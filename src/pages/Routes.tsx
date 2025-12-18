import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { FloatingPanicButton } from "@/components/PanicButton";
import { MapPlaceholder } from "@/components/MapPlaceholder";
import { RouteCard, Route } from "@/components/RouteCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Navigation, Clock, MapPin, ArrowRight, Loader2 } from "lucide-react";

const mockRoutes: Route[] = [
  {
    id: "1",
    name: "Main Street Route",
    safetyScore: 87,
    distance: "3.2 km",
    duration: "12 min",
    via: "Main St, Central Ave, Park Blvd",
    factors: {
      crime: "Low",
      lighting: "Good",
      traffic: "Moderate",
      time: "Low Risk",
    },
  },
  {
    id: "2",
    name: "Commercial Route",
    safetyScore: 64,
    distance: "2.8 km",
    duration: "10 min",
    via: "Market St, 5th Ave",
    factors: {
      crime: "Moderate",
      lighting: "Average",
      traffic: "High",
      time: "Moderate",
    },
  },
  {
    id: "3",
    name: "Shortcut Route",
    safetyScore: 35,
    distance: "2.1 km",
    duration: "8 min",
    via: "Industrial Rd, Back Lane",
    factors: {
      crime: "High",
      lighting: "Poor",
      traffic: "Low",
      time: "High Risk",
    },
  },
];

export default function RoutesPage() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedRoute, setSelectedRoute] = useState<string | null>("1");
  const [isSearching, setIsSearching] = useState(false);
  const [showRoutes, setShowRoutes] = useState(true);

  const handleSearch = () => {
    if (!source || !destination) return;
    
    setIsSearching(true);
    // Simulate search
    setTimeout(() => {
      setIsSearching(false);
      setShowRoutes(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <Badge variant="safe-soft" className="mb-3">
            <Navigation className="w-3 h-3 mr-1" />
            Route Finder
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Find Your Safest Route
          </h1>
          <p className="text-muted-foreground">
            Enter your locations to discover AI-recommended safe routes.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - Search & Routes */}
          <div className="space-y-6">
            {/* Search Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Route Search</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">
                      Starting Point
                    </label>
                    <Input
                      icon="location"
                      placeholder="Enter starting location"
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">
                      Destination
                    </label>
                    <Input
                      icon="location"
                      placeholder="Enter destination"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    />
                  </div>
                </div>
                
                <Button 
                  variant="hero" 
                  className="w-full" 
                  onClick={handleSearch}
                  disabled={isSearching || !source || !destination}
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing Routes...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Find Safe Routes
                    </>
                  )}
                </Button>

                {/* Quick stats */}
                {showRoutes && (
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="text-center p-2 rounded-lg bg-safe-bg">
                      <div className="text-lg font-bold text-safe">1</div>
                      <div className="text-[10px] text-muted-foreground">Safe</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-moderate-bg">
                      <div className="text-lg font-bold text-moderate">1</div>
                      <div className="text-[10px] text-muted-foreground">Moderate</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-danger-bg">
                      <div className="text-lg font-bold text-danger">1</div>
                      <div className="text-[10px] text-muted-foreground">High Risk</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Route Cards */}
            {showRoutes && (
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Available Routes</h3>
                {mockRoutes.map((route, index) => (
                  <RouteCard
                    key={route.id}
                    route={route}
                    rank={index}
                    isSelected={selectedRoute === route.id}
                    onSelect={() => setSelectedRoute(route.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Panel - Map */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] overflow-hidden">
              <MapPlaceholder 
                className="h-full" 
                showRoutes={showRoutes}
              >
                {/* Legend */}
                <div className="absolute top-4 right-4 bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-card">
                  <h4 className="text-sm font-semibold mb-2">Route Legend</h4>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-4 h-1 bg-safe rounded" />
                      <span>Safe Route (70+)</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-4 h-1 bg-moderate rounded" />
                      <span>Moderate (40-69)</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-4 h-1 bg-danger rounded" />
                      <span>High Risk (&lt;40)</span>
                    </div>
                  </div>
                </div>

                {/* Selected route info */}
                {selectedRoute && (
                  <div className="absolute bottom-4 left-4 right-4 md:right-auto md:max-w-sm">
                    <Card variant="glass" className="bg-card/95 backdrop-blur-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">
                            {mockRoutes.find(r => r.id === selectedRoute)?.name}
                          </h4>
                          <Badge 
                            variant={
                              mockRoutes.find(r => r.id === selectedRoute)!.safetyScore >= 70 
                                ? "safe" 
                                : mockRoutes.find(r => r.id === selectedRoute)!.safetyScore >= 40 
                                  ? "moderate" 
                                  : "danger"
                            }
                          >
                            Score: {mockRoutes.find(r => r.id === selectedRoute)?.safetyScore}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Navigation className="w-3 h-3" />
                            {mockRoutes.find(r => r.id === selectedRoute)?.distance}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {mockRoutes.find(r => r.id === selectedRoute)?.duration}
                          </span>
                        </div>
                        <Button variant="safe" className="w-full" size="sm">
                          Start Navigation
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
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
