/// <reference types="google.maps" />
import { useEffect, useRef, useState, useCallback } from "react";
import { useGoogleMaps, RouteResult } from "@/hooks/useGoogleMaps";
import { cn } from "@/lib/utils";
import { Loader2, Navigation2 } from "lucide-react";

interface GoogleMapProps {
  className?: string;
  routes?: RouteResult[];
  selectedRouteId?: string | null;
  onMapReady?: (map: google.maps.Map) => void;
  children?: React.ReactNode;
  // Navigation mode props
  isNavigating?: boolean;
  userPosition?: { lat: number; lng: number } | null;
  navigationRouteId?: string | null;
  accuracy?: number | null;
  heading?: number | null;
  gpsStatus?: 'initializing' | 'tracking' | 'error' | 'off';
}

const ROUTE_COLORS = {
  safe: "#22c55e",
  moderate: "#f59e0b", 
  danger: "#ef4444",
  navigation: "#3b82f6",
};

export function GoogleMap({ 
  className, 
  routes = [], 
  selectedRouteId,
  onMapReady,
  children,
  isNavigating = false,
  userPosition,
  navigationRouteId,
  accuracy,
  heading,
  gpsStatus,
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const accuracyCircleRef = useRef<google.maps.Circle | null>(null);
  const headingMarkerRef = useRef<google.maps.Marker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const targetPositionRef = useRef<{ lat: number; lng: number } | null>(null);
  const currentAnimatedPosRef = useRef<{ lat: number; lng: number } | null>(null);
  const mapsLoaded = useGoogleMaps();
  const [mapReady, setMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapsLoaded || !mapRef.current || mapInstanceRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: 28.6139, lng: 77.209 }, // Default to Delhi
      zoom: 13,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "transit",
          elementType: "labels",
          stylers: [{ visibility: "simplified" }],
        },
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      gestureHandling: isNavigating ? 'greedy' : 'auto',
    });

    mapInstanceRef.current = map;
    setMapReady(true);
    onMapReady?.(map);
  }, [mapsLoaded, onMapReady, isNavigating]);

  // Smooth animation for marker movement
  const animateMarkerTo = useCallback((targetLat: number, targetLng: number) => {
    if (!userMarkerRef.current) return;

    targetPositionRef.current = { lat: targetLat, lng: targetLng };

    if (!currentAnimatedPosRef.current) {
      currentAnimatedPosRef.current = { lat: targetLat, lng: targetLng };
      userMarkerRef.current.setPosition(targetPositionRef.current);
      return;
    }

    // Cancel any existing animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const startPos = { ...currentAnimatedPosRef.current };
    const startTime = performance.now();
    const duration = 1000; // 1 second smooth animation

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth movement
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      const currentLat = startPos.lat + (targetLat - startPos.lat) * easeProgress;
      const currentLng = startPos.lng + (targetLng - startPos.lng) * easeProgress;
      
      currentAnimatedPosRef.current = { lat: currentLat, lng: currentLng };
      
      if (userMarkerRef.current) {
        userMarkerRef.current.setPosition(currentAnimatedPosRef.current);
      }
      
      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.setCenter(currentAnimatedPosRef.current);
      }

      if (headingMarkerRef.current) {
        headingMarkerRef.current.setPosition(currentAnimatedPosRef.current);
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, []);

  // Update user position marker (during navigation OR when showing current location)
  useEffect(() => {
    if (!mapInstanceRef.current || !mapsLoaded) return;

    if (userPosition) {
      const pos = { lat: userPosition.lat, lng: userPosition.lng };

      // Create or update accuracy circle
      if (accuracy && accuracy > 0) {
        if (accuracyCircleRef.current) {
          accuracyCircleRef.current.setCenter(pos);
          accuracyCircleRef.current.setRadius(accuracy);
        } else {
          accuracyCircleRef.current = new google.maps.Circle({
            strokeColor: "#3b82f6",
            strokeOpacity: 0.3,
            strokeWeight: 1,
            fillColor: "#3b82f6",
            fillOpacity: 0.1,
            map: mapInstanceRef.current,
            center: pos,
            radius: accuracy,
            zIndex: 50,
          });
        }
      }

      if (userMarkerRef.current) {
        // Smooth animation to new position
        animateMarkerTo(pos.lat, pos.lng);
      } else {
        // Create pulsing user marker (blue dot like Google Maps)
        userMarkerRef.current = new google.maps.Marker({
          position: pos,
          map: mapInstanceRef.current,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: "#3b82f6",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 4,
          },
          title: "Your Location",
          zIndex: 100,
        });
        currentAnimatedPosRef.current = pos;
        
        // Center map on user's position when first detected
        if (!isNavigating) {
          mapInstanceRef.current.panTo(pos);
          mapInstanceRef.current.setZoom(15);
        }
      }

      // Create heading indicator (direction arrow) during navigation
      if (isNavigating && heading !== null && heading !== undefined) {
        if (headingMarkerRef.current) {
          headingMarkerRef.current.setPosition(pos);
          const icon = headingMarkerRef.current.getIcon() as google.maps.Symbol;
          if (icon) {
            headingMarkerRef.current.setIcon({
              ...icon,
              rotation: heading,
            });
          }
        } else {
          headingMarkerRef.current = new google.maps.Marker({
            position: pos,
            map: mapInstanceRef.current,
            icon: {
              path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 6,
              fillColor: "#1d4ed8",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
              rotation: heading,
              anchor: new google.maps.Point(0, 3),
            },
            zIndex: 101,
          });
        }
      }

      // Auto-center map on user during navigation
      if (isNavigating) {
        mapInstanceRef.current.panTo(pos);
        const currentZoom = mapInstanceRef.current.getZoom();
        if (currentZoom && currentZoom < 17) {
          mapInstanceRef.current.setZoom(17);
        }
      }
    } else {
      // Cleanup markers when no position
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
        userMarkerRef.current = null;
      }
      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.setMap(null);
        accuracyCircleRef.current = null;
      }
      if (headingMarkerRef.current) {
        headingMarkerRef.current.setMap(null);
        headingMarkerRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      currentAnimatedPosRef.current = null;
      targetPositionRef.current = null;
    }
  }, [userPosition, mapsLoaded, accuracy, heading, isNavigating, animateMarkerTo]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Draw routes on map
  const drawRoutes = useCallback(() => {
    if (!mapInstanceRef.current || !mapsLoaded) return;

    // Clear existing polylines and markers
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    if (routes.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    const activeRouteId = isNavigating ? navigationRouteId : selectedRouteId;

    routes.forEach((route, index) => {
      const isSelected = activeRouteId === route.id;
      const color = route.safetyScore >= 70 
        ? ROUTE_COLORS.safe 
        : route.safetyScore >= 40 
          ? ROUTE_COLORS.moderate 
          : ROUTE_COLORS.danger;

      // Decode polyline
      const path = google.maps.geometry?.encoding?.decodePath(route.polyline) || [];
      
      if (path.length === 0) return;

      // In navigation mode, only show the active route
      if (isNavigating && !isSelected) return;

      // Draw polyline with glow effect for navigation
      if (isNavigating && isSelected) {
        // Glow layer
        const glowPolyline = new google.maps.Polyline({
          path,
          geodesic: true,
          strokeColor: ROUTE_COLORS.navigation,
          strokeOpacity: 0.3,
          strokeWeight: 14,
          zIndex: 8,
          map: mapInstanceRef.current,
        });
        polylinesRef.current.push(glowPolyline);
      }

      // Main polyline
      const polyline = new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: isNavigating ? ROUTE_COLORS.navigation : color,
        strokeOpacity: isSelected ? 1 : 0.4,
        strokeWeight: isSelected ? 7 : 3,
        zIndex: isSelected ? 10 : 5 - index,
        map: mapInstanceRef.current,
      });

      polylinesRef.current.push(polyline);
      
      // Extend bounds
      path.forEach((point) => bounds.extend(point));

      // Add start and end markers for selected/navigating route
      if (isSelected && path.length > 0) {
        // Only show start marker if not navigating (user marker shows position)
        if (!isNavigating) {
          const startMarker = new google.maps.Marker({
            position: path[0],
            map: mapInstanceRef.current,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: "#6366f1",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 3,
            },
            title: "Start",
            zIndex: 20,
          });
          markersRef.current.push(startMarker);
        }

        // Destination marker with pin icon
        const endMarker = new google.maps.Marker({
          position: path[path.length - 1],
          map: mapInstanceRef.current,
          icon: {
            url: "data:image/svg+xml," + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="${isNavigating ? ROUTE_COLORS.navigation : color}" stroke="white" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3" fill="white"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 40),
          },
          title: "Destination",
          zIndex: 25,
          animation: isNavigating ? google.maps.Animation.BOUNCE : undefined,
        });

        // Stop bouncing after 2 seconds
        if (isNavigating) {
          setTimeout(() => endMarker.setAnimation(null), 2000);
        }

        markersRef.current.push(endMarker);
      }
    });

    // Fit map to bounds (only when not navigating - navigation follows user)
    if (routes.length > 0 && !isNavigating) {
      mapInstanceRef.current.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
    }
  }, [routes, selectedRouteId, navigationRouteId, isNavigating, mapsLoaded]);

  useEffect(() => {
    if (mapReady) {
      drawRoutes();
    }
  }, [mapReady, drawRoutes]);

  if (!mapsLoaded) {
    return (
      <div className={cn("relative w-full h-full min-h-[300px] rounded-xl overflow-hidden bg-muted flex items-center justify-center", className)}>
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-sm">Loading Google Maps...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full h-full min-h-[300px] rounded-xl overflow-hidden", className)}>
      <div ref={mapRef} className="absolute inset-0" />
      
      {/* GPS Status Indicator */}
      {isNavigating && (
        <div className="absolute top-4 left-4 z-10">
          <div className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium shadow-lg",
            gpsStatus === 'tracking' && "bg-green-500 text-white",
            gpsStatus === 'initializing' && "bg-yellow-500 text-white",
            gpsStatus === 'error' && "bg-red-500 text-white",
          )}>
            <Navigation2 className={cn(
              "w-4 h-4",
              gpsStatus === 'initializing' && "animate-pulse"
            )} />
            {gpsStatus === 'tracking' && "GPS Active"}
            {gpsStatus === 'initializing' && "Acquiring GPS..."}
            {gpsStatus === 'error' && "GPS Error"}
          </div>
        </div>
      )}
      
      {children}
    </div>
  );
}
