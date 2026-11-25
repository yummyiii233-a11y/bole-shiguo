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
    const workflow = root.querySelector('#workflow');
    const caseHistory = root.querySelector('#case-history');
    if (!workflow) caseHistory?.remove();
    if (workflow && !caseHistory) {
      workflow.before(template.content.cloneNode(true));
    }

    const homeCue = root.querySelector('.home-workflow-cue .collection-scroll-cue');
    if (homeCue && homeCue.getAttribute('href') !== '#case-history') {
      homeCue.setAttribute('href', '#case-history');
      homeCue.querySelector('span').textContent = 'SEE A CASE STUDY';
    }
    scheduleUpdate();
  }

  function update() {
    const section = root.querySelector('#case-history');
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
