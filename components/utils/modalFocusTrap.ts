const FOCUSABLE = 'a[href], area[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  const els = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
  // some test environments (jsdom) report offsetWidth/height as 0 — prefer a fallback
  const visible = els.filter(el => {
    try {
      return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    } catch {
      return true;
    }
  });
  return visible.length ? visible : els;
}

export function startModalFocusTrap(el: HTMLElement | null, onClose?: () => void): () => void {
  const prevActive = document.activeElement as HTMLElement | null;
  const focusable = getFocusableElements(el);
  if (focusable.length > 0) focusable[0].focus();
  const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose?.();
      return;
    }
    if (e.key === 'Tab') {
      if (!el) return;
      const nodes = getFocusableElements(el);
      if (nodes.length === 0) { e.preventDefault(); return; }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (active === first || !el.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last || !el.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  };
  document.addEventListener('keydown', handleKey, true);
  return () => {
    document.removeEventListener('keydown', handleKey, true);
    if (prevActive && typeof prevActive.focus === 'function') prevActive.focus();
  };
}

export default startModalFocusTrap;
