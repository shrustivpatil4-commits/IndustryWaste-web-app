import * as React from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'default' | 'outline' | 'ghost' | 'accent' | 'success';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-accent disabled:pointer-events-none disabled:opacity-50"
    const variants = {
      default: "bg-surface border border-teal-accent/20 text-foreground shadow hover:bg-teal-accent/10",
      accent: "bg-teal-accent text-background shadow hover:bg-teal-accent/90",
      success: "bg-green-accent text-background shadow hover:bg-green-accent/90",
      outline: "border border-teal-accent/50 bg-transparent shadow-sm hover:bg-teal-accent/10 text-teal-accent",
      ghost: "hover:bg-accent hover:text-accent-foreground",
    }
    const sizes = {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-10 rounded-md px-8",
      icon: "h-9 w-9",
    }
    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
