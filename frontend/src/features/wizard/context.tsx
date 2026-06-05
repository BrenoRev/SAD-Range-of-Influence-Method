import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { readJson, writeJson } from "@/shared/lib/storage";
import type { components } from "@/shared/types/api";
import { blankCriterion } from "./defaults";
import type { Criterion } from "./schemas";

type CaseDetail = components["schemas"]["CaseDetail"];

export type WizardState = {
  alternatives: string[];
  criteria: Criterion[];
  weights: number[];
  X: number[][];
  hasComputed: boolean;
  maxReached: number;
};

type WizardContextValue = WizardState & {
  setAlternatives: (a: string[]) => void;
  setCriteria: (c: Criterion[]) => void;
  setWeights: (w: number[]) => void;
  setX: (x: number[][]) => void;
  setCell: (i: number, j: number, value: number) => void;
  setHasComputed: (v: boolean) => void;
  setMaxReached: (n: number) => void;
  loadFromCase: (detail: CaseDetail) => void;
  reset: () => void;
  saved: boolean;
  hasSavedSnapshot: boolean;
  resumeSaved: () => boolean;
  errorTick: number;
  revealErrors: () => void;
  clearErrors: () => void;
};

const STORAGE_KEY = "rim:lastDecision";

const WizardCtx = createContext<WizardContextValue | null>(null);

function blankState(): WizardState {
  return {
    alternatives: ["", ""],
    criteria: [blankCriterion(), blankCriterion()],
    weights: [50, 50],
    X: [
      [Number.NaN, Number.NaN],
      [Number.NaN, Number.NaN],
    ],
    hasComputed: false,
    maxReached: 1,
  };
}

function safeNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : Number.NaN;
  }
  return Number.NaN;
}

function reshapeX(prev: number[][], rows: number, cols: number): number[][] {
  const out: number[][] = [];
  for (let i = 0; i < rows; i++) {
    const row: number[] = [];
    const src = prev[i];
    for (let j = 0; j < cols; j++) {
      const v = src ? src[j] : undefined;
      row.push(v !== undefined ? v : Number.NaN);
    }
    out.push(row);
  }
  return out;
}

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WizardState>(() => blankState());
  const [saved, setSaved] = useState(true);
  const [hasSavedSnapshot, setHasSavedSnapshot] = useState(false);
  const [errorTick, setErrorTick] = useState(0);
  const firstRender = useRef(true);

  const revealErrors = useCallback(() => setErrorTick((t) => t + 1), []);
  const clearErrors = useCallback(() => setErrorTick(0), []);

  useEffect(() => {
    const parsed = readJson<WizardState>(STORAGE_KEY);
    if (parsed && Array.isArray(parsed.alternatives) && parsed.alternatives.length >= 2) {
      setHasSavedSnapshot(true);
    }
  }, []);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setSaved(false);
    const t = setTimeout(() => {
      writeJson(STORAGE_KEY, {
        alternatives: state.alternatives,
        criteria: state.criteria,
        weights: state.weights,
        X: state.X,
        hasComputed: state.hasComputed,
        maxReached: state.maxReached,
      });
      setSaved(true);
      setHasSavedSnapshot(true);
    }, 350);
    return () => clearTimeout(t);
  }, [state]);

  const setAlternatives = useCallback((alternatives: string[]) => {
    setState((s) => {
      const cols = s.criteria.length;
      const nextX = reshapeX(s.X, alternatives.length, cols);
      return { ...s, alternatives, X: nextX, hasComputed: false };
    });
  }, []);

  const setCriteria = useCallback((criteria: Criterion[]) => {
    setState((s) => {
      const rows = s.alternatives.length;
      const cols = criteria.length;
      let weights = s.weights.slice(0, cols);
      while (weights.length < cols) weights.push(50);
      const nextX = reshapeX(s.X, rows, cols);
      return { ...s, criteria, weights, X: nextX, hasComputed: false };
    });
  }, []);

  const setWeights = useCallback((weights: number[]) => {
    setState((s) => ({ ...s, weights }));
  }, []);

  const setX = useCallback((X: number[][]) => {
    setState((s) => ({ ...s, X }));
  }, []);

  const setCell = useCallback((i: number, j: number, value: number) => {
    setState((s) => {
      const next = s.X.map((row) => row.slice());
      const row = next[i];
      if (row) row[j] = value;
      return { ...s, X: next };
    });
  }, []);

  const setHasComputed = useCallback((v: boolean) => {
    setState((s) => ({ ...s, hasComputed: v }));
  }, []);

  const setMaxReached = useCallback((n: number) => {
    setState((s) => ({ ...s, maxReached: Math.max(s.maxReached, n) }));
  }, []);

  const loadFromCase = useCallback((detail: CaseDetail) => {
    const { input } = detail;
    setState({
      alternatives: input.alternatives.slice(),
      criteria: input.criteria.map((c) => ({ ...c })),
      weights: input.weights.map((w) => w * 100),
      X: input.X.map((row) => row.slice()),
      hasComputed: true,
      maxReached: 4,
    });
  }, []);

  const reset = useCallback(() => {
    setState(blankState());
  }, []);

  const resumeSaved = useCallback((): boolean => {
    const parsed = readJson<WizardState>(STORAGE_KEY);
    if (!parsed || !Array.isArray(parsed.alternatives) || parsed.alternatives.length < 2) {
      return false;
    }
    const X = Array.isArray(parsed.X)
      ? parsed.X.map((row) => (Array.isArray(row) ? row.map(safeNumber) : []))
      : [];
    setState({
      alternatives: parsed.alternatives.slice(),
      criteria: Array.isArray(parsed.criteria)
        ? parsed.criteria.map((c) => ({ ...c }))
        : [blankCriterion()],
      weights: Array.isArray(parsed.weights) ? parsed.weights.slice() : [50],
      X,
      hasComputed: Boolean(parsed.hasComputed),
      maxReached: typeof parsed.maxReached === "number" ? parsed.maxReached : 1,
    });
    return true;
  }, []);

  const value = useMemo<WizardContextValue>(
    () => ({
      ...state,
      setAlternatives,
      setCriteria,
      setWeights,
      setX,
      setCell,
      setHasComputed,
      setMaxReached,
      loadFromCase,
      reset,
      saved,
      hasSavedSnapshot,
      resumeSaved,
      errorTick,
      revealErrors,
      clearErrors,
    }),
    [
      state,
      setAlternatives,
      setCriteria,
      setWeights,
      setX,
      setCell,
      setHasComputed,
      setMaxReached,
      loadFromCase,
      reset,
      saved,
      hasSavedSnapshot,
      resumeSaved,
      errorTick,
      revealErrors,
      clearErrors,
    ],
  );

  return <WizardCtx.Provider value={value}>{children}</WizardCtx.Provider>;
}

export function useWizard(): WizardContextValue {
  const ctx = useContext(WizardCtx);
  if (!ctx) throw new Error("useWizard must be used inside <WizardProvider>");
  return ctx;
}
