import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  AlertTriangle, 
  MapPin, 
  Users, 
  TrendingUp,
  Bell,
  Clock,
  Shield,
  Eye,
  CheckCircle,
  Loader2,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { format } from "date-fns";

interface PanicAlert {
  id: string;
  user_id: string | null;
  latitude: number;
  longitude: number;
  status: string;
  created_at: string;
  resolved_at: string | null;
}

interface LocationUpdate {
  id: string;
  panic_alert_id: string | null;
  latitude: number;
  longitude: number;
  created_at: string;
}

const stats = [
  { label: "Active Alerts", value: "0", icon: Bell, trend: "", color: "text-danger" },
  { label: "Routes Analyzed", value: "1,247", icon: MapPin, trend: "+89", color: "text-primary" },
  { label: "Safe Journeys", value: "98.2%", icon: Shield, trend: "+0.5%", color: "text-safe" },
  { label: "Total Alerts", value: "0", icon: Users, trend: "", color: "text-moderate" },
];

const riskZones = [
  { name: "Industrial District", level: "high", incidents: 12 },
  { name: "Old Town", level: "moderate", incidents: 5 },
  { name: "University Area", level: "low", incidents: 1 },
];

export default function AdminPage() {
  const [alerts, setAlerts] = useState<PanicAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState(stats);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const mapsLoaded = useGoogleMaps();

  // Fetch alerts
  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from("panic_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      
      setAlerts(data || []);
      
      // Update stats
      const activeCount = data?.filter(a => a.status === "active").length || 0;
      const totalCount = data?.length || 0;
      
      setStatsData(prev => prev.map(s => {
        if (s.label === "Active Alerts") return { ...s, value: activeCount.toString() };
        if (s.label === "Total Alerts") return { ...s, value: totalCount.toString() };
        return s;
      }));
    } catch (err) {
      console.error("Error fetching alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("panic-alerts-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "panic_alerts" },
        (payload) => {
          console.log("Real-time update:", payload);
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapsLoaded || !mapRef.current || mapInstanceRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: 28.6139, lng: 77.209 },
      zoom: 11,
      styles: [
        { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    mapInstanceRef.current = map;
  }, [mapsLoaded]);

  // Update markers when alerts change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    // Add new markers
    alerts.forEach(alert => {
      if (alert.latitude && alert.longitude) {
        const marker = new google.maps.Marker({
          position: { lat: alert.latitude, lng: alert.longitude },
          map: mapInstanceRef.current,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: alert.status === "active" ? 14 : 10,
            fillColor: alert.status === "active" ? "#ef4444" : "#22c55e",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
          title: `Alert: ${alert.status}`,
        });

        // Add pulse effect for active alerts
        if (alert.status === "active") {
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 8px;">
                <strong>🚨 Active Alert</strong><br/>
                <small>${format(new Date(alert.created_at), "PPp")}</small>
              </div>
            `,
          });
          marker.addListener("click", () => {
            infoWindow.open(mapInstanceRef.current, marker);
          });
        }

        markersRef.current.push(marker);
      }
    });

    // Fit bounds to show all markers
    if (markersRef.current.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      markersRef.current.forEach(m => bounds.extend(m.getPosition()!));
      mapInstanceRef.current?.fitBounds(bounds, 50);
    }
  }, [alerts, mapsLoaded]);

  const updateAlertStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("panic_alerts")
      .update({ 
        status, 
        resolved_at: status === "resolved" ? new Date().toISOString() : null 
      })
      .eq("id", id);

    if (!error) {
      fetchAlerts();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="danger">Active</Badge>;
      case "investigating":
        return <Badge variant="moderate">Investigating</Badge>;
      case "resolved":
        return <Badge variant="safe">Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return format(date, "MMM d, h:mm a");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Badge variant="secondary" className="mb-3">
              <LayoutDashboard className="w-3 h-3 mr-1" />
              Admin Dashboard
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Safety Monitoring Center
            </h1>
            <p className="text-muted-foreground">
              Monitor real-time alerts, view statistics, and manage safety reports.
            </p>
          </div>
          <Button onClick={fetchAlerts} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsData.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={cn("w-5 h-5", stat.color)} />
                    {stat.trend && (
                      <span className="text-xs text-safe flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {stat.trend}
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Alerts Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Live Panic Alerts</CardTitle>
                    <CardDescription>Real-time emergency alerts from users</CardDescription>
                  </div>
                  <Badge variant="danger-soft">
                    {alerts.filter(a => a.status === "active").length} active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : alerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No panic alerts recorded yet.</p>
                    <p className="text-sm">Alerts will appear here in real-time.</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div 
                      key={alert.id}
                      className={cn(
                        "p-4 rounded-lg border",
                        alert.status === "active" && "bg-danger-bg border-danger/20",
                        alert.status === "investigating" && "bg-moderate-bg border-moderate/20",
                        alert.status === "resolved" && "bg-safe-bg border-safe/20"
                      )}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className={cn(
                            "w-5 h-5",
                            alert.status === "active" ? "text-danger" : "text-muted-foreground"
                          )} />
                          <div>
                            <p className="font-medium text-foreground">
                              🚨 Panic Alert Triggered
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                            </div>
                          </div>
                        </div>
                        {getStatusBadge(alert.status)}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(alert.created_at)}
                        </span>
                        
                        {alert.status !== "resolved" && (
                          <div className="flex gap-2">
                            {alert.status === "active" && (
                              <Button 
                                variant="moderate" 
                                size="sm"
                                onClick={() => updateAlertStatus(alert.id, "investigating")}
                              >
                                Investigate
                              </Button>
                            )}
                            <Button 
                              variant="safe" 
                              size="sm"
                              onClick={() => updateAlertStatus(alert.id, "resolved")}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Resolve
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Map View */}
            <Card className="h-[400px] overflow-hidden">
              <div className="relative w-full h-full">
                {!mapsLoaded ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : (
                  <div ref={mapRef} className="absolute inset-0" />
                )}
                
                <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-card z-10">
                  <h4 className="text-sm font-semibold mb-2">Alert Locations</h4>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 bg-danger rounded-full animate-pulse" />
                      <span>Active Alerts</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 bg-safe rounded-full" />
                      <span>Resolved</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Risk Zones */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">High Risk Zones</CardTitle>
                <CardDescription>Areas requiring attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {riskZones.map((zone, i) => (
                  <div 
                    key={i}
                    className={cn(
                      "p-3 rounded-lg border",
                      zone.level === "high" && "bg-danger-bg border-danger/20",
                      zone.level === "moderate" && "bg-moderate-bg border-moderate/20",
                      zone.level === "low" && "bg-safe-bg border-safe/20"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{zone.name}</span>
                      <Badge 
                        variant={
                          zone.level === "high" ? "danger" : 
                          zone.level === "moderate" ? "moderate" : "safe"
                        }
                      >
                        {zone.level}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {zone.incidents} incidents this week
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="w-4 h-4 mr-2" />
                  Send Area Alert
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Contact Authorities
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">AI Model</span>
                  <Badge variant="safe-soft">Active</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Location Services</span>
                  <Badge variant="safe-soft">Online</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Real-time Sync</span>
                  <Badge variant="safe-soft">Connected</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Database</span>
                  <Badge variant="safe-soft">Active</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
