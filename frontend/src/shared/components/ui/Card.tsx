import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

export function Card({ children, className, ...rest }: CardProps) {
  return (
    <div className={cn("rounded-xl border border-line bg-white", className)} {...rest}>
      {children}
    </div>
  );
}
