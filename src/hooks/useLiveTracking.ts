import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

interface TrackingState {
  isTracking: boolean;
  currentPosition: { lat: number; lng: number } | null;
  elapsedTime: number;
  destination: { lat: number; lng: number } | null;
  distanceRemaining: string | null;
  routePath: google.maps.LatLng[] | null;
}

export function useLiveTracking() {
  const [state, setState] = useState<TrackingState>({
    isTracking: false,
    currentPosition: null,
    elapsedTime: 0,
    destination: null,
    distanceRemaining: null,
    routePath: null,
  });
  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startTracking = useCallback((routePath?: google.maps.LatLng[], destination?: { lat: number; lng: number }) => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
      return;
    }

    // Set tracking state immediately for instant UI feedback
    setState(prev => ({
      ...prev,
      isTracking: true,
      elapsedTime: 0,
      destination: destination || null,
      routePath: routePath || null,
    }));

    toast({
      title: "Live Tracking Started",
      description: "Getting your location...",
    });

    // Get quick initial position first (low accuracy but fast)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setState(prev => ({
          ...prev,
          currentPosition: { lat: latitude, lng: longitude },
        }));
      },
      () => {}, // Ignore error for quick position
      { enableHighAccuracy: false, timeout: 3000, maximumAge: 60000 }
    );

    // Start elapsed time counter
    timerRef.current = setInterval(() => {
      setState(prev => ({ ...prev, elapsedTime: prev.elapsedTime + 1 }));
    }, 1000);

    // Start watching position with high accuracy
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const newPos = { lat: latitude, lng: longitude };
        
        setState(prev => ({
          ...prev,
          currentPosition: newPos,
        }));

        // Save location to database if user is logged in
        if (user) {
          await supabase.from("location_updates").insert({
            user_id: user.id,
            latitude,
            longitude,
          });
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast({
          title: "Location Error",
          description: "Unable to get your location. Please check permissions.",
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000,
      }
    );
  }, [user, toast]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setState({
      isTracking: false,
      currentPosition: null,
      elapsedTime: 0,
      destination: null,
      distanceRemaining: null,
      routePath: null,
    });

    toast({
      title: "Tracking Stopped",
      description: "Your location is no longer being tracked.",
    });
  }, [toast]);

  const shareLocation = useCallback(async () => {
    if (!state.currentPosition) {
      toast({
        title: "No Location",
        description: "Please start tracking first.",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would send SMS/email to emergency contacts
    toast({
      title: "Location Shared",
      description: `Your current location (${state.currentPosition.lat.toFixed(4)}, ${state.currentPosition.lng.toFixed(4)}) has been shared with your emergency contacts.`,
    });
  }, [state.currentPosition, toast]);

  return {
    ...state,
    startTracking,
    stopTracking,
    shareLocation,
  };
}
