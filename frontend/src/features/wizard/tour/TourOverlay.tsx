import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { X } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/lib/utils";
import { useWizard } from "../context";
import { useTour } from "./TourContext";
import { waitForAnchor } from "./waitForAnchor";
import type { TourPlacement } from "./tourSteps";

type Rect = { top: number; left: number; width: number; height: number };

const PAD = 6;
const GAP = 12;
const EDGE = 8;
const POP_W = 320;

function placePopover(
  rect: Rect | null,
  placement: TourPlacement,
  popW: number,
  popH: number,
): { top: number; left: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (!rect || placement === "center") {
    return {
      top: Math.max(EDGE, (vh - popH) / 2),
      left: Math.max(EDGE, (vw - popW) / 2),
    };
  }
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  let p = placement;
  if (p === "top" && rect.top - GAP - popH < EDGE) p = "bottom";
  else if (p === "bottom" && rect.top + rect.height + GAP + popH > vh - EDGE) p = "top";
  else if (p === "left" && rect.left - GAP - popW < EDGE) p = "right";
  else if (p === "right" && rect.left + rect.width + GAP + popW > vw - EDGE) p = "left";

  let top: number;
  let left: number;
  if (p === "top") {
    top = rect.top - GAP - popH;
    left = cx - popW / 2;
  } else if (p === "bottom") {
    top = rect.top + rect.height + GAP;
    left = cx - popW / 2;
  } else if (p === "left") {
    left = rect.left - GAP - popW;
    top = cy - popH / 2;
  } else {
    left = rect.left + rect.width + GAP;
    top = cy - popH / 2;
  }
  left = Math.max(EDGE, Math.min(left, vw - popW - EDGE));
  top = Math.max(EDGE, Math.min(top, vh - popH - EDGE));
  return { top, left };
}

