import { ChevronRight } from "lucide-react";
import { Badge } from "@/shared/components/ui/Badge";
import type { components } from "@/shared/types/api";

type CaseSummary = components["schemas"]["CaseSummary"];

type CaseCardProps = {
  summary: CaseSummary;
  onClick: () => void;
  disabled?: boolean;
};

export function CaseCard({ summary, onClick, disabled = false }: CaseCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group cursor-pointer rounded-xl border border-line bg-white p-4 text-left transition-colors hover:border-accent focus:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Badge className="h-auto max-w-full whitespace-normal py-1 text-left leading-tight">
        {summary.source}
      </Badge>
      <h4 className="mt-3 text-[15px] font-semibold text-ink">{summary.title}</h4>
      <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-muted">
        {summary.description}
      </p>
      <div className="mt-4 flex items-center justify-between text-[12px] text-muted">
        <span>Carregar e ver o resultado</span>
        <ChevronRight
          size={14}
          strokeWidth={1.5}
          className="text-muted transition-colors group-hover:text-accent"
        />
      </div>
    </button>
  );
}
