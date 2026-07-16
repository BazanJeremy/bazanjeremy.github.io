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
├── components/     # Header, Footer, LangToggle + section components
├── content/        # blog/fr/*.md, blog/en/*.md — the veille articles
├── content.config.ts   # blog collection schema (frontmatter contract)
├── i18n/           # fr.json (source copy), en.json (English mirror), utils.ts
├── layouts/        # BaseLayout.astro (SEO, OG/Twitter, hreflang)
├── pages/
│   ├── index.astro           # FR (/)
│   ├── blog/index.astro      # FR article list (/blog)
│   ├── blog/[...slug].astro  # FR article page (/blog/<slug>)
│   ├── en/index.astro        # EN (/en/)
│   ├── en/blog/index.astro   # EN article list (/en/blog)
│   └── en/blog/[...slug].astro
└── styles/global.css   # Tailwind import + @theme tokens
public/             # favicon.svg, robots.txt, og-image.png, fonts/  (see Assets)
.github/workflows/  # deploy.yml — GitHub Pages via withastro/action
```

Translations are keyed in `src/i18n/{fr,en}.json` and read through
`useTranslations(lang)` in `src/i18n/utils.ts`. The language toggle
(`LangToggle.astro`) is a pure `<a>` link — no client JavaScript.

## Veille / blog

Articles are Markdown files under `src/content/blog/<lang>/`. Each file becomes a page:
`/blog/<slug>` (FR) or `/en/blog/<slug>` (EN). The schema is enforced by
`src/content.config.ts` — a build error means the frontmatter is wrong.

```markdown
---
title: "AI in QA: start with the simple tasks"   # rendered as the page's only <h1>
date: 2026-07-16
tag: "AI & QA"                                   # short label, shown as a chip
excerpt: "One or two sentences."                 # <meta description> + list-card summary
lang: en                                         # must match the folder: fr | en
slug: ai-in-qa-simple-tasks                      # THE URL — see rules below
linkedin: https://www.linkedin.com/in/jeremy-bazan   # optional
draft: false                                     # true = excluded from the build
---
```

Two rules the schema cannot catch on its own:

- **`slug` is the URL.** Lowercase kebab-case only — no spaces, no accents. A slug like
  `my article` builds a directory with spaces and ships `/blog/my%20article/` to the
  sitemap. Keep the filename identical to the slug.
- **Do not open the body with `#`.** The layout already renders `title` as the page's
  `<h1>`; a second one breaks the heading hierarchy. Start sections at `##`.

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

## Assets

All assets are self-hosted under `public/` — zero external requests at runtime.

- **`public/og-image.png`** (1200×630) — Open Graph / Twitter card, referenced by
  `BaseLayout.astro` at `/og-image.png`. It is the social-share preview only; it is
  **not** rendered on the page.
- **`public/favicon.svg`** — site icon.
- **`public/fonts/`** — Inter + JetBrains Mono variable fonts (latin subset, ~88 KB),
  preloaded in `BaseLayout.astro`.
- **`public/robots.txt`** — points crawlers to the sitemap.

Design tokens (palette « Ardoise » + type scale) live in `@theme` inside
`src/styles/global.css`.
