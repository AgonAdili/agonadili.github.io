import { projects } from './projects.js';

const bySlug = new Map(projects.map((project) => [project.slug, project]));
const pad = (n) => String(n).padStart(2, '0');
const linkedSlug = () => {
  const match = location.hash.match(/^#work\/(.+)$/);
  return match ? decodeURIComponent(match[1]) : null;
};

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function decorative(node) {
  node.setAttribute('aria-hidden', 'true');
  return node;
}

// Dark artwork switches the card's badge and labels to light text.
function isDark(color) {
  if (!/^#[\da-f]{6}$/i.test(color ?? '')) return false;
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 96;
}

function card(project, number, wide) {
  const button = el('button', 'project-card reveal');
  button.type = 'button';
  button.dataset.project = project.slug;
  button.classList.toggle('project-wide', wide);
  button.classList.toggle('is-dark', isDark(project.background));
  const art = el('span', 'project-art');
  if (project.background) art.style.setProperty('--project-bg', project.background);
  const image = el('img');
  Object.assign(image, { src: project.image, alt: '', width: 900, height: 620, loading: 'lazy', decoding: 'async' });
  art.append(
    decorative(el('span', 'project-badge mono', `${pad(number)} / ${project.concept ? 'CONCEPT' : project.year}`)),
    image,
    decorative(el('span', 'project-open', '↗')),
  );
  if (wide && project.feature) {
    button.classList.add('has-label');
    art.append(featureLabel(project.feature));
  }
  const heading = el('span', 'project-heading');
  heading.append(el('span', 'project-name', project.name), el('span', 'project-tagline', project.tagline));
  const meta = el('span', 'project-meta');
  meta.append(heading, el('span', 'tag mono', project.type));
  button.append(art, meta);
  return button;
}

function featureLabel({ kicker, title = [], caption }) {
  const label = decorative(el('span', 'wide-project-label'));
  if (kicker) label.append(el('span', 'mono wide-project-kicker', kicker));
  const heading = el('span', 'wide-project-title');
  title.forEach((line, i) => heading.append(...(i ? [el('br'), line] : [line])));
  label.append(heading);
  if (caption) label.append(el('span', 'mono', caption));
  return label;
}

function row(project, number) {
  const button = el('button', 'project-row reveal');
  button.type = 'button';
  button.dataset.project = project.slug;
  const main = el('span', 'project-row-main');
  main.append(el('span', 'project-row-name', project.name), el('span', 'project-row-tagline', project.tagline));
  const meta = el('span', 'project-row-meta');
  meta.append(el('span', 'project-row-type mono', project.type), el('span', 'project-row-year mono', project.year));
  button.append(decorative(el('span', 'project-row-index mono', pad(number))), main, meta, decorative(el('span', 'project-row-arrow', '↗')));
  const item = el('li');
  item.append(button);
  return item;
}

// On devices that can hover, a thumbnail of the project follows the pointer over the list.
function setupPreview(container, list) {
  const preview = decorative(el('span', 'project-preview'));
  const image = el('img');
  image.alt = '';
  preview.append(image);
  container.append(preview);
  const canHover = matchMedia('(hover: hover) and (pointer: fine)');
  const place = (event) => {
    const box = container.getBoundingClientRect();
    const x = Math.min(event.clientX - box.left + 28, box.width - preview.offsetWidth);
    const y = event.clientY - box.top - preview.offsetHeight / 2;
    preview.style.transform = `translate(${x}px, ${y}px)`;
  };
  list.addEventListener('pointerover', (event) => {
    const project = bySlug.get(event.target.closest('.project-row')?.dataset.project);
    if (!project || !canHover.matches) return preview.classList.remove('visible');
    if (image.getAttribute('src') !== project.image) image.src = project.image;
    preview.style.setProperty('--project-bg', project.background ?? '');
    place(event);
    preview.classList.add('visible');
  });
  list.addEventListener('pointermove', (event) => { if (preview.classList.contains('visible')) place(event); });
  list.addEventListener('pointerleave', () => preview.classList.remove('visible'));
}

function setupDialog() {
  const dialog = document.querySelector('.project-dialog');
  const field = (selector) => dialog.querySelector(selector);
  let trigger = null;
  let returnUrl = null;

  function open(slug) {
    const project = bySlug.get(slug);
    if (!project) return;
    trigger = document.querySelector(`[data-project="${CSS.escape(slug)}"]`);
    field('.dialog-kicker').textContent = project.concept ? 'A CLOSER LOOK / CONCEPT STUDY' : 'A CLOSER LOOK';
    field('.dialog-category').textContent = [project.type, project.year].filter(Boolean).join(' · ');
    field('#dialog-title').textContent = project.name;
    field('.dialog-description').textContent = project.description ?? '';
    const image = el('img');
    Object.assign(image, { src: project.image, alt: project.imageAlt ?? '' });
    field('.dialog-image').replaceChildren(image);
    field('.dialog-image').style.setProperty('--project-bg', project.background ?? '');
    const facts = [['Role', project.role], ['Tech', project.stack?.join(', ')]].filter(([, value]) => value);
    field('.dialog-facts').replaceChildren(...facts.map(([term, value]) => {
      const fact = el('div');
      fact.append(el('dt', null, term), el('dd', null, value));
      return fact;
    }));
    field('.dialog-features').replaceChildren(...(project.highlights ?? []).map((text) => el('span', null, text)));
    field('.dialog-links').replaceChildren(...(project.links ?? []).map(({ label, url }) => {
      const link = el('a', 'dialog-link', `${label} `);
      Object.assign(link, { href: url, target: '_blank', rel: 'noopener' });
      link.append(decorative(el('span', null, '↗')));
      return link;
    }));
    field('.dialog-note').hidden = !project.concept;
    // The open project gets its own address; closing goes back to where the visitor was.
    if (!linkedSlug()) returnUrl = location.href;
    history.replaceState(null, '', `#work/${encodeURIComponent(slug)}`);
    if (!dialog.open) {
      dialog.showModal();
      // Hide the page scrollbar without shifting the layout, as the intro does.
      const scrollbar = innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    }
    dialog.scrollTop = 0;
  }

  document.querySelector('#work').addEventListener('click', (event) => {
    const target = event.target.closest('[data-project]');
    if (target) open(target.dataset.project);
  });
  field('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    const openedFromLink = !returnUrl;
    history.replaceState(null, '', returnUrl ?? `${location.pathname}${location.search}#work`);
    returnUrl = null;
    // A visitor who arrived through a project link lands on that project in the page.
    trigger?.focus({ preventScroll: !openedFromLink });
  });
  addEventListener('hashchange', () => {
    const slug = linkedSlug();
    if (slug) open(slug);
  });
  const slug = linkedSlug();
  if (slug) open(slug);
}

export function initWork() {
  const featured = projects.filter((project) => project.featured);
  const more = projects.filter((project) => !project.featured);
  const lastIsWide = featured.length % 2 === 1;
  document.querySelector('.project-grid').replaceChildren(...featured.map((project, i) => card(project, i + 1, lastIsWide && i === featured.length - 1)));
  const container = document.querySelector('.more-projects');
  const list = container.querySelector('.project-list');
  list.replaceChildren(...more.map((project, i) => row(project, featured.length + i + 1)));
  container.querySelector('.more-projects-count').textContent = pad(more.length);
  container.hidden = !more.length;
  document.querySelector('.project-fallback')?.remove();
  setupPreview(container, list);
  setupDialog();
}
