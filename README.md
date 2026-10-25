# Agon Adili — Portfolio

A custom, responsive portfolio with a first-visit AA introduction, an interactive dot field, progressive scroll storytelling, and interactive concept projects.

## Run locally

Requires Node.js 20.11 or later. No install or build is required to serve the site.

```sh
npm run dev
```

Open http://127.0.0.1:4173. `npm run check` checks JavaScript syntax.

The site is entirely in `dist/`. The dot field uses native Canvas 2D, and fonts are stored locally, so the page makes no third-party runtime requests. Playwright is a development-only tool used for browser verification.

## Personalize

- Main copy, email, sections, and project cards: `dist/index.html`
- Project descriptions and interactions: `dist/main.js` (`projects` object)
- Colors, typography, layout, responsive styles, and animation: `dist/styles.css`
- AA opening sequence: `dist/intro.js` and `dist/intro.css`
- Interactive dot field: `dist/dot-field.js`
- Project artwork: `dist/assets/{orbit,forma,signal}.svg`

Orbit, Forma, and Signal are explicitly labeled placeholder concept projects. Replace their artwork, copy, and detail descriptions with real case studies as they become available.

The geometric AA intro is a 3.45-second identity sequence with an outline reveal, solid neon initials, and a split opening into the page. It is remembered in local storage under `aa-intro-v2-seen`. Use “Replay intro” in the hero to watch again, or “Skip intro” to enter immediately. Move your cursor across the dot field to deform the flowing surface; scrolling changes its perspective. The site respects the system reduced-motion preference and offers a static dot illustration when Canvas is unavailable. Escape skips the introduction and closes project dialogs.

This update is local only. The existing hosting identity is preserved in `.openai/hosting.json`; running or editing the local site does not publish it.
