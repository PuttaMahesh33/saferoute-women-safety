import { MapPin, Navigation, Hospital, Shield as ShieldIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MapPlaceholderProps {
  className?: string;
  showRoutes?: boolean;
  showLocation?: boolean;
  children?: React.ReactNode;
}

export function MapPlaceholder({ className, showRoutes, showLocation, children }: MapPlaceholderProps) {
  return (
    <div 
      className={cn(
        "relative w-full h-full min-h-[300px] rounded-xl overflow-hidden map-container border border-border/50",
        className
      )}
    >
      {/* Grid pattern for map feel */}
      <div className="absolute inset-0 opacity-30">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Simulated roads */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        {/* Main roads */}
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="hsl(var(--muted-foreground))" strokeWidth="3" opacity="0.2"/>
        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="hsl(var(--muted-foreground))" strokeWidth="3" opacity="0.2"/>
        <line x1="20%" y1="0" x2="80%" y2="100%" stroke="hsl(var(--muted-foreground))" strokeWidth="2" opacity="0.15"/>
        
        {showRoutes && (
          <>
            {/* Safe route */}
            <path 
              d="M 15% 80% Q 25% 60% 35% 55% T 55% 45% T 75% 30% T 85% 20%"
              fill="none"
              stroke="hsl(var(--safe))"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="0"
            />
            {/* Moderate route */}
            <path 
              d="M 15% 80% Q 30% 70% 45% 60% T 65% 45% T 85% 20%"
              fill="none"
              stroke="hsl(var(--moderate))"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="8 4"
              opacity="0.8"
            />
            {/* Danger route */}
            <path 
              d="M 15% 80% Q 20% 50% 40% 40% T 60% 30% T 85% 20%"
              fill="none"
              stroke="hsl(var(--danger))"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="4 4"
              opacity="0.6"
            />
          </>
        )}
      </svg>

      {/* Location markers */}
      {showRoutes && (
        <>
          {/* Start point */}
          <div className="absolute left-[15%] bottom-[20%] -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <MapPin className="w-8 h-8 text-primary fill-primary" />
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-card px-2 py-0.5 rounded text-xs font-medium shadow-sm">
                Start
              </div>
            </div>
          </div>
          
          {/* End point */}
          <div className="absolute right-[15%] top-[20%] -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <Navigation className="w-8 h-8 text-safe fill-safe" />
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-card px-2 py-0.5 rounded text-xs font-medium shadow-sm">
                Destination
              </div>
            </div>
          </div>
        </>
      )}

      {/* Current location indicator */}
      {showLocation && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="w-4 h-4 bg-primary rounded-full animate-ping absolute inset-0 opacity-75" />
            <div className="w-4 h-4 bg-primary rounded-full relative" />
          </div>
        </div>
      )}

      {/* Safe zones */}
      {showLocation && (
        <>
          <div className="absolute left-[30%] top-[30%]" title="Police Station">
            <div className="w-6 h-6 bg-safe rounded-full flex items-center justify-center">
              <ShieldIcon className="w-3 h-3 text-safe-foreground" />
            </div>
          </div>
          <div className="absolute right-[25%] bottom-[35%]" title="Hospital">
            <div className="w-6 h-6 bg-safe rounded-full flex items-center justify-center">
              <Hospital className="w-3 h-3 text-safe-foreground" />
            </div>
          </div>
        </>
      )}

      {/* Overlay content */}
      {children}

      {/* Map attribution placeholder */}
      <div className="absolute bottom-2 left-2 text-[10px] text-muted-foreground bg-background/80 px-2 py-0.5 rounded">
        Map data © SafeRoute (Demo)
      </div>
    </div>
  );
}
