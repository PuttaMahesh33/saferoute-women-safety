import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FloatingPanicButton } from "@/components/PanicButton";
import { 
  Shield, 
  Map, 
  Brain, 
  AlertCircle, 
  Star, 
  Navigation,
  ArrowRight,
  Lightbulb,
  Users,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Map,
    title: "Smart Route Finding",
    description: "Get multiple route options with safety scores based on real-time data and AI predictions.",
  },
  {
    icon: Brain,
    title: "AI Crime Prediction",
    description: "Machine learning analyzes historical crime data, time, and location to predict risk levels.",
  },
  {
    icon: AlertCircle,
    title: "Panic Button",
    description: "One-tap emergency alert sends your live location to contacts and authorities instantly.",
  },
  {
    icon: Navigation,
    title: "Live Tracking",
    description: "Share your real-time location with trusted contacts during your journey.",
  },
  {
    icon: Lightbulb,
    title: "Safety Factors",
    description: "We analyze street lighting, traffic density, time of day, and user ratings.",
  },
  {
    icon: Star,
    title: "Community Ratings",
    description: "User-submitted safety ratings help improve route recommendations for everyone.",
  },
];

const stats = [
  { value: "50K+", label: "Safe Routes Planned" },
  { value: "98%", label: "User Satisfaction" },
  { value: "24/7", label: "Active Monitoring" },
  { value: "5 sec", label: "Alert Response" },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="container relative py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center animate-slide-up">
            <Badge variant="safe-soft" className="mb-6">
              <Shield className="w-3 h-3 mr-1" />
              AI-Powered Safety
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Find the{" "}
              <span className="text-primary">Safest Route</span>
              {" "}to Your Destination
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              SafeRoute uses AI-powered crime prediction to recommend the safest paths, 
              not just the shortest. Your safety is our priority.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/routes">
                <Button variant="hero" size="xl" className="gap-2 w-full sm:w-auto">
                  Find Safe Route
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/panic">
                <Button variant="outline-danger" size="xl" className="gap-2 w-full sm:w-auto">
                  <AlertCircle className="w-5 h-5" />
                  Emergency SOS
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-muted/30">
        <div className="container py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container py-20">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Features</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Comprehensive Safety Features
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to travel safely, powered by advanced AI and community insights.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={i} 
                className="group hover:shadow-card-hover transition-all duration-300 animate-scale-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg gradient-hero flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/30 border-y border-border">
        <div className="container py-20">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Safety in 3 Simple Steps
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Enter Locations",
                description: "Input your starting point and destination",
                icon: Map,
              },
              {
                step: "2",
                title: "AI Analyzes Routes",
                description: "Our ML model evaluates crime data and safety factors",
                icon: Brain,
              },
              {
                step: "3",
                title: "Choose Safest Path",
                description: "Select from color-coded routes based on safety scores",
                icon: Shield,
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="relative text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-hero text-primary-foreground text-2xl font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {item.description}
                  </p>
                  {i < 2 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20">
        <Card variant="glass" className="gradient-hero p-1">
          <div className="bg-card rounded-lg p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Your Safety Matters
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of users who trust SafeRoute for their daily commute. 
              Start your safe journey today.
            </p>
            <Link to="/routes">
              <Button variant="hero" size="xl">
                Start Using SafeRoute
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">SafeRoute</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 SafeRoute. Empowering safe journeys through AI.
            </p>
          </div>
        </div>
      </footer>

      <FloatingPanicButton />
    </div>
  );
}
