import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { MapPlaceholder } from "@/components/MapPlaceholder";
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
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  type: "panic" | "crime" | "feedback";
  message: string;
  location: string;
  time: string;
  status: "active" | "resolved" | "investigating";
}

const mockAlerts: Alert[] = [
  {
    id: "1",
    type: "panic",
    message: "Panic button triggered",
    location: "Sector 15, Near Metro Station",
    time: "2 min ago",
    status: "active",
  },
  {
    id: "2",
    type: "crime",
    message: "Suspicious activity reported",
    location: "Industrial Area, Block C",
    time: "15 min ago",
    status: "investigating",
  },
  {
    id: "3",
    type: "feedback",
    message: "Poor lighting reported",
    location: "Main Street, Near Park",
    time: "1 hour ago",
    status: "resolved",
  },
];

const stats = [
  { label: "Active Alerts", value: "3", icon: Bell, trend: "+2", color: "text-danger" },
  { label: "Routes Analyzed", value: "1,247", icon: MapPin, trend: "+89", color: "text-primary" },
  { label: "Safe Journeys", value: "98.2%", icon: Shield, trend: "+0.5%", color: "text-safe" },
  { label: "Active Users", value: "342", icon: Users, trend: "+24", color: "text-moderate" },
];

const riskZones = [
  { name: "Industrial District", level: "high", incidents: 12 },
  { name: "Old Town", level: "moderate", incidents: 5 },
  { name: "University Area", level: "low", incidents: 1 },
];

export default function AdminPage() {
  const [alerts, setAlerts] = useState(mockAlerts);

  const updateAlertStatus = (id: string, status: Alert["status"]) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, status } : a));
  };

  const getStatusBadge = (status: Alert["status"]) => {
    switch (status) {
      case "active":
        return <Badge variant="danger">Active</Badge>;
      case "investigating":
        return <Badge variant="moderate">Investigating</Badge>;
      case "resolved":
        return <Badge variant="safe">Resolved</Badge>;
    }
  };

  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "panic":
        return <AlertTriangle className="w-5 h-5 text-danger" />;
      case "crime":
        return <Shield className="w-5 h-5 text-moderate" />;
      case "feedback":
        return <Eye className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <Badge variant="secondary" className="mb-3">
            <LayoutDashboard className="w-3 h-3 mr-1" />
            Admin Dashboard
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Safety Monitoring Center
          </h1>
          <p className="text-muted-foreground">
            Monitor alerts, view statistics, and manage safety reports.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={cn("w-5 h-5", stat.color)} />
                    <span className="text-xs text-safe flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {stat.trend}
                    </span>
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
                    <CardTitle className="text-lg">Live Alerts</CardTitle>
                    <CardDescription>Real-time emergency and safety alerts</CardDescription>
                  </div>
                  <Badge variant="danger-soft">
                    {alerts.filter(a => a.status === "active").length} active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {alerts.map((alert) => (
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
                        {getAlertIcon(alert.type)}
                        <div>
                          <p className="font-medium text-foreground">{alert.message}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {alert.location}
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(alert.status)}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {alert.time}
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
                ))}
              </CardContent>
            </Card>

            {/* Map View */}
            <Card className="h-[400px] overflow-hidden">
              <MapPlaceholder className="h-full" showLocation>
                <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-card">
                  <h4 className="text-sm font-semibold mb-2">Risk Zones</h4>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 bg-danger rounded-full animate-pulse" />
                      <span>High Risk Areas</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 bg-moderate rounded-full" />
                      <span>Moderate Risk</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 bg-safe rounded-full" />
                      <span>Safe Zones</span>
                    </div>
                  </div>
                </div>
              </MapPlaceholder>
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

            {/* Recent Activity */}
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
                  <span className="text-muted-foreground">Alert System</span>
                  <Badge variant="safe-soft">Running</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Sync</span>
                  <span className="text-xs">2 min ago</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
