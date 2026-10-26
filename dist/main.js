import { initIntro } from './intro.js';

const root = document.documentElement;
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
let reducedMotion = motionPreference.matches;
let dotField = null;
let fieldGeneration = 0;
let toastTimer;

const toast = (message) => {
  const el = document.querySelector('.toast');
  el.textContent = message;
  el.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('visible'), 2800);
};

const intro = initIntro({
  motionPreference,
  onReveal: () => dotField?.pulse(),
  onReducedReplay: () => toast('Reduced motion is enabled on your device.')
});
document.querySelector('.replay-intro').addEventListener('click', () => intro.play({ replay: true }));

async function mountDotField() {
  const generation = ++fieldGeneration;
  const container = document.querySelector('#dot-field');
  let initDotField;
  try {
    ({ initDotField } = await import('./dot-field.js'));
  } catch (error) {
    console.warn('The static dot field is being used.', error.message);
  }
  if (generation !== fieldGeneration) return;
  dotField?.dispose();
  dotField = initDotField?.(container, { reducedMotion }) ?? null;
  container.classList.toggle('dot-field-ready', !!dotField);
  // A static point field keeps the composition complete without Canvas.
  container.classList.toggle('dot-field-static', !dotField);
  updateScroll();
}
mountDotField();

const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
function closeMenu(restoreFocus = false) {
  if (menuButton.getAttribute('aria-expanded') !== 'true') return;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open menu');
  mobileNav.classList.remove('open');
  mobileNav.inert = true;
  document.body.classList.remove('menu-open');
  document.querySelector('main').inert = false;
  document.querySelector('footer').inert = false;
  if (restoreFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => {
  const opening = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(opening));
  menuButton.setAttribute('aria-label', opening ? 'Close menu' : 'Open menu');
  mobileNav.classList.toggle('open', opening);
  mobileNav.inert = !opening;
  document.body.classList.toggle('menu-open', opening);
  document.querySelector('main').inert = opening;
  document.querySelector('footer').inert = opening;
});
// The header stays clickable above the open menu, so its links close the menu too.
document.querySelectorAll('.header a, .mobile-nav a').forEach((link) => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu(true);
  if (event.key !== 'Tab' || menuButton.getAttribute('aria-expanded') !== 'true') return;
  const links = [...mobileNav.querySelectorAll('a')];
  const last = links.at(-1);
  if (event.shiftKey && document.activeElement === menuButton) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); menuButton.focus(); }
});
matchMedia('(min-width: 761px)').addEventListener('change', (e) => { if (e.matches) closeMenu(); });

const revealElements = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }
  }, { threshold: 0.1, rootMargin: '0px 0px -15px 0px' });
  revealElements.forEach((el) => revealObserver.observe(el));
} else { revealElements.forEach((el) => el.classList.add('is-visible')); }

const statement = document.querySelector('.word-reveal');
const originalStatement = statement.textContent;
statement.textContent = '';
originalStatement.split(' ').forEach((word, index) => {
  const span = document.createElement('span');
  span.textContent = word;
  if (index) statement.append(document.createTextNode(' '));
  statement.append(span);
});
const words = [...statement.querySelectorAll('span')];
const manifesto = document.querySelector('.manifesto');
const manifestoSticky = manifesto.querySelector('.manifesto-sticky');
const manifestoDots = [...document.querySelectorAll('.manifesto-dots i')];
const header = document.querySelector('.header');
const hero = document.querySelector('.hero');
const progressBar = document.querySelector('.scroll-progress');
const activeLinks = [...document.querySelectorAll('.desktop-nav a')];
const trackedSections = activeLinks.map((link) => document.querySelector(link.getAttribute('href')));
let scrollFrame = 0;
const clamp = (n, min = 0, max = 1) => Math.max(min, Math.min(max, n));

