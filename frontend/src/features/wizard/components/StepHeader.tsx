import type { ReactNode } from "react";

type StepHeaderProps = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
};

export function StepHeader({ title, subtitle, right }: StepHeaderProps) {
  return (
    <header className="mb-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">
            {title}
          </h1>
          {subtitle ? <p className="mt-2 max-w-xl text-[14px] text-muted">{subtitle}</p> : null}
        </div>
        {right}
      </div>
    </header>
  );
}
