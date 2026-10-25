const STORAGE_KEY = 'aa-intro-v2-seen';
const DURATION = 3450;
const EXIT_AT = 2650;

export function initIntro({ motionPreference, onReveal = () => {}, onReducedReplay = () => {} }) {
  const root = document.documentElement;
  const overlay = document.querySelector('.intro');
  const skip = overlay.querySelector('.intro-skip');
  const counter = overlay.querySelector('.intro-count');
  const label = overlay.querySelector('.intro-sequence-label');
  const page = [...document.querySelectorAll('.skip-link, .header, #mobile-nav, main, .footer')];
  let running = false;
  let frame = 0;
  let timer = 0;
  let snapshot;

  function finish(reason = 'complete') {
    if (!running) { root.classList.remove('intro-pending'); return; }
    running = false;
    const alreadyRevealed = root.classList.contains('intro-exiting');
    cancelAnimationFrame(frame);
    clearTimeout(timer);
    root.classList.remove('intro-pending', 'intro-playing', 'intro-exiting');
    overlay.inert = true;
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.removeProperty('--intro-progress');
    snapshot.inert.forEach(([element, inert]) => { element.inert = inert; });
    document.body.style.overflow = snapshot.overflow;
    document.body.style.paddingRight = snapshot.paddingRight;
    if (scrollX !== snapshot.x || scrollY !== snapshot.y) {
      window.scrollTo({ left: snapshot.x, top: snapshot.y, behavior: 'instant' });
    }
    const returnTo = snapshot.focus;
    const wasKeyboard = reason === 'keyboard';
    if (returnTo?.isConnected && returnTo !== document.body && !overlay.contains(returnTo)) {
      returnTo.focus({ preventScroll: true });
    } else if (wasKeyboard) {
      document.querySelector('.skip-link').focus({ preventScroll: true });
    } else if (reason === 'skip') {
      document.querySelector('.hero-copy a').focus({ preventScroll: true });
    } else if (overlay.contains(document.activeElement)) {
      document.activeElement.blur();
    }
    if (!alreadyRevealed) onReveal();
    snapshot = null;
  }

  function play({ replay = false } = {}) {
    if (motionPreference.matches) {
      finish('preference');
      if (replay) onReducedReplay();
      return;
    }
    if (running) finish('restart');
    snapshot = {
      focus: document.activeElement,
      overflow: document.body.style.overflow,
      paddingRight: document.body.style.paddingRight,
      x: scrollX,
      y: scrollY,
      inert: page.map(element => [element, element.inert])
    };
    root.classList.remove('intro-pending', 'intro-playing', 'intro-exiting');
    overlay.dataset.phase = 'assemble';
    overlay.style.setProperty('--intro-progress', '0');
    counter.textContent = '00';
    label.textContent = 'FORMING IDEAS';
    void overlay.offsetWidth;
    const scrollbar = innerWidth - root.clientWidth;
    if (scrollbar > 0) {
      document.body.style.paddingRight = `${parseFloat(getComputedStyle(document.body).paddingRight) + scrollbar}px`;
    }
    document.body.style.overflow = 'hidden';
    snapshot.inert.forEach(([element]) => { element.inert = true; });
    overlay.inert = false;
    overlay.setAttribute('aria-hidden', 'false');
    running = true;
    root.classList.add('intro-playing');
    skip.focus({ preventScroll: true });
    try { localStorage.setItem(STORAGE_KEY, 'true'); } catch { /* The intro also works when storage is blocked. */ }
    const started = performance.now();
    const count = now => {
      if (!running) return;
      const elapsed = now - started;
      const progress = Math.min(elapsed / DURATION, 1);
      counter.textContent = String(Math.round(progress * 100)).padStart(2, '0');
      overlay.style.setProperty('--intro-progress', String(progress));
      if (elapsed >= EXIT_AT && overlay.dataset.phase !== 'exit') {
        overlay.dataset.phase = 'exit';
        label.textContent = 'LET’S BEGIN';
        root.classList.add('intro-exiting');
        onReveal();
      } else if (elapsed >= 1350 && elapsed < EXIT_AT) {
        overlay.dataset.phase = 'hold';
        label.textContent = 'BUILT TO CONNECT';
      }
      if (progress >= 1) finish();
      else frame = requestAnimationFrame(count);
    };
    frame = requestAnimationFrame(count);
    // End even if the tab becomes hidden and animation frames are suspended.
    timer = setTimeout(() => finish(), DURATION + 60);
  }

  skip.addEventListener('click', () => finish('skip'));
  document.addEventListener('keydown', event => {
    if (!running || (event.key !== 'Escape' && event.key !== 'Tab')) return;
    event.preventDefault();
    finish('keyboard');
  });
  if (root.classList.contains('intro-pending')) play();
  return { play, finish };
}
