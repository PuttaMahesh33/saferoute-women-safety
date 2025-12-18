import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { FloatingPanicButton } from "@/components/PanicButton";
import { MapPlaceholder } from "@/components/MapPlaceholder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Navigation, 
  Play, 
  Pause, 
  Share2, 
  Users, 
  Shield, 
  Hospital, 
  Phone,
  Clock,
  MapPin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SafeZone {
  id: string;
  name: string;
  type: "police" | "hospital" | "safe-point";
  distance: string;
}

const safezones: SafeZone[] = [
  { id: "1", name: "Central Police Station", type: "police", distance: "0.8 km" },
  { id: "2", name: "City Hospital", type: "hospital", distance: "1.2 km" },
  { id: "3", name: "Safe Point - Mall", type: "safe-point", distance: "0.5 km" },
];

export default function TrackingPage() {
  const [isTracking, setIsTracking] = useState(false);
  const [shareWithContacts, setShareWithContacts] = useState(true);
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking]);

  useEffect(() => {
    if (isTracking && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        },
        { enableHighAccuracy: true }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [isTracking]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartTracking = () => {
    setIsTracking(true);
    setElapsedTime(0);
    toast({
      title: "Live Tracking Started",
      description: shareWithContacts 
        ? "Your location is now being shared with your emergency contacts."
        : "Tracking active. Enable sharing to notify contacts.",
    });
  };

  const handleStopTracking = () => {
    setIsTracking(false);
    toast({
      title: "Tracking Stopped",
      description: "Your location is no longer being shared.",
    });
  };

  const handleShareLocation = () => {
    toast({
      title: "Location Shared",
      description: "Your current location has been sent to your emergency contacts.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <Badge variant={isTracking ? "safe" : "secondary"} className="mb-3">
            <Navigation className="w-3 h-3 mr-1" />
            {isTracking ? "Tracking Active" : "Live Tracking"}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Live Location Tracking
          </h1>
          <p className="text-muted-foreground">
            Share your real-time location with trusted contacts for added safety.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Control Panel */}
          <div className="space-y-6">
            {/* Tracking Control */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tracking Control</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isTracking ? (
                  <div className="text-center py-4">
                    <div className="relative inline-flex">
                      <div className="w-20 h-20 rounded-full bg-safe/20 flex items-center justify-center animate-pulse">
                        <Navigation className="w-8 h-8 text-safe" />
                      </div>
                      <div className="absolute -inset-2 rounded-full border-2 border-safe/30 animate-ping" />
                    </div>
                    <p className="mt-4 text-2xl font-bold text-foreground">
                      {formatTime(elapsedTime)}
                    </p>
                    <p className="text-sm text-muted-foreground">Tracking Duration</p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
                      <Navigation className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="mt-4 text-muted-foreground">
                      Start tracking to share your location
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Share with contacts</span>
                  </div>
                  <Switch
                    checked={shareWithContacts}
                    onCheckedChange={setShareWithContacts}
                  />
                </div>

                {isTracking ? (
                  <Button 
                    variant="danger" 
                    className="w-full" 
                    onClick={handleStopTracking}
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Stop Tracking
                  </Button>
                ) : (
                  <Button 
                    variant="safe" 
                    className="w-full" 
                    onClick={handleStartTracking}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Tracking
                  </Button>
                )}

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleShareLocation}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Current Location
                </Button>
              </CardContent>
            </Card>

            {/* Current Location */}
            {currentPosition && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Current Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Latitude</span>
                      <span className="font-mono">{currentPosition.lat.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Longitude</span>
                      <span className="font-mono">{currentPosition.lng.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Updated</span>
                      <span>Just now</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Nearby Safe Zones */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Nearby Safe Zones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {safezones.map((zone) => (
                  <div 
                    key={zone.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-safe-bg border border-safe/20"
                  >
                    <div className="w-10 h-10 rounded-full bg-safe/20 flex items-center justify-center">
                      {zone.type === "police" && <Shield className="w-5 h-5 text-safe" />}
                      {zone.type === "hospital" && <Hospital className="w-5 h-5 text-safe" />}
                      {zone.type === "safe-point" && <MapPin className="w-5 h-5 text-safe" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">
                        {zone.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{zone.distance}</p>
                    </div>
                    <Button variant="ghost" size="icon-lg">
                      <Navigation className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Map View */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] overflow-hidden">
              <MapPlaceholder 
                className="h-full" 
                showLocation={isTracking}
              >
                {/* Status overlay */}
                <div className="absolute top-4 left-4 right-4">
                  <Card variant="glass" className="bg-card/95 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${isTracking ? "bg-safe animate-pulse" : "bg-muted"}`} />
                          <span className="font-medium">
                            {isTracking ? "Tracking Active" : "Tracking Inactive"}
                          </span>
                        </div>
                        {isTracking && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {formatTime(elapsedTime)}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Emergency contacts overlay */}
                {isTracking && shareWithContacts && (
                  <div className="absolute bottom-4 left-4">
                    <Card variant="glass" className="bg-card/95 backdrop-blur-sm">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-safe" />
                          <span className="text-muted-foreground">Sharing with</span>
                          <Badge variant="safe-soft">3 contacts</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </MapPlaceholder>
            </Card>
          </div>
        </div>
      </main>

      <FloatingPanicButton />
    </div>
  );
}