function updateScroll() {
  scrollFrame = 0;
  const travel = document.documentElement.scrollHeight - innerHeight;
  progressBar.style.transform = `scaleX(${travel > 0 ? scrollY / travel : 0})`;
  const bounds = manifesto.getBoundingClientRect();
  // Words light up from when the statement scrolls in until its sticky panel is released below the header.
  const revealStart = innerHeight * 0.15;
  const revealEnd = header.offsetHeight + manifestoSticky.offsetHeight - bounds.height;
  const wordProgress = reducedMotion ? 1 : clamp((revealStart - bounds.top) / Math.max(revealStart - revealEnd, 1));
  words.forEach((word, i) => word.classList.toggle('lit', i < Math.ceil(wordProgress * words.length)));
  manifestoDots.forEach((dot, i) => dot.classList.toggle('lit', i < Math.ceil(wordProgress * manifestoDots.length)));
  const heroBounds = hero.getBoundingClientRect();
  dotField?.setProgress(clamp(-heroBounds.top / heroBounds.height));
  let current = -1;
  trackedSections.forEach((section, i) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= innerHeight * 0.45 && rect.bottom > innerHeight * 0.25) current = i;
  });
  activeLinks.forEach((link, i) => {
    link.classList.toggle('active', i === current);
    if (i === current) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
const requestScrollUpdate = () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); };
addEventListener('scroll', requestScrollUpdate, { passive: true });
addEventListener('resize', requestScrollUpdate, { passive: true });
motionPreference.addEventListener('change', ({ matches }) => {
  reducedMotion = matches;
  if (matches) intro.finish('preference');
  mountDotField();
  updateScroll();
});
updateScroll();


const projects = {
  orbit: {
    name: 'Orbit', category: 'ERP / WEB APPLICATION', image: './assets/orbit.svg',
    description: 'An exploration of a calmer way to manage complex business operations. Orbit brings orders, inventory, and reporting into one connected workspace, with an interface designed to make the next action clear.',
    features: ['Operations dashboard', 'Inventory & orders', 'Data visualization', 'Connected workflows']
  },
  forma: {
    name: 'Forma', category: 'EDITORIAL WEBSITE / DIGITAL EXPERIENCE', image: './assets/forma.svg',
    description: 'A website concept for an architecture practice, where the digital experience reflects the spaces it presents. Generous typography, a quiet color palette, and considered movement give the work room to speak.',
    features: ['Responsive design', 'Editorial layout', 'Project storytelling', 'Considered motion']
  },
  signal: {
    name: 'Signal', category: 'MOBILE APPLICATION / EVERYDAY UTILITY', image: './assets/signal.svg',
    description: 'A focused mobile concept for finding a better daily rhythm. A clear view of tasks, a quiet focus timer, and a little perspective on progress — designed to feel helpful without adding to the noise.',
    features: ['Mobile interface', 'Daily planning', 'Focus sessions', 'Progress insights']
  }
};
const dialog = document.querySelector('.project-dialog');
let projectTrigger;
for (const card of document.querySelectorAll('[data-project]')) {
  card.addEventListener('click', () => {
    const project = projects[card.dataset.project];
    projectTrigger = card;
    dialog.querySelector('#dialog-title').textContent = project.name;
    dialog.querySelector('.dialog-category').textContent = project.category;
    dialog.querySelector('.dialog-description').textContent = project.description;
    const image = document.createElement('img');
    image.src = project.image;
    image.alt = `${project.name} concept interface`;
    dialog.querySelector('.dialog-image').replaceChildren(image);
    dialog.querySelector('.dialog-features').replaceChildren(...project.features.map((feature) => {
      const span = document.createElement('span'); span.textContent = feature; return span;
    }));
    dialog.showModal();
    dialog.scrollTop = 0;
    // Hide the page scrollbar without shifting the layout, as the intro does.
    const scrollbar = innerWidth - root.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
  });
}
dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
  projectTrigger?.focus({ preventScroll: true });
});

document.querySelector('[data-copy-email]').addEventListener('click', async (event) => {
  const button = event.currentTarget;
  // The address is written only in index.html; copy it from the contact link.
  const email = document.querySelector('.contact-email').href.replace(/^mailto:/, '');
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(email);
    else {
      const field = document.createElement('textarea');
      field.value = email; field.style.position = 'fixed'; field.style.opacity = '0';
      document.body.append(field); field.select();
      const copied = document.execCommand('copy'); field.remove();
      if (!copied) throw new Error('Clipboard unavailable');
    }
    button.querySelector('.copy-label').textContent = 'COPIED!';
    toast('Email copied.');
    setTimeout(() => { button.querySelector('.copy-label').textContent = 'COPY EMAIL'; }, 2400);
  } catch { toast(email); }
});

document.querySelector('.footer-year').textContent = new Date().getFullYear();

// Tells the fallback timer in index.html that the page started correctly.
root.classList.add('js-ready');
