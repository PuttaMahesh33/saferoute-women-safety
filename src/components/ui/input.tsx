import * as React from "react";
import { cn } from "@/lib/utils";
import { Search, MapPin } from "lucide-react";

export interface InputProps extends React.ComponentProps<"input"> {
  icon?: "search" | "location" | "none";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon = "none", ...props }, ref) => {
    const iconElement = {
      search: <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />,
      location: <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />,
      none: null,
    }[icon];

    if (icon !== "none") {
      return (
        <div className="relative">
          {iconElement}
          <input
            type={type}
            className={cn(
              "flex h-11 w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
      );
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
