# bazanjeremy.github.io

Personal single-page landing for **Jérémy Bazan** — QA Engineer, AI-augmented testing.
Bilingual (FR default, EN), built with Astro + Tailwind, deployed to GitHub Pages.

## Stack

- **[Astro 7](https://astro.build)** — static output, zero client JS by default.
- **[Tailwind CSS 4](https://tailwindcss.com)** via the official `@tailwindcss/vite` plugin.
  CSS-first config: design tokens live in `@theme` inside `src/styles/global.css`
  (no `tailwind.config.*`).
- **[@astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/)**
  for `sitemap-index.xml`.
- Native Astro **i18n** — `fr` served at `/`, `en` at `/en/` (`prefixDefaultLocale: false`).

## Project structure

```text
src/
├── components/     # Header, Footer, LangToggle + 6 section components
├── i18n/           # fr.json (source copy), en.json (mirror, TODO), utils.ts
├── layouts/        # BaseLayout.astro (SEO, OG/Twitter, hreflang)
├── pages/
│   ├── index.astro     # FR (/)
│   └── en/index.astro  # EN (/en/)
└── styles/global.css   # Tailwind import + @theme tokens
public/             # favicon.svg, robots.txt  (og-image.png: see Assets below)
.github/workflows/  # deploy.yml — GitHub Pages via withastro/action
```

Translations are keyed in `src/i18n/{fr,en}.json` and read through
`useTranslations(lang)` in `src/i18n/utils.ts`. The language toggle
(`LangToggle.astro`) is a pure `<a>` link — no client JavaScript.

## Commands

| Command           | Action                                       |
| :---------------- | :------------------------------------------- |
| `npm install`     | Install dependencies                         |
| `npm run dev`     | Dev server at `localhost:4321`               |
| `npm run build`   | Build to `./dist/`                           |
| `npm run preview` | Preview the production build locally         |

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds with
`withastro/action` and publishes via `actions/deploy-pages`. In the repository
settings, set **Settings → Pages → Source = GitHub Actions**.

## Status / TODO

- **`src/i18n/en.json`** is a structural mirror with every translatable value set to
  `TODO`; the English copy is written in a later task.
- **`public/og-image.png`** (1200×630) is not committed yet — `BaseLayout.astro`
  references `/og-image.png` for Open Graph / Twitter cards. Add it in the assets task.
- Palette and typography are placeholders in `global.css`, finalized in the design task.
