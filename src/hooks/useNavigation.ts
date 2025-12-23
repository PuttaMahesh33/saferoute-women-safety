import { useState, useCallback, useRef, useEffect } from "react";
import { RouteResult } from "./useGoogleMaps";
import { useToast } from "./use-toast";

interface NavigationState {
  isNavigating: boolean;
  currentStep: number;
  currentPosition: { lat: number; lng: number } | null;
  previousPosition: { lat: number; lng: number } | null;
  selectedRoute: RouteResult | null;
  instructions: string[];
  distanceRemaining: string;
  timeRemaining: string;
  progress: number;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  isOffRoute: boolean;
  destination: { lat: number; lng: number } | null;
  routePath: google.maps.LatLng[] | null;
  gpsStatus: 'initializing' | 'tracking' | 'error' | 'off';
}

const REROUTE_THRESHOLD_METERS = 50; // Distance from route to trigger reroute

export function useNavigation() {
  const [state, setState] = useState<NavigationState>({
    isNavigating: false,
    currentStep: 0,
    currentPosition: null,
    previousPosition: null,
    selectedRoute: null,
    instructions: [],
    distanceRemaining: "",
    timeRemaining: "",
    progress: 0,
    accuracy: null,
    heading: null,
    speed: null,
    isOffRoute: false,
    destination: null,
    routePath: null,
    gpsStatus: 'off',
  });
  const watchIdRef = useRef<number | null>(null);
  const routePathRef = useRef<google.maps.LatLng[] | null>(null);
  const destinationRef = useRef<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();

  // Calculate distance between two points in meters
  const calculateDistance = useCallback((lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }, []);

  // Calculate distance to destination
  const getDistanceToDestination = useCallback((currentPos: { lat: number; lng: number }): string => {
    if (!destinationRef.current) return "";
    const dist = calculateDistance(
      currentPos.lat, currentPos.lng,
      destinationRef.current.lat, destinationRef.current.lng
    );
    if (dist < 1000) {
      return `${Math.round(dist)} m`;
    }
    return `${(dist / 1000).toFixed(1)} km`;
  }, [calculateDistance]);

  // Calculate ETA based on average walking speed (5 km/h)
  const getTimeRemaining = useCallback((currentPos: { lat: number; lng: number }): string => {
    if (!destinationRef.current) return "";
    const dist = calculateDistance(
      currentPos.lat, currentPos.lng,
      destinationRef.current.lat, destinationRef.current.lng
    );
    const walkingSpeed = 5 * 1000 / 3600; // 5 km/h in m/s
    const seconds = dist / walkingSpeed;
    const minutes = Math.ceil(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }, [calculateDistance]);

  // Calculate progress along route
  const calculateProgress = useCallback((currentPos: { lat: number; lng: number }): number => {
    if (!destinationRef.current || !routePathRef.current || routePathRef.current.length === 0) return 0;
    
    const totalDist = calculateDistance(
      routePathRef.current[0].lat(),
      routePathRef.current[0].lng(),
      destinationRef.current.lat,
      destinationRef.current.lng
    );
    
    const remainingDist = calculateDistance(
      currentPos.lat, currentPos.lng,
      destinationRef.current.lat, destinationRef.current.lng
    );
    
    if (totalDist === 0) return 100;
    return Math.min(100, Math.max(0, ((totalDist - remainingDist) / totalDist) * 100));
  }, [calculateDistance]);

  // Check if user is off route
  const checkIfOffRoute = useCallback((currentPos: { lat: number; lng: number }): boolean => {
    if (!routePathRef.current || routePathRef.current.length === 0) return false;
    
    // Find minimum distance to any point on the route
    let minDistance = Infinity;
    for (const point of routePathRef.current) {
      const dist = calculateDistance(
        currentPos.lat, currentPos.lng,
        point.lat(), point.lng()
      );
      if (dist < minDistance) {
        minDistance = dist;
      }
    }
    
    return minDistance > REROUTE_THRESHOLD_METERS;
  }, [calculateDistance]);

  // Calculate heading between two points
  const calculateHeading = useCallback((from: { lat: number; lng: number }, to: { lat: number; lng: number }): number => {
    const lat1 = from.lat * Math.PI / 180;
    const lat2 = to.lat * Math.PI / 180;
    const lng1 = from.lng * Math.PI / 180;
    const lng2 = to.lng * Math.PI / 180;
    
    const y = Math.sin(lng2 - lng1) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1);
    
    let heading = Math.atan2(y, x) * 180 / Math.PI;
    heading = (heading + 360) % 360;
    
    return heading;
  }, []);

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
        title: "GPS Error",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
      return;
    }

    // Decode the route polyline to get path points
    let routePath: google.maps.LatLng[] = [];
    let destination: { lat: number; lng: number } | null = null;
    
    if (window.google && google.maps.geometry?.encoding) {
      routePath = google.maps.geometry.encoding.decodePath(route.polyline);
      if (routePath.length > 0) {
        const lastPoint = routePath[routePath.length - 1];
        destination = { lat: lastPoint.lat(), lng: lastPoint.lng() };
      }
    }

    routePathRef.current = routePath;
    destinationRef.current = destination;

    // Parse instructions from route
    const instructions = [
      "Head towards your destination",
      `Continue via ${route.via}`,
      "Follow the highlighted route",
      "Continue on current path",
      "You are approaching your destination",
    ];

    // Set navigation state immediately for instant UI feedback
    setState({
      isNavigating: true,
      currentStep: 0,
      currentPosition: null,
      previousPosition: null,
      selectedRoute: route,
      instructions,
      distanceRemaining: route.distance,
      timeRemaining: route.duration,
      progress: 0,
      accuracy: null,
      heading: null,
      speed: null,
      isOffRoute: false,
      destination,
      routePath,
      gpsStatus: 'initializing',
    });

    toast({
      title: "🧭 GPS Navigation Started",
      description: "Acquiring your location...",
    });

    // Start watching position with high accuracy GPS
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy, heading, speed } = position.coords;
        const newPos = { lat: latitude, lng: longitude };
        
        setState(prev => {
          // Calculate heading from movement if device doesn't provide it
          let calculatedHeading = heading;
          if (prev.previousPosition && (heading === null || heading === undefined)) {
            calculatedHeading = calculateHeading(prev.previousPosition, newPos);
          }
          
          const isOffRoute = checkIfOffRoute(newPos);
          const newProgress = calculateProgress(newPos);
          const distanceRemaining = getDistanceToDestination(newPos);
          const timeRemaining = getTimeRemaining(newPos);
          
          // Check if arrived at destination (within 20 meters)
          if (destinationRef.current) {
            const distToDest = calculateDistance(
              newPos.lat, newPos.lng,
              destinationRef.current.lat, destinationRef.current.lng
            );
            if (distToDest < 20) {
              toast({
                title: "🎉 You have arrived!",
                description: "You have reached your destination.",
              });
              // Auto-stop navigation on arrival
              setTimeout(() => stopNavigation(), 2000);
            }
          }
          
          // Update step based on progress
          let currentStep = prev.currentStep;
          if (newProgress > 80 && prev.currentStep < 4) {
            currentStep = 4;
          } else if (newProgress > 60 && prev.currentStep < 3) {
            currentStep = 3;
          } else if (newProgress > 40 && prev.currentStep < 2) {
            currentStep = 2;
          } else if (newProgress > 20 && prev.currentStep < 1) {
            currentStep = 1;
          }
          
          // Warn if off route
          if (isOffRoute && !prev.isOffRoute) {
            toast({
              title: "⚠️ Off Route",
              description: "You have deviated from the route. Please return to the path.",
              variant: "destructive",
            });
          }
          
          return {
            ...prev,
            currentPosition: newPos,
            previousPosition: prev.currentPosition,
            accuracy: accuracy,
            heading: calculatedHeading ?? prev.heading,
            speed: speed ?? prev.speed,
            gpsStatus: 'tracking',
            distanceRemaining,
            timeRemaining,
            progress: newProgress,
            isOffRoute,
            currentStep,
          };
        });
      },
      (error) => {
        console.error("GPS tracking error:", error);
        setState(prev => ({
          ...prev,
          gpsStatus: 'error',
        }));
        
        let errorMessage = "Unable to get your location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable GPS.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "GPS signal unavailable. Please check your location settings.";
            break;
          case error.TIMEOUT:
            errorMessage = "GPS signal timeout. Retrying...";
            break;
        }
        
        toast({
          title: "GPS Error",
          description: errorMessage,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0, // Always get fresh position
        timeout: 10000,
      }
    );
  }, [toast, calculateHeading, checkIfOffRoute, calculateProgress, getDistanceToDestination, getTimeRemaining, calculateDistance]);

  const stopNavigation = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    routePathRef.current = null;
    destinationRef.current = null;

    setState({
      isNavigating: false,
      currentStep: 0,
      currentPosition: null,
      previousPosition: null,
      selectedRoute: null,
      instructions: [],
      distanceRemaining: "",
      timeRemaining: "",
      progress: 0,
      accuracy: null,
      heading: null,
      speed: null,
      isOffRoute: false,
      destination: null,
      routePath: null,
      gpsStatus: 'off',
    });

    toast({
      title: "Navigation Stopped",
      description: "GPS tracking has been stopped.",
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
