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
      className="group flex h-full cursor-pointer flex-col rounded-xl border border-line bg-white p-4 text-left transition-colors hover:border-accent focus:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <h4 className="text-[15px] font-semibold text-ink">{summary.title}</h4>
      <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-muted">
        {summary.description}
      </p>
      <div className="mt-auto pt-4">
        <Badge className="mb-3 max-w-full">
          <span className="block min-w-0 truncate" title={summary.source}>
            {summary.source}
          </span>
        </Badge>
        <div className="flex items-center justify-between text-[12px] text-muted">
          <span>Carregar e ver o resultado</span>
          <ChevronRight
            size={14}
            strokeWidth={1.5}
            className="text-muted transition-colors group-hover:text-accent"
          />
        </div>
      </div>
    </button>
  );
}
