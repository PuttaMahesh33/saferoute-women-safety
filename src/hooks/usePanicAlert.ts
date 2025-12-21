import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

interface PanicAlertState {
  isActive: boolean;
  alertId: string | null;
  latitude: number | null;
  longitude: number | null;
  emailsSent: number;
  deliveryStatus: string | null;
}

export function usePanicAlert() {
  const [state, setState] = useState<PanicAlertState>({
    isActive: false,
    alertId: null,
    latitude: null,
    longitude: null,
    emailsSent: 0,
    deliveryStatus: null,
  });
  const [sending, setSending] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const sendEmergencyAlerts = useCallback(async (
    alertId: string,
    latitude: number,
    longitude: number
  ) => {
    try {
      console.log("Sending emergency alerts via edge function...");
      
      const { data, error } = await supabase.functions.invoke("send-emergency-alert", {
        body: {
          userId: user?.id || null,
          userName: profile?.full_name || user?.email || "SafeRoute User",
          latitude,
          longitude,
          alertId,
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        throw error;
      }

      console.log("Emergency alert response:", data);
      return data;
    } catch (err) {
      console.error("Failed to send emergency alerts:", err);
      throw err;
    }
  }, [user, profile]);

  const triggerPanic = useCallback(async () => {
    setSending(true);

    try {
      // Get current position
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation not supported"));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const { latitude, longitude } = position.coords;

      // Save panic alert to database
      const { data: alertData, error } = await supabase
        .from("panic_alerts")
        .insert({
          user_id: user?.id || null,
          latitude,
          longitude,
          status: "active",
        })
        .select()
        .single();

      if (error) throw error;

      // Save initial location update
      await supabase.from("location_updates").insert({
        user_id: user?.id || null,
        panic_alert_id: alertData.id,
        latitude,
        longitude,
      });

      // Send real email alerts to emergency contacts
      let emailResult = { emailsSent: 0, deliveryStatus: "pending" };
      try {
        const alertResponse = await sendEmergencyAlerts(alertData.id, latitude, longitude);
        emailResult = {
          emailsSent: alertResponse.results?.filter((r: any) => r.success).length || 0,
          deliveryStatus: alertResponse.deliveryStatus || "unknown",
        };
        
        if (alertResponse.deliveryStatus === "delivered") {
          toast({
            title: "📧 Emails Sent Successfully!",
            description: `Emergency alerts sent to ${emailResult.emailsSent} contact(s).`,
          });
        } else if (alertResponse.deliveryStatus === "no_contacts") {
          toast({
            title: "⚠️ No Emergency Contacts",
            description: "Add emergency contacts to receive alerts.",
            variant: "destructive",
          });
        }
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        toast({
          title: "⚠️ Email Delivery Issue",
          description: "Alert saved but email delivery failed. Check your contacts.",
          variant: "destructive",
        });
      }

      setState({
        isActive: true,
        alertId: alertData.id,
        latitude,
        longitude,
        emailsSent: emailResult.emailsSent,
        deliveryStatus: emailResult.deliveryStatus,
      });

      // Start continuous tracking
      startContinuousTracking(alertData.id);

      toast({
        title: "🚨 Emergency Alert Activated!",
        description: `Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}. Live tracking started.`,
        variant: "destructive",
      });

      return { latitude, longitude, alertId: alertData.id };
    } catch (err: any) {
      console.error("Panic alert error:", err);
      toast({
        title: "Emergency Alert Error",
        description: err.message || "Could not get location. Please try again.",
        variant: "destructive",
      });

      // Still create alert without precise location
      const { data: alertData } = await supabase
        .from("panic_alerts")
        .insert({
          user_id: user?.id || null,
          latitude: 0,
          longitude: 0,
          status: "active",
        })
        .select()
        .single();

      if (alertData) {
        setState({
          isActive: true,
          alertId: alertData.id,
          latitude: null,
          longitude: null,
          emailsSent: 0,
          deliveryStatus: "location_failed",
        });
      }

      return null;
    } finally {
      setSending(false);
    }
  }, [user, toast, sendEmergencyAlerts]);

  const startContinuousTracking = useCallback((alertId: string) => {
    if (!navigator.geolocation) return;

    // Clear any existing watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Update state
        setState(prev => ({
          ...prev,
          latitude,
          longitude,
        }));

        // Save location update to database
        await supabase.from("location_updates").insert({
          user_id: user?.id || null,
          panic_alert_id: alertId,
          latitude,
          longitude,
        });
      },
      (error) => {
        console.error("Tracking error:", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 10000,
      }
    );
  }, [user]);

  const stopPanic = useCallback(async () => {
    // Stop watching position
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    // Update alert status in database
    if (state.alertId) {
      await supabase
        .from("panic_alerts")
        .update({ 
          status: "resolved",
          resolved_at: new Date().toISOString(),
        })
        .eq("id", state.alertId);
    }

    setState({
      isActive: false,
      alertId: null,
      latitude: null,
      longitude: null,
      emailsSent: 0,
      deliveryStatus: null,
    });

    toast({
      title: "Alert Deactivated",
      description: "Your emergency alert has been stopped.",
    });
  }, [state.alertId, toast]);

  return {
    ...state,
    sending,
    triggerPanic,
    stopPanic,
  };
}
