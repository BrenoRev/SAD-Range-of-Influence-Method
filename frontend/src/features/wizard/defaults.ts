import type { Criterion, CriterionKind } from "./schemas";

export function defaultIdealForKind(
  kind: CriterionKind,
  A: number,
  B: number,
): { C: number; D: number } {
  if (kind === "benefit") return { C: B, D: B };
  if (kind === "cost") return { C: A, D: A };
  const span = B - A;
  // Sem arredondamento: o paper calcula em precisão total; arredondar só no
  // display (export.ts, tabelas, gráficos), nunca na entrada do cálculo.
  return { C: A + 0.4 * span, D: A + 0.6 * span };
}

export function blankCriterion(): Criterion {
  return { name: "", kind: "benefit", A: 0, B: 1, C: 1, D: 1 };
}

export function critRowErrors(c: Criterion): Partial<Record<"A" | "B" | "C" | "D", string>> {
  const e: Partial<Record<"A" | "B" | "C" | "D", string>> = {};
  const { A, B, C, D } = c;
  if (!Number.isFinite(A)) e.A = "Obrigatório";
  if (!Number.isFinite(B)) e.B = "Obrigatório";
  if (!Number.isFinite(C)) e.C = "Obrigatório";
  if (!Number.isFinite(D)) e.D = "Obrigatório";
  if (Object.keys(e).length) return e;
  if (A >= B) {
    e.A = "Mín deve ser menor que Máx";
    e.B = e.A;
  }
  if (C < A) e.C = "Deve ser ≥ Mín";
  if (D > B) e.D = "Deve ser ≤ Máx";
  if (C > D) {
    e.C = "Ideal de deve ser ≤ Ideal até";
    e.D = e.C;
  }
  return e;
}

export function step1Valid(alternatives: string[]): { ok: boolean; reason?: string } {
  const cleaned = alternatives.map((a) => a.trim()).filter(Boolean);
  if (cleaned.length < 2)
    return { ok: false, reason: "Adicione pelo menos 2 alternativas nomeadas." };
  const set = new Set(cleaned.map((s) => s.toLowerCase()));
  if (set.size !== cleaned.length)
    return { ok: false, reason: "Os nomes das alternativas devem ser únicos." };
  return { ok: true };
}

export function step2Valid(criteria: Criterion[]): { ok: boolean; reason?: string } {
  if (criteria.length < 2) return { ok: false, reason: "Adicione pelo menos 2 critérios." };
  const names = criteria.map((c) => c.name.trim());
  if (names.some((n) => !n)) return { ok: false, reason: "Todo critério precisa de um nome." };
  const lower = names.map((n) => n.toLowerCase());
  if (new Set(lower).size !== lower.length)
    return { ok: false, reason: "Os nomes dos critérios devem ser únicos." };
  for (const c of criteria) {
    const e = critRowErrors(c);
    if (Object.keys(e).length)
      return { ok: false, reason: "Corrija as faixas destacadas em vermelho." };
  }
  return { ok: true };
}

export function step3Valid(weights: number[]): { ok: boolean; reason?: string } {
  const sum = weights.reduce((s, w) => s + Math.max(0, w), 0);
  if (sum <= 0) return { ok: false, reason: "Pelo menos um peso deve ser maior que zero." };
  return { ok: true };
}

export function normalizeWeights(raw: number[]): number[] {
  const sum = raw.reduce((s, w) => s + Math.max(0, w), 0);
  if (sum <= 0) return raw.map(() => 0);
  return raw.map((w) => Math.max(0, w) / sum);
}
