import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Loader, Sliders } from "lucide-react";
import { Card } from "@/shared/components/ui/Card";
import { Select } from "@/shared/components/ui/Select";
import { Slider } from "@/shared/components/ui/Slider";
import { Tabs } from "@/shared/components/ui/Tabs";
import { cn } from "@/shared/lib/utils";
import type { components } from "@/shared/types/api";
import { useSensitivity } from "../api/useSensitivity";
import type { Criterion } from "../schemas";

type RankingEntry = components["schemas"]["RankingEntry"];
type DecisionInput = components["schemas"]["DecisionInput"];

type SensitivityPanelProps = {
  criteria: Criterion[];
  weights: number[];
  ranking: RankingEntry[];
  alternatives: string[];
  baseInput: DecisionInput;
  recalcSpin: boolean;
  onChangeWeight: (i: number, raw: number) => void;
};

export function SensitivityPanel({
  criteria,
  weights,
  ranking,
  alternatives,
  baseInput,
  recalcSpin,
  onChangeWeight,
}: SensitivityPanelProps) {
  const [tab, setTab] = useState<string>("live");
  const sum = weights.reduce((s, w) => s + Math.max(0, w), 0);
  const pct = (i: number) => (sum > 0 ? ((Math.max(0, weights[i] ?? 0)) / sum) * 100 : 0);

  return (
    <aside className="space-y-4">
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
            <Sliders size={14} strokeWidth={1.5} className="text-accent" /> Sensibilidade
          </div>
          {recalcSpin ? (
            <div className="flex items-center gap-1.5 text-[11px] text-muted">
              <Loader size={12} strokeWidth={1.5} className="animate-spin" /> Recalculando
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] text-muted">
              <Check size={12} strokeWidth={1.5} className="text-ok" /> Atualizado
            </div>
          )}
        </div>
        <p className="mt-1 text-[12px] leading-snug text-muted">
          Ajuste qualquer peso para ver a classificação atualizar em tempo real.
        </p>
        <div className="mt-4 space-y-4">
          {criteria.map((c, i) => (
            <div key={i}>
              <div className="flex items-baseline justify-between gap-2">
                <div className="truncate text-[12px] font-medium text-ink">{c.name}</div>
                <div className="font-mono text-[12px] tabular-nums text-ink">
                  {pct(i).toFixed(1)}%
                </div>
              </div>
              <div className="mt-2">
                <Slider
                  value={Math.max(0, Math.min(100, weights[i] ?? 0))}
                  onChange={(v) => onChangeWeight(i, v)}
                  ariaLabel={`Peso para ${c.name}`}
                  ariaValueText={`${pct(i).toFixed(1)} por cento`}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { value: "live", label: "Ranking ao vivo" },
            { value: "whatif", label: "E se?" },
          ]}
        />
        {tab === "live" ? (
          <LiveRanking ranking={ranking} />
        ) : (
          <WhatIfPanel
            criteria={criteria}
            alternatives={alternatives}
            baseInput={baseInput}
          />
        )}
      </Card>
    </aside>
  );
}

function LiveRanking({ ranking }: { ranking: RankingEntry[] }) {
  return (
    <div className="mt-4 space-y-2">
      {ranking.map((r) => (
        <div key={r.alternative} className="flex items-center gap-3 text-[12px]">
          <span
            className={cn(
              "inline-grid h-5 w-5 place-items-center rounded-full font-mono text-[11px]",
              r.rank === 1 ? "bg-ok-soft text-ok" : "border border-line text-muted",
            )}
          >
            {r.rank}
          </span>
          <span className="flex-1 truncate text-ink">{r.alternative}</span>
          <span className="font-mono tabular-nums text-muted">{r.R.toFixed(4)}</span>
        </div>
      ))}
    </div>
  );
}

const PALETTE = ["#5e6ad2", "#7d87de", "#9aa2e8", "#b9beef", "#d3d6f5", "#e6e9fa"];

function WhatIfPanel({
  criteria,
  alternatives,
  baseInput,
}: {
  criteria: Criterion[];
  alternatives: string[];
  baseInput: DecisionInput;
}) {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const { data, run, loading } = useSensitivity();
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    void run(
      { base: baseInput, criterion_index: selectedIdx, points: 11 },
      controller.signal,
    );
    return () => controller.abort();
  }, [run, baseInput, selectedIdx]);

  const W = 280;
  const H = 160;
  const padL = 28;
  const padR = 6;
  const padT = 8;
  const padB = 22;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const series = useMemo(() => {
    if (!data) return [];
    const points = data.points;
    return alternatives.map((alt) => {
      return points.map((p, sIdx) => {
        const entry = p.ranking.find((r) => r.alternative === alt);
        return { sIdx, value: entry ? entry.R : 0, weight: p.weight };
      });
    });
  }, [data, alternatives]);

  const steps = series[0]?.length ?? 0;
  const xAt = (s: number) => (steps <= 1 ? padL : padL + (s / (steps - 1)) * innerW);
  const yAt = (v: number) => padT + (1 - Math.max(0, Math.min(1, v))) * innerH;

  return (
    <div className="mt-4">
      <div className="mb-1.5 text-[11px] text-muted">Variando o peso de:</div>
      <Select
        value={String(selectedIdx)}
        onChange={(e) => setSelectedIdx(Number(e.target.value))}
        options={criteria.map((c, i) => ({
          value: String(i),
          label: c.name || `Critério ${i + 1}`,
        }))}
      />
      <div className="mt-3 overflow-x-auto">
        {loading && !data ? (
          <div className="py-8 text-center text-[12px] text-muted">Calculando…</div>
        ) : (
          <svg width={W} height={H} className="block">
            {[0, 0.25, 0.5, 0.75, 1].map((t) => (
              <g key={t}>
                <line
                  x1={padL}
                  x2={W - padR}
                  y1={yAt(t)}
                  y2={yAt(t)}
                  stroke="#e6e6e6"
                  strokeDasharray={t === 0 || t === 1 ? "" : "2 3"}
                />
                <text
                  x={padL - 4}
                  y={yAt(t)}
                  dominantBaseline="middle"
                  textAnchor="end"
                  fontSize="9"
                  fill="#6b7280"
                  fontFamily="ui-monospace, JetBrains Mono, monospace"
                >
                  {t.toFixed(2)}
                </text>
              </g>
            ))}
            <text
              x={padL}
              y={H - 4}
              fontSize="9"
              fill="#6b7280"
              fontFamily="ui-monospace, JetBrains Mono, monospace"
            >
              peso=0%
            </text>
            <text
              x={W - padR}
              y={H - 4}
              textAnchor="end"
              fontSize="9"
              fill="#6b7280"
              fontFamily="ui-monospace, JetBrains Mono, monospace"
            >
              peso=100%
            </text>
            {series.map((line, i) => {
              const color = PALETTE[i % PALETTE.length] ?? PALETTE[0];
              return (
                <polyline
                  key={i}
                  fill="none"
                  stroke={color}
                  strokeWidth={1.5}
                  points={line.map((p) => `${xAt(p.sIdx)},${yAt(p.value)}`).join(" ")}
                />
              );
            })}
          </svg>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted">
        {alternatives.map((a, i) => {
          const color = PALETTE[i % PALETTE.length] ?? PALETTE[0];
          return (
            <span key={i} className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-sm"
                style={{ background: color }}
                aria-hidden
              />
              {a.length > 14 ? a.slice(0, 13) + "…" : a}
            </span>
          );
        })}
      </div>
    </div>
  );
}
