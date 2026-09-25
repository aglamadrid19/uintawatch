# Uinta Watch — Website

Marketing site for [Uinta Watch](https://uintawatch.com), a community-driven,
open-source early wildfire detection network for Utah. Built with Astro 7 and
Tailwind CSS 4.

## Commands

All commands are run from the project root, in a terminal:

| Command            | Action                                         |
| :----------------- | :--------------------------------------------- |
| `npm install`      | Installs dependencies                          |
| `npm run dev`      | Starts local dev server at `localhost:4321`    |
| `npm run build`    | Build your production site to `./dist/`        |
| `npm run preview`  | Preview your build locally, before deploying   |
| `npm run check`    | Type-check the project with `astro check`      |
| `npm run test`     | Run the Playwright end-to-end tests            |

## Project structure

```text
/
├── public/            # Static assets (icons, manifest, og images)
├── src/
│   ├── components/    # Nav, Footer
│   ├── content/       # Content collections (stats, faq, phases)
│   ├── layouts/       # Base layout (head, fonts, meta, transitions)
│   ├── pages/         # Routes
│   ├── styles/        # Global CSS + Tailwind theme
│   └── content.config.ts
└── astro.config.mjs   # Fonts, prefetch, sitemap, Tailwind
```

## Content

Site content lives in `src/content/` and is validated against schemas in
`src/content.config.ts`:

- `stats.json` — headline statistics on the homepage
- `faq.json` — support page FAQ (HTML in `answer` is rendered)
- `phases/*.md` — the phased plan on the About page
- `journal/*.md` — lab journal entries (`/journal`), dated and sorted newest first

## Social cards (OG images)

Every page emits `og:image` / `twitter:image` meta (see `src/layouts/Layout.astro`).
Card images (1200×630) are composed by `make_og.py`:

- `public/images/og-default.png` — site default, used by pages without their own card
- `public/images/og/<slug>.png` — one card per journal entry, wired up in
  `src/pages/journal/[slug].astro`

After adding a journal entry, regenerate the cards before deploying:

```sh
python3 make_og.py   # needs python3 + Pillow; run from website/
```

`npm run test` includes a "Social cards" Playwright block that audits every
page: og/twitter meta present, absolute image URL, 1200×630 dimensions, and
the image resolving to a real PNG. If an entry's card is missing, that test
fails with a 404.

## Styling

Tailwind CSS 4 via the `@tailwindcss/vite` plugin. Design tokens (paper/ink/
accent palettes, display sizes, buttons) are defined in `src/styles/global.css`
under `@theme` and `@layer components`.
