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
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/shared/components/ui/Toast";
import { useWizard } from "../context";
import { step1Valid, step2Valid, step3Valid } from "../defaults";
import type { Criterion } from "../schemas";
import { buildTourSteps, type TourStep } from "./tourSteps";

type GateData = { alternatives: string[]; criteria: Criterion[]; weights: number[] };

function leavingGate(route: string, d: GateData): { ok: boolean; reason?: string } {
  if (route === "/wizard/1") return step1Valid(d.alternatives);
  if (route === "/wizard/2") return step2Valid(d.criteria);
  if (route === "/wizard/3") return step3Valid(d.weights);
  return { ok: true };
}

function firstErrorStepIndex(steps: TourStep[], route: string, d: GateData): number {
  if (route === "/wizard/1") {
    let t = d.alternatives.findIndex((a) => !a.trim());
    if (t < 0) {
      const seen = new Map<string, number>();
      for (let i = 0; i < d.alternatives.length; i++) {
        const k = (d.alternatives[i] ?? "").trim().toLowerCase();
        if (k && seen.has(k)) {
          t = i;
          break;
        }
        if (k) seen.set(k, i);
      }
    }
    if (t < 0) t = 0;
    return steps.findIndex((s) => s.id === `s1-alt-${t}`);
  }
  if (route === "/wizard/2") return steps.findIndex((s) => s.id === "s2-table");
  return -1;
}

type TourContextValue = {
  active: boolean;
  index: number;
  steps: TourStep[];
  current: TourStep | null;
  atStart: boolean;
  atEnd: boolean;
  start: () => void;
  next: () => void;
  prev: () => void;
  stop: () => void;
};

const TourCtx = createContext<TourContextValue | null>(null);

function stepActive(step: TourStep, hasComputed: boolean): boolean {
  if (step.requires === "uncomputed" && hasComputed) return false;
  return true;
}

function nextActive(steps: TourStep[], from: number, hasComputed: boolean): number {
  for (let i = from + 1; i < steps.length; i++) {
    const s = steps[i];
    if (s && stepActive(s, hasComputed)) return i;
  }
  return -1;
}

function prevActive(steps: TourStep[], from: number, hasComputed: boolean): number {
  for (let i = from - 1; i >= 0; i--) {
    const s = steps[i];
    if (s && stepActive(s, hasComputed)) return i;
  }
  return -1;
}

function firstActive(steps: TourStep[], hasComputed: boolean): number {
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    if (s && stepActive(s, hasComputed)) return i;
  }
  return 0;
}

function firstActiveForRoute(steps: TourStep[], route: string, hasComputed: boolean): number {
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    if (s && s.route === route && stepActive(s, hasComputed)) return i;
  }
  return -1;
}

export function TourProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { hasComputed, alternatives, criteria, weights, revealErrors } = useWizard();

  const steps = useMemo(() => buildTourSteps(alternatives.length), [alternatives.length]);

  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);

  const pathRef = useRef(location.pathname);
  pathRef.current = location.pathname;
  const computedRef = useRef(hasComputed);
  computedRef.current = hasComputed;
  const indexRef = useRef(index);
  indexRef.current = index;
  const stepsRef = useRef(steps);
  stepsRef.current = steps;
  const dataRef = useRef<GateData>({ alternatives, criteria, weights });
  dataRef.current = { alternatives, criteria, weights };
  const lastFocus = useRef<HTMLElement | null>(null);

  const goToRoute = useCallback(
    (route: string) => {
      if (pathRef.current !== route) navigate(route);
    },
    [navigate],
  );

  const start = useCallback(() => {
    lastFocus.current = (document.activeElement as HTMLElement) ?? null;
    const fi = firstActive(stepsRef.current, computedRef.current);
    setIndex(fi);
    setActive(true);
    const step = stepsRef.current[fi];
    if (step) goToRoute(step.route);
  }, [goToRoute]);

  const stop = useCallback(() => {
    setActive(false);
    const el = lastFocus.current;
    if (el) requestAnimationFrame(() => el.focus());
  }, []);

  const next = useCallback(() => {
    const list = stepsRef.current;
    const cur = list[indexRef.current];
    const ni = nextActive(list, indexRef.current, computedRef.current);
    if (ni === -1) {
      setActive(false);
      return;
    }
    const nextStep = list[ni];
    if (cur && nextStep) {
      if (
        cur.requires === "uncomputed" &&
        nextStep.requires === "computed" &&
        !computedRef.current
      ) {
        const btn = document.querySelector<HTMLButtonElement>('[data-tour="matrix-compute"]');
        if (btn && !btn.disabled) {
          btn.click();
          return;
        }
        toast(
          "Preencha a matriz e clique em Calcular classificação para ver o resultado.",
          "danger",
        );
        const mi = list.findIndex((s) => s.id === "s4-matrix");
        if (mi >= 0) {
          setIndex(mi);
          goToRoute(list[mi]!.route);
        }
        return;
      }
      if (nextStep.route !== cur.route) {
        const gate = leavingGate(cur.route, dataRef.current);
        if (!gate.ok) {
          if (gate.reason) toast(gate.reason, "danger");
          revealErrors();
          const ji = firstErrorStepIndex(list, cur.route, dataRef.current);
          if (ji >= 0) {
            setIndex(ji);
            goToRoute(list[ji]!.route);
          }
          return;
        }
      }
    }
    setIndex(ni);
    if (nextStep) goToRoute(nextStep.route);
  }, [goToRoute, toast, revealErrors]);

  const prev = useCallback(() => {
    const list = stepsRef.current;
    const pi = prevActive(list, indexRef.current, computedRef.current);
    if (pi === -1) return;
    setIndex(pi);
    const step = list[pi];
    if (step) goToRoute(step.route);
  }, [goToRoute]);

  useEffect(() => {
    if (!active) return;
    const step = steps[index];
    if (step?.requires === "uncomputed" && hasComputed) next();
  }, [hasComputed, active, index, steps, next]);

  useEffect(() => {
    if (!active) return;
    const path = location.pathname;
    if (!path.startsWith("/wizard/")) {
      stop();
      return;
    }
    const step = steps[index];
    if (step && step.route === path) return;
    const ni = firstActiveForRoute(steps, path, computedRef.current);
    if (ni >= 0) setIndex(ni);
  }, [location.pathname, active, index, steps, stop]);

  const value = useMemo<TourContextValue>(() => {
    const current = active ? (steps[index] ?? null) : null;
    return {
      active,
      index,
      steps,
      current,
      atStart: prevActive(steps, index, hasComputed) === -1,
      atEnd: nextActive(steps, index, hasComputed) === -1,
      start,
      next,
      prev,
      stop,
    };
  }, [active, index, steps, hasComputed, start, next, prev, stop]);

  return <TourCtx.Provider value={value}>{children}</TourCtx.Provider>;
}

export function useTour(): TourContextValue {
  const ctx = useContext(TourCtx);
  if (!ctx) throw new Error("useTour must be used inside <TourProvider>");
  return ctx;
}
