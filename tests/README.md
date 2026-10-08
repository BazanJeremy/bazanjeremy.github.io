# Suite QA — registre de risque

Suite Playwright du site, avec rapport Allure 3. Ce fichier est le **registre de
risque** : il dit ce que la suite verrouille, ce qu'elle ne verrouille
**délibérément pas**, et pourquoi.

La seconde liste compte autant que la première. Le test exhaustif est
impossible ; sur un site statique sans interactivité, l'essentiel du risque
n'est pas là où une suite E2E regarde d'habitude. Une omission argumentée est
une décision ; une omission tacite est un trou.

> **Note sur ce fichier.** Il ne reproduit aucun des mots de la liste rouge du
> vocabulaire public, y compris pour les décrire — ni même les noms de fichiers
> source qui en contiennent un. Un hook du dépôt les interdit dans tout fichier
> public, et il a effectivement bloqué deux versions de ce README. La liste fait
> foi à un seul endroit, `helpers/vocabulary.ts` : s'y référer plutôt que de la
> recopier ici ou ailleurs.

## Commandes

```bash
npm run test:e2e      # build + preview + toute la suite
npm run test:gate     # le sous-ensemble bloquant seulement
npm run test:report   # genere le rapport Allure (un fichier HTML autonome)
```

Le rapport sort dans `allure-report/index.html` — **un seul fichier**, ouvrable
hors ligne, sans aucune requête externe. Il pèse environ **4 Mo** même pour un
run vert : c'est le bundle de l'application Allure, inliné en base64. Ce n'est
pas « léger », c'est autonome.

Pour cibler la production au lieu du preview local (PowerShell) :

```powershell
$env:PW_BASE_URL='https://bazanjeremy.github.io'; $env:PW_NO_SERVER='1'
npx playwright test
Remove-Item Env:PW_BASE_URL, Env:PW_NO_SERVER
```

Il n'y a pas de `cross-env` (hors stack verrouillée), donc la forme
`VAR=x npx playwright test` ne marche ni en PowerShell ni en cmd.

## Niveaux

| Niveau | Rôle |
|---|---|
| **GATE** | bloque le déploiement. Rien d'instable, rien qui dépende d'un tiers. |
| **CHECK** | même run, informatif. Signale sans empêcher la mise en ligne. |
| **NUIT** | cron. Tout ce qui est lent, dépendant de tiers, ou vrai seulement en production. |

Le découpage n'est pas une question de confiance dans les tests, mais de **coût
d'un faux positif** : un test qui bloque la publication d'un article doit être
déterministe et ne dépendre que de nous.

## Ce que la suite verrouille

### Livré

| Spec | Niveau | Risque | Ce qu'il verrouille |
|---|---|---|---|
| `gate/vocabulary.spec.ts` | GATE | P moyenne × I **très haut** | La ligne rouge du vocabulaire public, sur **trois surfaces indépendantes** : le texte rendu et les attributs visibles des 26 pages, les URLs réellement produites (noms de dossiers de `dist/`), et les **valeurs** des deux dictionnaires i18n. Règle qui a déjà échappé deux fois. |
| `invariants/zero-js.spec.ts` | GATE | P basse × I **maximal** | Aucun `.js` dans `dist/`, aucune balise `<script>`, aucun handler inline. Plus un garde-fou : toutes les pages déclarées par le contenu sont bien construites. |

Détail important de `vocabulary.spec.ts` : il scanne les **valeurs** des
dictionnaires i18n, jamais les **clés**. Une clé est de la structure, une valeur
est de la copy publiée — et l'un des noms de clé existants est précisément un
mot de la liste rouge, au même titre qu'un nom de composant du dépôt, qui est du
code et non du texte publié. Scanner les clés rendrait la suite rouge dès le
premier jour sans aucun défaut.

### À venir (PR 2 à 6)

`i18n-toggle` (chaînage `translationSlug`) · `links-anchors` (ancres mortes et
ancres interdites) · `mobile-375` (débordement horizontal, avec la précondition
de largeur) · `sitemap` · `seo-meta` · `blog-contract` · `skip-link` ·
`zero-external` · `assets` · `og-copy` · puis `a11y-axe`, `prod-http`,
`external-links`, `reduced-motion`.

## Ce qu'on ne teste pas — et pourquoi

1. **Captures comparées / régression visuelle.** 26 pages × 2 viewports d'un
   design réglé à la main : la suite passerait au rouge à chaque changement
   *voulu*, et sur les différences de rastérisation entre Windows (dev) et
   Linux (CI). Le dépôt possède déjà une technique moins chère et plus
   concluante pour cette question : comparer `dist/` à la production et `cmp`
   le CSS haché. **Rejeté sur le coût, avec une alternative nommée.**
