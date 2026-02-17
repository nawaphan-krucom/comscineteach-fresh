export function startModalFocusTrap(el: HTMLElement | null, onClose?: () => void): () => void {
  // Minimal focus-trap stub: attach basic keyboard handler and return cleanup
  const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose?.();
  };
  if (el) document.addEventListener('keydown', handleKey);
  return () => {
    document.removeEventListener('keydown', handleKey);
  };
}

export default startModalFocusTrap;
