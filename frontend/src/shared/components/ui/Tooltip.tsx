import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type TooltipProps = {
  children: ReactNode;
  content: ReactNode;
};

type Pos = { top: number; left: number; placement: "top" | "bottom" };

export function Tooltip({ children, content }: TooltipProps) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const lastPointer = useRef<string>("mouse");
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<Pos>({ top: 0, left: 0, placement: "top" });
  const id = useId();

  const place = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const margin = 8;
    const half = Math.min(240, window.innerWidth - margin * 2) / 2;
    const left = Math.min(
      Math.max(r.left + r.width / 2, margin + half),
      window.innerWidth - margin - half,
    );
    // Fica em cima se couber, senão embaixo (evita corte nas bordas da viewport).
    const est = 64;
    const spaceAbove = r.top;
    const spaceBelow = window.innerHeight - r.bottom;
    const placement: Pos["placement"] =
      spaceAbove >= est || spaceAbove >= spaceBelow ? "top" : "bottom";
    setPos({ top: placement === "top" ? r.top : r.bottom, left, placement });
  }, []);

  const show = useCallback(() => {
    place();
    setOpen(true);
  }, [place]);
  const hide = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onScroll = () => hide();
    const onResize = () => hide();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && hide();
    const onDown = (e: PointerEvent) => {
      if (!triggerRef.current?.contains(e.target as Node)) hide();
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open, hide]);

  return (
    <span
      ref={triggerRef}
      className="inline-flex items-center"
      tabIndex={0}
      aria-describedby={open ? id : undefined}
      onPointerDown={(e) => {
        lastPointer.current = e.pointerType || "mouse";
      }}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") show();
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") hide();
      }}
      onFocus={() => show()}
      onBlur={hide}
      onClick={() => {
        if (lastPointer.current === "touch") setOpen((v) => !v);
      }}
    >
      {children}
      {open
        ? createPortal(
            <span
              id={id}
              role="tooltip"
              style={{
                position: "fixed",
                top: pos.top,
                left: pos.left,
                transform: `translate(-50%, ${pos.placement === "top" ? "calc(-100% - 6px)" : "6px"})`,
              }}
              className="pointer-events-none z-[100] max-w-[240px] rounded-md bg-ink px-2 py-1.5 text-[11px] leading-snug text-white shadow-md"
            >
              {content}
            </span>,
            document.body,
          )
        : null}
    </span>
  );
}