2. **Un vérificateur de contraste maison.** La règle `color-contrast` d'axe le
   fera dans un vrai navigateur. Un second finirait par le contredire.
3. **Lighthouse / budgets de performance.** Une page à 0 JS, deux polices
   auto-hébergées et une feuille de style n'a presque rien à régresser, et les
   scores varient de plusieurs points d'un run à l'autre sur un runner
   partagé : un gate là-dessus est un générateur de faux positifs.
4. **L'exactitude du contenu des articles.** Le recoupement contre les dépôts
   cités et les sources primaires est un processus **humain**, documenté dans
   `CLAUDE.md`. Il a attrapé des choses qu'aucune assertion ne pouvait voir —
   une thèse contredite par le prompt que l'outil envoie réellement. Automatiser
   un proxy fabriquerait une fausse assurance, le pire résultat possible ici.
5. **Le serveur `astro dev`.** Seul `dist/` est déployé.
6. **Les articles `draft: true`.** Exclus du build par construction. Le
   catalogue les exclut aussi, donc les deux côtés restent cohérents.
7. **Les alternates `xhtml:link` du sitemap.** Mesuré absents le 07.10 (0
   occurrence dans `dist/sitemap-0.xml`, alors que le namespace est déclaré).
   Les assérer rendrait le gate rouge dès le premier jour pour une
   *fonctionnalité manquante*, pas une régression. C'est une décision de
   configuration `@astrojs/sitemap`, à arbitrer séparément.
8. **Vrais appareils mobiles / Mobile Safari.** Pas de device cloud. Le risque
   mobile réel est le débordement à 375px, que l'émulation Chromium mesure
   fidèlement.
9. **Formulaires, authentification, état, contrats d'API.** Il n'y en a aucun.
   Dit explicitement, parce que leur absence est *la raison* pour laquelle
   cette suite est petite.
10. **Les pixels des images Open Graph.** Le texte y est incrusté : aucun scan
    de texte ne peut le lire. `invariants/og-copy.spec.ts` (PR 2) scannera la
    copy du *générateur* `scripts/og-image.mjs`, ce qui ferme le trou par lequel
    la fuite a eu lieu — mais ne prouve pas que le PNG correspond au script.
11. **Charge, concurrence, scan de sécurité.** Site statique sur CDN, sans code
    serveur ni entrée utilisateur.

## Pièges mesurés — à ne pas redécouvrir

### Tailwind scanne les tests et les configs racine

