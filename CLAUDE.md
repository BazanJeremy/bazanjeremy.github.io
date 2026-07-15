# CLAUDE.md — bazanjeremy.github.io

Handoff/état du projet. **Lis ce fichier en premier à chaque nouvelle session** (Jérémy
`/clear` le contexte entre les étapes ; toute la continuité vit ici + dans la mémoire
persistante). Communiquer en **français**.

## Le projet en une phrase

Landing single-page **bilingue FR/EN**, vitrine externe du portfolio QA×IA de Jérémy Bazan
(recherche CDI Suisse romande), déployée sur GitHub Pages. Ton : **moderne dans la forme,
senior/sobre dans le fond**. Aucun contenu inventé — la copy vient du brief de Jérémy et vit
dans `src/i18n/fr.json`.

## Décisions verrouillées (ne pas revenir dessus sans demander)

- **Stack** : Astro 7 + Tailwind 4 en **CSS-first** via `@tailwindcss/vite`. Pas de
  `@astrojs/tailwind`, pas de `tailwind.config.*` (incompatibles Astro 7 — divergence assumée).
- **i18n natif** : `fr` sur `/`, `en` sur `/en/` (`prefixDefaultLocale: false`). Toggle = liens
  purs, **0 JS client**. `@astrojs/sitemap` pour le sitemap.
- **Palette « Ardoise »** (tokens dans `@theme`, `src/styles/global.css`) :
  `bg #0d1117` · `surface #161b22` · `line #232a2f` · `fg #e6edf3` · `muted #8b949e` ·
  accent émeraude `#4cbf88` · `accent-strong #3ba873` · `on-accent #08130d`.
- **Typo** : Inter + JetBrains Mono **auto-hébergées** (`public/fonts`, variables latin,
  ~88 KB, 0 requête externe). Utilitaires d'échelle : `text-stat` / `text-thesis` / `text-heading`.
- **CSS layering** : styles de base dans `@layer base`, helpers (`.wrap` `.section` `.reveal`)
  dans `@layer components` — sinon les utilitaires Tailwind sont écrasés sur les `<a>`.
- **Pas de dépendance hors stack ci-dessus sans accord.** Pas d'emoji dans le contenu.
  Animations : rien au-delà d'un fade-in au scroll (déjà en place, `.reveal`, CSS-only).

## Avancement

| Tâche | État |
| --- | --- |
| T1 — bootstrap Astro + i18n + CI Pages | ✅ mergée, déployée |
| T2 — design system (palette + fonts + tokens) | ✅ mergée, déployée |
| T3 — Hero + Preuves stylés + header | ✅ mergée, déployée |
| T4 — Cartographie sectorielle (`Portfolio.astro` : 3 blocs × 2 dépôts, cartes cliquables GitHub) | ✅ mergée, déployée |
| T5 — Stack + Parcours + Contact + Footer | ✅ mergée, déployée |
| T6 — assets (favicon + `public/og-image.png` 1200×630) | ✅ mergée, déployée |
| T7 — traduction EN + a11y | ✅ mergée, déployée. EN complet + audit a11y (landmarks, hiérarchie titres, contrastes AA, `lang`/hreflang) + Lighthouse prod |
| T8 — déploiement / DNS custom | ✅ déploiement live & vérifié (`/`, `/en/`, `sitemap-index.xml` → 200). **DNS custom : reporté** (pas de domaine — décision Jérémy 2026-07-15). Repo prêt : ajouter `public/CNAME` + màj `astro.config.mjs` `site` le jour venu |

## Workflow Git (Jérémy merge lui-même)

Une **branche `feat/*` (ou `fix/`, `chore/`) par tâche → PR → squash-merge**. Claude fait tout
**sauf le merge** :

1. `git switch main && git pull` (récupérer la PR précédente mergée), nettoyer les branches locales.
2. `git switch -c feat/<tache>`.
3. Implémenter + **vérifier en conditions réelles** (voir plus bas).
4. Commit (Conventional Commits, anglais, trailer `Co-Authored-By`), `git push -u origin ...`,
   `gh pr create` (body finissant par "Generated with Claude Code").
5. **S'arrêter** : donner le lien PR + `gh pr merge <n> --squash --delete-branch`. **Jérémy merge.**

## Vérification (obligatoire avant de livrer une PR)

- `npm run build` (doit passer).
- Aperçu réel : `npm run preview` puis vérifs. **Les screenshots du browser pane plantent dans
  cet environnement** → vérifier via `javascript_tool` + `getComputedStyle` (couleurs, tailles),
  et via la prod (`curl` du CSS `/_astro/*.css`).
- Responsive **mobile 375px** (iPhone SE) : pas de débordement horizontal. Contrastes WCAG AA.

## Gotchas

- CI = `.github/workflows/deploy.yml`, `withastro/action` **avec `node-version: 22`**
  (Astro 7 exige ≥ 22.12 ; l'action est en Node 20 par défaut).
- L'environnement `github-pages` n'autorise que la **branche par défaut** → doit rester `main`.
- Repo : https://github.com/BazanJeremy/bazanjeremy.github.io · Live :
  https://bazanjeremy.github.io/

## Commandes Astro

`npm run dev` (localhost:4321) · `npm run build` (→ `dist/`) · `npm run preview`.
Docs : https://docs.astro.build
