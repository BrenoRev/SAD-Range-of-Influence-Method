export function waitForAnchor(
  selector: string,
  onFound: (el: HTMLElement) => void,
  onTimeout: () => void,
  maxMs = 1500,
): () => void {
  let cancelled = false;
  let raf = 0;
  const start = Date.now();

  const tick = () => {
    if (cancelled) return;
    const el = document.querySelector(selector);
    if (el instanceof HTMLElement) {
      onFound(el);
      return;
    }
    if (Date.now() - start >= maxMs) {
      onTimeout();
      return;
    }
    raf = requestAnimationFrame(tick);
  };

  raf = requestAnimationFrame(tick);
  return () => {
    cancelled = true;
    cancelAnimationFrame(raf);
  };
}
