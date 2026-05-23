import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid = false, type = "text", ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "h-9 w-full rounded-lg border bg-white px-3 text-sm text-ink placeholder:text-muted/80",
        "focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent",
        invalid ? "border-danger ring-1 ring-danger/30" : "border-line",
        className,
      )}
      {...rest}
    />
  );
});
