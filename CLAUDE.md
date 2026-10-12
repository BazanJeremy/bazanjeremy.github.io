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
  transitif), depuis T39 **`@astrojs/check` et `typescript` épinglés exact** (même argument :
  un vérificateur de types est un instrument de mesure ; et `@astrojs/check` 0.9.10 exige
  `typescript ^5 || ^6`, donc **6.0.3 et non la 7.0.2 disponible** — c'est la plage du peer qui
  décide, pas le dernier numéro), et depuis T32 **`@axe-core/playwright` épinglé exact** (accord Jérémy du 10.10 —
  un jeu de règles est un instrument de mesure : une version mineure peut ajouter une règle,
  donc changer le verdict sans qu'une ligne du site ait bougé). Rapport publié en **artefact de
  workflow** (`singleFile`), jamais sous le site :
  l'invariant « `dist/` sans `.js` » est l'argument qui répond aux alertes Dependabot, et un
  rapport Allure le ferait tomber. Gate **bloquant restreint** (ce qui est déterministe et ne
  dépend que de ce dépôt). ⚠️ **Le niveau « informatif » existe mais bloque quand même** —
  mesuré en T32, voir la section « En CI » de `tests/README.md` : les deux runs partagent
  `allure-results`, le quality gate est à `maxFailures: 0`, et l'étape de rapport n'est pas en
  `continue-on-error`. Il est donc resté vide, et axe est bloquant. **Pas de régression
  visuelle** (Windows en dev, Linux en CI : les baselines seraient inutilisables en local).
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

**État de la suite QA au 12.10, sous Astro 7.3.8, sharp 0.35.5, Tailwind 4.3.3 et
Playwright 1.64.0** : **472 tests, 9 projets**. **Ensemble bloquant : 204 tests, 204 passés,
sortie 0, 43,8 s** — c'est la mesure qui engage, parce que c'est celle que la CI applique, et elle
est verte sous les nouveaux moteurs, `a11y-axe` compris sur les 26 pages. ⚠️ **La suite complète
n'a PAS été verte aux trois derniers runs (T37 et T38)**, et **tous** les échecs sont **hors de
l'ensemble bloquant**, avec une cause identifiée qui n'est ni le site ni un navigateur :
3 `prod-http` par abandon client après un `200 OK`, puis 4 `gate-firefox` par
`NS_ERROR_CONNECTION_REFUSED` du serveur de prévisualisation local. **Les deux ont leur expérience
d'isolation et leur conduite à tenir** — `prod-http` juste en dessous, `gate-firefox` dans le
gotcha `astro preview`. Le dernier run complet **vert** est celui de T36 : 469 passés, 3 sautés,
sortie 0, 2,7 min. **Ne pas écrire « suite verte » sans avoir relancé**, et ne pas lire ces rouges
comme une régression du site : `dist/` a été vérifié identique octet pour octet à chaque étape.

`a11y-axe` a aussi été pointé
sur la **production** le 11.10 : 26 tests verts, sortie 0, 24,4 s — la conformité tient sur les
octets servis, et les 10 nœuds indécis de l'accueil s'y comportent à l'identique. Le compte a bougé trois fois —
446 → 443 en T30 (une assertion déplacée dans une boucle déjà paramétrée, donc moins de tests pour
plus de couverture), 443 → 446 en T31 (+2 invariants, +1 test clavier), puis 446 → 472 en T32
(+26, le projet `a11y-axe`, un test par page). **Ne pas lire ces
variations comme un signal** : le plancher du quality gate est à `minTestsCount: 20`, délibérément
loin du compte réel, parce que la suite est paramétrée sur les articles et qu'en ajouter un change
le nombre.
⚠️ **Un `npm run test:e2e` local lance les 9 projets, nocturnes compris**, dont
`external-links`, qui dépend de tiers : au **premier** des trois runs il est tombé sur un
**504** de `github.com/BazanJeremy`, l'URL répondant **200** aux trois réessais puis aux deux
runs suivants. Un rouge venu d'un tiers est donc attendu en local et ne
dit rien du site — et il ne bloque aucune PR, le défaut de `projects` dans
`.github/actions/qa/action.yml` étant depuis T32
`invariants-gate gate-desktop gate-mobile a11y-axe`. Ce défaut **est** la définition de
l'ensemble bloquant, et `npm run test:gate` liste exactement les mêmes quatre projets
(204 tests) : les deux étaient désalignés avant T32 — le script omettait `gate-mobile` —, donc
si l'un change, changer l'autre dans la même PR.
⚠️ **Et `prod-http` flanche de la même façon, mesuré en T37** : sur deux runs complets d'affilée,
le second a sorti **3 échecs, tous dans `prod-http`, tous le même mécanisme** —
`apiRequestContext.get: aborted` alors que le journal d'appel montre **`← 200 OK`** avec ses
en-têtes, donc un **abandon côté client après réponse du serveur**, pas une erreur de la
production. Lancé seul, `prod-http` passe **5/5 en 5,1 s**. L'hypothèse est la contention — 9
projets qui martèlent le site live en parallèle —, elle n'est **pas prouvée**. Donc `prod-http`
rouge en local après un `test:e2e` complet ne dit rien du site : **le relancer seul avant de
conclure**, `PW_NO_SERVER=1 npx playwright test --project=prod-http`. ⚠️ Et ne pas imputer ce
rouge à un déploiement en cours sans **vérifier l'horodatage du run de déploiement** : en T37 je
l'ai écrit, et c'était faux — le déploiement s'était terminé avant les deux runs.
⚠️ **Un échec non reproduit laisse la cause INCONNUE, et la trace se lit avant le réessai.** T37,
run 1 : un échec de `gate-firefox` › `blog-contract` (un seul h1 sur un article EN), non
reproduit ensuite (25/25). La cause est restée inconnue parce que le réessai a **écrasé
`test-results/`** avant que j'aie lu l'erreur. Lire `test-results/*/error-context.md` **d'abord**,
relancer ensuite. **Appliqué en T38, ça a payé en une lecture** : les 4 rouges `gate-firefox` ont
livré `NS_ERROR_CONNECTION_REFUSED` et la page « Unable to connect » de Firefox, donc la cause en
une minute au lieu d'une hypothèse. Celle de T37 reste inconnue faute de trace, mais c'est le même
projet et **vraisemblablement** la même cause — vraisemblablement, pas démontré. Détail et
expérience d'isolation dans le gotcha `astro preview`.
Trois workflows actifs —
`pr.yml` (gate sur chaque PR), le job `gate` en amont de `build` dans `deploy.yml` (si le gate
échoue, aucun artefact Pages n'est produit, donc `deploy` ne peut pas s'exécuter), et
`qa-nightly.yml` (cron 04:17 UTC + lancement manuel paramétré). Mesuré en CI sur le run du merge
de T32 : gate **99 s**, build 19 s, deploy 8 s, soit **~2 min 14** de bout en bout (c'était gate
65 s / build 14 s / deploy 10 s, ~94 s avant axe, et 36 s avant toute suite) — les +34 s du gate
sont le prix des 26 pages analysées par axe, payé une fois par PR et une fois par déploiement.
**Mesuré à nouveau sur le run du merge de T39** : gate **95 s**, build 25 s, deploy 16 s, soit
**~2 min 16**. Donc la vérification de types et les quatre étapes de cache **n'ont rien coûté de
mesurable** — le gate est même 4 s sous celui de T32, ce qui le situe dans le bruit d'un run à
l'autre : **la cause de l'écart est inconnue, et il ne faut pas le lire comme un gain.** Le
`astro check` lui-même a pris **5,4 s** en CI (11,7 s en local), 0 erreur / 12 indications.
⚠️ **Et c'est le run qui a exercé les étapes `actions/cache`, impossibles à mesurer hors CI** :
`Cache not found for input keys: qa-history-main-gate-…` au premier passage (cache froid attendu,
le préfixe de `restore-keys` bien essayé), puis `Cache saved with key:
qa-history-main-gate-38263619548`. Le script a écrit
`.qa-history/junit/20261012T143334Z-main-gate-83/junit.xml`, « 1 run conservé ». Et le chemin
**lecture seule** de `pr.yml` est vérifié par la mesure qui compte : **0** sauvegarde
`qa-history` sur le run de la PR. La série `main-gate` contient donc 1 run, et se remplit d'un
run par merge. **Les quatre points « pas encore en place » sont
traités en T39** (#81, mergée et déployée) : persistance de l'historique Allure **et** du JUnit par le
**cache d'Actions** (trois séries séparées par `history-key` ; `main-gate`, écrite par le gate
de `deploy.yml`, est la série de référence, la seule à retries 0 sur un jeu de projets fixe),
vérification de types bloquante (`npm run typecheck` → `astro check`, 0 erreur / 12 indications
/ 11,7 s en local), niveau informatif réellement non bloquant, et job `verdict` au nocturne qui
enchaîne FlakySense puis ReleaseGuard, épinglés au commit, jamais bloquants. Détail et mesures
dans `tests/README.md`.
⚠️ **L'historique par cache est au mieux-effort, pas durable** : une entrée non consultée
pendant **7 jours** est supprimée (source : documentation GitHub, pas une mesure). Il survit
parce que le nocturne le touche chaque jour — nocturne éteint, la tendance meurt une semaine
plus tard. Le rendre durable voudrait dire la branche de stockage, écartée parce qu'elle
exigerait `contents: write` et une poussée depuis la CI sur un dépôt dont `main` est protégée
précisément pour les empêcher.
⚠️ **Deux couplages trouvés en appliquant le correctif du niveau informatif**, qu'aucun fichier
ne nommait : le run informatif **écrasait** `test-results/junit.xml` (celui que l'historique et
ReleaseGuard consomment), et **renommer le fichier ne suffit pas** — un run Playwright
**nettoie son `outputDir`**. C'est le dossier qu'il faut séparer. Les deux sont mesurés et
documentés en pièges.
**Pas encore en place après T40** : le rapport Allure hébergé, et lui seul (évalué et écarté le
12.10). La jonction d'identité FlakySense ↔ ReleaseGuard est **réparée en amont** par T40
(`ReleaseGuard#7`, mergée le 12.10, check `tests` vert) — voir la section tranchée plus bas.

**Point ouvert au 10.10 (source : ligne T32 du journal), décision de Jérémy** : le contraste de
**10 nœuds des deux pages d'accueil est INCONNU**, et ne doit pas être relu comme conforme. Ce
n'est ni un défaut trouvé ni un contrôle oublié : axe **refuse de trancher**, ce qui est son
comportement correct. Mesuré — 6 nœuds du Hero (`.hero__bg` empile deux `radial-gradient`, motif
`bgGradient`) et 4 liens de navigation (`.header-blur` vaut
`color-mix(in srgb, var(--color-bg) 82%, transparent)`, donc le header `sticky` est translucide,
et le `<svg>` décoratif `.hero__arcs` passe dessous — motif `imgNode`). `a11y/axe` **borne** cette
indécision par une règle (tolérée seulement dans le Hero ou le header, et seulement avec ces deux
motifs) et la fait apparaître dans le rapport, mais ne la lève pas. La lever demanderait soit un
vérificateur de contraste maison — rejeté par `tests/README.md`, un second finirait par
contredire le premier —, soit un changement de design rendant le fond réductible à une couleur
sous ces textes. **Arbitrage de Jérémy, rien à changer sans lui.**

Le 3e test sauté est **mesuré, pas accidentel** : Firefox répond `false` à
`CSS.supports('animation-timeline', 'view()')`, donc l'assertion CSSOM de `gate/reveal-css` s'y
abstient au lieu de conclure à un défaut. Chromium **et WebKit** la supportent tous les deux et
passent. **Vérifié à chaque bump de Playwright, et ça tient** : c'était Firefox 155 / Chromium 153
/ WebKit 26.6 avec Playwright 1.63.0 ; depuis T38 et Playwright 1.64.0, ce sont
**Firefox 157 / Chromium 156.0.8078.4 / WebKit 27.2**, et la réponse est la même — `false` sur
Firefox 157, `true` sur les deux autres. ⚠️ **C'est la mesure à refaire avant de lancer la suite
après un bump de Playwright** : elle prédit le compte de sautés sans attendre les 2,5 min de la
suite, et un passage de Firefox à `true` ferait disparaître le saut sans que rien du site ait
bougé.

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
  Le point laissé ouvert ici — `article:published_time` / `article:modified_time`, que
  `og:type: article` appelle normalement — est **tranché en T33** : `published_time` est servi
  sur les 22 articles, dérivé du `date` du frontmatter ; `modified_time` **n'est délibérément
  pas servi**, et une assertion le verrouille sur les 26 pages. Motif mesuré : les 22 articles
  portent exactement 9 champs de frontmatter et le schéma n'en a aucun pour une date de
  modification, donc la dériver de `date` affirmerait une modification inconnue, et la tirer du
  mtime git la ferait bouger à chaque reformatage. Un jeu de métadonnées incomplet est honnête ;
  un jeu fabriqué ne l'est pas.
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

**Tranché en T40 (`ReleaseGuard#7`), mergé — ne pas reproposer** : la jonction d'identité
FlakySense ↔ ReleaseGuard, **réparée en amont** comme T39 le préconisait, par une option de
dialecte JUnit dans ReleaseGuard (son ADR-004, qui supersède ADR-002). `--junit-dialect
pytest|path`, défaut `pytest`, donc aucun appel existant ne change ; `path` prend un `classname`
déjà en forme de chemin **tel quel**. Rien n'est normalisé d'un dialecte à l'autre — réécrire
nos séparateurs serait réécrire un côté d'une clé que ReleaseGuard ne produit pas.
⚠️ **Et la mesure a corrigé l'énoncé avant de corriger le défaut, une fois de plus** : T39
écrivait « les 4 tests signalés instables ont été déclarés 4 non-flaky failure(s) », ce qui
laissait croire à un défaut portant sur 4 tests. Mesuré en T40 sur le même rapport :
**0 identité sur 204 concorde**, et **0 testcase sur 204** porte un attribut `file`. La jonction
n'était pas dégradée, elle était **morte pour tous les tests** — donc la règle inter-signaux,
le seul comportement qu'aucun parseur seul ne peut produire, était absente de toute une famille
d'artefacts. Le mode de panne restait du bon côté (plus strict, jamais plus laxiste), et c'est
précisément pourquoi personne ne s'en plaignait : un défaut dont le symptôme est l'excès de
prudence ne produit aucune réclamation.
**Contrefactuel vérifié** : avec l'identité en chemin, le même rapport donne **CONDITIONAL GO,
score 0,9837** au lieu de NO GO. Et sur la fixture du dépôt (`data/samples/dialect_playwright/`,
dont les `classname`/`name` sont **copiés** des octets réels, seul le `<failure>` étant
construit), la paire qui conclut est **NO GO / sortie 2** sans le dialecte contre
**CONDITIONAL GO 0,72 / sortie 1** avec. Suite ReleaseGuard : **110 tests** (89 avant), dogfood
**GO 1,00**, couverture 94 %, check `tests` vert en CI.
⚠️ **Deux choses restent à faire là-bas, et elles sont pour Jérémy** : (1) `ADR-002` affiche
encore `Accepted` alors qu'ADR-004 le supersède — le garde-fou de `docs/adr/` du dépôt refuse
**toute** écriture sur un ADR existant, **y compris la ligne `Superseded by` qu'il demande
lui-même** ; non contourné, et les tableaux d'ADR des deux READMEs portent l'information à sa
place. (2) Le point ASCII ci-dessous.

**Point ouvert au 12.10 (source : ligne T40 du journal), décision de Jérémy — REPORTÉE par lui
le 12.10 (« à trancher plus tard »)** : dans **ReleaseGuard**, l'invariant « sortie ASCII
uniquement » d'ADR-003 **ne tient pas sur des noms de tests non-ASCII venus du rapport**.
Mesuré : un nom portant `›`, `é` ou `×` atteint le texte du verdict par `G1 detail` et par les
conditions d'échec excusé, donc `isascii()` vaut **False** — et sur le rapport Playwright de ce
dépôt-ci, **204 noms sur 204** sont non-ASCII. C'est la convention du bug #3 de ReleaseGuard qui
tombe sur des **données d'entrée** et non sur ses propres chaînes, et c'est **indépendant** de
T40 : réparer la jonction déplace seulement l'id de `G1` vers les conditions. Consigné là-bas en
« signalé, non corrigé » (bug evidence #4) parce que **l'énoncé dépend de l'arbitrage** : si la
règle ne vaut que pour les chaînes que le projet écrit, ce n'est pas un défaut mais une limite à
documenter, et c'est la portée d'ADR-003 qu'il faut restreindre par un ADR. Si elle vaut pour
toute la sortie, il faut choisir **comment** (échapper en `\uXXXX`, translittérer, ou ne plus
afficher l'id entier — or l'id est ce qui rend le verdict actionnable). **Ne rien patcher sans
lui** : ce dépôt est en « maintenance mode, smallest targeted fix only ».

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

**Tranché en T35 (#75), déployé — ne pas reproposer** : l'attribution de l'étude des dix
universités dans l'article T21. L'analyse est l'œuvre d'**Accessiway** (observé : l'article
Handicap.fr du 03.09.2026 cité en source la lui attribue nommément, « entreprise spécialisée dans
l'accessibilité numérique »). Aucun fait n'était faux — 2 universités sur 10 satisfaisaient
l'ensemble des critères, contrastes insuffisants et navigation clavier déficiente —, donc ce
n'était pas une erreur à corriger mais un **choix éditorial**. Décision de Jérémy : **nommer ET
caractériser**, plus la phrase « L'analyse vient d'un acteur du secteur : à lire comme un signal,
pas comme un audit indépendant », qui rend l'article cohérent avec sa propre thèse. ⚠️ Pas
« prestataire » : le mot suggère une relation commerciale que la source ne dit pas. Vérifié le
12.10 — `Accessiway` est présent dans les deux langues (`grep -rln` sur `src/`).

**Tranché en T34 (#74), déployé — ne pas reproposer** : les deux écarts de **sourcement** de
l'article T22. (1) Le principe 4 du syllabus s'appelle « **Regroupement des défauts** » dans la
traduction CFTL (observé : CFTL v4.0 p. 20) ; l'article emploie désormais « le regroupement des
défauts ». (2) La ligne de sources ne renvoyait ni à §5.2, d'où vient sa mécanique centrale
(probabilité × impact), ni à §4.2.1/§4.2.2 pour les partitions d'équivalence et les valeurs
limites ; elle cite maintenant §1.1.1, §1.3, §1.4.3, §1.4.4, **§4.2.1**, **§4.2.2**, §4.2.3 et
**§5.2** (vérifié le 12.10 sur le fichier FR). Aucune affirmation n'était fausse ; seuls les
renvois manquaient.

⚠️ **Ces deux paragraphes sont restés en « Point ouvert » après leur fermeture** (constaté le
12.10 : T34 et T35 étaient mergées et déployées, et ce fichier disait encore « non réécrit » et
« ne rien changer sans son arbitrage » — une session fraîche l'aurait lu comme l'état courant).
C'est la même accumulation que la règle « compter les lignes ouvertes » décrit pour le journal,
mais ici **aucune commande ne la vérifiait** : le `grep -c "🔄 PR ouverte"` ne regarde que
`docs/JOURNAL.md`. À relancer avant tout `/clear`, en plus de celui du journal :

```bash
grep -c "^\*\*Point ouvert" CLAUDE.md
```

Le résultat attendu est le nombre de points **réellement** ouverts — au 12.10, après T40 :
**3**, les 10 nœuds de contraste inconnus, les prompts d'`anomaly-sentinel`, et l'invariant
ASCII de ReleaseGuard sur des noms de tests non-ASCII. ⚠️ **Le compte n'a pas bougé mais sa
composition a changé** : T40 a fermé la jonction d'identité FlakySense ↔ ReleaseGuard et ouvert
le point ASCII. Donc un compteur stable ne prouve rien — **lire les trois titres**, pas
seulement le nombre. S'il monte sans qu'un nouvel arbitrage ait été demandé, c'est qu'un point
fermé a survécu.

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
⚠️ **Compter les lignes ouvertes, ne pas regarder seulement la dernière.** Observé le 09.10 : T31
a été ajoutée dans la PR suivante **sans** que T30 soit fermée, donc deux lignes périmées se sont
accumulées alors que la règle ci-dessus était déjà écrite. Elle dit quoi faire, pas comment le
vérifier. La vérification tient en une commande, à lancer avant d'ajouter une ligne **et** avant
tout `/clear` :

```bash
grep -c "🔄 PR ouverte" docs/JOURNAL.md
```

Le résultat attendu est `0` avant un `/clear`, et au plus `1` pendant une PR en cours — celle
qu'on vient d'ouvrir.

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
- **`npm run test:e2e`** — 472 tests, ~2 min (2,0 mesuré le 10.10 ; 2,7 le 12.10).
  Il construit et sert `dist/` tout seul. Puis `npm run test:report` pour le rapport Allure
  (un fichier HTML autonome dans `allure-report/`). Pour un sous-ensemble :
  `npx playwright test --project=gate-desktop` (voir `tests/README.md` pour les 9 projets).
  La suite tourne aussi sur chaque PR via `pr.yml`.
- **La suite peut être pointée sur la production, et depuis T28 c'est concluant** — avant, les
  specs qui lisent du style couraient contre le chargement de la feuille et annonçaient des
  défauts inexistants. À refaire après tout changement de spec lisant du style, et après tout
  déploiement dont on veut vérifier le rendu réel :
  `PW_NO_SERVER=1 PW_BASE_URL=https://bazanjeremy.github.io npx playwright test --project=motion`
- **Le hash du CSS après tout ajout de fichier** : `npm run build && ls dist/_astro/`. Le nom doit
  rester `_astro_content.Cdcq06J1.css`, **18 949 octets** (il valait `DPDLS9i_` jusqu'à T27 — +81
  octets pour réparer la révélation au scroll —, `CerI2rm-` jusqu'à T29 — −27 octets, la règle
  `.contents`, documentation sortie du scan —, `DRDROTEC` jusqu'à T31 — +26 octets, une règle
  devenue deux, le scrollport des tableaux passant du `<table>` à son conteneur —, `CAfsBN8X`
  jusqu'à T36, puis `D1b6u-4G` jusqu'à T38).
  ⚠️ **T38 : +87 octets, et aucun n'atteint le rendu.** Au bump Tailwind 4.3.2 → 4.3.3,
  `D1b6u-4G` → `Cdcq06J1`. Diff par règle : **263 règles avant comme après, 3 lignes diffèrent**.
  (1) Le commentaire de version du preflight. (2) La pile de polices de **repli** du `html,:host`
  s'allonge — c'est elle qui porte les +87 octets —, mais c'est le repli de
  `var(--default-font-family, …)` et il n'est **jamais atteint** : le CSS produit définit
  `--default-font-family: var(--font-sans)`, `--font-sans` reste
  `"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`, et `body` repose
  `font-family: var(--font-sans)` par-dessus. (3) `:-moz-focusring` devient
  `:-moz-focusring:where(:not(iframe))`, et `dist/` ne contient **aucun** `<iframe>` (mesuré),
  donc portée vide. **Mesuré dans un vrai moteur**, feuille externe chargée (38 règles) :
  `html`, `body` et `h1` calculent tous `Inter, system-ui, …`, et Inter comme JetBrains Mono sont
  chargées — donc le repli est inerte par la mesure, pas par un raisonnement sur la cascade.
  ⚠️ **T36 montre qu'un hash peut bouger à taille d'octets strictement identique** : au bump
  Astro 7.3.8, `CAfsBN8X` → `D1b6u-4G` **sans changer un octet de taille** (18 862 dans les deux
  cas), parce qu'une seule règle a changé de représentation et que les deux écritures font 10
  caractères — `.rounded-full{border-radius:3.40282e38px}` (FLT_MAX) devient
  `…:2147483647px` (INT32_MAX). Mesuré : 263 règles avant comme après, et le `diff` par règle ne
  sort que cette ligne. **Conséquence de rendu : nulle, et c'est mesuré, pas déduit** — sur la
  pastille de `Journey.astro` (boîte de 10×10px, seul usage de `rounded-full`), le moteur calcule
  `3.35544e+07px` pour **les deux** valeurs, donc elles sont indiscernables après calcul
  (mesuré dans Chromium sur la production ; la réduction du rayon à la moitié de la boîte est en
  outre imposée par la spec dans tout moteur — ça, c'est du raisonnement, pas une mesure).
  Leçon : **comparer la taille ne suffit pas, il faut comparer le hash**, et quand il bouge,
  diffracter par règle avant de conclure. La cause exacte de la réécriture est **inconnue** :
  elle est corrélée au remplacement d'`esbuild` par `lightningcss` 1.33.0 dans la chaîne de vite
  (mesuré dans le lockfile), mais ça n'a **pas** été isolé.
  **Depuis T29, une édition de `docs/`, `.github/` ou `CLAUDE.md` ne peut plus déplacer ce
  hash** — c'était tout l'objet du changement. Mais Tailwind scanne toujours plus large qu'on
  ne croit (voir les gotchas), et un mot de prose **d'article** peut injecter une règle.
- **Plusieurs contrôles manuels sont désormais automatisés**, et il ne faut pas les refaire à la
  main : débordement horizontal à 375px (avec la précondition de largeur qui ferme le piège de
  mesure de T16 — un test qui ne vérifie que le débordement passerait pour la même mauvaise
  raison), vocabulaire banni sur trois surfaces, ancres mortes, chaînage `translationSlug`,
  métadonnées par locale, contrat des articles, invariants 0-JS et 0 requête externe, et
  depuis T32 les **règles WCAG 2.0/2.1 A et AA d'axe sur les 26 pages**, contrastes compris.
  **Pas encore couvert** : le rendu visuel — pour ça, la comparaison `dist/` contre la prod
  ci-dessous reste la méthode. Et **10 nœuds de contraste des deux accueils restent inconnus**,
  axe refusant de les trancher : voir le point ouvert plus haut. ⚠️ Ne pas conclure d'un axe vert
  que la page est stylée : **mesuré en T32, feuille de style coupée, axe rend 0 violation et 85
  nœuds « conformes »** en mesurant le noir sur blanc du navigateur. C'est `gotoStyled` qui
  protège, pas axe.
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
- **Le minifieur peut détruire une déclaration CSS correcte, et c'est `lightningcss`.** Au
  moment de la mesure du 08.10 les deux minifieurs étaient là (`esbuild` via Vite,
  `lightningcss` via la passe d'optimisation de Tailwind 4) ; **depuis T36 il n'y a plus
  que `lightningcss`**, en deux copies — 1.33.0 via vite 8.3.4, 1.32.0 via Tailwind —,
  `esbuild` ayant quitté l'arbre. **Mesuré le 08.10**, c'est `lightningcss` qui refusionne un
  raccourci `animation` et un `animation-timeline` en
  `animation: linear both reveal-fade view()`. Ce raccourci
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
  ⚠️ **Et ce montage refuse des connexions par intermittence — isolé en T38, c'est LUI, pas le
  navigateur.** Symptôme : `gate-firefox` sort des échecs `NS_ERROR_CONNECTION_REFUSED` sur
  `localhost:4321`, et la capture de la page montre le « Unable to connect » de Firefox, **pas une
  page du site**. Les tests touchés changent d'un run à l'autre, ce qui donne l'illusion d'un
  défaut qui se déplace. **L'isolation est l'expérience à refaire, pas le diagnostic à recopier** :
  le même projet, le même `dist/` et le même Firefox contre un serveur statique banal passent
  **127/128 avec 1 sauté et sortie 0** —

  ```bash
  python -m http.server 4399 --directory dist
  PW_NO_SERVER=1 PW_BASE_URL=http://127.0.0.1:4399 npx playwright test --project=gate-firefox
  ```

  Donc : **un rouge `gate-firefox` se vérifie contre un serveur statique avant d'accuser quoi que
  ce soit d'autre.** Ce qui est isolé, c'est « le montage `astro preview` du `webServer` » — pas
  nécessairement le serveur HTTP d'Astro lui-même, puisque l'expérience change aussi le port et
  retire la gestion du `webServer` par Playwright ; **la cause fine reste inconnue**.
  Chronologie mesurée : full suite verte en T36 (Playwright 1.63.0), **1** rouge `gate-firefox` en
  T37 (même version), puis **4** en T38 (Playwright 1.64.0 / Firefox 157) et **2** en relançant le
  projet seul. La fréquence a donc augmenté ; **la raison de cette augmentation est inconnue**, et
  le bump n'est pas en cause puisque le défaut lui est antérieur. `gate-firefox` n'est pas dans
  l'ensemble bloquant, donc rien de tout ça ne bloque une PR.
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
  **Vérifié en T37, et c'est la bonne façon d'exercer un bump de `sharp`** : après
  `sharp` 0.35.4 → 0.35.5 (donc librsvg 2.63.2), `node scripts/og-image.mjs` régénère les deux
  cartes **identiques octet pour octet** — md5 inchangés, `cmp` silencieux, 1200×630, sRGB,
  3 canaux, sans alpha, 67 et 69 KB. Le rendu ne dépend donc pas de la version de librsvg sur ce
  SVG. ⚠️ C'est aussi le **seul** contrôle qui exerce vraiment `sharp` : le build ne l'appelle
  jamais, donc un `dist/` identique ne dit **rien** sur lui, et une régression de `sharp` ne se
  verrait qu'à la prochaine régénération. À refaire à chaque bump de `sharp`, en comparant les
  octets et pas l'œil.
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
- **`npm update <paquet>` n'est PAS limité à ce paquet.** Mesuré en T36 : `npm update astro`
  a re-résolu l'arbre entier — **57 versions changées, 16 paquets ajoutés, 31 retirés** —, dont
  des minors de la chaîne de bundling (`vite` 8.1.4 → 8.3.4, `rolldown` 1.1.5 → 1.2.13) et la
  **disparition d'`esbuild`** et de `js-yaml`. Même famille que le piège déjà noté sur
  `npm audit fix`, qui « emporte des minors malgré son lockfile only » : le levier est le même,
  npm re-résout tout ce que les plages autorisent. Deux conséquences pratiques :
  **(1)** un bump « isolé » n'existe pas — toujours differ le lockfile **par version de paquet**
  avant de conclure sur le périmètre (le script de T36 compare les deux `packages` et sort
  changés / ajoutés / retirés) ; **(2)** une dépendance directe peut être emportée au passage.
  En T36 `@astrojs/markdown-satteri` 0.4.0 → 0.4.3 est partie avec, et ce n'était pas gratuit :
  les deux épinglent `@astrojs/internal-helpers` **exactement**, et Astro 7.3.8 exige `0.12.0`
  là où satteri 0.4.0 exigeait `0.11.0`. ⚠️ Un bump du wrapper `@astrojs/markdown-satteri`
  touche le pipeline Markdown, donc **le gotcha du cache de contenu s'applique** : sans
  `rm -rf node_modules/.astro`, le HTML des 22 articles sort du cache et la comparaison ne
  mesure rien. Mesuré après vidage en T36 : `satteri` lui-même (le moteur de rendu) **n'a pas
  bougé**, 0.10.5 avant comme après, et le HTML des 26 pages est identique.
  ⚠️ **T37 nuance l'énoncé, et la nuance compte** : `npm update sharp` est resté **serré** — 27
  versions changées, **0 ajoutée, 0 retirée**, uniquement `sharp` et ses binaires `@img/*`. La
  règle n'est donc pas « `npm update` emporte toujours tout », ce qui mènerait à éviter la
  commande, mais **le périmètre est imprévisible et se mesure** : il dépend de ce que les plages
  du parent autorisent, pas du nom passé en argument. Le diff du lockfile par version de paquet
  est la seule façon de le savoir, et il coûte une commande dans les deux cas.
- **Les alertes Dependabot sont triées — ne pas les relayer au score CVSS.** Il y en avait quatre
  au 12.10 : `source-map-js` (DoS, haute), `http-cache-semantics` (divulgation de cache
  inter-utilisateurs, haute), `sharp`/librsvg CVE-2026-96889 (haute), `smol-toml` (parse
  quadratique, moyenne). **Mesuré** : les quatre étaient **transitives** (`isDirect: false`),
  tirées par `astro` et la chaîne de build, et **`dist/` contient 0 fichier `.js` et 0
  balise `<script>`** — donc aucune ne tournait chez le visiteur. Entrées hostiles : aucune non
  plus. `source-map-js` traite nos propres CSS au build ; `http-cache-semantics` suppose un cache
  HTTP partagé entre utilisateurs, que ce build n'a pas ; `sharp` n'est appelé **que** par
  `scripts/og-image.mjs`, lancé à la main sur notre propre SVG, jamais par le build ; et
  `smol-toml` n'a rien à parser, **le dépôt ne contient aucun `.toml`** (vérifié).
  **État après T36 et T37 : 4 alertes → 1.** `smol-toml` 1.8.0 → **1.9.1** et `source-map-js`
  1.2.1 → **1.2.2** fermées par le bump Astro ; `sharp` 0.35.4 → **0.35.5** fermée par T37.
  ⚠️ **Il reste `http-cache-semantics` 4.2.0, et elle ne se fermera pas** : son
  **`first_patched_version` vaut `aucun`** — toute version publiée est vulnérable, donc aucun
  bump ne peut y changer quoi que ce soit, et la seule sortie serait qu'elle quitte l'arbre.
  **Ce n'est pas un oubli, ne pas la retrier à chaque session.**
  ⚠️ **Et l'affichage de Dependabot retarde sur le dépôt** : mesuré le 12.10, l'alerte `sharp`
  était encore listée `open` alors que `main` portait déjà **0.35.5** dans le lockfile (vérifié
  par `git show main:package-lock.json`). Dependabot ferme à son propre rythme après un push sur
  la branche par défaut. **La version du lockfile de `main` fait foi, pas le compteur d'alertes**
  — sinon on refait un bump déjà fait.
  ⚠️ **T36 avait écrit ici que « le correctif passe par Astro 7.3.8 » : c'était faux pour la
  moitié**, le bump n'en fermant que deux sur quatre. Leçon, qui est la vraie valeur de ces deux
  tâches : **une alerte se ferme en comparant la version installée à la plage vulnérable**
  (`vulnerable_version_range` et `first_patched_version` dans l'API), jamais en supposant qu'un
  bump du parent emporte l'arbre, ni en lisant le seul numéro de version. Et le correctif se
  vérifie **au critère que l'avis donne lui-même** : celui de `sharp` disait « 0.35.5, which
  provides librsvg 2.63.2 », donc la mesure qui conclut est
  `require('sharp').versions.rsvg` → **2.63.2**, pas le numéro de `sharp`.
- **`allowScripts` dans `package.json`** : la machine de Jérémy est en **npm 11**, qui bloque
  les `postinstall` par défaut ; la CI est en **npm 10.9.8** (lu dans le log du workflow), qui
  ignore le champ. Le warning `allow-scripts` sur `esbuild` était donc local. Il est acté en
  `"esbuild": false` : sur Windows avec `@esbuild/win32-x64` installé, ce `postinstall` est un
  **no-op** (`maybeOptimizePackage()` s'exclut de `win32`, le binaire de plateforme résout déjà)
  — vérifié par `npm ci` complet puis `esbuild --version`. ⚠️ `npm install-scripts approve|deny`
  **écrit dans `package.json` malgré `--dry-run`** (npm 11.18.0) : ne pas s'y fier.
  ⚠️ **Depuis T36, `esbuild` n'est plus dans l'arbre du tout** : Astro 7.3.8 exige
  `vite ^8.3.1`, et vite 8.3.4 ne tire plus `esbuild` mais `lightningcss` 1.33.0 en imbriqué
  (mesuré dans le lockfile ; `ls node_modules/esbuild` → absent). Le champ
  `"esbuild": false` est donc devenu **inopérant** — gardé volontairement, pour qu'il reprenne
  effet si `esbuild` revenait, et parce que le retirer ne gagne rien. Corollaire pour le gotcha
  du minifieur plus haut : **la chaîne de minification CSS a changé**, et c'est ce qui rend le
  contrôle du raccourci `animation` d'autant plus nécessaire. Vérifié en T36 : la règle
  `.reveal` sort **identique octet pour octet**, et `grep -c 'animation:'` donne **0** sur le CSS
  produit — le raccourci n'est pas reconstruit sous la nouvelle chaîne.
- Repo : https://github.com/BazanJeremy/bazanjeremy.github.io · Live :
  https://bazanjeremy.github.io/

## Commandes Astro

`npm run dev` (localhost:4321) · `npm run build` (→ `dist/`) · `npm run preview`.
Docs : https://docs.astro.build
