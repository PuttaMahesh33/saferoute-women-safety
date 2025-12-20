import { Shield, AlertCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePanicAlert } from "@/hooks/usePanicAlert";

interface PanicButtonProps {
  size?: "default" | "large";
  showLabel?: boolean;
}

export function PanicButton({ size = "default", showLabel = true }: PanicButtonProps) {
  const { isActive, sending, triggerPanic, stopPanic, latitude, longitude } = usePanicAlert();

  const handlePanic = async () => {
    if (isActive) {
      stopPanic();
    } else {
      await triggerPanic();
    }
  };

  if (size === "large") {
    return (
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={handlePanic}
          disabled={sending}
          className={`
            relative w-40 h-40 rounded-full transition-all duration-300
            ${isActive 
              ? 'bg-danger scale-95 shadow-panic' 
              : sending
                ? 'bg-danger/50'
                : 'gradient-panic animate-pulse-panic hover:scale-105'
            }
            flex flex-col items-center justify-center gap-2
            disabled:cursor-not-allowed
          `}
        >
          <AlertCircle className="w-12 h-12 text-panic-foreground" />
          <span className="text-panic-foreground font-bold text-lg">
            {sending ? "SENDING..." : isActive ? "ACTIVE" : "SOS"}
          </span>
        </button>
        
        {isActive && (
          <div className="text-center">
            <p className="text-safe font-semibold">🚨 Alert is ACTIVE</p>
            {latitude && longitude && (
              <p className="text-sm text-muted-foreground">
                Location: {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </p>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={stopPanic}
              className="mt-2"
            >
              Stop Alert
            </Button>
          </div>
        )}
        
        {showLabel && !isActive && (
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
      disabled={sending}
    >
      <AlertCircle className="w-5 h-5" />
      {sending ? "Sending Alert..." : isActive ? "Alert Active" : "Panic Button"}
    </Button>
  );
}

export function FloatingPanicButton() {
  const { isActive, sending, triggerPanic, stopPanic } = usePanicAlert();

  const handlePanic = async () => {
    if (isActive) {
      stopPanic();
    } else {
      await triggerPanic();
    }
  };

  return (
    <button
      onClick={handlePanic}
      disabled={sending}
      className={`
        fixed bottom-6 right-6 z-50
        w-16 h-16 rounded-full 
        ${isActive 
          ? 'bg-safe scale-95 animate-pulse' 
          : sending
            ? 'bg-danger/50'
            : 'gradient-panic animate-pulse-panic hover:scale-110'
        }
        flex items-center justify-center
        transition-transform duration-200
        shadow-panic
        disabled:cursor-not-allowed
      `}
      title={isActive ? "Alert Active - Click to stop" : "Emergency Panic Button"}
    >
      <AlertCircle className="w-7 h-7 text-panic-foreground" />
    </button>
  );
}
