import { Info, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Select } from "@/shared/components/ui/Select";
import { Tooltip } from "@/shared/components/ui/Tooltip";
import { cn } from "@/shared/lib/utils";
import { defaultIdealForKind, critRowErrors } from "../defaults";
import type { Criterion, CriterionKind } from "../schemas";

type CriterionRowProps = {
  index: number;
  criterion: Criterion;
  canRemove: boolean;
  nameInvalid?: boolean;
  onUpdate: (patch: Partial<Criterion>) => void;
  onRemove: () => void;
};

const typeOptions = [
  { value: "benefit", label: "Benefício ↑" },
  { value: "cost", label: "Custo ↓" },
  { value: "target", label: "Alvo →" },
];

function parseCellValue(raw: string): number {
  if (raw.trim() === "") return Number.NaN;
  const n = Number(raw);
  return Number.isFinite(n) ? n : Number.NaN;
}

function NumCell({
  value,
  onChange,
  invalid,
  err,
  tourId,
}: {
  value: number;
  onChange: (v: number) => void;
  invalid: boolean;
  err?: string;
  tourId?: string;
}) {
  const display = Number.isFinite(value) ? String(value) : "";
  return (
    <td className="px-4 py-3" data-tour={tourId}>
      {err ? (
        <Tooltip content={err}>
          <span className="inline-block w-full">
            <Input
              type="number"
              value={display}
              onChange={(e) => onChange(parseCellValue(e.target.value))}
              className={cn("font-mono text-[13px]")}
              invalid={invalid}
            />
          </span>
        </Tooltip>
      ) : (
        <Input
          type="number"
          value={display}
          onChange={(e) => onChange(parseCellValue(e.target.value))}
          className={cn("font-mono text-[13px]")}
          invalid={invalid}
        />
      )}
    </td>
  );
}

export function CriterionRow({
  index,
  criterion,
  canRemove,
  nameInvalid,
  onUpdate,
  onRemove,
}: CriterionRowProps) {
  const errors = critRowErrors(criterion);

  const onKindChange = (kind: CriterionKind) => {
    const { A, B } = criterion;
    if (Number.isFinite(A) && Number.isFinite(B) && A < B) {
      const { C, D } = defaultIdealForKind(kind, A, B);
      onUpdate({ kind, C, D });
    } else {
      onUpdate({ kind });
    }
  };

  const onRangeChange = (key: "A" | "B", v: number) => {
    const next = { ...criterion, [key]: v };
    if (Number.isFinite(next.A) && Number.isFinite(next.B) && next.A < next.B) {
      const { C, D } = defaultIdealForKind(next.kind, next.A, next.B);
      onUpdate({ [key]: v, C, D });
    } else {
      onUpdate({ [key]: v });
    }
  };

  return (
    <tr className="border-b border-line align-top last:border-b-0">
      <td className="px-4 py-3">
        <Input
          value={criterion.name}
          placeholder={`ex.: Critério ${index + 1}`}
          onChange={(e) => onUpdate({ name: e.target.value })}
          invalid={nameInvalid}
        />
      </td>
      <td className="px-4 py-3" data-tour={index === 0 ? "crit-type" : undefined}>
        <Select
          value={criterion.kind}
          onChange={(e) => onKindChange(e.target.value as CriterionKind)}
          options={typeOptions}
        />
      </td>
      <NumCell
        value={criterion.A}
        invalid={!!errors.A}
        err={errors.A}
        onChange={(v) => onRangeChange("A", v)}
        tourId={index === 0 ? "crit-A" : undefined}
      />
      <NumCell
        value={criterion.B}
        invalid={!!errors.B}
        err={errors.B}
        onChange={(v) => onRangeChange("B", v)}
      />
      <NumCell
        value={criterion.C}
        invalid={!!errors.C}
        err={errors.C}
        onChange={(v) => onUpdate({ C: v })}
        tourId={index === 0 ? "crit-C" : undefined}
      />
      <NumCell
        value={criterion.D}
        invalid={!!errors.D}
        err={errors.D}
        onChange={(v) => onUpdate({ D: v })}
      />
      <td className="px-3 py-3 text-right">
        <Button
          variant="ghost-muted"
          size="icon"
          onClick={onRemove}
          disabled={!canRemove}
          aria-label="Remover critério"
        >
          <Trash2 size={16} strokeWidth={1.5} />
        </Button>
      </td>
    </tr>
  );
}

export function ColHead({ title, hint }: { title: string; hint: string }) {
  return (
    <th className="px-4 py-3 font-medium">
      <span className="inline-flex items-center gap-1 whitespace-nowrap">
        <span className="font-mono text-[12px]">{title}</span>
        <Tooltip content={hint}>
          <Info size={12} strokeWidth={1.5} className="text-muted" />
        </Tooltip>
      </span>
    </th>
  );
}
