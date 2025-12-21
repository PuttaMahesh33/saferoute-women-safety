import { useState, useCallback, useRef, useEffect } from "react";
import { RouteResult } from "./useGoogleMaps";
import { useToast } from "./use-toast";

interface NavigationState {
  isNavigating: boolean;
  currentStep: number;
  currentPosition: { lat: number; lng: number } | null;
  selectedRoute: RouteResult | null;
  instructions: string[];
  distanceRemaining: string;
  timeRemaining: string;
  progress: number;
}

export function useNavigation() {
  const [state, setState] = useState<NavigationState>({
    isNavigating: false,
    currentStep: 0,
    currentPosition: null,
    selectedRoute: null,
    instructions: [],
    distanceRemaining: "",
    timeRemaining: "",
    progress: 0,
  });
  const watchIdRef = useRef<number | null>(null);
  const { toast } = useToast();

  // Cleanup
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const startNavigation = useCallback((route: RouteResult) => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
      return;
    }

    // Parse instructions from route (simplified for demo)
    const instructions = [
      "Head north on your current street",
      `Continue via ${route.via}`,
      "Turn right at the next intersection",
      "Continue straight for 500m",
      "Your destination is on the right",
    ];

    // Set navigation state immediately for instant UI feedback
    setState({
      isNavigating: true,
      currentStep: 0,
      currentPosition: null,
      selectedRoute: route,
      instructions,
      distanceRemaining: route.distance,
      timeRemaining: route.duration,
      progress: 0,
    });

    toast({
      title: "Navigation Started",
      description: `Following ${route.name} - ${route.duration} to destination.`,
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
      { enableHighAccuracy: false, timeout: 2000, maximumAge: 60000 }
    );

    // Start watching position with high accuracy
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        setState(prev => ({
          ...prev,
          currentPosition: { lat: latitude, lng: longitude },
          progress: Math.min(prev.progress + 1, 100),
        }));
      },
      (error) => {
        console.error("Navigation tracking error:", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000,
      }
    );
  }, [toast]);

  const stopNavigation = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setState({
      isNavigating: false,
      currentStep: 0,
      currentPosition: null,
      selectedRoute: null,
      instructions: [],
      distanceRemaining: "",
      timeRemaining: "",
      progress: 0,
    });

    toast({
      title: "Navigation Stopped",
      description: "Turn-by-turn navigation has been stopped.",
    });
  }, [toast]);

  const nextStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, prev.instructions.length - 1),
    }));
  }, []);

  return {
    ...state,
    startNavigation,
    stopNavigation,
    nextStep,
  };
}