Tailwind 4 détecte ses sources automatiquement, et le périmètre est plus large
qu'on ne le croit. **Mesuré les 07 et 08.10, par élimination** : sont scannés
`tests/` (versionné), les fichiers de config à la racine (comme
`astro.config.mjs` l'est déjà), `scripts/`, **`docs/` et `.github/`** ; en
revanche la feuille de style elle-même ne l'est pas — un commentaire de
`global.css` contenant `.inline{display:inline}` n'a rien produit.

Le cas de `.github/` a été tranché par un témoin : les mots « uppercase italic »
ajoutés dans un fichier de workflow ont produit les deux règles correspondantes
et déplacé le hash. Ce n'était pas évident, et le périmètre d'un futur
`@source not` doit en tenir compte.

Un mot de prose qui ressemble à un utilitaire injecte donc une règle dans le CSS
de production et fait bouger le hash de `_astro/*.css`. Deux fois de suite
pendant la PR 1 : le mot « inline » dans un commentaire de
`playwright.config.ts`, puis dans un commentaire d'un script de `scripts/` —
chaque fois `.inline{display:inline}`, +23 octets, hash `DPDLS9i_` vers
`RNyVmQBJ`. Quatre directives dans `src/styles/global.css` l'empêchent :

```css
@source not "../../tests";
@source not "../../playwright.config.ts";
@source not "../../allurerc.mjs";
@source not "../../scripts";
```

L'exclusion de `scripts/` protège aussi `scripts/og-image.mjs`, qui était
exposé au même piège depuis le début.

**`docs/` et `.github/` ne sont volontairement PAS exclus**, bien qu'ils soient
scannés : leur prose apporte deux règles que le CSS de production sert
aujourd'hui — `.block` (21 octets), venue de l'entrée de journal qui documente
justement l'incident du mot « block », et `.contents` (27 octets), venue de
`permissions: contents: read` dans `deploy.yml`. Les exclure retirerait 48
octets de CSS mort sur 18 782 : un nettoyage qui se défend, mais qui **change
les octets servis**, donc il mérite son propre changement plutôt que de voyager
dans un autre. En attendant, une retouche de prose dans l'un des deux peut
déplacer le hash, et la procédure documentée s'applique — differ les deux
feuilles règle par règle avant de conclure à une régression de style.

Contrôle qui tranche, à refaire après tout ajout de fichier à la racine :

```bash
npm run build && ls dist/_astro/
```

Le nom doit rester `_astro_content.DPDLS9i_.css`. S'il bouge, diffe les deux
CSS **règle par règle** avant de conclure : un hash différent ne veut pas dire
régression de style.

### `astro preview` se démonise sous un agent

**Mesuré le 07.10** dans `node_modules/astro/dist/cli/preview/index.js` :

```js
const agentDetected = !process.env.ASTRO_PREVIEW_BACKGROUND && isRunByAgent();
const wantsBackground = !!flags.background || agentDetected;
```

`isRunByAgent()` délègue au paquet `am-i-vibing`. Lancé depuis un agent, `astro
preview` détache un serveur et **rend la main aussitôt** — Playwright conclut
alors « Process from config.webServer exited early ». En CI il n'y a pas
d'agent, donc le problème ne se voit pas là : la suite passerait en CI et
échouerait en local, le pire des deux mondes.

`playwright.config.ts` pose donc `ASTRO_PREVIEW_BACKGROUND` dans
`webServer.env`, ce qui désactive la détection, plus `--ignore-lock` pour le
symptôme jumeau (un verrou laissé par un démon d'une session précédente fait
sortir `astro preview` sur « already running »).

### Allure : `generate`, pas `awesome`

**Mesuré le 07.10** : seul `allure generate` lit `allurerc.mjs`. `allure awesome
./allure-results` ignore le bloc `plugins.awesome.options` et sort un rapport
**multi-fichiers de 3,1 Mo** au lieu du fichier unique. Passer par
`npm run test:report`.

### Allure injecte un traceur Google Analytics, sans opt-out

**Mesuré le 07.10** dans
`node_modules/@allurereport/plugin-awesome/dist/generators.js` :

```js
analyticsEnable: true,          // en dur
```

là où le plugin historique `allure2` respecte un opt-out :

```js
analyticsEnable: process.env.ALLURE_NO_ANALYTICS?.toLowerCase() !== "true"
```

Il n'existe donc **aucune** option ni variable d'environnement pour désactiver
le traceur sur le plugin `awesome` (vérifié : `ALLURE_NO_ANALYTICS=1` ne change
rien). Or ce dépôt revendique « 0 requête externe » et auto-héberge ses polices
pour ne pas appeler de CDN tiers. `npm run test:report` passe donc par
`scripts/allure-report.mjs`, qui génère le rapport puis retire le traceur, et
**échoue** s'il ne trouve rien à retirer — pour qu'un correctif en amont ou un
changement de markup se voie au lieu de passer en silence.

C'est un script, et non deux commandes enchaînées par `&&`, pour une raison
mesurée pendant la PR 2 : quand le quality gate échoue, `allure generate` sort
avec un code non nul, le `&&` court-circuite, et le traceur reste dans le
rapport — précisément celui qu'on va ouvrir, puisqu'il y a des échecs. Un `;`
ne corrige rien de façon portable (npm passe par `sh` sur POSIX, `cmd.exe` sur
Windows). Le script garantit l'ordre et ressort le code de la génération, pour
que le quality gate garde son autorité.

### CRLF

`core.autocrlf=true` sur la machine de développement, LF en CI. Toute assertion
sur un fichier doit normaliser (`fixtures/dist.ts` le fait), et **aucune ne doit
comparer des octets**. Sinon les specs `invariants` seraient rouges en local et
vertes en CI pour une raison sans rapport avec le site.

### Ne jamais publier le nombre de tests de cette suite

La suite est paramétrée sur les articles : **ajouter une paire d'articles change
le nombre de tests.** Citer ce nombre dans un article lierait l'article au
dépôt, et le rendrait faux au prochain article — exactement ce qui est arrivé
avec les « 182 tests » d'un outil du dépôt. Pour la même raison, le
`minTestsCount` du quality gate est un **plancher large** (20), pas un compte
exact, et le garde-fou de pages construites **dérive** son attendu du catalogue
au lieu de coder un nombre en dur.

## Conventions

- **Des répertoires, pas des tags.** Chaque répertoire est un projet Playwright,
  donc `--project=` est le sélecteur unique, partagé par les scripts npm et
  (plus tard) par l'input `suite` du `workflow_dispatch`.
- **Le catalogue est dérivé, jamais codé en dur.** `fixtures/pages.ts` lit
  `src/content/blog/**` et les JSON i18n. Un article ajouté entre dans la suite
  sans rien toucher ici.
- **Toujours naviguer vers la forme à slash final** (`/blog/x/`). Les liens de
  carte émettent `/blog/x` sans slash, ce qui **301 en production** mais répond
  **200 sans redirection** sous `astro preview` (mesuré). Le slash final est
  donc le sujet d'une seule spec, en production uniquement — ailleurs, c'est une
  source de conclusions fausses.
- **`reducedMotion: 'reduce'` partout.** Les `.reveal` animent leur opacité au
  scroll derrière `@media (prefers-reduced-motion: no-preference)`. Motion
  réduit, ils restent à opacité 1 et les assertions sont déterministes. Le gate
  ne doit jamais dépendre de l'avancement d'une animation.
- **Retries à 0 dans le gate.** Un gate est une mesure à tentative unique ; les
  retries sont un instrument de mesure de l'instabilité, pas un comportement de
  gate. Les deux ne partagent jamais le même run — et le quality gate d'Allure
  est de toute façon incompatible avec les retries.
- **Un message d'échec doit localiser le défaut**, pas seulement le signaler.
  Les specs nomment la surface exacte (le fichier puis le chemin de clé), la
  règle violée et le contexte.

## Prouver que les tests savent échouer

Une suite verte ne prouve rien sur la suite. Chaque spec doit avoir été vue
rouge au moins une fois, par une mutation réelle, annulée ensuite. Mutations
exécutées le 07.10 :

| Mutation | Résultat |
|---|---|
| Un mot de la liste rouge inséré dans une valeur de `en.json` | `vocabulary` rouge, en nommant le fichier et le chemin de clé exact |
| `<script>console.log(1)</script>` dans `BaseLayout.astro` | `zero-js` rouge, en listant les 26 pages touchées |
| `posts.map(` vers `posts.slice(1).map(` dans le `getStaticPaths` du blog FR | garde-fou de pages rouge, `missing` non vide |

Note : passer un article en `draft: true` ne fait **pas** échouer le garde-fou,
et c'est correct — le catalogue exclut les brouillons comme le build. C'est la
régression de `getStaticPaths` que ce garde-fou attrape.

## En CI

Une action composite, `.github/actions/qa/action.yml`, porte l'implémentation
unique ; deux workflows l'appellent :

| Workflow | Déclencheur | Rôle |
|---|---|---|
| `pr.yml` | `pull_request` vers `main` | Le gate sur chaque PR. Il n'existait **aucun** déclencheur de PR avant. |
| `deploy.yml` | `push` sur `main` | Un job `gate` en amont de `build`. |

**Comment le gate bloque.** Le job `gate` tourne **avant** que l'artefact Pages
existe. S'il échoue, `build` ne tourne pas (il porte `needs: gate`), donc rien
n'est téléversé, donc `deploy` ne peut pas s'exécuter faute d'artefact. Aucune
condition `if:` à mal écrire, aucun moyen de déployer des octets non testés.

**Pourquoi un job séparé et non les tests dans `build`.** `withastro/action@v3`
installe, construit et téléverse en une seule étape, sans point d'insertion. Le
remplacer par ses étapes internes n'est pas la traduction 1:1 qu'on croit —
mesuré, il utilise `setup-node@v7`, `upload-pages-artifact@v5` et un cache de
build Astro via `actions/cache@v6` : on reprendrait la maintenance de trois
choses. Or le job `build` complet prend **15 secondes** (mesuré), et le gate doit
de toute façon construire son propre `dist/` pour le servir. Payer un build de
plus coûte moins cher que posséder les entrailles de l'action, qui reste donc
**intacte**.

`pr.yml` et le job `gate` ont leurs **propres groupes de concurrence**, jamais
`pages` : partager le groupe de déploiement mettrait les runs de test en file
derrière les mises en production (`cancel-in-progress: false`), et pourrait
retarder un déploiement derrière un run de test.

**Le quality gate d'Allure est porteur, pas décoratif.** L'étape de rapport n'est
pas en `continue-on-error` : un gate en échec fait échouer le job. C'est ce qui
attrape ce qu'une suite verte ne peut pas voir — des specs qui disparaissent
discrètement, via `minTestsCount`.

**Le niveau informatif existe mais est vide.** L'action accepte
`check-projects`, dont l'échec produit une annotation d'avertissement sans
bloquer. Rien n'y est aujourd'hui : tout ce qui est livré est déterministe et ne
dépend que de ce dépôt. Axe, les liens externes et les autres moteurs de rendu y
atterriront.

## Pas encore en place

- **Le cron nocturne et le `workflow_dispatch` paramétré** arrivent en PR 4.
- **Pas de vérification de types.** `tsconfig.json` est strict et couvre
  `tests/`, mais `astro build` ne lance pas `tsc` : les erreurs de type ne sont
  donc visibles que dans l'éditeur. Un script `typecheck` exigerait
  `@astrojs/check` et `typescript` en devDependencies — **deux dépendances non
  approuvées**, donc non ajoutées. À arbitrer.
- **Pas d'historique Allure.** `historyPath` pointe
  `.qa-history/allure/history.jsonl`, mais rien ne le persiste encore entre deux
  runs (PR 4).
