# CLAUDE.md — bazanjeremy.github.io

Handoff/état du projet. **Lis ce fichier en premier à chaque nouvelle session** (Jérémy
`/clear` le contexte entre les étapes ; toute la continuité vit ici + dans la mémoire
persistante). Communiquer en **français**.

## Le projet en une phrase

Landing single-page **bilingue FR/EN**, vitrine externe des outils QA×IA de Jérémy Bazan
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
- **Vocabulaire public (ligne rouge, 30.07.2026)** : les mots « portfolio », « P1 » à « P7 »,
  « entretien », « recruteur », « démonstration » sont **bannis de tout texte rendu** — copy,
  navigation, libellés de boutons, et **ancres d'URL** (`#outils` / `#tools`, pas `#portfolio`).
  On dit « outils », « série d'outils », ou le nom du projet. Le fichier `Portfolio.astro` garde
  son nom : c'est du code, pas du texte publié.
- **Pas de dépendance hors stack ci-dessus sans accord.** Pas d'emoji dans le contenu.
  Animations (mise à jour T9 « plus affirmé », validé Jérémy sur maquette) : fade-in scroll
  (`.reveal`) + entrée Hero échelonnée + micro-effets au survol (cartes `.card-lift`, boutons).
  CSS-only, toujours gated `prefers-reduced-motion`. Rester sobre : pas d'animation gratuite.

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
| T9 — mise en vie « plus affirmé » (Hero halo + arcs, header flouté, bandes de section, cartes lift, eyebrows ; helpers `.eyebrow`/`.kicker`/`.card-lift`/`.btn*` ; clé i18n `hero.eyebrow`) | ✅ mergée, déployée (direction validée sur maquette) |
| T10 — blog/veille bilingue (Astro content collections, section `#veille` + `/blog` + `/blog/<slug>` FR/EN, `.prose`, nav « Veille »/« Insights ») | ✅ mergée (#12, #13), déployée |
| T11 — 1er article réel de veille (« L'IA en QA : commencer par les tâches simples », FR par Jérémy + traduction EN). Gabarits `[EXEMPLE]` supprimés | ✅ mergée (#14), déployée |
| T12 — 2e article (« Mot de passe "robuste"… », NIST SP 800-63B-4, FR par Jérémy + traduction EN) + fix switch de langue des articles (champ `translationSlug` → toggle + `hreflang` corrects, l'ancienne « limite T10 » est levée) + styles `.prose table` (scroll interne mobile) | ✅ mergée (#16), déployée |
| T13 — 7ᵉ outil + ligne rouge de vocabulaire (`claude-qa-toolkit` en 4ᵉ bloc de la cartographie, tuile de preuve « 6 outils · ~848 tests » → « 7 outils open source » avec le total réattribué aux six frameworks, mot « portfolio » purgé de la nav / de l'eyebrow / du bouton / de l'ancre `#portfolio` → `#outils` / `#tools`) | ✅ mergée (#18), déployée |
| T14 — 3e article (« Tests flaky : qui décide qu'un test est instable ? », choix de conception de `flakysense`, FR par Jérémy + traduction EN). Une objection de l'article réécrite après vérification du repo lié : le seuil 0.5 est une constante de l'orchestrateur (ADR-005), distincte du seuil de détection 0.3, calibrée sur fixtures synthétiques, et la CLI **expose bien** `--escalation-threshold` | ✅ mergée (#20), déployée |
| T15 — 4e article (« Le déterministe d'abord, l'IA là où elle apporte », la règle « le LLM ne décide de rien » appliquée à 5 outils, FR par Jérémy + traduction EN). Deux affirmations reformulées après vérification des dépôts cités : (1) `flakysense` n'a pas de « refus de conclure » sous 4 runs — `MIN_RUNS = 4` est un **amortisseur** du score dans `detector.py` (`raw * min(1, len(runs)/MIN_RUNS)`), le vrai refus est le classifieur de cause qui répond `unknown` sous `CONFIDENCE_FLOOR = 0.4` ; (2) `testscribe` n'a pas « retenu TF-IDF plutôt qu'un modèle sémantique » — ADR-002 acte un *dual-mode embedder*, TF-IDF étant le **défaut et le chemin CI**, sentence-transformers restant accessible via `USE_NEURAL_EMBEDDINGS`. Un point mou signalé et **non** réécrit (choix rhétorique, pas erreur factuelle) : sur `anomaly-sentinel`, le dépôt tient ses gates avec son fallback déterministe | ✅ mergée (#22), déployée |
| T16 — 5e article (« Le QA qui arrive au refinement arrive déjà trop tard », positionnement du QA au cadrage plutôt qu'au refinement, FR par Jérémy + traduction EN). **Aucun dépôt d'outil cité** → pas de vérification technique applicable ; à la place, contrôle de cohérence avec la copy publiée : les trois tâches amont et le « 60 à 80 % » de l'article concordaient mot pour mot avec la tuile de preuve n°2 de l'époque (`i18n/fr.json`, « −60 à −80 % »). La traduction EN réutilisait le vocabulaire alors publié dans `i18n/en.json` (« Definition-of-Ready checks », « deriving acceptance criteria into passing and failing scenarios », « high-level scoping of the test strategy »). **Depuis #32**, cette tuile n'existe plus, et l'article présente le chiffre comme une estimation, plus comme une mesure (voir la ligne « Correctif chiffres ») | ✅ mergée (#24), déployée |
| T17 — 6e article (« Le bouton ne marche pas » : ce que coûte la reconstruction d'un signalement d'une ligne, les quatre agents de `testscribe`, et les trois fois où l'outil s'est trompé sur lui-même ; FR par Jérémy + traduction EN). Deux affirmations reformulées après vérification du dépôt cité : (1) « chaque agent tourne dans deux modes : le modèle de langage + un repli déterministe » est vrai pour **trois agents sur quatre** — le classifieur de doublons n'appelle aucun modèle de langage, `PatternClassifier.__init__` fige `Embedder(force_tfidf=True)` et retombe sur des mots-clés sous son seuil de similarité ; (2) « le repli déterministe laisse le champ vide plutôt que de deviner » est vrai pour `psd2_article` (`None`) et `traceability_tag` (`UNTRACED`), mais les quatre dimensions de sévérité et le label de pattern retombent sur des **défauts conservateurs écrits en dur** (`"partial"  # Safe default`, `"sometimes"  # Assume reproducible by default`, `"single"`, `"new"`, `"UI_REGRESSION"`) — donc précisément des valeurs vraisemblables. Vérifié et laissé tel quel : 4 agents, CVSS-lite à 4 dimensions (ADR-003), 144 tests (144 `def test_`, aucun `parametrize`), le lookbehind `(?<!not )\balways\b`, et l'anecdote du seuil — le scoreur **exécuté ici** sur la fixture `medtech_report` sort `full/always/single/new` → **8,1 → critical**, qui serait « high » avec un seuil à 8,5. Non vérifiable et signalé sans réécriture : les valeurs *antérieures* des trois corrections ne sont pas dans l'historique public (seuil déjà à 8.0 et lookbehind déjà présent au premier commit poussé `0a118c69`) | ✅ mergée (#30), déployée |
| Maintenance — dépendances, en deux temps. **(a) #26** : 4 alertes Dependabot fermées (`js-yaml` GHSA-5p4m-2wfm-xmqj high, `nanoid` high, `postcss` medium, `astro` XSS medium) par `npm audit fix` — `package-lock.json` seul, mais le bump a emporté **Astro 7.0.9 → 7.3.1** (deux minors, dans `^7.0.9`) ; rendu vérifié inchangé par diff octet contre la prod, `npm audit` = 0. **(b) #28** : le warning npm 11 `allow-scripts` acté dans `package.json` en `"allowScripts": { "esbuild": false }` — donc **`package.json` n'est plus vierge de tout champ hors stack**, c'est voulu (détail et justification dans les gotchas) | ✅ mergées (#26, #28), déployées |
| Correctif chiffres (17.09) — lot fourni par Jérémy sous forme de **patch** (`git apply`, appliqué tel quel, sans conflit). **(1) Tuiles de preuve (FR + EN)** : Jérémy qualifie lui-même « −30 % » et « −60 à −80 % » d'**estimations personnelles**. Elles sont remplacées par « 100 % des user stories » (évaluées sur leurs risques dès le cadrage, avec un agent de relecture) et « 8 agents IA » ; la tuile « 7 outils open source » ne change pas. Source des deux nouveaux faits : Jérémy. Ce sont des pratiques internes, **aucun dépôt public ne permet de les vérifier**. Cohérence contrôlée : la tuile « 100 % » reprend l'article T16 (« dès le cadrage », « avant la première ligne de code » ; en EN, « framing stage », le terme de l'article). **(2) Articles T11 et T16 (FR + EN)** : le −60 à −80 % est désormais libellé comme une estimation (« Estimation personnelle, pas une mesure », « je ne l'ai pas mesuré »). Le titre « Ce que ça change, mesuré » devient « Ce que ça change », donc **l'ancre change** : `#ce-que-ça-change-mesuré` → `#ce-que-ça-change`, `#what-it-changes-measured` → `#what-it-changes` (aucun lien interne n'y pointait). **(3) Article T16** : la phrase « le module d'à côté a cassé deux fois ce trimestre » est retirée (fait sans source). Vérifié : diff du `dist/` contre la prod, mise en page des tuiles de 375 à 1265 px sans débordement, et, après le merge, le texte servi sur les 6 pages concernées | ✅ mergée (#32), déployée |
| Correctif `testscribe` (19.09) — fermeture de l'écart ouvert depuis T17, **option choisie par Jérémy : le texte suit le code** (l'autre option était de retirer le `force_tfidf=True` du dépôt, écartée : elle changeait l'outil et aurait demandé d'exécuter le mode neuronal pour pouvoir l'affirmer). Côté site : la carte `testscribe` passe de « détection sémantique de doublons » à « détection de doublons » (la description GitHub du dépôt, mot pour mot), et l'article T15 ne dit plus que TF-IDF est un « chemin par défaut » ni que le modèle neuronal est « accessible derrière un drapeau de configuration ». Côté outil, même écart dans le README FR/EN, l'ADR-002 (« Production upgrade path is one config flag ») et un commentaire de `docker-compose.yml` → PR séparée, l'ADR gardant sa décision et recevant un **amendement daté** plutôt qu'une réécriture | ✅ mergée (#34), déployée · `BazanJeremy/testscribe#2` mergée le 19.09 (4 fichiers de doc, **aucun code** : le comportement est délibéré, seule sa description était fausse) |
| Cartes de partage Open Graph (19.09) — « PORTFOLIO QA × IA » retiré de l'image (le mot avait survécu à T13 parce qu'aucun `grep` ne lit une image) et remplacé par « OUTILS QA × IA », l'eyebrow du héros. **Une carte par langue** : les pages `/en/` affichaient jusque-là une image en français ; `BaseLayout` choisit selon `lang`. Le script de génération est enfin versionné (`scripts/og-image.mjs`). Géométrie du texte calibrée sur l'image d'origine (largeurs et positions à 2 px près, titre et thèse au pixel exact) ; halo et arcs reconstruits d'après les pixels, faute du script de T6. Seul écart visible assumé : le nom descend 4 px moins bas, la police système d'origine n'étant pas reproductible | ✅ mergée (#35), déployée |
| T18 — 7e article (« De zéro règle à la règle de trop », le statut d'une règle de validation — observation ou spécification — à partir de l'incident Minecraft de GPT-6 Astra relayé par Vals AI, FR par Jérémy + traduction EN). **Une affirmation réécrite** après vérification du dépôt cité : « le seuil d'escalade ne vit pas dans un flag de ligne de commande » est faux — `cli.py` définit bien `--escalation-threshold` (défaut `None` → `ESCALATION_THRESHOLD = 0.5` de l'orchestrateur, ADR-005), et la phrase contredisait en plus l'article T14 **déjà publié**, qui écrit noir sur blanc que « la ligne de commande expose bien un `--escalation-threshold` ». Reformulée sur le libellé déjà en ligne : le flag existe pour explorer, seul le **défaut** ne bouge que par un ADR. Vérifié et laissé tel quel : l'amortissement du score sous quatre runs (`MIN_RUNS = 4`, `raw * min(1, len(terminal)/MIN_RUNS)` dans `detector.py`). Faits externes vérifiés par recherche web (141 h, ferme à blazes, 6+ endermen / 3 perles, coffre **et** lit soufflés, pommes de terre, « milliers de spectateurs », écran/clavier/souris seuls, la ligne « SUGARCANE, NOT creeper! ») ; la citation mémoire est reproduite **avec ses espaces manquants**, comme chez Dexerto — the-decoder la normalise, les médias divergent sur ce point. Signalé à la livraison puis **corrigé après publication** (ligne suivante) : « a publié le compte rendu » | ✅ mergée (#39), déployée |
| Correctif d'attribution (20.09) — le seul point que T18 avait signalé sans le réécrire, **arbitré par Jérémy après le merge**. L'article ouvrait sur « le 15 septembre, […] Vals AI a publié le compte rendu d'une expérience » : or le récit vient du **fil X de Vals AI et du direct** (15.09, date confirmée par Dexerto et Tom's Hardware), alors que la page CUA-bench de vals.ai est datée « Updated 9/18/2026 » et ne contient **ni** l'anecdote **ni** la citation mémoire (the-decoder, lui, date « le rapport » du 17.09 — les médias divergent). « a publié le compte rendu » → « a partagé le récit » ; en EN « published an account » → « shared an account » (l'EN était moins exposé : « an account » n'annonçait pas un document, seul « published » posait problème). **Une ligne par fichier, sans reflux de paragraphe** : les lignes de remplacement se terminent comme les originales (`d'une` / `an`). Raison du correctif, propre à cet article : sa thèse est qu'une règle doit dire d'où elle vient et à quelle date — l'ouverture ne pouvait pas se tromper sur sa propre source. **Laissé tel quel sur décision de Jérémy** : « Astra a fini par se corriger […] L'alerte a été levée » — la ligne de log (« SUGARCANE, NOT creeper! ») corrige une *identification*, pas la règle ; choix rhétorique non garanti par la source, pas erreur factuelle, et l'article se protège déjà deux paragraphes plus haut (« une partie, un incident, aucun contrefactuel ») | ✅ branche `fix/attribution-vals-ai`, PR ouverte, à merger |
| Maintenance — dépendances (20.09, #41) — les **3 alertes Dependabot** restantes fermées par `npm audit fix` : `svgo` ×2 (GHSA-w27v-7q3p-w38r **high, CVSS 8.2** et GHSA-4vpr-x523-8j87 medium 6.1, toutes deux sur le plugin `removeScripts`) et `devalue` ×1 (GHSA-9rgm-9g3h-6x36 medium 5.3, DoS sur entrée malformée). **Aucune n'atteignait le visiteur**, mesuré : `dist/` livre 0 fichier `.js` et 0 balise `<script>` ; les deux avis `svgo` sont des **contournements de sanitizer** qui supposent un SVG venu d'un utilisateur non fiable, alors que le dépôt n'a qu'un seul SVG (`public/favicon.svg`, écrit à la main, copié verbatim sans passer par le pipeline d'assets — vérifié identique à l'octet après le bump) ; le `devalue` est un CVE de disponibilité sans entrée hostile, même forme que le `js-yaml` de #26. Motif du correctif : hygiène (une liste d'alertes bruyante cache celle qui compte), pas exposition. **`package.json` intact à l'octet** (le champ `allowScripts` survit) et, contrairement à #26, **Astro n'a pas bougé** (7.3.1). 7 paquets transitifs changent : `svgo` 4.0.2 → 4.1.0, `devalue` 5.8.1 → 5.9.4, `sax` 1.6.0 → 1.6.1, `entities` dédupliqué, et **deux majors** tirés par `svgo` — `css-select` 5.2.2 → 6.0.0, `css-what` 6.2.2 → 7.0.0. Vérif : **18/18 pages identiques à l'octet** contre la prod, hash du CSS inchangé, `sitemap-0.xml` identique, 5 assets identiques dont `favicon.svg` et les deux cartes OG, `npm audit` = 0 | ✅ branche `chore/audit-svgo-devalue`, PR ouverte, à merger |

## Workflow Git (Jérémy merge lui-même)

Une **branche `feat/*` (ou `fix/`, `chore/`) par tâche → PR → squash-merge**. Claude fait tout
**sauf le merge** :

1. `git switch main && git pull` (récupérer la PR précédente mergée), nettoyer les branches locales.
2. `git switch -c feat/<tache>`.
3. Implémenter + **vérifier en conditions réelles** (voir plus bas).
4. Commit (Conventional Commits, trailer `Co-Authored-By` ; langue : voir ci-dessous),
   `git push -u origin ...`,
   `gh pr create`.
5. **S'arrêter** : donner le lien PR + `gh pr merge <n> --squash --delete-branch`. **Jérémy merge.**

**Langue des commits : le français est accepté** (Jérémy, 19.09 — l'ancienne règle « anglais »
n'est plus impérative). Quand Jérémy fournit un message de commit, l'utiliser **pour le commit**,
pas seulement comme titre de PR : le squash d'une PR **à un seul commit** garde le message du
commit, pas le titre de la PR (observé sur #30 et #32, corrigé à partir de #34). Dans un **autre
dépôt**, suivre la langue de son historique : `testscribe` est en anglais.

**Pas de mention d'outil dans les PR** (décision Jérémy 2026-07-16) : aucun footer / annexe
« 🤖 Generated with Claude Code » ni équivalent dans les titres et bodies de PR. C'est déjà
évident, et Jérémy compte écrire dessus lui-même. Le body décrit le changement, point.
Vaut aussi pour les commentaires de PR et les issues.

## Vérification (obligatoire avant de livrer une PR)

- `npm run build` (doit passer).
- Aperçu réel : `npm run preview` puis vérifs. **Les screenshots du browser pane plantent dans
  cet environnement** → vérifier via `javascript_tool` + `getComputedStyle` (couleurs, tailles),
  et via la prod (`curl` du CSS `/_astro/*.css`).
- Responsive **mobile 375px** (iPhone SE) : pas de débordement horizontal. Contrastes WCAG AA.
  ⚠️ `resize_window` peut répondre « Viewport set to 375x812 » **sans que l'émulation soit
  appliquée** : toujours relire `document.documentElement.clientWidth` dans la même mesure,
  et recharger la page si la largeur n'est pas 375 avant de conclure (vu en T16 : première
  mesure faite à 785px, donc sans valeur).
- **Bump de dépendance ou correctif de contenu** : ne pas juger à l'œil, comparer le `dist/`
  au site en prod (qui est l'état de `main`) — `curl` de chaque type de page + `diff`, `cmp` sur
  le CSS `/_astro/*.css` (son nom est un hash de contenu : nom identique ⇒ CSS identique), `diff`
  du `sitemap-0.xml`. Vérif la moins coûteuse et la plus concluante ; en #26 le seul écart sur
  4 pages était `<meta name="generator">`, en #32 les écarts étaient exactement ceux du patch.
  ⚠️ **Faux positif Windows** : cette machine extrait les fichiers en CRLF (`core.autocrlf=true`,
  `git ls-files --eol` → `w/crlf`). Un build local laisse alors un octet `\r` à chaque retour à
  la ligne *interne à un paragraphe*, ce qui fait différer l'article T17 (FR + EN) alors qu'il
  n'a pas changé. La CI construit en LF. Cause **vérifiée** le 17.09 : build de `main` tel
  quel → 2 pages différentes ; mêmes fichiers repassés en LF → 0 écart sur les 16 pages. Avant
  de conclure à une régression, regarder l'octet (`cmp -l`) : un `015` isolé n'en est pas une.

## Gotchas

- CI = `.github/workflows/deploy.yml`, `withastro/action` **avec `node-version: 22`**
  (Astro 7 exige ≥ 22.12 ; l'action est en Node 20 par défaut).
- L'environnement `github-pages` n'autorise que la **branche par défaut** → doit rester `main`.
- **Articles de veille** : Jérémy en pousse lui-même. Le schéma (`src/content.config.ts`)
  ne valide pas tout → à vérifier à chaque nouvel article (contrat documenté dans le README) :
  `slug` = l'URL, kebab-case sans espace ni accent (sinon `/blog/mon%20article/` part dans le
  sitemap), fichier nommé comme le slug, et **le corps ne commence pas par `#`** (le layout rend
  déjà `title` en `<h1>` — sinon double h1). Penser au pendant EN, et **chaîner les deux via
  `translationSlug`** (chacun pointe le slug de l'autre — sinon le toggle de langue retombe sur
  l'index du blog de l'autre langue). Le frontmatter fourni par Jérémy est souvent en
  `description` / `category` : remapper sur `excerpt` / `tag`, et ajouter `lang` +
  `translationSlug`.
- **Article qui parle d'un outil du repo public** : vérifier chaque affirmation technique
  contre le dépôt cité (`gh api repos/BazanJeremy/<outil>/...`) avant de livrer la PR.
  **La source de vérité est le code, pas le README — ni même l'ADR** : celui de `testscribe`
  annonçait « détection sémantique de doublons », et son ADR-002 promettait un basculement vers
  le neuronal « à un drapeau près », là où le classifieur fige TF-IDF depuis toujours (corrigé
  par `testscribe#2`). L'écart va toujours dans le même sens : l'article promet
  plus que ce que le code garantit. Cas rencontrés — T14 : un seuil annoncé comme non exposé
  en CLI alors que `flakysense` l'expose ; T15 : un « refus de conclure » annoncé là où le
  code amortit seulement le score, et un « plutôt que » là où l'ADR acte un mode double.
  Reformuler et le signaler à Jérémy, ne jamais publier l'écart en silence. Distinguer
  l'affirmation technique fausse (à corriger) du choix rhétorique non soutenu par le dépôt
  (à signaler, pas à réécrire).
- **La vérification d'un nouvel article peut invalider un article déjà publié.** Repéré en T17,
  **corrigé le 19.09** : l'article T15 (FR + EN) écrivait que, pour la détection de doublons de
  `testscribe`, « le modèle neuronal reste accessible derrière un flag de configuration », et la
  copy de la landing annonçait une « détection sémantique de doublons » ; or
  `PatternClassifier.__init__` fige `Embedder(force_tfidf=True)`, donc `USE_NEURAL_EMBEDDINGS`
  n'atteint jamais ce classifieur. Les deux sont réécrits (#34). L'écart vivait **aussi dans le
  dépôt de l'outil** (README FR/EN, ADR-002, commentaire `docker-compose`) → PR séparée
  `BazanJeremy/testscribe#2`, mergée le 19.09. Leçon : quand une vérification contredit du contenu déjà en ligne, le
  dire, et regarder où la même affirmation est répétée — site, article, README, ADR.
- **Cartes Open Graph : deux images, un script** (#35, 19.09). `public/og-image.png` (FR) et
  `public/og-image-en.png` (EN) ; `BaseLayout.astro` choisit selon `lang`. **Le texte est incrusté
  dans l'image** : toute copy qui y figure doit être changée là aussi, et aucun `grep` ne la
  trouvera — c'est ce qui a fait survivre « PORTFOLIO QA × IA » à la purge de T13, jusqu'au 17.09.
  Les régénérer avec `node scripts/og-image.mjs` (le script porte la copy et la mise en page) ;
  ne jamais retoucher les PNG à la main. Rendu par `sharp`, présent via Astro mais **non déclaré**
  dans `package.json` — outil de génération lancé à la main, jamais appelé par le build. Polices
  **système** (Segoe UI / Consolas) : le SVG passe par librsvg, Inter et JetBrains Mono ne sont pas
  utilisables. Sortie attendue : 1200×630, sRGB, **sans canal alpha** (`.flatten()`), ~70 KB.
  La géométrie du texte est calibrée sur l'image de T6 ; le décor (halo, arcs) est une
  reconstruction, le script d'origine n'ayant jamais été versionné.
- **Article qui cite une source externe (presse, rapport, fil X)** : aucun dépôt à
  interroger, mais la vérification reste due — recouper chaque fait sur plusieurs médias
  et remonter à la source primaire. Vu en T18 : la date et le verbatim ne sont pas
  donnés pareil partout (Dexerto reproduit la note mémoire d'Astra **avec ses espaces
  manquants**, the-decoder la nettoie et date le rapport du 17.09, la page CUA-bench de
  vals.ai est datée du 18.09 et ne contient pas le récit du tout). Quand une citation
  verbatim est le ressort d'un paragraphe (« espaces manquants compris »), il faut une
  source qui la reproduise telle quelle, pas un résumé — un résumé normalise. Et
  distinguer ce qu'un rapport publie de ce qu'une entreprise raconte sur X : ce n'est ni
  la même date ni le même statut.
- **Article qui ne cite aucun dépôt** : la vérification ci-dessus ne s'applique pas — le dire
  plutôt que de laisser croire qu'elle a eu lieu. Faire à la place le contrôle de cohérence
  avec la **copy publiée** (`src/i18n/*.json`) : un article qui reprend un chiffre ou une
  liste déjà affichés sur la landing doit dire la même chose qu'eux, et la traduction EN doit
  réutiliser le vocabulaire déjà publié dans `en.json` (sinon un lecteur EN voit deux
  formulations divergentes du même engagement). Cas T16 : les trois tâches amont et le
  « 60 à 80 % » concordaient avec la tuile de preuve n°2, et rien n'avait été reformulé.
  **Mais une concordance ne dit rien de la source** : l'article (« je mesure ») et la tuile
  reprenaient tous deux un chiffre que Jérémy a ensuite qualifié d'« estimation
  personnelle » (#32), si bien qu'il a fallu requalifier les deux. Quand un chiffre est
  présenté comme mesuré (« mesuré », « je mesure », « résultat mesuré »), demander à Jérémy
  s'il s'agit d'une mesure ou d'une estimation, au lieu de s'arrêter à la concordance.
- **Alertes Dependabot / `npm audit`** : elles portent sur des dépendances **transitives**
  (rien à toucher dans `package.json`). Avant de relayer la sévérité affichée, regarder si le
  paquet tourne **au build ou chez le visiteur** : le site est statique, donc un CVE de
  disponibilité (le DoS `js-yaml`, qu'Astro utilise pour parser le frontmatter de nos propres
  articles) n'a aucune entrée hostile ici, alors qu'un XSS d'Astro, lui, atteint le visiteur.
  Le dire, plutôt que de recopier le score CVSS. Et `npm audit fix` peut emporter des
  **minors** malgré son « lockfile only » (vu en #26 : Astro 7.0.9 → 7.3.1), et même des
  **majors transitifs** (vu en #41 : `css-select` 5→6 et `css-what` 6→7, tirés par le
  nouveau `svgo`) → vérifier le rendu à chaque fois. Enfin, le `scope: runtime` affiché
  par Dependabot ne veut **pas** dire « tourne chez le visiteur » : c'est la distinction
  npm `dependencies` / `devDependencies`, héritée d'Astro. Sur ce site, la mesure qui
  tranche est que `dist/` ne contient aucun `.js` ni aucune balise `<script>`.
- **`allowScripts` dans `package.json`** : la machine de Jérémy est en **npm 11**, qui bloque
  les `postinstall` par défaut ; la CI est en **npm 10.9.8** (lu dans le log du workflow), qui
  ignore le champ. Le warning `allow-scripts` sur `esbuild` était donc local. Il est acté en
  `"esbuild": false` : sur Windows avec `@esbuild/win32-x64` installé, ce `postinstall` est un
  **no-op** (`maybeOptimizePackage()` s'exclut de `win32`, le binaire de plateforme résout déjà)
  — vérifié par `npm ci` complet puis `esbuild --version`. ⚠️ `npm install-scripts approve|deny`
  **écrit dans `package.json` malgré `--dry-run`** (npm 11.18.0) : ne pas s'y fier.
- Repo : https://github.com/BazanJeremy/bazanjeremy.github.io · Live :
  https://bazanjeremy.github.io/

## Commandes Astro

`npm run dev` (localhost:4321) · `npm run build` (→ `dist/`) · `npm run preview`.
Docs : https://docs.astro.build
