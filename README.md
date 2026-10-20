# Agon Adili — Portfolio

A custom, responsive portfolio with a first-visit AA introduction, a real-time metallic 3D monogram, progressive scroll storytelling, and interactive concept projects.

## Run locally

Requires Node.js 20.11 or later. No install or build is required to serve the site.

```sh
npm run dev
```

Open http://127.0.0.1:4173. `npm run check` checks JavaScript syntax.

The deployable site is entirely in `dist/`. Three.js and fonts are vendored locally, so the page makes no third-party runtime requests. Playwright is a development-only tool used for browser verification.

## Personalize

- Main copy, email, sections, and project cards: `dist/index.html`
- Project descriptions and interactions: `dist/main.js` (`projects` object)
- Colors, typography, layout, responsive styles, and animation: `dist/styles.css`
- Metallic monogram: `dist/aa-scene.js`
- Project artwork: `dist/assets/{orbit,forma,signal}.svg`

Orbit, Forma, and Signal are explicitly labeled placeholder concept projects. Replace their artwork, copy, and detail descriptions with real case studies as they become available.

The intro is remembered in local storage. Use “Replay intro” in the hero to watch again. The site respects the system reduced-motion preference and offers a static monogram when WebGL is unavailable. Escape skips the introduction and closes project dialogs.

The hosting identity is preserved in `.openai/hosting.json`. New hosting is owner-private by default.
