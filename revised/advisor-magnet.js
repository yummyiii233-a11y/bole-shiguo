(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer: fine)');
  let button = null;

  function reset() {
    if (button) button.classList.remove('advisor-near');
    button = null;
  }

  window.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse' || !finePointer.matches || reducedMotion.matches) {
      reset();
      return;
    }
    const next = document.querySelector('.patent-browse');
    if (!next || !next.getClientRects().length) {
      reset();
      return;
    }
    const rect = next.getBoundingClientRect();
    const dx = event.clientX - Math.max(rect.left, Math.min(event.clientX, rect.right));
    const dy = event.clientY - Math.max(rect.top, Math.min(event.clientY, rect.bottom));
    if (Math.hypot(dx, dy) <= 80) {
      if (button && button !== next) reset();
      button = next;
      button.classList.add('advisor-near');
    } else {
      reset();
    }
  }, { passive: true });

  window.addEventListener('pointerout', (event) => { if (!event.relatedTarget) reset(); });
  window.addEventListener('blur', reset);
  window.addEventListener('hashchange', reset);
  reducedMotion.addEventListener('change', reset);
})();
