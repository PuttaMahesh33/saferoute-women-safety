/// <reference types="google.maps" />
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect?: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  className?: string;
}

export function PlacesAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder,
  className,
}: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapsLoaded = useGoogleMaps();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!mapsLoaded || !inputRef.current || initialized) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      types: ["geocode", "establishment"],
      fields: ["formatted_address", "geometry", "name"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        onChange(place.formatted_address);
        onPlaceSelect?.(place);
      } else if (place.name) {
        onChange(place.name);
        onPlaceSelect?.(place);
      }
    });

    autocompleteRef.current = autocomplete;
    setInitialized(true);

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [mapsLoaded, initialized, onChange, onPlaceSelect]);

  return (
    <Input
      ref={inputRef}
      icon="location"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    />
  );
}
