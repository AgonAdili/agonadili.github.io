# Agon Adili — Portfolio

A custom, responsive portfolio with a first-visit intro, an interactive dot field, progressive scroll storytelling, and interactive concept projects.

## Run locally

Requires Node.js 20.11 or later. No install or build is required to serve the site.

```sh
npm run dev
```

Open http://127.0.0.1:4173. `npm run check` checks JavaScript syntax.

The site is entirely in `dist/`. The dot field uses native Canvas 2D, and fonts are stored locally as WOFF2, so the page makes no third-party runtime requests.

## Test

`npm test` opens the site in a headless browser and checks the intro, the layout at five screen widths, the mobile menu, the project dialog, and the fallback when a script fails to load. It uses Playwright, a development-only dependency; run `npm install` and `npx playwright install chromium` once first.

## Personalize

- Main copy and sections: `dist/index.html`
- Email address: `dist/index.html` (replace every occurrence; the copy button reads it from the contact link)
- Projects: `dist/projects.js`, one entry per project in display order (the field guide is at the top of the file). Featured projects get the large cards; the rest go in the “More projects” list. Every project has its own link, `/#work/<slug>`, that opens it directly.
- Project images: `dist/assets/projects/` (1800 × 1240 WebP screenshots, named after each project’s slug)
- Colors, typography, layout, responsive styles, and animation: `dist/styles.css`
- Intro sequence: `dist/intro.js` and `dist/intro.css`
- Interactive dot field: `dist/dot-field.js`
- Link preview image: `dist/assets/og-image.png`. The `og:image` and `og:url` tags in `dist/index.html` use the site’s full address; update them if the address ever changes, because social networks ignore relative paths.

A new project can point its `image` at `dist/assets/projects/placeholder.svg` until its screenshot is ready. The screenshots show demo data only.

The intro is a 3.45-second identity sequence: the ΛΛ mark is drawn as an outline, fills in, and the page opens behind it. It plays once and is remembered in local storage under `aa-intro-v2-seen`; to see it again, open the site in a private window or delete that entry. Use “Skip intro” to enter immediately; Escape and Tab skip it too. Move your cursor across the dot field to deform the flowing surface; scrolling changes its perspective. The site respects the system reduced-motion preference, shows a static dot illustration when Canvas or JavaScript is unavailable, and closes project dialogs with Escape.

## Publish

The site is published at https://agonadili.github.io with GitHub Pages. Every push to `main` runs `.github/workflows/pages.yml`, which checks the JavaScript syntax and publishes the `dist/` folder. Each run appears in the repository’s Actions tab and takes about a minute.
