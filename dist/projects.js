/*
 * The projects in the Work section, in display order.
 *
 * Featured projects get the large cards; when there is an odd number of them, the last card spans
 * the full width. Every other project appears in the "More projects" list. Each card and row opens
 * the same detail panel, and every project has its own link: https://agonadili.github.io/#work/<slug>
 *
 *   slug          Short id used in the link: lowercase, no spaces.
 *   name          Project name.
 *   tagline       One line, about eight words.
 *   type          For example 'Web application', 'Website', 'Mobile app' or 'ERP / Web app'.
 *   year          Shown on the card badge, in the list and in the panel.
 *   role, stack   Optional facts in the panel, for example 'Design & development' and ['Vue', 'Laravel'].
 *   description   Two to four sentences: the problem, what you built, the result.
 *   highlights    Three or four short points.
 *   links         Buttons in the panel, for example [{ label: 'Visit site', url: 'https://…' }].
 *   image         Landscape image in assets/projects/, about 1800 px wide. imageAlt describes it.
 *   background    Colour behind the image; dark colours switch the card's labels to light text.
 *   concept       true marks an illustrative concept rather than shipped work.
 *   featured      true puts the project in the large cards.
 *   feature       Optional text for a full-width card: { kicker, title: ['Line one', 'Line two'], caption }.
 */
export const projects = [
  {
    slug: 'orbit',
    name: 'Orbit',
    tagline: 'Complex operations. One clear view.',
    type: 'ERP / Web app',
    year: 2026,
    description: 'An exploration of a calmer way to manage complex business operations. Orbit brings orders, inventory, and reporting into one connected workspace, with an interface designed to make the next action clear.',
    highlights: ['Operations dashboard', 'Inventory & orders', 'Data visualization', 'Connected workflows'],
    image: './assets/projects/orbit.svg',
    imageAlt: 'Orbit ERP concept with operations dashboard, charts, and inventory overview',
    background: '#c7d4c0',
    concept: true,
    featured: true,
  },
  {
    slug: 'forma',
    name: 'Forma',
    tagline: 'A digital space, beautifully considered.',
    type: 'Website',
    year: 2026,
    description: 'A website concept for an architecture practice, where the digital experience reflects the spaces it presents. Generous typography, a quiet color palette, and considered movement give the work room to speak.',
    highlights: ['Responsive design', 'Editorial layout', 'Project storytelling', 'Considered motion'],
    image: './assets/projects/forma.svg',
    imageAlt: 'Forma architecture website concept with bold editorial typography and architectural imagery',
    background: '#d7d4d1',
    concept: true,
    featured: true,
  },
  {
    slug: 'signal',
    name: 'Signal',
    tagline: 'A little structure for the everyday.',
    type: 'Mobile app',
    year: 2026,
    description: 'A focused mobile concept for finding a better daily rhythm. A clear view of tasks, a quiet focus timer, and a little perspective on progress — designed to feel helpful without adding to the noise.',
    highlights: ['Mobile interface', 'Daily planning', 'Focus sessions', 'Progress insights'],
    image: './assets/projects/signal.svg',
    imageAlt: 'Signal mobile application concept with two dark interface phone screens and lime accents',
    background: '#23282c',
    concept: true,
    featured: true,
    feature: { kicker: 'Less noise. More signal.', title: ['Your day.', 'In your rhythm.'], caption: 'Mobile experience / Signal' },
  },

  // Placeholders: replace these with your own projects.
  {
    slug: 'project-four',
    name: 'Project four',
    tagline: 'One line about what it does.',
    type: 'Web application',
    year: 2025,
    role: 'Your role',
    stack: ['Technology', 'Technology', 'Technology'],
    description: 'Two to four sentences: the problem, what you built, and the result.',
    highlights: ['Highlight', 'Highlight', 'Highlight'],
    links: [{ label: 'Visit site', url: 'https://example.com' }],
    image: './assets/projects/placeholder.svg',
    imageAlt: 'Placeholder image',
    background: '#1d1f1a',
  },
  {
    slug: 'project-five',
    name: 'Project five',
    tagline: 'One line about what it does.',
    type: 'Website',
    year: 2024,
    role: 'Your role',
    stack: ['Technology', 'Technology'],
    description: 'Two to four sentences: the problem, what you built, and the result.',
    highlights: ['Highlight', 'Highlight', 'Highlight'],
    links: [{ label: 'Visit site', url: 'https://example.com' }],
    image: './assets/projects/placeholder.svg',
    imageAlt: 'Placeholder image',
    background: '#1d1f1a',
  },
  {
    slug: 'project-six',
    name: 'Project six',
    tagline: 'One line about what it does.',
    type: 'Mobile app',
    year: 2023,
    role: 'Your role',
    stack: ['Technology', 'Technology'],
    description: 'Two to four sentences: the problem, what you built, and the result.',
    highlights: ['Highlight', 'Highlight', 'Highlight'],
    links: [{ label: 'App Store', url: 'https://example.com' }, { label: 'Google Play', url: 'https://example.com' }],
    image: './assets/projects/placeholder.svg',
    imageAlt: 'Placeholder image',
    background: '#1d1f1a',
  },
];
