type FactCellProps = {
  label: string;
  title: string;
  body: string;
};

export function FactCell({ label, title, body }: FactCellProps) {
  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-2 text-[14px] font-semibold text-ink">{title}</div>
      <div className="mt-1 text-[13px] leading-snug text-muted">{body}</div>
    </div>
  );
}
