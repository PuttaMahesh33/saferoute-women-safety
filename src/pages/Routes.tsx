import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { FloatingPanicButton } from "@/components/PanicButton";
import { GoogleMap } from "@/components/GoogleMap";
import { PlacesAutocomplete } from "@/components/PlacesAutocomplete";
import { RouteCard } from "@/components/RouteCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Navigation, Clock, ArrowRight, Loader2, AlertCircle, X, ChevronRight, MapPin, Gauge, AlertTriangle } from "lucide-react";
import { useDirections, RouteResult } from "@/hooks/useGoogleMaps";
import { useNavigation } from "@/hooks/useNavigation";
import { toast } from "sonner";

export default function RoutesPage() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const { getDirections, routes, loading, error, mapsLoaded } = useDirections();
  const navigate = useNavigate();
  const { 
    isNavigating, 
    currentStep, 
    currentPosition,
    instructions, 
    timeRemaining, 
    distanceRemaining,
    progress,
    accuracy,
    heading,
    speed,
    isOffRoute,
    gpsStatus,
    startNavigation, 
    stopNavigation, 
    nextStep 
  } = useNavigation();

  const handleSearch = async () => {
    if (!source || !destination) {
      toast.error("Please enter both starting point and destination");
      return;
    }
    
    const results = await getDirections(source, destination);
    if (results.length > 0) {
      setSelectedRoute(results[0].id);
      toast.success(`Found ${results.length} routes. Safest route selected.`);
    }
  };

  const handleStartNavigation = () => {
    const routeData = routes.find(r => r.id === selectedRoute);
    if (routeData) {
      startNavigation(routeData);
      toast.success("🧭 GPS Navigation started! Walk to see live tracking.");
    }
  };

  const handleGoToTracking = () => {
    navigate("/tracking");
  };

  const getRouteCounts = () => {
    const safe = routes.filter(r => r.safetyScore >= 70).length;
    const moderate = routes.filter(r => r.safetyScore >= 40 && r.safetyScore < 70).length;
    const danger = routes.filter(r => r.safetyScore < 40).length;
    return { safe, moderate, danger };
  };

  const counts = getRouteCounts();
  const selectedRouteData = routes.find(r => r.id === selectedRoute);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <Badge variant="safe-soft" className="mb-3">
            <Navigation className="w-3 h-3 mr-1" />
            {isNavigating ? "Live GPS Navigation" : "Route Finder"}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {isNavigating ? "Navigating to Destination" : "Find Your Safest Route"}
          </h1>
          <p className="text-muted-foreground">
            {isNavigating 
              ? "Your live GPS position is being tracked. Walk to see the marker move." 
              : "Enter your locations to discover AI-recommended safe routes."}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - Search & Routes */}
          <div className="space-y-6">
            {/* Navigation Mode Panel */}
            {isNavigating && (
              <Card className="border-safe/50 bg-safe-bg">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-safe flex items-center gap-2">
                      <Navigation className="w-5 h-5 animate-pulse" />
                      Live Navigation
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={stopNavigation}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* GPS Status */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">GPS Status:</span>
                    <Badge variant={
                      gpsStatus === 'tracking' ? 'safe' : 
                      gpsStatus === 'initializing' ? 'moderate' : 'danger'
                    }>
                      {gpsStatus === 'tracking' ? '📡 Active' : 
                       gpsStatus === 'initializing' ? '⏳ Acquiring...' : '❌ Error'}
                    </Badge>
                  </div>

                  {/* Off Route Warning */}
                  {isOffRoute && (
                    <div className="flex items-center gap-2 p-2 bg-danger-bg rounded-lg text-danger text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      <span>You are off route!</span>
                    </div>
                  )}

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-safe h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Current instruction */}
                  <div className="p-3 bg-card rounded-lg">
                    <p className="text-xs text-muted-foreground">Step {currentStep + 1} of {instructions.length}</p>
                    <p className="font-medium">{instructions[currentStep]}</p>
                  </div>

                  {/* Live Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-card rounded-lg">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <MapPin className="w-3 h-3" />
                        Distance
                      </div>
                      <p className="font-semibold">{distanceRemaining || "Calculating..."}</p>
                    </div>
                    <div className="p-3 bg-card rounded-lg">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <Clock className="w-3 h-3" />
                        ETA
                      </div>
                      <p className="font-semibold">{timeRemaining || "Calculating..."}</p>
                    </div>
                  </div>

                  {/* GPS Accuracy */}
                  {accuracy && (
                    <div className="flex items-center justify-between text-sm p-2 bg-card rounded-lg">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Gauge className="w-3 h-3" />
                        GPS Accuracy
                      </span>
                      <span className={accuracy < 20 ? "text-safe" : accuracy < 50 ? "text-moderate" : "text-danger"}>
                        ±{Math.round(accuracy)}m
                      </span>
                    </div>
                  )}

                  {/* Current Position */}
                  {currentPosition && (
                    <div className="text-xs text-muted-foreground p-2 bg-card rounded-lg">
                      <span className="font-medium">Your Position:</span>
                      <br />
                      {currentPosition.lat.toFixed(6)}, {currentPosition.lng.toFixed(6)}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={nextStep}
                      disabled={currentStep >= instructions.length - 1}
                    >
                      Next Step <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="safe" 
                      size="sm"
                      onClick={handleGoToTracking}
                    >
                      Share Location
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Search Card */}
            {!isNavigating && (
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
                      <PlacesAutocomplete
                        value={source}
                        onChange={setSource}
                        placeholder="Enter starting location"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">
                        Destination
                      </label>
                      <PlacesAutocomplete
                        value={destination}
                        onChange={setDestination}
                        placeholder="Enter destination"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    variant="hero" 
                    className="w-full" 
                    onClick={handleSearch}
                    disabled={loading || !source || !destination || !mapsLoaded}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing Routes...
                      </>
                    ) : !mapsLoaded ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading Maps...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        Find Safe Routes
                      </>
                    )}
                  </Button>

                  {error && (
                    <div className="flex items-center gap-2 text-sm text-danger bg-danger-bg p-3 rounded-lg">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  {/* Quick stats */}
                  {routes.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <div className="text-center p-2 rounded-lg bg-safe-bg">
                        <div className="text-lg font-bold text-safe">{counts.safe}</div>
                        <div className="text-[10px] text-muted-foreground">Safe</div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-moderate-bg">
                        <div className="text-lg font-bold text-moderate">{counts.moderate}</div>
                        <div className="text-[10px] text-muted-foreground">Moderate</div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-danger-bg">
                        <div className="text-lg font-bold text-danger">{counts.danger}</div>
                        <div className="text-[10px] text-muted-foreground">High Risk</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Route Cards */}
            {routes.length > 0 && !isNavigating && (
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Available Routes</h3>
                {routes.map((route, index) => (
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
              <GoogleMap 
                className="h-full" 
                routes={routes}
                selectedRouteId={selectedRoute}
                isNavigating={isNavigating}
                userPosition={currentPosition}
                navigationRouteId={selectedRoute}
                accuracy={accuracy}
                heading={heading}
                gpsStatus={gpsStatus}
              >
                {/* Legend - hide during navigation */}
                {!isNavigating && (
                  <div className="absolute top-4 right-4 bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-card z-10">
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
                )}

                {/* Selected route info */}
                {selectedRouteData && !isNavigating && (
                  <div className="absolute bottom-4 left-4 right-4 md:right-auto md:max-w-sm z-10">
                    <Card variant="glass" className="bg-card/95 backdrop-blur-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">
                            {selectedRouteData.name}
                          </h4>
                          <Badge 
                            variant={
                              selectedRouteData.safetyScore >= 70 
                                ? "safe" 
                                : selectedRouteData.safetyScore >= 40 
                                  ? "moderate" 
                                  : "danger"
                            }
                          >
                            Score: {selectedRouteData.safetyScore}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Navigation className="w-3 h-3" />
                            {selectedRouteData.distance}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {selectedRouteData.duration}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          via {selectedRouteData.via}
                        </p>
                        <Button 
                          variant="safe" 
                          className="w-full" 
                          size="sm"
                          onClick={handleStartNavigation}
                        >
                          <Navigation className="w-4 h-4 mr-1" />
                          Start GPS Navigation
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Navigation info overlay */}
                {isNavigating && (
                  <div className="absolute bottom-4 left-4 right-4 z-10">
                    <Card className="bg-card/95 backdrop-blur-sm border-safe/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold text-safe">{distanceRemaining}</p>
                            <p className="text-sm text-muted-foreground">to destination • {timeRemaining}</p>
                          </div>
                          <Button variant="danger" size="sm" onClick={stopNavigation}>
                            End Navigation
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </GoogleMap>
            </Card>
          </div>
        </div>
      </main>

      <FloatingPanicButton />
    </div>
  );
}
