import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-lg",
        outline: "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Safety-specific variants
        safe: "bg-safe text-safe-foreground hover:bg-safe/90 shadow-safe hover:shadow-lg",
        moderate: "bg-moderate text-moderate-foreground hover:bg-moderate/90 shadow-md hover:shadow-lg",
        danger: "bg-danger text-danger-foreground hover:bg-danger/90 shadow-md hover:shadow-lg",
        // Hero button for landing page
        hero: "gradient-hero text-primary-foreground hover:opacity-90 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
        // Panic button - highly visible
        panic: "gradient-panic text-panic-foreground animate-pulse-panic hover:opacity-90 font-bold tracking-wide",
        // Outline variants for each status
        "outline-safe": "border-2 border-safe text-safe bg-transparent hover:bg-safe-bg",
        "outline-moderate": "border-2 border-moderate text-moderate bg-transparent hover:bg-moderate-bg",
        "outline-danger": "border-2 border-danger text-danger bg-transparent hover:bg-danger-bg",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
        "icon-lg": "h-12 w-12",
        "icon-xl": "h-16 w-16 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
