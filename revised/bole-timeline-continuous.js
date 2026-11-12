(() => {
  const root = document.getElementById('root');
  const template = document.getElementById('bole-timeline-template');
  let pendingFrame = 0;

  function scheduleUpdate() {
    if (pendingFrame) return;
    pendingFrame = requestAnimationFrame(() => {
      pendingFrame = 0;
      update();
    });
  }

  function mount() {
    const collections = root.querySelector('#collections');
    if (!collections) root.querySelector('#case-timeline')?.remove();
    if (collections && !root.querySelector('#case-timeline')) {
      collections.before(template.content.cloneNode(true));
    }
    const workflow = root.querySelector('#workflow');
    const homeCue = root.querySelector('#home .collection-scroll-cue');
    if (workflow && homeCue && !workflow.querySelector('.collection-scroll-cue')) {
      const cue = homeCue.cloneNode(true);
      cue.setAttribute('href', '#case-timeline');
      cue.querySelector('span').textContent = '查看转化案例';
      workflow.append(cue);
    }
    scheduleUpdate();
  }

  function update() {
    const section = root.querySelector('#case-timeline');
    if (!section) return;
    const track = section.querySelector('.bole-timeline-track');
    const viewport = section.querySelector('.bole-timeline-window');
    const travel = Math.max(0, track.scrollWidth - viewport.clientWidth);
    const distance = Math.max(1, section.offsetHeight - section.firstElementChild.offsetHeight);
    const progress = Math.max(0, Math.min(1, -section.getBoundingClientRect().top / distance));
    const milestones = Array.from(track.querySelectorAll('li:not(.bole-timeline-intro)'));
    const intro = track.querySelector('.bole-timeline-intro');
    const start = intro.querySelector('p').getBoundingClientRect().left - track.getBoundingClientRect().left;
    const length = track.offsetWidth - start - intro.offsetLeft;
    const initial = Math.min(185, length);
    const distanceAlongLine = initial + (length - initial) * progress;
    const offsets = milestones.map(milestone => milestone.offsetLeft);
    section.style.setProperty('--timeline-offset', (-travel * progress) + 'px');
    section.style.setProperty('--timeline-start', start + 'px');
    section.style.setProperty('--timeline-progress', distanceAlongLine + 'px');
    for (const [index, milestone] of milestones.entries()) {
      const passed = distanceAlongLine - (offsets[index] - start);
      const reveal = Math.max(0, Math.min(1, passed / 44));
      milestone.style.setProperty('--milestone-reveal', reveal);
    }
  }

  new MutationObserver(mount).observe(root, { childList: true, subtree: true });
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  mount();
})();
