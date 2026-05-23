import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "ghost-muted" | "danger" | "outline";
type Size = "sm" | "md" | "lg" | "icon";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children?: ReactNode;
};

const baseClasses =
  "inline-flex items-center justify-center gap-1.5 font-medium select-none whitespace-nowrap cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] rounded-md",
  md: "h-9 px-4 text-sm rounded-md",
  lg: "h-10 px-5 text-sm rounded-md",
  icon: "h-9 w-9 rounded-md",
};

const variantClasses: Record<Variant, string> = {
  primary: "bg-accent text-white hover:bg-accent-hover",
  secondary: "bg-white text-ink border border-line hover:bg-page",
  ghost: "text-ink hover:bg-page",
  "ghost-muted": "text-muted hover:text-ink hover:bg-page",
  danger: "text-danger hover:bg-red-50",
  outline: "bg-white text-ink border border-line hover:border-ink/30",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className, children, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(baseClasses, sizeClasses[size], variantClasses[variant], className)}
      {...rest}
    >
      {children}
    </button>
  );
});
