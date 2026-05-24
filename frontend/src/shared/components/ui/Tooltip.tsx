import type { ReactNode } from "react";

type TooltipProps = {
  children: ReactNode;
  content: ReactNode;
};

export function Tooltip({ children, content }: TooltipProps) {
  return (
    <span className="tt inline-flex items-center" tabIndex={0}>
      {children}
      <span className="tt-pop">{content}</span>
    </span>
  );
}
