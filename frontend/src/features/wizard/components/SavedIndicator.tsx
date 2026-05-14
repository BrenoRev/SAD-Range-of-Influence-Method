import { Check, Loader } from "lucide-react";

type SavedIndicatorProps = {
  saved: boolean;
};

export function SavedIndicator({ saved }: SavedIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5 text-[12px] text-muted">
      {saved ? (
        <>
          <Check size={14} strokeWidth={1.5} className="text-ok" />
          <span>Salvo</span>
        </>
      ) : (
        <>
          <Loader size={12} strokeWidth={1.5} className="animate-spin text-muted" />
          <span>Salvando…</span>
        </>
      )}
    </div>
  );
}
