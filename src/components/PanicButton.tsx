import { Shield, AlertCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface PanicButtonProps {
  size?: "default" | "large";
  showLabel?: boolean;
}

export function PanicButton({ size = "default", showLabel = true }: PanicButtonProps) {
  const [isActivated, setIsActivated] = useState(false);
  const { toast } = useToast();

  const handlePanic = () => {
    setIsActivated(true);
    
    // Simulate getting location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          toast({
            title: "Emergency Alert Sent!",
            description: `Location shared: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}. Help is on the way.`,
            variant: "destructive",
          });
        },
        () => {
          toast({
            title: "Emergency Alert Sent!",
            description: "Could not get exact location. Alert sent to emergency contacts.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Emergency Alert Sent!",
        description: "Alert sent to emergency contacts.",
        variant: "destructive",
      });
    }

    // Reset after 3 seconds
    setTimeout(() => setIsActivated(false), 3000);
  };

  if (size === "large") {
    return (
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={handlePanic}
          className={`
            relative w-40 h-40 rounded-full transition-all duration-300
            ${isActivated 
              ? 'bg-danger scale-95 shadow-panic' 
              : 'gradient-panic animate-pulse-panic hover:scale-105'
            }
            flex flex-col items-center justify-center gap-2
          `}
        >
          <AlertCircle className="w-12 h-12 text-panic-foreground" />
          <span className="text-panic-foreground font-bold text-lg">
            {isActivated ? "SENDING..." : "SOS"}
          </span>
        </button>
        {showLabel && (
          <p className="text-muted-foreground text-center max-w-xs">
            Press in case of emergency. Your location will be shared with emergency contacts.
          </p>
        )}
      </div>
    );
  }

  return (
    <Button
      variant="panic"
      size="lg"
      onClick={handlePanic}
      className="gap-2"
      disabled={isActivated}
    >
      <AlertCircle className="w-5 h-5" />
      {isActivated ? "Sending Alert..." : "Panic Button"}
    </Button>
  );
}

export function FloatingPanicButton() {
  const { toast } = useToast();
  const [isActivated, setIsActivated] = useState(false);

  const handlePanic = () => {
    setIsActivated(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          toast({
            title: "🚨 Emergency Alert Sent!",
            description: `Location: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
            variant: "destructive",
          });
        },
        () => {
          toast({
            title: "🚨 Emergency Alert Sent!",
            description: "Alert sent to emergency contacts.",
            variant: "destructive",
          });
        }
      );
    }

    setTimeout(() => setIsActivated(false), 3000);
  };

  return (
    <button
      onClick={handlePanic}
      className={`
        fixed bottom-6 right-6 z-50
        w-16 h-16 rounded-full 
        ${isActivated 
          ? 'bg-danger scale-95' 
          : 'gradient-panic animate-pulse-panic hover:scale-110'
        }
        flex items-center justify-center
        transition-transform duration-200
        shadow-panic
      `}
      title="Emergency Panic Button"
    >
      <AlertCircle className="w-7 h-7 text-panic-foreground" />
    </button>
  );
}
