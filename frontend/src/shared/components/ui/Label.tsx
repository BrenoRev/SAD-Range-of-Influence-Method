import type { LabelHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  children?: ReactNode;
};

export function Label({ children, className, ...rest }: LabelProps) {
  return (
    <label className={cn("text-[13px] font-medium text-ink", className)} {...rest}>
      {children}
    </label>
  );
}
