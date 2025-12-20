import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

interface PanicAlertState {
  isActive: boolean;
  alertId: string | null;
  latitude: number | null;
  longitude: number | null;
}

export function usePanicAlert() {
  const [state, setState] = useState<PanicAlertState>({
    isActive: false,
    alertId: null,
    latitude: null,
    longitude: null,
  });
  const [sending, setSending] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

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

      setState({
        isActive: true,
        alertId: alertData.id,
        latitude,
        longitude,
      });

      // Start continuous tracking
      startContinuousTracking(alertData.id);

      toast({
        title: "🚨 Emergency Alert Sent!",
        description: `Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}. Help is on the way.`,
        variant: "destructive",
      });

      return { latitude, longitude, alertId: alertData.id };
    } catch (err: any) {
      console.error("Panic alert error:", err);
      toast({
        title: "Emergency Alert",
        description: err.message || "Could not get location. Alert sent without coordinates.",
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
        });
      }

      return null;
    } finally {
      setSending(false);
    }
  }, [user, toast]);

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
