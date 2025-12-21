/// <reference types="google.maps" />
import { useEffect, useRef, useState, useCallback } from "react";
import { useGoogleMaps, RouteResult } from "@/hooks/useGoogleMaps";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

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
}

const ROUTE_COLORS = {
  safe: "#22c55e",
  moderate: "#f59e0b", 
  danger: "#ef4444",
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
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
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
    });

    mapInstanceRef.current = map;
    setMapReady(true);
    onMapReady?.(map);
  }, [mapsLoaded, onMapReady]);

  // Update user position marker during navigation
  useEffect(() => {
    if (!mapInstanceRef.current || !mapsLoaded) return;

    if (isNavigating && userPosition) {
      const pos = { lat: userPosition.lat, lng: userPosition.lng };

      if (userMarkerRef.current) {
        userMarkerRef.current.setPosition(pos);
      } else {
        // Create pulsing user marker
        userMarkerRef.current = new google.maps.Marker({
          position: pos,
          map: mapInstanceRef.current,
          icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 8,
            fillColor: "#3b82f6",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
            rotation: 0,
          },
          title: "Your Location",
          zIndex: 100,
        });
      }

      // Pan to user with slight offset for better view
      mapInstanceRef.current.panTo(pos);
      if (mapInstanceRef.current.getZoom()! < 16) {
        mapInstanceRef.current.setZoom(16);
      }
    } else if (!isNavigating && userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
      userMarkerRef.current = null;
    }
  }, [isNavigating, userPosition, mapsLoaded]);

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

      // Draw polyline
      const polyline = new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: isNavigating ? "#3b82f6" : color,
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

        const endMarker = new google.maps.Marker({
          position: path[path.length - 1],
          map: mapInstanceRef.current,
          icon: {
            url: "data:image/svg+xml," + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3" fill="white"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 32),
          },
          title: "Destination",
          zIndex: 20,
        });

        markersRef.current.push(startMarker, endMarker);
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
      {children}
    </div>
  );
}
