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
- **Suite de tests (accord Jérémy, 07.10)** : Playwright + rapport Allure 3, en `devDependencies`
  uniquement — `@playwright/test` **épinglé exact** (les binaires de navigateur sont liés à la
  version), `allure-playwright`, `allure` (CLI 3, aucun JRE), `@types/node` (il était déjà
  transitif). Rapport publié en **artefact de workflow** (`singleFile`), jamais sous le site :
  l'invariant « `dist/` sans `.js` » est l'argument qui répond aux alertes Dependabot, et un
  rapport Allure le ferait tomber. Gate **bloquant restreint** (ce qui est déterministe et ne
  dépend que de ce dépôt), reste en informatif. **Pas de régression visuelle** (Windows en dev,
  Linux en CI : les baselines seraient inutilisables en local).
  Le registre de risque, la liste argumentée de ce qu'on ne teste **pas**, et tous les pièges
  mesurés vivent dans **`tests/README.md`** — à lire avant de toucher à la suite.
- **Pas de dépendance hors stack ci-dessus sans accord.** Pas d'emoji dans le contenu.
  Animations (mise à jour T9 « plus affirmé », validé Jérémy sur maquette) : fade-in scroll
  (`.reveal`) + entrée Hero échelonnée + micro-effets au survol (cartes `.card-lift`, boutons).
  CSS-only, toujours gated `prefers-reduced-motion`. Rester sobre : pas d'animation gratuite.
  **La règle `.reveal` s'écrit en longhands, jamais avec le raccourci `animation`, et son bloc
  reste restreint à `screen`** (T27 — voir les gotchas ; `gate/reveal-css.spec.ts` échoue sinon).

## Avancement

Historique des tâches (T1–T31, correctifs, maintenance) : `docs/JOURNAL.md`. Ne pas le lire en
entier ; le consulter par ligne ciblée quand une décision passée doit être vérifiée.

**État de la suite QA, relancée en entier le 09.10** : **446 tests — 443 passés, 3 sautés**,
8 projets Playwright, sortie Playwright 0, 1,8 min. Le compte a bougé deux fois ce jour-là —
446 → 443 en T30 (une assertion déplacée dans une boucle déjà paramétrée, donc moins de tests pour
plus de couverture), puis 443 → 446 en T31 (+2 invariants, +1 test clavier). **Ne pas lire ces
variations comme un signal** : le plancher du quality gate est à `minTestsCount: 20`, délibérément
loin du compte réel, parce que la suite est paramétrée sur les articles et qu'en ajouter un change
le nombre.
⚠️ **Un `npm run test:e2e` local lance les 8 projets, nocturnes compris**, dont
`external-links`, qui dépend de tiers : au **premier** des trois runs il est tombé sur un
**504** de `github.com/BazanJeremy`, l'URL répondant **200** aux trois réessais puis aux deux
runs suivants. Un rouge venu d'un tiers est donc attendu en local et ne
dit rien du site — et il ne bloque aucune PR, le défaut de `projects` dans
`.github/actions/qa/action.yml` étant `invariants-gate gate-desktop gate-mobile`.
Trois workflows actifs —
`pr.yml` (gate sur chaque PR), le job `gate` en amont de `build` dans `deploy.yml` (si le gate
échoue, aucun artefact Pages n'est produit, donc `deploy` ne peut pas s'exécuter), et
`qa-nightly.yml` (cron 04:17 UTC + lancement manuel paramétré). Mesuré en CI : gate 65 s, build
14 s, deploy 10 s, soit ~94 s contre 36 s avant. **Pas encore en place** : la persistance de
l'historique Allure et du JUnit (les tendances du rapport sont donc vides), axe/a11y, et le
branchement ReleaseGuard / FlakySense.

Le 3e test sauté est **mesuré, pas accidentel** : Firefox 155 (la build livrée avec Playwright
1.63.0) répond `false` à `CSS.supports('animation-timeline', 'view()')`, donc l'assertion CSSOM de
`gate/reveal-css` s'y abstient au lieu de conclure à un défaut. Chromium 153 **et WebKit 26.6**
la supportent tous les deux et passent.

