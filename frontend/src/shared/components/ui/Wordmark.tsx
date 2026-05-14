import { cn } from "@/shared/lib/utils";

type WordmarkProps = {
  className?: string;
};

export function Wordmark({ className }: WordmarkProps) {
  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className="font-mono text-[15px] font-semibold tracking-tight text-ink">RIM</span>
      <span className="text-[12px] text-muted">Método do Ideal de Referência</span>
    </div>
  );
}
