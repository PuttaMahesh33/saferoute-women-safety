import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SafetyScore } from "@/components/SafetyScore";
import { Clock, MapPin, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Route {
  id: string;
  name: string;
  safetyScore: number;
  distance: string;
  duration: string;
  via: string;
  factors: {
    crime: string;
    lighting: string;
    traffic: string;
    time: string;
  };
}

interface RouteCardProps {
  route: Route;
  isSelected?: boolean;
  onSelect?: () => void;
  rank: number;
}

export function RouteCard({ route, isSelected, onSelect, rank }: RouteCardProps) {
  const getVariant = () => {
    if (route.safetyScore >= 70) return "safe" as const;
    if (route.safetyScore >= 40) return "moderate" as const;
    return "danger" as const;
  };

  const variant = getVariant();
  const rankLabels = ["Recommended", "Alternative 1", "Alternative 2"];

  return (
    <Card
      variant={isSelected ? variant : "default"}
      className={cn(
        "cursor-pointer transition-all duration-200 hover:scale-[1.02]",
        isSelected && "ring-2 ring-offset-2",
        isSelected && variant === "safe" && "ring-safe",
        isSelected && variant === "moderate" && "ring-moderate",
        isSelected && variant === "danger" && "ring-danger"
      )}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <Badge variant={`${variant}-soft`} className="mb-2">
              {rankLabels[rank] || `Route ${rank + 1}`}
            </Badge>
            <CardTitle className="text-lg">{route.name}</CardTitle>
          </div>
          <div className="text-right">
            <SafetyScore score={route.safetyScore} size="sm" showLabel={false} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Navigation className="h-4 w-4" />
            {route.distance}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {route.duration}
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">via</span>
          <span className="font-medium">{route.via}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-muted/50 rounded-md p-2">
            <span className="text-muted-foreground">Crime Level:</span>
            <span className="ml-1 font-medium">{route.factors.crime}</span>
          </div>
          <div className="bg-muted/50 rounded-md p-2">
            <span className="text-muted-foreground">Lighting:</span>
            <span className="ml-1 font-medium">{route.factors.lighting}</span>
          </div>
          <div className="bg-muted/50 rounded-md p-2">
            <span className="text-muted-foreground">Traffic:</span>
            <span className="ml-1 font-medium">{route.factors.traffic}</span>
          </div>
          <div className="bg-muted/50 rounded-md p-2">
            <span className="text-muted-foreground">Time Risk:</span>
            <span className="ml-1 font-medium">{route.factors.time}</span>
          </div>
        </div>

        <Button 
          variant={variant}
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.();
          }}
        >
          Select This Route
        </Button>
      </CardContent>
    </Card>
  );
}
