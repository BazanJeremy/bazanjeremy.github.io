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
  navigation, libellés de boutons, et **ancres d'URL** (`#outils`, pas `#portfolio` — les ancres
  ne sont pas traduites, l'anglais pointe `#outils` lui aussi ; `#tools` n'existe nulle part,
  mesuré le 30.09 sur `dist/` et `src/i18n/*.json`).
  On dit « outils », « série d'outils », ou le nom du projet. Le fichier `Portfolio.astro` garde
  son nom : c'est du code, pas du texte publié.
- **Pas de dépendance hors stack ci-dessus sans accord.** Pas d'emoji dans le contenu.
  Animations (mise à jour T9 « plus affirmé », validé Jérémy sur maquette) : fade-in scroll
  (`.reveal`) + entrée Hero échelonnée + micro-effets au survol (cartes `.card-lift`, boutons).
  CSS-only, toujours gated `prefers-reduced-motion`. Rester sobre : pas d'animation gratuite.

## Avancement

Historique des tâches (T1–T21, correctifs, maintenance) : `docs/JOURNAL.md`. Ne pas le lire en
entier ; le consulter par ligne ciblée quand une décision passée doit être vérifiée.

**Point ouvert au 22.09 (source : ligne T19 du journal), décision de Jérémy** : aligner les prompts
d'`anomaly-sentinel` (`fintech_v1.2`, `medtech_v1.1`) attend un premier run en mode LLM ; toute version
ajoutée au test paramétré change le nombre de tests (182, publié dans l'article T19).

**Point ouvert au 29.09 (source : ligne T20 du journal), décision de Jérémy** : `main` de
`ReleaseGuard` n'est **pas protégée** (re-mesuré le 30.09 : `gh api .../branches/main` →
`protected: false`, aucun ruleset). Le job CI échoue bien sur NO GO (`test "$status" -le 1`),
mais rien n'empêche un merge par-dessus — or l'article T20 et le README écrivent que l'outil
« est le verrou de sortie du projet ». Même écart que celui fermé en T19 sur `anomaly-sentinel`,
où Jérémy avait choisi d'activer la protection. Ne rien changer sans son arbitrage.

**Point ouvert au 01.10 (source : ligne T21 du journal), décision de Jérémy** : l'article T21
s'appuie sur « une analyse récente des sites des dix universités françaises », sans auteur. Cette
analyse est l'œuvre d'**Accessiway**, un prestataire d'accessibilité (observé : l'article
Handicap.fr du 03.09.2026 cité en source la lui attribue nommément). Les faits repris sont exacts
— 2 universités sur 10 satisfaisaient l'ensemble des critères, contrastes insuffisants et
navigation clavier déficiente. C'est un choix de rédaction, pas une erreur factuelle, donc **non
réécrit** ; signalé parce que l'article reproche précisément à un indicateur de taire sa méthode.
Ne rien changer sans son arbitrage.

**Point ouvert au 07.10 (source : ligne T22 du journal), décision de Jérémy** : deux écarts de
**sourcement** relevés à la vérification de l'article T22, aucun n'étant une erreur factuelle,
donc **non réécrits**. (1) Le principe 4 du syllabus s'appelle « **Regroupement des défauts** »
dans la traduction CFTL (observé : CFTL v4.0 p. 20), là où l'article écrit « les défauts se
regroupent » — retraduction du titre anglais « Defects cluster together », exacte et hors
guillemets, mais l'article emploie partout ailleurs le vocabulaire officiel du CFTL. (2) La ligne
de sources cite §1.1.1, §1.3, §1.4.3, §1.4.4 et §4.2.3 mais **pas §5.2**, alors que la mécanique
centrale de l'article (probabilité × impact → tester plus tôt et plus en profondeur) en vient
(observé : §5.2.1 « Plus le niveau de risque est élevé, plus son traitement est important » et
§5.2.3 « influencer la rigueur et le périmètre des tests »), ni §4.2.1/§4.2.2 pour les partitions
d'équivalence et les valeurs limites qu'il développe. Toutes les affirmations sont justes ; seul le
renvoi manque. Ne rien changer sans son arbitrage.

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

**La ligne d'avancement qu'on ajoute dans une PR (dans `docs/JOURNAL.md`) est périmée dès le merge** : elle
décrit son propre état d'avant, donc elle reste sur « PR ouverte, à merger ». C'est ce
qui a produit #36, #37, #38 et #42. À fermer soit dans la PR suivante, soit par un
`docs(handoff)` dédié — et à relire **avant tout `/clear`**, puisque ce fichier est la
seule continuité.

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
  ⚠️ **L'inverse n'est pas vrai : un hash de CSS différent ne veut pas dire une régression de
  style.** Tailwind 4 scanne aussi les `.md` du contenu, et un mot de prose qui ressemble à un
  utilitaire produit une règle. Cause **mesurée** le 30.09 (#50) : le mot anglais « block » de
  « what would block the most people » a ajouté `.block{display:block}` (+21 octets,
  `TT2EtjqR` → `DPDLS9i_`) ; le mot remplacé, le hash redevient celui de la prod à l'identique.
  Donc quand le hash bouge sans changement de style, `diff` les deux CSS **par règle**
  (`sed 's/}/}\n/g'`) avant de conclure — et ne pas réécrire la copy pour 21 octets inutilisés.
  ⚠️ **Faux positif Windows** : cette machine extrait les fichiers en CRLF (`core.autocrlf=true`,
  `git ls-files --eol` → `w/crlf`). Un build local laisse alors un octet `\r` à chaque retour à
  la ligne *interne à un paragraphe*, ce qui fait différer l'article T17 (FR + EN) alors qu'il
  n'a pas changé. La CI construit en LF. Cause **vérifiée** le 17.09 : build de `main` tel
  quel → 2 pages différentes ; mêmes fichiers repassés en LF → 0 écart sur les 16 pages. Avant
  de conclure à une régression, **recomparer les deux fichiers après `tr -d '\r'`** : s'ils
  deviennent identiques, l'écart n'était que du CRLF. ⚠️ Ne pas chercher un `015` isolé dans
  `cmp -l` : les deux fichiers n'ayant pas la même longueur, `cmp` annonce `EOF` et décale toutes
  les positions suivantes, donc **tous** les octets ressortent comme différents (vu le 30.09 :
  10 pages classées « écart réel » à tort, 0 une fois les `\r` retirés).

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
  T19 : la thèse entière d'une première version (le LLM voit l'enchaînement) contredite par
  le prompt et le contexte que reçoit le LLM, et une anecdote « ce test a attrapé ce défaut »
  fausse **une fois rejouée**. Quand un article dit qu'un test attrape un défaut, remettre le
  défaut dans un clone et lancer la suite : c'est le seul moyen de savoir quel test échoue.
  Et relire les métriques : un taux de faux positifs n'est pas une part d'alertes fausses.
  Un chiffre du dépôt cité dans un article (T19 : « 182 tests ») lie le dépôt à l'article :
  ajouter un test à l'outil rend l'article faux. Vérifier le nombre collecté avant et après
  tout changement dans le dépôt cité.
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
- **Dépôt `anomaly-sentinel` : `main` protégée depuis le 22.09** (PR obligatoire, check
  `Quality gate` requis, administrateurs compris). Plus aucun push direct, même pour Jérémy :
  toute modification passe par une PR, et `gh pr merge` échoue tant que la CI n'est pas
  verte. C'est voulu, ne pas désactiver la protection pour aller plus vite.
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