**Les cinq écarts trouvés en construisant la suite sont tous tranchés** (source : lignes T23–T31
du journal). Trois corrigés, deux fermés par décision. Détail juste en dessous — il reste écrit
parce que chacun porte une mesure qu'une session fraîche refera sinon à ses frais.

**Et le fil rouge des trois correctifs mérite d'être lu avant le prochain défaut** : dans les
trois cas, **la mesure a corrigé l'énoncé du défaut avant de corriger le défaut**. T27 : la cause
attribuée au garde `@supports` était en fait le minifieur. T29 : les 48 octets étaient 27, et
`.block` ne venait pas du journal. T31 : « la colonne est inatteignable » était faux — elle
défilait déjà, le défaut était l'accès clavier. Un énoncé de défaut écrit de mémoire est une
hypothèse, pas un constat.

### Tranchés — ne pas reproposer

Trois des cinq écarts sont fermés. Ils restent écrits ici parce que chacun porte une mesure
qu'une session fraîche refera sinon à ses frais.

- **Le 5e, la révélation au scroll** : corrigé en T27 (#62), vérifié en production. Voir le
  gotcha du minifieur.
- **Les alternates `xhtml:link` du sitemap** : le namespace est déclaré et le site est
  bilingue, mais l'option `i18n` de `@astrojs/sitemap` n'est pas passée. Décision de
  configuration, pas régression — délibérément non assérée. **Mesuré le 09.10, et ça change la
  conclusion : ne pas activer l'option telle quelle.** Dans le code de l'intégration
  (`dist/utils/parse-i18n-url.js` + `dist/generate-sitemap.js`), les alternates sont groupés
  par **chemin identique après retrait du préfixe de langue**, et un groupe d'un seul membre
  n'émet rien. Or **aucun de nos 22 articles ne partage son slug** entre FR et EN (11 + 11
  mesurés, chaînage `translationSlug` valide 11/11). L'option produirait donc des alternates
  sur **4 URLs sur 26** et sur **aucun article** — les pages où l'information est la moins
  utile. Et le `hreflang` HTML est déjà complet et réciproque, `x-default` compris (vérifié sur
  une paire d'articles réelle). Faire mieux demanderait un `serialize` piloté par
  `translationSlug`, soit du vrai code pour un gain nul. **TRANCHÉ le 09.10 (décision de
  Jérémy) : on ne le fait pas**, avec cette mesure comme motif. L'option `i18n` a été évaluée
  et écartée, pas oubliée.
- **Le tableau à 375px** : corrigé en T31. L'énoncé était faux et la mesure l'a montré avant
  tout correctif — le tableau était **déjà** un scrollport qui défilait (`scrollWidth` 433 contre
  `clientWidth` 327, `scrollLeft` poussé à 106 ramenant la dernière colonne entièrement dans le
  viewport), donc la colonne n'était pas perdue. Et `display: block` était **innocent** : les
  trois moteurs exposaient la sémantique intacte (`table`, 7 `row`, 3 `columnheader`, 18 `cell`),
  contrairement à la crainte inscrite ici. Le défaut réel était `tabIndex: -1` sur ce scrollport :
  **inatteignable au clavier** (WCAG 2.1.1) et jamais annoncé. Corrigé par
  `src/plugins/satteri-scrollable-tables.mjs`, qui enveloppe chaque tableau dans un
  `role="region"` focalisable, libellé depuis `src/i18n/*.json`. La liste d'exceptions de
  `mobile-375.spec.ts` a disparu au profit d'une **règle** : un texte dans un scrollport dont le
  rectangle tient dans le viewport est atteignable, donc il ne compte plus comme débordement.
- **`og:type` sur les pages d'article** : corrigé en T30. `BaseLayout` codait `website` en dur
  pour les 26 pages ; il prend maintenant une prop `ogType` (défaut `website`) et les deux
  gabarits d'article passent `article` — mesuré, **22 articles en `article`, 4 pages en
  `website`**, la ligne `og:type` étant le seul écart sur les 26 pages. Le `test.fail()` a été
  **supprimé** plutôt que converti : l'assertion est entrée dans la boucle déjà paramétrée de
  `seo-meta.spec.ts`, ce qui ne coûte aucune navigation, **nomme la page** en échec, et assère
  dans les deux sens via le `kind` du catalogue (un article dit `article`, le reste reste
  `website`) — l'ancien test ne voyait ni les 21 autres articles ni la régression inverse.
  **Non fait, et dit comme tel** : `article:published_time` / `article:modified_time`, que
  `og:type: article` appelle normalement, ne sont pas servis — hors périmètre du point, à
  arbitrer séparément.
- **Le scan Tailwind de la documentation** : fait en T29 (#66), déployé. Le point annonçait
  **48 octets** de CSS mort (`.block` 21 o « venue de l'entrée de journal », plus `.contents`
  27 o venue de `permissions: contents: read`). **Mesuré en l'appliquant : 27 octets et une
  seule règle**, `.contents` — `CerI2rm-` → `DRDROTEC`, 18 863 → 18 836 octets, le diff par
  règle contre la production ne montrant que cette ligne. `.block` **survit** : sa source n'a
  jamais été le journal mais la prose d'un article EN publié (`accessible-at-71-percent.md`,
  « what would block the most people »), isolée en excluant ce seul fichier en plus des trois.
  Les deux produisaient la même règle, donc retirer le journal seul ne la retirait pas :
  l'attribution avait pris une **co-occurrence pour une cause**, et le chiffre a survécu trois
  PR parce qu'il avait la forme d'une mesure — alors que ce fichier portait **déjà** la bonne
  cause 120 lignes plus loin, dans le gotcha de l'incident #50. Leçon : quand deux sources
  peuvent produire le même octet, en exclure une ne prouve rien sur l'autre ; il faut les
  isoler une par une.

**Point ouvert au 22.09 (source : ligne T19 du journal), décision de Jérémy** : aligner les prompts
d'`anomaly-sentinel` (`fintech_v1.2`, `medtech_v1.1`) attend un premier run en mode LLM ; toute version
ajoutée au test paramétré change le nombre de tests (182, publié dans l'article T19).

**T20 — `main` de `ReleaseGuard` est protégée depuis le 09.10** (décision de Jérémy), ce qui
ferme le point ouvert du 29.09 : l'article T20 et le README écrivaient que l'outil « est le verrou
de sortie du projet » alors que rien n'empêchait un merge par-dessus un NO GO. Posé puis **relu**
le 09.10 : PR obligatoire, check requis, **administrateurs inclus**, force-push et suppression
interdits, `strict: false`, 0 approbation — identique à `anomaly-sentinel` **sauf le contexte
requis**.
⚠️ **Le check requis s'appelle `tests`, pas `Quality gate`.** Même piège que sur ce dépôt-ci, et
mesuré avant de poser : `ReleaseGuard` n'a qu'un workflow (`ci.yml`, nommé « CI ») avec un seul
job dont la clé est `tests` et qui ne porte pas de `name:`, donc **c'est `tests` qui est rapporté
comme contexte**, vérifié sur `main` et sur la PR #6. Copier `Quality gate` depuis
`anomaly-sentinel` aurait rendu **toute PR immergeable**. Si ce job est renommé un jour, mettre à
jour le contexte requis dans la même PR.

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

⚠️ **Relire `git branch --show-current` juste avant CHAQUE commit**, dans la même commande que le
`git add` si possible. Observé le 08.10 : après le merge de #62 par Jérémy, le checkout est passé
sur `main` et a été fast-forwardé **entre deux tours** — ce qui a lancé ces commandes reste
inconnu. La session a enchaîné un commit en croyant être encore sur sa branche, et `18a5629` est
parti **directement sur `main`**, sans PR. Le push a réussi parce que `main` n'était pas encore
protégée : rien ne l'aurait arrêté. Dégâts nuls dans ce cas (0 fichier sous `src/` ou `public/`),
mais l'annuler aurait demandé un second push direct sur `main`, donc de répéter la faute. Une
branche lue au tour précédent n'est pas une branche courante.
**Le phénomène s'est reproduit le 09.10 après le merge de #66** : le checkout était déjà sur
`main` à `f8ad899`, et la branche locale déjà supprimée, avant tout `git switch` ou `git pull` de
ma part. Donc ce n'est pas un accident isolé mais le comportement normal après un merge — **la
cause reste inconnue**, et c'est la garde qui compte, pas son explication. Deux filets tiennent
désormais : relire la branche dans la commande du `git add`, et la protection de `main`, qui
refuserait le push.

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
- **`npm run test:e2e`** — 446 tests, ~2 min (1,8 mesuré le 09.10).
  Il construit et sert `dist/` tout seul. Puis `npm run test:report` pour le rapport Allure
  (un fichier HTML autonome dans `allure-report/`). Pour un sous-ensemble :
  `npx playwright test --project=gate-desktop` (voir `tests/README.md` pour les 8 projets).
  La suite tourne aussi sur chaque PR via `pr.yml`.
- **La suite peut être pointée sur la production, et depuis T28 c'est concluant** — avant, les
  specs qui lisent du style couraient contre le chargement de la feuille et annonçaient des
  défauts inexistants. À refaire après tout changement de spec lisant du style, et après tout
  déploiement dont on veut vérifier le rendu réel :
  `PW_NO_SERVER=1 PW_BASE_URL=https://bazanjeremy.github.io npx playwright test --project=motion`
- **Le hash du CSS après tout ajout de fichier** : `npm run build && ls dist/_astro/`. Le nom doit
  rester `_astro_content.CAfsBN8X.css`, 18 862 octets (il valait `DPDLS9i_` jusqu'à T27 — +81
  octets pour réparer la révélation au scroll —, `CerI2rm-` jusqu'à T29 — −27 octets, la règle
  `.contents`, documentation sortie du scan —, puis `DRDROTEC` jusqu'à T31 : +26 octets, une règle
  devenue deux, le scrollport des tableaux passant du `<table>` à son conteneur).
  **Depuis T29, une édition de `docs/`, `.github/` ou `CLAUDE.md` ne peut plus déplacer ce
  hash** — c'était tout l'objet du changement. Mais Tailwind scanne toujours plus large qu'on
  ne croit (voir les gotchas), et un mot de prose **d'article** peut injecter une règle.
- **Plusieurs contrôles manuels sont désormais automatisés**, et il ne faut pas les refaire à la
  main : débordement horizontal à 375px (avec la précondition de largeur qui ferme le piège de
  mesure de T16 — un test qui ne vérifie que le débordement passerait pour la même mauvaise
  raison), vocabulaire banni sur trois surfaces, ancres mortes, chaînage `translationSlug`,
  métadonnées par locale, contrat des articles, invariants 0-JS et 0 requête externe.
  **Pas encore couvert** : les contrastes WCAG AA (axe arrive plus tard), et le rendu visuel —
  pour ça, la comparaison `dist/` contre la prod ci-dessous reste la méthode.
- Aperçu réel : `npm run preview` puis vérifs. **Les screenshots du browser pane plantent dans
  cet environnement** → vérifier via `javascript_tool` + `getComputedStyle` (couleurs, tailles),
  et via la prod (`curl` du CSS `/_astro/*.css`).
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
  (Astro 7 exige ≥ 22.12 ; l'action est en Node 20 par défaut). **L'action reste intacte** : la
  réécrire à la main n'est pas la traduction 1:1 qu'on croit — mesuré, elle utilise
  `setup-node@v7`, `upload-pages-artifact@v5` et un cache de build Astro via `actions/cache@v6`.
  Comme le job `build` complet prend 14 s et que le gate doit de toute façon construire son
  propre `dist/`, un build de plus coûte moins cher que reprendre la maintenance de ses
  entrailles. Le gate est donc un **job séparé en amont**, et `build` porte `needs: gate`.
  `pr.yml` et `qa-nightly.yml` ont leurs **propres groupes de concurrence**, jamais `pages` :
  partager le groupe de déploiement mettrait les tests en file derrière les mises en production.
- **Le périmètre de scan de Tailwind est plus large que « le contenu ».** Mesuré par élimination
  les 07 et 08.10, sont scannés : `tests/`, les fichiers de config à la racine, `scripts/`,
  `docs/`, `.github/` et **`CLAUDE.md` lui-même**. N'est **pas** scannée : la feuille de style.
  **Depuis T29, `src/styles/global.css` les exclut tous les sept** (`tests/`, les trois configs
  racine, `scripts/`, `docs/`, `.github/`, `CLAUDE.md`), donc **ce fichier et le journal ne
  peuvent plus injecter de règle**, et les mots pièges peuvent y être nommés librement — ce qui
  était interdit avant, les nommer suffisant à injecter leur règle (arrivé trois fois pendant la
  construction de la suite, dont une en rédigeant ce gotcha).
  ⚠️ **Ce qui reste exposé, et c'est l'essentiel** : tout `src/`, **la prose des articles
  comprise**. Un mot d'article qui ressemble à un utilitaire injecte toujours sa règle — c'est le
  cas de `.block`, qui vient de « what would block the most people » dans
  `accessible-at-71-percent.md` et non du journal, comme on l'a cru jusqu'au 09.10. La procédure
  tient donc pour tout changement sous `src/` : si le hash bouge, `diff` les deux CSS **par
  règle** (`sed 's/}/}\n/g'`) avant de conclure à une régression.
- **Le cache de contenu rend INVISIBLE toute mutation d'un plugin Markdown.** Mesuré le 09.10 :
  `node_modules/.astro/data-store.json` garde le HTML rendu des collections. Il est invalidé par
  un changement de fichier source **et** par un changement d'`astro.config.mjs`, mais **pas** par
  un changement d'un module que la config importe — donc pas par un plugin. En vérifiant le
  plugin de T31, **quatre mutations d'affilée ont laissé le HTML identique et la suite verte** :
  retirer `tabIndex`, puis `role="region"`, et le HTML servait encore les deux. Une suite verte
  ne disait rien du plugin. ⚠️ **Avant toute mutation d'un plugin Markdown : `rm -rf
  node_modules/.astro`.** Cache vidé, les mêmes mutations rougissent aussitôt. Même famille
  qu'`astro preview` et `DOMContentLoaded` : l'état de la machine décidait du verdict.
- **Sätteri sérialise `tabindex` en tout ou rien.** Mesuré le 09.10, cache vidé à chaque essai :
  `tabIndex: 0`, `-1`, `5` et la forme littérale `'tabindex': '3'` sortent **toutes**
  `tabindex="0"`. Seule la présence de la propriété compte. Donc on ne désactive pas le focus en
  passant `-1` depuis un plugin hast, et une assertion écrite sur la source du plugin ne mesure
  rien : asserter sur les octets servis, dont le seul levier de mutation est la **suppression** de
  la propriété.
- **Le minifieur peut détruire une déclaration CSS correcte, et c'est `lightningcss`.** Les deux
  minifieurs sont là (`esbuild` via Vite, `lightningcss` via la passe d'optimisation de
  Tailwind 4) ; **mesuré le 08.10**, c'est `lightningcss` qui refusionne un raccourci `animation`
  et un `animation-timeline` en `animation: linear both reveal-fade view()`. Ce raccourci
  n'accepte aucune valeur de timeline, donc le navigateur rejette la déclaration **en entier**
  (`cssText: ""`, d'où `animation-name: none`) : l'animation de `.reveal` n'a jamais tourné en
  production. La parade est d'écrire **tous les longhands** — mesuré, il ne reconstruit pas le
  raccourci à partir d'eux ; deux règles au même sélecteur, en revanche, sont fusionnées et le
  raccourci revient. Corollaire : réparer une animation d'apparition **rallume son mode de
  panne** — à l'impression il n'y a pas de scrollport, la timeline ne progresse pas et
  `animation-fill-mode: both` figerait les sections à opacité 0 (mesuré : 11 `.reveal` sur 11),
  d'où la portée `screen`. Leçon générale : pour une propriété récente portée par un raccourci,
  **asserter sur les octets servis**, pas sur la source. Détail complet dans `tests/README.md`.
- **`DOMContentLoaded` n'attend pas la feuille de style sur un site à 0 JS.** Sans script à
  bloquer, lire un style à `domcontentloaded` est une **course** avec le chargement de la
  feuille externe. Mesuré le 08.10 : à `domcontentloaded` la prod servait 1 feuille et 7
  règles (`animationName: none`), à `load` 2 feuilles et 38 règles (`reveal-fade`). En local le
  preview répond si vite que la course est toujours gagnée — la suite était donc verte en local
  et en CI, et annonçait un défaut inexistant dès qu'on la pointait sur la prod. Les specs qui
  lisent du style passent par `gotoStyled` (T28) ; celles qui ne lisent que du DOM gardent
  `domcontentloaded`. Même famille que le piège `astro preview` ci-dessous, asymétrie inversée :
  **l'endroit où on lance la suite décidait du verdict.**
- **`astro preview` se démonise quand il détecte un agent** (lu dans
  `node_modules/astro/dist/cli/preview/index.js` : `isRunByAgent()` via le paquet `am-i-vibing`),
  ce qui casse le contrat `webServer` de Playwright — « Process from config.webServer exited
  early ». `playwright.config.ts` pose `ASTRO_PREVIEW_BACKGROUND` dans `webServer.env` pour
  désactiver la détection, plus `--ignore-lock` contre un verrou laissé par une session
  précédente. **En CI il n'y a pas d'agent, donc le défaut ne s'y voit pas** : sans ce
  correctif, la suite passerait en CI et échouerait en local.
- **GitHub Actions pose une entrée non renseignée à CHAÎNE VIDE, pas à `undefined`.** Un
  `process.env.X ?? défaut` ne retombe donc pas sur le défaut en CI — utiliser `||`. Vu sur
  `PW_BASE_URL`, qui serait devenu vide et aurait cassé toute navigation relative, en CI
  seulement.
- **Rapport Allure** : seul `allure generate` lit `allurerc.mjs` (`allure awesome <dir>` ignore
  `plugins.awesome.options` et sort un rapport multi-fichiers). Et le plugin `awesome` injecte un
  traceur Google Analytics **en dur, sans opt-out** — `scripts/allure-report.mjs` le retire et
  échoue s'il ne trouve rien à retirer. Ne pas revenir à un enchaînement par `&&` : un quality
  gate en échec fait sortir `allure generate` en non-zéro, le `&&` court-circuite, et le traceur
  reste dans le rapport qu'on va justement ouvrir.
- **`main` est protégée depuis le 09.10** (décision de Jérémy, même configuration
  qu'`anomaly-sentinel`) : PR obligatoire, check requis, **administrateurs inclus**, force-push et
  suppression interdits, `strict: false`, 0 approbation exigée (sinon une PR solo serait
  indéblocable). Plus aucun push direct sur `main`, pour personne — c'est la réponse au push
  direct de `18a5629`.
  ⚠️ **Le nom du check requis est `Playwright + Allure`, PAS `QA gate`.** Mesuré avant de poser la
  protection : `pr.yml` s'appelle « QA gate » mais son job porte `name: Playwright + Allure`, et
  c'est le NOM DU JOB qui devient le contexte rapporté sur une PR ; `QA gate` est le nom du job de
  `deploy.yml`, qui ne rapporte que sur `main`. Exiger « QA gate » rendrait **toute PR impossible à
  merger**, en attente d'un check qui ne rapporte jamais là. Donc si un jour on renomme ce job,
  **mettre à jour le contexte requis dans la même PR**, sinon le dépôt se verrouille.
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
