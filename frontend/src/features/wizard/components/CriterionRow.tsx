import { AlertCircle, Info, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { NumberField } from "@/shared/components/ui/NumberField";
import { Select } from "@/shared/components/ui/Select";
import { Tooltip } from "@/shared/components/ui/Tooltip";
import { defaultIdealForKind, critRowErrors, NAME_MAX_LEN } from "../defaults";
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

// Trocar tipo ou faixa [A, B] reposiciona o ideal [C, D] pelo padrão do tipo (só com A < B).
function critHandlers(criterion: Criterion, onUpdate: (patch: Partial<Criterion>) => void) {
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
  return { onKindChange, onRangeChange };
}

function NumCell({
  value,
  onChange,
  invalid,
  err,
  label,
  tourId,
}: {
  value: number;
  onChange: (v: number) => void;
  invalid: boolean;
  err?: string;
  label: string;
  tourId?: string;
}) {
  return (
    <td className="px-4 py-3 align-top" data-tour={tourId}>
      {err ? (
        <Tooltip content={err}>
          <span className="inline-block w-full">
            <NumberField
              value={value}
              onChange={onChange}
              className="font-mono text-[13px]"
              invalid={invalid}
              aria-label={label}
            />
          </span>
        </Tooltip>
      ) : (
        <NumberField
          value={value}
          onChange={onChange}
          className="font-mono text-[13px]"
          invalid={invalid}
          aria-label={label}
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
  const { onKindChange, onRangeChange } = critHandlers(criterion, onUpdate);

  return (
    <tr className="border-b border-line align-top last:border-b-0">
      <td className="px-4 py-3">
        <Input
          value={criterion.name}
          placeholder={`ex.: Critério ${index + 1}`}
          maxLength={NAME_MAX_LEN}
          onChange={(e) => onUpdate({ name: e.target.value })}
          invalid={nameInvalid}
          aria-label={`Nome do critério ${index + 1}`}
        />
      </td>
      <td className="px-4 py-3" data-tour={index === 0 ? "crit-type" : undefined}>
        <Select
          value={criterion.kind}
          onChange={(e) => onKindChange(e.target.value as CriterionKind)}
          options={typeOptions}
          aria-label="Tipo do critério"
        />
      </td>
      <NumCell
        value={criterion.A}
        invalid={!!errors.A}
        err={errors.A}
        label="Mínimo (A)"
        onChange={(v) => onRangeChange("A", v)}
        tourId={index === 0 ? "crit-A" : undefined}
      />
      <NumCell
        value={criterion.B}
        invalid={!!errors.B}
        err={errors.B}
        label="Máximo (B)"
        onChange={(v) => onRangeChange("B", v)}
      />
      <NumCell
        value={criterion.C}
        invalid={!!errors.C}
        err={errors.C}
        label="Ideal de (C)"
        onChange={(v) => onUpdate({ C: v })}
        tourId={index === 0 ? "crit-C" : undefined}
      />
      <NumCell
        value={criterion.D}
        invalid={!!errors.D}
        err={errors.D}
        label="Ideal até (D)"
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

const CARD_FIELDS: Array<{ key: "A" | "B" | "C" | "D"; label: string }> = [
  { key: "A", label: "Mín (A)" },
  { key: "B", label: "Máx (B)" },
  { key: "C", label: "Ideal de (C)" },
  { key: "D", label: "Ideal até (D)" },
];

export function CriterionCard({
  index,
  criterion,
  canRemove,
  nameInvalid,
  onUpdate,
  onRemove,
}: CriterionRowProps) {
  const errors = critRowErrors(criterion);
  const { onKindChange, onRangeChange } = critHandlers(criterion, onUpdate);

  const fieldChange = (key: "A" | "B" | "C" | "D") => (v: number) => {
    if (key === "A" || key === "B") onRangeChange(key, v);
    else onUpdate({ [key]: v });
  };

  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <Input
            value={criterion.name}
            placeholder={`ex.: Critério ${index + 1}`}
            maxLength={NAME_MAX_LEN}
            onChange={(e) => onUpdate({ name: e.target.value })}
            invalid={nameInvalid}
            aria-label={`Nome do critério ${index + 1}`}
          />
        </div>
        <Button
          variant="ghost-muted"
          size="icon"
          onClick={onRemove}
          disabled={!canRemove}
          aria-label="Remover critério"
        >
          <Trash2 size={16} strokeWidth={1.5} />
        </Button>
      </div>

      <div className="mt-3">
        <div className="mb-1 text-[11px] text-muted">Tipo</div>
        <Select
          value={criterion.kind}
          onChange={(e) => onKindChange(e.target.value as CriterionKind)}
          options={typeOptions}
          aria-label="Tipo do critério"
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        {CARD_FIELDS.map((f) => {
          const err = errors[f.key];
          return (
            <div key={f.key}>
              <div className="mb-1 font-mono text-[11px] text-muted">{f.label}</div>
              <NumberField
                value={criterion[f.key]}
                onChange={fieldChange(f.key)}
                className="font-mono text-[13px]"
                invalid={!!err}
                aria-label={f.label}
              />
              {err ? (
                <div className="mt-1 flex items-center gap-1 text-[11px] text-danger">
                  <AlertCircle size={11} strokeWidth={1.5} /> {err}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ColHead({ title, hint }: { title: string; hint: string }) {
  return (
    <th className="min-w-[104px] px-4 py-3 font-medium">
      <span className="inline-flex items-center gap-1 whitespace-nowrap">
        <span className="font-mono text-[12px]">{title}</span>
        <Tooltip content={hint}>
          <Info size={12} strokeWidth={1.5} className="text-muted" />
        </Tooltip>
      </span>
    </th>
  );
}
