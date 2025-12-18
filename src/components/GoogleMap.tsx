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
  children 
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const markersRef = useRef<google.maps.Marker[]>([]);
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

    routes.forEach((route, index) => {
      const isSelected = selectedRouteId === route.id;
      const color = route.safetyScore >= 70 
        ? ROUTE_COLORS.safe 
        : route.safetyScore >= 40 
          ? ROUTE_COLORS.moderate 
          : ROUTE_COLORS.danger;

      // Decode polyline
      const path = google.maps.geometry?.encoding?.decodePath(route.polyline) || [];
      
      if (path.length === 0) return;

      // Draw polyline
      const polyline = new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: color,
        strokeOpacity: isSelected ? 1 : 0.5,
        strokeWeight: isSelected ? 6 : 4,
        zIndex: isSelected ? 10 : 5 - index,
        map: mapInstanceRef.current,
      });

      polylinesRef.current.push(polyline);
      
      // Extend bounds
      path.forEach((point) => bounds.extend(point));

      // Add start and end markers only for selected route
      if (isSelected && path.length > 0) {
        const startMarker = new google.maps.Marker({
          position: path[0],
          map: mapInstanceRef.current,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
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
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: color,
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          },
          title: "Destination",
          zIndex: 20,
        });

        markersRef.current.push(startMarker, endMarker);
      }
    });

    // Fit map to bounds
    if (routes.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
    }
  }, [routes, selectedRouteId, mapsLoaded]);

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
