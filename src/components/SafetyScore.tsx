import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SafetyScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function SafetyScore({ score, size = "md", showLabel = true }: SafetyScoreProps) {
  const getStatus = () => {
    if (score >= 70) return { label: "Safe", variant: "safe" as const, color: "text-safe" };
    if (score >= 40) return { label: "Moderate", variant: "moderate" as const, color: "text-moderate" };
    return { label: "High Risk", variant: "danger" as const, color: "text-danger" };
  };

  const status = getStatus();

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("font-bold", textSizes[size], status.color)}>
            {score}
          </span>
          <span className="text-muted-foreground text-sm">/100</span>
        </div>
        {showLabel && (
          <Badge variant={`${status.variant}-soft`}>{status.label}</Badge>
        )}
      </div>
      <div className={cn("w-full bg-muted rounded-full overflow-hidden", sizeClasses[size])}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            score >= 70 ? "bg-safe" : score >= 40 ? "bg-moderate" : "bg-danger"
          )}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

interface SafetyFactorProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  status: "safe" | "moderate" | "danger";
}

export function SafetyFactor({ icon, label, value, status }: SafetyFactorProps) {
  const statusColors = {
    safe: "text-safe bg-safe-bg border-safe/20",
    moderate: "text-moderate bg-moderate-bg border-moderate/20",
    danger: "text-danger bg-danger-bg border-danger/20",
  };

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg border",
      statusColors[status]
    )}>
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{value}</p>
      </div>
    </div>
  );
}
