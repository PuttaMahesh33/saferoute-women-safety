/// <reference types="google.maps" />
import { useEffect, useState, useCallback } from "react";

const GOOGLE_MAPS_API_KEY = "AIzaSyAvr5KnCLi0CdN8S70klpsbr4x8e-KDB6U";

declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps: () => void;
  }
}

let isLoading = false;
let isLoaded = false;
const callbacks: (() => void)[] = [];

export function useGoogleMaps() {
  const [loaded, setLoaded] = useState(isLoaded);

  useEffect(() => {
    if (isLoaded) {
      setLoaded(true);
      return;
    }

    if (isLoading) {
      callbacks.push(() => setLoaded(true));
      return;
    }

    isLoading = true;

    window.initGoogleMaps = () => {
      isLoaded = true;
      isLoading = false;
      setLoaded(true);
      callbacks.forEach((cb) => cb());
      callbacks.length = 0;
    };

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup only if we were the ones loading
    };
  }, []);

  return loaded;
}

export interface RouteResult {
  id: string;
  name: string;
  distance: string;
  duration: string;
  via: string;
  safetyScore: number;
  polyline: string;
  bounds: google.maps.LatLngBounds;
  factors: {
    crime: string;
    lighting: string;
    traffic: string;
    time: string;
  };
}

// Simulated safety analysis based on route characteristics
function calculateSafetyScore(route: google.maps.DirectionsRoute, index: number): {
  score: number;
  factors: { crime: string; lighting: string; traffic: string; time: string };
} {
  // Simulate different safety profiles for different routes
  const hour = new Date().getHours();
  const isNight = hour < 6 || hour > 20;
  
  // Base score varies by route alternative (first is typically main roads)
  const baseScores = [85, 65, 40];
  const baseScore = baseScores[index] || 50;
  
  // Adjust for time of day
  const timeAdjustment = isNight ? -15 : 0;
  
  // Longer routes through main streets are often safer
  const distanceKm = (route.legs[0]?.distance?.value || 0) / 1000;
  const distanceBonus = distanceKm > 3 ? 5 : 0;
  
  const finalScore = Math.min(100, Math.max(0, baseScore + timeAdjustment + distanceBonus));
  
  // Determine factor levels based on score
  const getLevel = (score: number, type: 'crime' | 'other') => {
    if (type === 'crime') {
      if (score >= 70) return 'Low';
      if (score >= 40) return 'Moderate';
      return 'High';
    } else {
      if (score >= 70) return 'Good';
      if (score >= 40) return 'Average';
      return 'Poor';
    }
  };

  return {
    score: Math.round(finalScore),
    factors: {
      crime: getLevel(finalScore, 'crime'),
      lighting: getLevel(finalScore + (index === 0 ? 10 : -10), 'other'),
      traffic: index === 0 ? 'Moderate' : index === 1 ? 'High' : 'Low',
      time: isNight ? 'High Risk' : 'Low Risk',
    },
  };
}

export function useDirections() {
  const mapsLoaded = useGoogleMaps();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routes, setRoutes] = useState<RouteResult[]>([]);

  const getDirections = useCallback(
    async (origin: string, destination: string): Promise<RouteResult[]> => {
      if (!mapsLoaded || !window.google) {
        setError("Maps not loaded yet");
        return [];
      }

      setLoading(true);
      setError(null);

      return new Promise((resolve) => {
        const directionsService = new google.maps.DirectionsService();

        directionsService.route(
          {
            origin,
            destination,
            travelMode: google.maps.TravelMode.WALKING,
            provideRouteAlternatives: true,
          },
          (result, status) => {
            setLoading(false);

            if (status !== google.maps.DirectionsStatus.OK || !result) {
              setError("Could not find routes. Please check your locations.");
              setRoutes([]);
              resolve([]);
              return;
            }

            const routeResults: RouteResult[] = result.routes
              .slice(0, 3) // Max 3 routes
              .map((route, index) => {
                const leg = route.legs[0];
                const { score, factors } = calculateSafetyScore(route, index);
                
                // Extract main street names for "via"
                const steps = leg?.steps || [];
                const streetNames = steps
                  .filter((step) => step.instructions)
                  .map((step) => {
                    const match = step.instructions?.match(/(?:on|onto|via)\s+([^<]+)/i);
                    return match ? match[1].trim() : null;
                  })
                  .filter((name): name is string => !!name)
                  .slice(0, 3);

                return {
                  id: `route-${index}`,
                  name: index === 0 ? "Recommended Safe Route" : index === 1 ? "Alternative Route" : "Shortest Route",
                  distance: leg?.distance?.text || "Unknown",
                  duration: leg?.duration?.text || "Unknown",
                  via: streetNames.length > 0 ? streetNames.join(", ") : route.summary || "Direct route",
                  safetyScore: score,
                  polyline: route.overview_polyline,
                  bounds: route.bounds,
                  factors,
                };
              })
              // Sort by safety score (highest first)
              .sort((a, b) => b.safetyScore - a.safetyScore);

            setRoutes(routeResults);
            resolve(routeResults);
          }
        );
      });
    },
    [mapsLoaded]
  );

  return { getDirections, routes, loading, error, mapsLoaded };
}