export function TourOverlay() {
  const { active, current, next, prev, stop, atStart, atEnd, steps } = useTour();
  const { hasComputed } = useWizard();

  const [rect, setRect] = useState<Rect | null>(null);
  const [centered, setCentered] = useState(true);
  const [pop, setPop] = useState<{ top: number; left: number } | null>(null);
  const [ready, setReady] = useState(false);

  const elRef = useRef<HTMLElement | null>(null);
  const popRef = useRef<HTMLDivElement | null>(null);
  const nextBtnRef = useRef<HTMLButtonElement | null>(null);
  const rafRef = useRef(0);

  const targetId = current?.target ?? null;
  const wantsTarget =
    !!current &&
    !!targetId &&
    current.placement !== "center" &&
    !(current.requires === "computed" && !hasComputed);

  const measure = useCallback(() => {
    const el = elRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const top = Math.max(0, r.top - PAD);
    const left = Math.max(0, r.left - PAD);
    const width = Math.min(window.innerWidth, r.right + PAD) - left;
    const height = Math.min(window.innerHeight, r.bottom + PAD) - top;
    setRect({ top, left, width, height });
  }, []);

  useEffect(() => {
    if (!active || !current) return;
    if (!wantsTarget) {
      elRef.current = null;
      setCentered(true);
      setRect(null);
      return;
    }
    setCentered(false);
    const cancel = waitForAnchor(
      `[data-tour="${targetId}"]`,
      (el) => {
        elRef.current = el;
        el.scrollIntoView({ block: "center", behavior: "smooth" });
        requestAnimationFrame(() => measure());
      },
      () => {
        elRef.current = null;
        setCentered(true);
        setRect(null);
      },
    );
    return cancel;
  }, [active, current, wantsTarget, targetId, measure]);

  useEffect(() => {
    if (!active || centered) return;
    const onMove = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => measure());
    };
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    const main = document.querySelector("main");
    const obs = main ? new MutationObserver(onMove) : null;
    obs?.observe(main as Element, { childList: true, subtree: true, attributes: true });
    return () => {
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
      obs?.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [active, centered, measure]);

  useLayoutEffect(() => {
    if (!active || !current) return;
    const node = popRef.current;
    if (!node) return;
    const b = node.getBoundingClientRect();
    const placement: TourPlacement = centered || !rect ? "center" : current.placement;
    setPop(placePopover(centered ? null : rect, placement, b.width || POP_W, b.height));
    setReady(true);
  }, [active, current, rect, centered]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") stop();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, stop]);

  useEffect(() => {
    if (!active || !ready) return;
    const el = elRef.current;
    const fields = el
      ? Array.from(
          el.querySelectorAll<HTMLElement>(
            "input:not([disabled]), select:not([disabled]), textarea:not([disabled])",
          ),
        )
      : [];
    const emptyInput = fields.find((f) => f instanceof HTMLInputElement && !f.value.trim());
    const field = emptyInput ?? fields[0];
    if (field) field.focus({ preventScroll: true });
    else nextBtnRef.current?.focus();
  }, [active, ready, current]);

  useEffect(() => {
    if (!active) setReady(false);
  }, [active]);

  if (!active || !current) return null;

  const visible = steps.filter((s) => !(s.requires === "uncomputed" && hasComputed));
  const human = visible.findIndex((s) => s.id === current.id) + 1;
  const total = visible.length;
  const showSpotlight = !centered && !!rect;

  const big = !showSpotlight;
  const dim = "fixed z-50 bg-ink/50 pointer-events-none";
  const popStyle: CSSProperties = { top: pop?.top ?? 0, left: pop?.left ?? 0 };

  return (
    <>
      {showSpotlight && rect ? (
        <>
          <div
            className={dim}
            style={{ top: 0, left: 0, width: "100vw", height: rect.top }}
            aria-hidden
          />
          <div
            className={dim}
            style={{
              top: rect.top + rect.height,
              left: 0,
              width: "100vw",
              height: `calc(100vh - ${rect.top + rect.height}px)`,
            }}
            aria-hidden
          />
          <div
            className={dim}
            style={{ top: rect.top, left: 0, width: rect.left, height: rect.height }}
            aria-hidden
          />
          <div
            className={dim}
            style={{
              top: rect.top,
              left: rect.left + rect.width,
              width: `calc(100vw - ${rect.left + rect.width}px)`,
              height: rect.height,
            }}
            aria-hidden
          />
          <div
            className="pointer-events-none fixed z-50 rounded-md border-2 border-accent"
            style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
            aria-hidden
          />
        </>
      ) : (
        <div className="pointer-events-none fixed inset-0 z-50 bg-ink/40" aria-hidden />
      )}

      <div
        ref={popRef}
        role="dialog"
        aria-modal="false"
        aria-label={current.title}
        className={cn(
          "fixed z-50 max-w-[92vw] rounded-xl border border-line bg-white shadow-card transition-opacity duration-150",
          big ? "w-[480px]" : "w-[340px]",
          ready ? "opacity-100" : "opacity-0",
        )}
        style={popStyle}
      >
        <div
          className={cn("flex items-start justify-between gap-3", big ? "px-6 pt-6" : "px-4 pt-4")}
        >
          <h2 className={cn("font-semibold text-ink", big ? "text-[18px]" : "text-[14px]")}>
            {current.title}
          </h2>
          <button
            type="button"
            onClick={stop}
            aria-label="Fechar guia"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted hover:bg-page hover:text-ink"
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>
        <div
          className={cn(
            "leading-relaxed text-muted",
            big ? "px-6 pb-2 pt-3 text-[14.5px]" : "px-4 pb-1 pt-2 text-[13px]",
          )}
          aria-live="polite"
        >
          {current.body}
        </div>
        <div
          className={cn(
            "flex items-center justify-between gap-3",
            big ? "px-6 pb-6 pt-4" : "px-4 pb-4 pt-3",
          )}
        >
          <span className="text-[11px] text-muted">
            Passo <span className="font-mono text-ink">{human}</span> de{" "}
            <span className="font-mono text-ink">{total}</span>
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost-muted" size="sm" onClick={stop}>
              Pular
            </Button>
            <Button variant="ghost" size="sm" onClick={prev} disabled={atStart}>
              Voltar
            </Button>
            <Button ref={nextBtnRef} size="sm" onClick={next}>
              {atEnd ? "Concluir" : "Próximo"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
