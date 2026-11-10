(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = window.matchMedia('(pointer: fine)');
  let button = null;
  let frame = 0;
  let x = 0, y = 0, vx = 0, vy = 0, targetX = 0, targetY = 0;
  function animate() {
    vx = (vx + (targetX - x) * 0.16) * 0.72;
    vy = (vy + (targetY - y) * 0.16) * 0.72;
    x += vx;
    y += vy;
    if (button) button.style.transform = `translate(${x}px, ${y}px)`;
    if (Math.abs(vx) + Math.abs(vy) + Math.abs(targetX - x) + Math.abs(targetY - y) > 0.03) {
      frame = requestAnimationFrame(animate);
    } else {
      frame = 0;
      if (targetX === 0 && targetY === 0 && button) {
        button.style.transform = '';
        button = null;
        x = y = vx = vy = 0;
      }
    }
  }
  function start() {
    if (!frame) frame = requestAnimationFrame(animate);
  }
  function reset() {
    targetX = targetY = 0;
    if (button) start();
  }
  window.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !pointer.matches || reduced.matches) return;
    const next = document.querySelector('.patent-browse');
    if (!next || !next.getClientRects().length) { reset(); return; }
    const rect = next.getBoundingClientRect();
    const left = rect.left - (button === next ? x : 0);
    const top = rect.top - (button === next ? y : 0);
    const dx = event.clientX - Math.max(left, Math.min(event.clientX, left + rect.width));
    const dy = event.clientY - Math.max(top, Math.min(event.clientY, top + rect.height));
    if (Math.hypot(dx, dy) > 80) { reset(); return; }
    button = next;
    targetX = Math.max(-14, Math.min(14, (event.clientX - left - rect.width / 2) * 0.12));
    targetY = Math.max(-14, Math.min(14, (event.clientY - top - rect.height / 2) * 0.12));
    start();
  }, { passive: true });
  window.addEventListener('pointerout', event => { if (!event.relatedTarget) reset(); });
  window.addEventListener('blur', reset);
  window.addEventListener('hashchange', reset);
  reduced.addEventListener('change', reset);
})();
