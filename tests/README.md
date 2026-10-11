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
npm run test:gate     # le sous-ensemble bloquant seulement (204 tests)
npm run test:report   # genere le rapport Allure (un fichier HTML autonome)
```

`test:gate` liste **exactement** les quatre projets du défaut `projects` de
`.github/actions/qa/action.yml`, qui est la définition de l'ensemble bloquant.
Les deux étaient désalignés jusqu'au 10.10 — le script omettait `gate-mobile` —,
donc un run local vert ne disait rien du gate. Si l'un des deux change, changer
l'autre dans la même PR.

Pour un projet precis, `--project=` est le selecteur unique :

```bash
npx playwright test --project=gate-mobile
npx playwright test --project=gate-firefox --project=gate-webkit
```

Les projets `prod-http` et `external-links` visent la **production** et n'ont
besoin d'aucun serveur local :

```powershell
$env:PW_NO_SERVER='1'; npx playwright test --project=prod-http
Remove-Item Env:PW_NO_SERVER
```

Le rapport sort dans `allure-report/index.html` — **un seul fichier**, ouvrable
hors ligne, sans aucune requête externe : c'est le bundle de l'application
Allure, inliné en base64. Ce n'est pas « léger », c'est autonome.

⚠️ **Le « environ 4 Mo » qui était écrit ici est faux, et la correction vaut
plus que le chiffre.** Mesuré le 10.10, trois runs verts, résultats nettoyés
avant chacun : **13,0 Mo** pour le sous-ensemble du gate (150 tests), **19,4 Mo**
pour la suite complète sans axe (446 tests), **18,8 Mo** avec axe (472 tests).
Donc le rapport est 3 à 5 fois plus gros qu'annoncé, l'essentiel est une base
constante, et l'ajout de 26 tests ne l'a pas fait grossir — il a même donné un
fichier plus petit que le run sans eux, ce qui situe la variation dans le bruit
et non dans le nombre de tests. **La cause de l'écart avec le 4 Mo d'origine est
inconnue** : montée de version d'Allure, changement de `singleFile`, ou chiffre
faux dès l'écriture — je ne l'ai pas mesurée, et le dire est plus utile que de
choisir une explication plausible. Conséquence pratique, elle : un artefact de
~19 Mo par run, trois workflows, 30 jours de rétention.

Et une mesure annexe qui pique : `allure-results` **s'accumule** d'un run à
l'autre, les échecs y déposent captures et traces, et `singleFile` inline tout.
Après une série de runs de mutation, le même rapport pesait **505 Mo**. En CI le
dossier part vide, donc le cas ne s'y produit pas ; en local, nettoyer
`allure-results/` avant de juger une taille.

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

### GATE — bloque le déploiement

| Spec | Risque | Ce qu'elle verrouille |
|---|---|---|
| `gate/i18n-toggle` | P **haute** × I haut | Aller-retour du toggle sur les 26 pages (la page d'arrivée doit ramener exactement d'où l'on vient) et chaînage bidirectionnel de `translationSlug` sur les 22 articles. La règle que le schéma Zod ne *peut pas* valider, et dont le mode de panne est documenté. |
| `gate/links-anchors` | P moy-haute × I haut | Ancres mortes y compris inter-pages ; **parité des id de section FR/EN**, qui encode la décision « les ancres ne sont pas traduites » ; ancre `#tools` interdite. |
| `gate/vocabulary` | P moyenne × I **très haut** | La ligne rouge du vocabulaire, sur **trois surfaces indépendantes** : texte rendu et attributs visibles des 26 pages, URLs réellement produites, et **valeurs** des dictionnaires i18n. Règle qui a déjà échappé deux fois. |
| `gate/mobile-375` | P moyenne × I haut | Aucun défilement horizontal **et** aucun texte peint hors du viewport, avec la précondition de largeur qui ferme le piège de mesure documenté. |
| `gate/sitemap` | P basse-moy × I moyen | Correspondance exacte avec les pages construites, slash final, **aucune URL encodée** (le piège `%20`), aucun doublon, chaque URL en 200. |
| `gate/seo-meta` | P moyenne × I moy-haut | Canonical = `og:url`, image Open Graph **par locale**, `og:locale`, titres uniques, les trois `hreflang`. |
| `gate/blog-contract` | P moy-haute × I moyen | Un seul `h1` égal au titre, aucun saut de niveau, date affichée = frontmatter, slug kebab-case et fichier homonyme. |
| `gate/reveal-css` | P moyenne × I faible (écran) à moyen (impression) | Les OCTETS de la révélation au scroll : aucun raccourci `animation` ne transporte de timeline (c'est le minifieur qu'on surveille, pas la règle), `.reveal` déclare bien sa timeline en longhand **dans son propre bloc**, la portée `screen` est là, et le moteur a réellement ACCEPTÉ la déclaration (CSSOM). Verrouille un défaut qui a vécu en production depuis sa mise en place sans être vu. |
| `gate/skip-link` | P basse × I moyen | Hors écran sans focus, visible au focus, mène à `#contenu` — vérifié sur les trois moteurs. Et « un seul Tab suffit » là où Tab atteint les liens. |
| `a11y/axe` | P moyenne × I haut | Les règles WCAG 2.0 et 2.1 niveaux A et AA d'axe-core sur les 26 pages (`best-practice` exclu : opinion d'outil, pas critère de conformité). Plus deux choses que « 0 violation » ne dit pas tout seul : que la règle de contraste a trouvé du texte à mesurer, et que l'indécision d'axe reste **bornée par une règle** — un nœud dont il refuse de trancher le contraste n'est toléré que dans le Hero ou le header translucide. Ferme le seul contrôle manuel que la suite ne reprenait pas. |
| `invariants/zero-js` | P basse × I **maximal** | Aucun `.js`, aucune balise de script, aucun handler en attribut. Plus un garde-fou : toutes les pages déclarées sont construites. |
| `invariants/zero-external` | P basse-moy × I moy-haut | L'invariant « 0 requête externe », côté fichiers **et** côté navigateur. |
| `invariants/assets` | P basse × I moyen | Polices présentes, preloads avec `crossorigin`, contrat des PNG Open Graph lu dans l'en-tête IHDR. |
| `invariants/og-copy` | P basse × I **haut** | La copy du générateur des cartes Open Graph — seule surface du système lisible par une machine. |

Détail important de `vocabulary` : il scanne les **valeurs** des dictionnaires
i18n, jamais les **clés**. Une clé est de la structure, une valeur est de la
copy publiée — et l'un des noms de clé existants est précisément un mot de la
liste rouge, au même titre qu'un nom de composant du dépôt, qui est du code et
non du texte publié. Scanner les clés rendrait la suite rouge dès le premier
jour sans aucun défaut.

### NUIT — cron, jamais bloquant

| Spec / projet | Risque | Ce qu'elle verrouille |
|---|---|---|
| `nightly/prod-http` | impact faible-moyen | **Production uniquement.** Chaque page et chaque URL du sitemap en 200 ; un lien non canonique redirige en **une seule** étape vers exactement sa canonique ; un chemin inconnu répond 404 ; la feuille de style référencée est bien servie. Avec un garde-fou qui échoue si aucune redirection n'est observée — sinon la spec passerait sans rien vérifier de propre à la production. |
| `nightly/external-links` | P basse-moy × I moyen | Les 7 dépôts de la cartographie, LinkedIn, GitHub et le champ `linkedin:` des articles. Un statut qu'on ne peut pas interpréter est compté « inconnu », pas « vérifié ». |
| `nightly/reduced-motion` | P basse × I moyen | La seule spec autorisée à s'intéresser au mouvement : sous `reduce` rien n'est animé et tout est visible ; sous `no-preference` l'animation s'applique ; **aucun contenu ne RESTE masqué** (chaque `.reveal` amené dans la vue atteint l'opacité 1) ; et à l'impression rien n'est animé ni masqué. Le mode de panne grave de ce motif est du contenu qui reste invisible, pas du contenu invisible à un instant donné. |
| `gate-firefox` / `gate-webkit` | assurance de régression | Rejeu du gate sur les deux autres moteurs. Justifié, pas réflexe : le site a 0 JS et une seule feuille de style, et la seule fonctionnalité sensible au moteur est derrière un `@supports`. |

### À venir

Persistance de l'historique Allure et accumulation du JUnit · branchement
ReleaseGuard et FlakySense.

## Ce qu'on ne teste pas — et pourquoi

1. **Captures comparées / régression visuelle.** 26 pages × 2 viewports d'un
   design réglé à la main : la suite passerait au rouge à chaque changement
   *voulu*, et sur les différences de rastérisation entre Windows (dev) et
   Linux (CI). Le dépôt possède déjà une technique moins chère et plus
   concluante pour cette question : comparer `dist/` à la production et `cmp`
   le CSS haché. **Rejeté sur le coût, avec une alternative nommée.**
2. **Un vérificateur de contraste maison.** La règle `color-contrast` d'axe le
   fait dans un vrai navigateur depuis le 10.10 ; un second finirait par le
   contredire. Y compris — et c'est là que la tentation revient — pour les 10
   nœuds de l'accueil qu'axe refuse de trancher : écrire notre propre calcul
   pour ces 10-là, c'est exactement le second vérificateur. **Ils restent donc
   inconnus**, ce que `a11y/axe` borne et affiche au lieu de le combler.
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
   *fonctionnalité manquante*, pas une régression. **TRANCHÉ le 09.10
   (décision de Jérémy) : on ne le fait pas**, donc l'absence est voulue et
   reste non assérée. Motif mesuré : l'intégration groupe les alternates par
   chemin identique après retrait du préfixe de langue, or aucun des 22
   articles ne partage son slug entre FR et EN, donc l'option `i18n`
   produirait des alternates sur 4 URLs sur 26 et sur **aucun** article — là
   où le `hreflang` HTML est déjà complet et réciproque. Ne pas reproposer.
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

## Défauts du site trouvés par la suite

**Il n'en reste aucun.** Les trois sont corrigés, chacun dans son propre
changement et avec sa propre vérification — et dans les trois cas la mesure a
corrigé l'énoncé du défaut avant de le corriger lui-même, ce qui est le vrai
produit de cette suite.

- **La révélation au scroll, morte en production** (08.10). Le récit mesuré est
  passé plus bas, dans les pièges, parce que la leçon survit au correctif : le
  minifieur peut détruire une déclaration correcte. Assertions dans
  `gate/reveal-css.spec.ts`.
- **`og:type` valait `website` sur les pages d'article** (09.10). Voir juste
  après.
- **Un tableau d'article était hors d'atteinte au clavier à 375px** (09.10).
  L'énoncé disait « la colonne n'est ni visible ni accessible par défilement »
  et c'était faux : le tableau était un scrollport qui défilait déjà
  (`scrollWidth` 433 contre `clientWidth` 327, `scrollLeft` poussé à 106
  ramenant la colonne entièrement dans le viewport). Le défaut réel était
  `tabIndex: -1` sur ce scrollport : personne au clavier ne pouvait l'atteindre
  (WCAG 2.1.1), et rien n'annonçait la région. Et `display: block` était
  innocent — les trois moteurs exposaient la sémantique intacte (`table`, 7
  `row`, 3 `columnheader`, 18 `cell`). Corrigé par
  `src/plugins/satteri-scrollable-tables.mjs`, qui enveloppe chaque tableau
  dans une région défilable focalisable ; la liste d'exceptions de
  `mobile-375.spec.ts` a disparu **au profit d'une règle** — un texte dans un
  scrollport dont le rectangle tient dans le viewport est atteignable, donc il
  n'est plus compté comme débordement.

**CORRIGÉ le 09.10 — `og:type` valait `website` sur les pages d'article.**
`BaseLayout` codait la valeur en dur pour les 26 pages. Il prend désormais une
prop `ogType` (défaut `website`), et les deux gabarits d'article passent
`article` : mesuré sur le build, **22 articles en `article` et 4 pages en
`website`**, et sur les 26 pages la ligne `og:type` est le **seul** écart avec
la production — 4 pages identiques à l'octet, 22 à deux lignes de diff, 0 autre
écart.

Le `test.fail()` n'a pas été transformé en assertion : il a été **supprimé**, et
l'assertion est entrée dans la boucle paramétrée de `seo-meta.spec.ts`, qui
visite déjà chaque page. Trois raisons, toutes vérifiées : la vérification est
gratuite (aucune navigation de plus), l'échec **nomme la page** au lieu de
désigner un article pris au hasard, et le `kind` du catalogue permet d'asséré
**dans les deux sens** — un article doit dire `article`, une page qui n'en est
pas une doit rester `website`. L'ancien test ne voyait ni les 21 autres
articles, ni la régression inverse, et il fallait penser à retirer son marqueur.

**Deux mutations réelles, annulées.** Recoder `website` en dur dans
`BaseLayout` : 22 rouges, 6 verts — exactement les pages concernées. Faire
déclarer `article` à un index de blog : **1 rouge, `/blog/`**, la page mutée,
nommée. Coût : −3 tests (un par projet qui lance ce spec ; `gate-mobile` ne le
lance pas, son `testMatch` se limitant à `mobile-375.spec.ts`).

À noter, non fait et dit comme tel : `og:type: article` appelle normalement
`article:published_time` et `article:modified_time`, que le site ne sert pas.
Hors du périmètre de ce point, qui ne portait que sur `og:type` — à arbitrer
séparément si le partage social devient un sujet.

## Pièges mesurés — à ne pas redécouvrir

### Un moteur peut diverger sans que le site soit en cause

Le rejeu sur WebKit a fait échouer `skip-link`, et la cause n'était pas le
site. **Mesuré le 08.10** : dans WebKit, un `Tab` laisse le focus sur `<body>`
— Safari ne tabule pas sur les liens sans l'option « Press Tab to highlight
each item on a webpage ». Mais un `focus()` programmé y fonctionne
parfaitement, et le lien passe de `left: -9999` à `left: 0` : le CSS du site
est correct dans WebKit.

La spec mélangeait donc deux choses, une propriété du **site** et un modèle
clavier de **navigateur**. Elles sont séparées : le comportement du site est
vérifié sur les trois moteurs par focus programmé, et « un seul Tab suffit »
n'est vérifié que là où Tab atteint les liens, avec un `test.skip` qui dit
pourquoi.

Leçon générale : quand un moteur diverge, mesurer **avant** de conclure au
défaut, et se demander si l'assertion ne mélangeait pas deux questions.

### `DOMContentLoaded` n'attend pas la feuille de style

**Mesuré le 08.10 contre la production.** Ce site a **0 JS**, et
`DOMContentLoaded` n'attend pas les feuilles externes en l'absence de script à
bloquer. Lire un style à `domcontentloaded` est donc une **course** :

| moment de lecture | feuilles appliquées | règles | `animationName` |
|---|---|---|---|
| `domcontentloaded` | 1 (l'inline seule) | 7 | `none` |
| `load` | 2 | 38 | `reveal-fade` |

En local, `astro preview` sert la feuille si vite que la course est **toujours**
gagnée : la suite était verte en local et en CI. Pointée sur la production,
`nightly/reduced-motion` l'a perdue **deux fois de suite** et annonçait un
défaut du site — alors que le CSS servi était identique à l'octet au build
local. Dans le même temps `gate-desktop` et `gate-mobile` la gagnaient. **La
répartition gagne/perd est de cause inconnue** ; seul le mécanisme est mesuré.
Un test qui dépend d'une course ne vaut rien, qu'il passe ou non.

Remède : `fixtures/styled-page.ts` expose `gotoStyled(page, path)`, qui navigue
en `load` **et** attend que la feuille externe soit appliquée, avec un message
d'échec qui dit « la page n'est pas stylée » au lieu de « le site est cassé ».
Les 4 specs qui lisent du style y passent (`reveal-css`, `skip-link`,
`mobile-375`, `reduced-motion`) ; les 5 qui ne lisent que du DOM restent en
`domcontentloaded`, mesuré : aucune n'appelle `getComputedStyle`,
`getBoundingClientRect` ni `styleSheets`.

C'est la famille du piège `astro preview` plus bas, avec l'asymétrie inversée :
là, faux en local et vert en CI ; ici, vert en local et faux sur le réseau.
Dans les deux cas, **l'endroit où on lance la suite décidait du verdict**.

### Axe est AVEUGLE à une page non stylée, et il la déclare conforme

Corollaire direct du piège précédent, mesuré le 10.10 en écrivant `a11y/axe` —
et il a corrigé l'énoncé de l'assertion avant que l'assertion soit figée.

L'intention était de se protéger de la course ci-dessus par un garde-fou : « si
la feuille n'est pas appliquée, la règle de contraste n'aura rien mesuré, donc
un comptage de nœuds à zéro le révélera ». **Faux.** Feuille `_astro/*.css`
coupée par `page.route(...).abort()`, navigation en `domcontentloaded` :

| | feuille coupée | page normale |
|---|---|---|
| violations WCAG A/AA | **0** | 0 |
| nœuds de contraste conformes | **85** | 74 |
| `color-contrast` inapplicable | non | non |
| nœuds indécis | 0 | 10 |

axe mesure tranquillement le **noir sur blanc par défaut du navigateur** et le
déclare conforme. Deux conséquences qui comptent plus que la mesure :

1. **Un run d'axe vert ne dit rien tant que la feuille n'est pas prouvée
   appliquée.** Toute spec axe passe donc par `gotoStyled` — vérifié dans la
   même mesure : sur la page privée de sa feuille, `gotoStyled` échoue avec son
   propre message, alors qu'axe seul y est vert.
2. **Aucune assertion de comptage ne rattrape ça** : 85 nœuds non stylés contre
   74 stylés, le nombre ne discrimine pas — il va dans le mauvais sens. Les
   deux garde-fous de la spec gardent donc un périmètre réel mais étroit, écrit
   dans son en-tête pour ne pas être relu plus large : ils attrapent une page
   où axe n'a mesuré **aucun** texte (page blanche, injection ratée, URL sans
   contenu), pas une page mal stylée.

Leçon générale, troisième occurrence dans ce dépôt : un garde-fou qu'on n'a pas
vu rouge est une intention, pas une protection.

### Le minifieur peut détruire une déclaration correcte

**Mesuré le 08.10**, et c'est le défaut le plus instructif trouvé jusqu'ici :
une source juste peut être servie morte.

La révélation au scroll s'écrivait en trois déclarations correctes —
`animation: reveal-fade linear both`, puis `animation-timeline: view()`, puis
`animation-range`. Le CSS servi, lui, portait :

```css
animation: linear both reveal-fade view()
```

Or le raccourci `animation` **n'accepte aucune valeur de timeline**. Poser cette
déclaration dans un navigateur donne `cssText: ""` : elle est rejetée **en
entier**, donc `animation-name: none`. L'animation n'a donc jamais tourné en
production, depuis sa mise en place, sans que personne le voie — ni la source,
qui était correcte, ni l'œil, le contenu restant lisible.

**Attribution mesurée, pas devinée** : les deux minifieurs sont présents dans ce
dépôt (`esbuild` via Vite, `lightningcss` via la passe d'optimisation de
Tailwind 4). Rejouer `lightningcss` **seul** sur l'extrait reproduit la sortie
fautive à l'octet. Le garde `@supports` est innocent :
`CSS.supports('animation-timeline', 'view()')` vaut `true` sur Chromium.

Le correctif est d'écrire **tous les longhands** et aucun raccourci : mesuré,
`lightningcss` ne reconstruit pas le raccourci à partir des longhands. Deux
contournements testés ont échoué ou sont pires — **deux règles au même
sélecteur** sont fusionnées, raccourci reconstruit inclus, et une indirection
par `var()` marche mais rend la règle illisible. Comme rien ne garantit qu'une
version future ne se remettra pas à fusionner, c'est `gate/reveal-css.spec.ts`
qui tient la garantie, et pas une confiance dans le minifieur.

Leçon transférable : pour une propriété récente portée par un raccourci,
**l'assertion doit porter sur les octets servis**, pas sur la source.

Et un effet de bord à ne pas rater : réparer une animation d'apparition
**rallume son mode de panne**. À l'impression il n'y a pas de scrollport, donc
une timeline de vue ne progresse jamais et `animation-fill-mode: both` fige les
sections à opacité 0 — mesuré sous `media: print`, 11 `.reveal` sur 11. D'où la
portée `screen` du bloc. Tant que le raccourci était rejeté, l'impression était
intacte **par accident**.

### Lire le CSSOM : un `CSSStyleRule` a lui aussi des `cssRules`

**Mesuré le 08.10** en écrivant la spec. Depuis le nesting CSS, une règle de
style expose une collection `cssRules` (vide la plupart du temps), exactement
comme `@media` ou `@supports`. Un parcours récursif qui descend *dès que*
`cssRules` existe saute donc **toutes** les règles de style et ne trouve jamais
rien : premier jet rouge pour cette raison, pas pour un défaut du site. Tester
`selectorText` d'abord.

Deuxième piège de la même famille : chercher une déclaration dans **toute** la
feuille au lieu du bloc concerné. `animation-timeline:view()` figure aussi dans
la condition `@supports (animation-timeline:view())` — l'assertion restait donc
verte alors que la mutation avait supprimé la déclaration de la règle. Trouvé
par mutation, et c'est précisément à ça que servent les mutations : l'assertion
ne mesurait rien.

### Une opacité lue à l'ouverture n'est pas déterministe

**Mesuré neuf fois le 08.10** sur le même build, au même `scrollY`, au même
viewport : l'opacité des `.reveal` à l'ouverture, sous `no-preference`, rend
`0` ou `1` selon le run. **Cause inconnue** — ce n'est pas une explication qui
manque de place, c'est une mesure qui n'a pas été faite. Aucune spec n'assère
donc là-dessus.

L'invariant utile n'est de toute façon pas celui-là. « Tous les `.reveal` à
opacité 1 » n'était vrai que **tant que l'animation était morte** : une
révélation au scroll qui fonctionne laisse légitimement à 0 ce qui n'est pas
encore entré dans la vue. La formulation qui protège le lecteur est « aucun
contenu ne **reste** masqué » : amener l'élément dans la vue, puis **attendre**
l'opacité 1 avec une borne.

Et pour l'y amener, `scrollIntoViewIfNeeded()` est le mauvais instrument : il
fait défiler le **minimum**, donc il laisse l'élément collé au bord du viewport,
là où la plage `entry 0% cover 20%` n'est légitimement pas terminée. Mesuré :
rouge sur le 6e élément, sans aucun défaut du site. Centrer.

### Le cache de contenu rend INVISIBLE toute mutation d'un plugin Markdown

**Mesuré le 09.10, et c'est le piège le plus coûteux rencontré sur la suite** :
`node_modules/.astro/data-store.json` garde le HTML rendu des collections de
contenu. Il est invalidé quand un fichier source change, et quand
`astro.config.mjs` change — mais **pas** quand change un module que la config
importe, comme un plugin Markdown.

Conséquence directe : en vérifiant `satteri-scrollable-tables.mjs`, quatre
mutations successives du plugin ont toutes laissé le HTML identique, donc la
suite verte. Retirer `tabIndex`, puis `role="region"` : le HTML servait encore
les deux. Une suite verte ne disait donc **rien** du plugin, et sans vider le
cache on aurait pu livrer un plugin mort en croyant l'avoir prouvé.

La règle : **avant toute mutation d'un plugin Markdown, `rm -rf
node_modules/.astro`**. Avec le cache vidé, les mêmes mutations rougissent
immédiatement, et l'invariant nomme l'attribut manquant.

Même famille que `astro preview` et `DOMContentLoaded` : ce n'est pas le site
qui décidait du verdict, c'est l'état de la machine.

### Sätteri sérialise `tabindex` en tout ou rien

**Mesuré le 09.10**, avec le cache vidé à chaque essai : `tabIndex: 0`,
`tabIndex: -1`, `tabIndex: 5` et la forme littérale `'tabindex': '3'` sortent
**toutes** `tabindex="0"` dans le HTML. Seule la présence de la propriété
compte ; sa valeur est ignorée.

Deux conséquences. On ne peut pas désactiver le focus en passant `-1` depuis un
plugin hast — il faut ne pas poser la propriété. Et une assertion écrite sur la
source du plugin ne mesurerait rien : `invariants/scrollable-tables.spec.ts`
assère donc sur **les octets servis**, et son seul levier de mutation est la
suppression de la propriété, pas le changement de sa valeur.

### Tailwind scanne les tests, les configs racine et la documentation

Tailwind 4 détecte ses sources automatiquement, et le périmètre est plus large
qu'on ne le croit. **Mesuré les 07 et 08.10, par élimination** : sont scannés
`tests/` (versionné), les fichiers de config à la racine (comme
`astro.config.mjs` l'est déjà), `scripts/`, **`docs/`, `.github/` et
`CLAUDE.md` lui-même** ; en revanche la feuille de style elle-même ne l'est
pas — un commentaire de `global.css` contenant `.inline{display:inline}`
n'a rien produit.

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
@source not "../../docs";
@source not "../../.github";
@source not "../../CLAUDE.md";
```

L'exclusion de `scripts/` protège aussi `scripts/og-image.mjs`, qui était
exposé au même piège depuis le début.

**`docs/`, `.github/` et `CLAUDE.md` sont exclus depuis le 09.10**, et la
mesure qui a motivé l'exclusion a corrigé au passage ce que ce paragraphe
affirmait avant elle.

Ce qui était écrit ici : leur prose apportait **deux** règles au CSS servi —
`.block` (21 octets) « venue de l'entrée de journal qui documente justement
l'incident du mot "block" », et `.contents` (27 octets) venue de
`permissions: contents: read` dans `deploy.yml` —, soit **48 octets** à gagner.

**Mesuré le 09.10 : c'est 27 octets, et une seule règle.** L'exclusion appliquée
puis le build diffé règle par règle contre la production ne retire que
`.contents` (18 863 → 18 836 octets, hash `CerI2rm-` → `DRDROTEC`).

`.block` survit, parce que sa source n'a jamais été le journal : c'est la prose
d'un **article EN publié** (`src/content/blog/en/accessible-at-71-percent.md`,
« what would block the most people », introduite par #50 et jamais retirée —
cohérent avec la décision de ne pas réécrire la copy pour 21 octets inutilisés).
Isolé en excluant ce seul fichier **en plus** des trois : la règle disparaît
alors. `Portfolio.astro` n'y est pour rien non plus, bien qu'il contienne
`portfolio.blocks.map((block) => …)` — l'extracteur ne capte pas cet
identifiant dans ce contexte, et la même mesure le montre.

**La leçon est doctrinale, pas comptable** : le journal *et* l'article
produisaient la même règle, donc retirer le journal seul ne la retirait pas.
L'attribution a pris une co-occurrence pour une cause, et le chiffre est resté
faux trois PR durant parce qu'il avait la forme d'une mesure. Quand deux sources
peuvent produire le même octet, en exclure une ne prouve rien sur l'autre :
il faut les isoler une par une.

**Et le motif réel de l'exclusion n'a jamais été les octets** : c'est qu'aucune
règle du CSS servi ne dépend plus de la documentation. Une retouche de prose
dans `docs/`, `.github/` ou `CLAUDE.md` ne peut donc plus déplacer le hash —
ce qui, avant, polluait la vérification de hash de la PR suivante (arrivé une
fois de plus le 08.10, pour 29 octets, au prix d'une enquête `diff` par règle).
Corollaire utile : **les mots pièges peuvent désormais être nommés** dans ces
trois endroits, ce qui était interdit tant qu'ils étaient scannés.

Contrôle qui tranche, à refaire après tout ajout de fichier à la racine :

```bash
npm run build && ls dist/_astro/
```

**Le hash attendu n'est pas écrit ici, et c'est délibéré** : il vit dans la
section « Vérification » de `CLAUDE.md`, en un seul endroit. Il a été écrit en
dur ici pendant un temps, et il y a été **périmé deux fois** — à T27, puis à
T31 —, chaque fois parce qu'on avait mis à jour `CLAUDE.md` en oubliant ce
fichier. Deux copies d'un nombre qui bouge à chaque changement de CSS font une
copie fausse.

S'il bouge, diffe les deux CSS **règle par règle** avant de conclure : un hash
différent ne veut pas dire régression de style.

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
  scroll derrière `@media screen and (prefers-reduced-motion: no-preference)`.
  Motion réduit, ils restent à opacité 1 et les assertions sont déterministes.
  Le gate ne doit jamais dépendre de l'avancement d'une animation — ce que
  `gate/reveal-css` respecte en lisant le CSSOM et les octets servis, jamais un
  rendu animé.
- **Retries à 0 dans le gate.** Un gate est une mesure à tentative unique ; les
  retries sont un instrument de mesure de l'instabilité, pas un comportement de
  gate. Les deux ne partagent jamais le même run — et le quality gate d'Allure
  est de toute façon incompatible avec les retries.
- **Une spec qui lit du STYLE navigue avec `gotoStyled`**, jamais avec
  `page.goto(..., { waitUntil: 'domcontentloaded' })` — voir le piège
  correspondant. Celles qui ne lisent que du DOM gardent `domcontentloaded`,
  qui est plus rapide et correct.
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
| Image Open Graph de la mauvaise locale | `seo-meta` rouge, en nommant la locale |
| `left: -9999px` vers `left: 0` sur le lien d'evitement | `skip-link` rouge |
| Mot interdit dans une ligne de **code** du generateur Open Graph | `og-copy` rouge, avec le numero de ligne |
| Mot interdit dans un **commentaire** du generateur | **passe** — le filtre fait ce qui etait prevu, verifie dans les deux sens |
| Feuille de style externe chargee par le layout | `zero-external` rouge cote fichiers **et** cote navigateur |
| Slug avec espaces et accent | `sitemap` rouge sur les URLs encodees, `blog-contract` rouge sur le kebab-case |
| Une police auto-hebergee supprimee | `assets` rouge, trois messages |
| Une entree retiree de la liste d'exception 375px | rouge en « NOUVEAU » |
| `prod-http` pointe le preview local au lieu de la production | rouge sur le garde-fou : « aucun lien non canonique ne redirige » |
| Une URL de depot morte dans la cartographie | `external-links` rouge, URL nommee, et la parite FR/EN rouge aussi |
| `.reveal { opacity: 0 }` sans animation pour le rattraper | `reduced-motion` rouge sur le contenu masqué |

Mutations exécutées le 08.10, sur la révélation au scroll :

| Mutation | Résultat |
|---|---|
| Retour au raccourci `animation: reveal-fade linear both` + `animation-timeline` (le défaut d'origine) | `reveal-css` rouge **3 fois** : raccourci porteur de timeline, longhand absent du bloc, CSSOM qui a rejeté la déclaration |
| Retrait du garde `screen` de la media query | `reveal-css` rouge 2 fois (portée, puis condition lue dans le CSSOM) et `reduced-motion` rouge sur l'impression |
| Suppression de `animation-timeline: view()` | `reveal-css` rouge 2 fois — et c'est la mutation qui a révélé qu'une des deux assertions ne mesurait rien, corrigée aussitôt |
| Keyframe d'arrivée passée à `opacity: 0.2` | `reduced-motion` rouge sur « aucun contenu ne RESTE masqué », en nommant l'index de l'élément |

Mutations exécutées le 10.10, sur `a11y/axe` — une par assertion, et la
dernière a corrigé l'assertion au lieu de la confirmer :

| Mutation | Résultat |
|---|---|
| `--color-muted` passé de `#8b949e` à `#3a4148` | rouge sur **toutes** les pages, en nommant la règle, la gravité `serious`, le nombre de nœuds (32 sur un index, 11 sur un article) et les premiers sélecteurs |
| Dégradé posé sur `.section-alt`, donc derrière du texte **hors** du Hero | rouge sur les 2 pages qui portent cette classe, en nommant les 8 sélecteurs devenus indécis (`#preuves > .wrap > h2`, etc.) — c'est la règle de bornage, pas une liste |
| `background-image` (data-URI) sur `.section-alt` | rouge sur le **motif nouveau** `bgImage`, qui n'est ni `bgGradient` ni `imgNode` : la carte des motifs n'est pas décorative |
| Page stylée mais vidée de son `<body>` | rouge sur les deux garde-fous à la fois (`contrastePasses: 0`, `inapplicable: true`) |
| Feuille `_astro/*.css` coupée (`route.abort`), navigation en `domcontentloaded` | **passe** — et c'est la mutation qui a corrigé l'énoncé, voir le piège ci-dessous. axe rend 0 violation et 85 nœuds conformes sur une page non stylée. `gotoStyled`, lui, échoue bien dans le même scénario. |

Et une mesure qui n'est pas une mutation mais qui vaut autant : **pointer la
suite sur la production**. Avant `gotoStyled`, `motion` y échouait 2 fois sur 2
en annonçant un défaut inexistant ; après, `motion`, `gate-desktop` et
`gate-mobile` y sont verts 2 passes sur 2. C'est ce qui a révélé la course
documentée plus haut, et c'est devenu une vérification à refaire après tout
changement de spec lisant du style :

```
PW_NO_SERVER=1 PW_BASE_URL=https://bazanjeremy.github.io npx playwright test --project=motion
```

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
| `qa-nightly.yml` | `schedule` 04:17 UTC + `workflow_dispatch` | Ce que le gate ne fait délibérément pas. |

### Le nocturne

Il fait les deux choses qu'un gate ne peut pas faire sans devenir faux ou
instable : regarder la **production** (le 301 de GitHub Pages n'existe pas sous
`astro preview`) et dépendre de **tiers** et d'autres moteurs de rendu.

C'est aussi le run d'**instrument**, par opposition au run de **gate** :
retries à 2 et quality gate Allure désactivé. Un gate est une mesure à
tentative unique ; les retries sont un instrument de mesure de l'instabilité,
pas un comportement de gate — et le quality gate d'Allure est de toute façon
incompatible avec les retries. Les deux ne partagent jamais le même run.

Trois jobs. `resolve` ne fait rien d'autre que transformer les entrées en plan,
et l'écrit dans le résumé du run : les paramètres effectifs apparaissent ainsi
en **un seul endroit**, ce qui compte le jour où la question devient « qu'a
exactement lancé le nocturne de mardi ? ». Puis `live` (contre la production)
et `preview` (contre un build frais) tournent selon ce plan.

**Entrées du lancement manuel** : `suite`
(`full` · `live` · `gate` · `cross-browser` · `motion` · `a11y` · `prod-http` ·
`external-links`), `browsers`, `retries`. ⚠️ Le plan de `resolve` **énumère** ses
projets : un projet nouveau est absent de `full` jusqu'à ce qu'on l'y nomme —
`a11y-axe` y a été ajouté explicitement, et le prochain devra l'être aussi. Sur un déclenchement `schedule` le
contexte `inputs` est vide, donc `inputs.x` vaut `''` — les défauts `||` du job
`resolve` **sont** le contrat du nocturne. L'asymétrie est voulue : le défaut
du lancement manuel est `chromium`, parce qu'un humain qui lance à la main veut
une réponse rapide, alors que le `schedule` prend les trois moteurs.

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

**Le niveau informatif existe, est vide, et NE PEUT PAS être utilisé tel
quel.** L'action accepte `check-projects`, dont l'échec ne produit qu'une
annotation d'avertissement — mais mesuré le 10.10 en y branchant axe, le job
devient rouge quand même. Les deux runs écrivent dans le **même**
`allure-results`, le quality gate porte `maxFailures: 0`, et l'étape de rapport
n'est délibérément pas en `continue-on-error` : 150 résultats bloquants verts
plus 2 échecs informatifs donnent `maxFailures actual 2` et un code de sortie 1.
L'annotation s'affiche, puis le job échoue — le pire des deux mondes, puisqu'on
croyait ne pas bloquer.

⚠️ Et la première tentative de mesure avait **conclu l'inverse**, par un défaut
de la mesure elle-même : lancer le run informatif avec `--reporter=line`
**remplace tout le tableau `reporter`** de la config, reporter Allure compris.
Aucun résultat n'était donc écrit, le quality gate ne voyait que les 150 du run
bloquant, et tout semblait aller. L'action, elle, ne passe aucun `--reporter`.
Reproduire un comportement de CI exige la **commande de la CI**, pas une
commande voisine.

Rendre ce niveau réel demanderait un dossier de résultats à lui (variable
d'environnement sur le reporter `allure-playwright`) et son propre artefact de
rapport, pour que le quality gate ne couvre jamais que le bloquant. **Non fait**
— inutile tant que l'entrée est vide, et `a11y-axe` est donc dans `projects`,
où un contrôle qui fait échouer le job porte enfin le nom de ce qu'il est.
Les liens externes et les autres moteurs restent dans le nocturne.

## Pas encore en place

- **La persistance de l'historique Allure et du JUnit.** `historyPath` pointe
  `.qa-history/allure/history.jsonl`, mais rien ne le conserve encore entre
  deux runs : les tendances du rapport sont donc vides. Repoussé dans son
  propre changement, parce que cela demande une branche de stockage et une
  poussée depuis la CI — une surface de risque distincte, qui mérite sa propre
  relecture.
- **Pas de vérification de types.** `tsconfig.json` est strict et couvre
  `tests/`, mais `astro build` ne lance pas `tsc` : les erreurs de type ne sont
  donc visibles que dans l'éditeur. Un script `typecheck` exigerait
  `@astrojs/check` et `typescript` en devDependencies — **deux dépendances non
  approuvées**, donc non ajoutées. À arbitrer.
- **Le contraste de 10 nœuds de l'accueil reste INCONNU.** Ce n'est pas un
  défaut trouvé, ni un contrôle oublié : axe refuse de trancher, et refuser est
  son comportement correct. `a11y/axe` borne cette indécision par une règle et
  la fait apparaître dans le rapport, mais ne la lève pas. Mesuré le 10.10 :
  6 nœuds du Hero (`.hero__bg` empile deux `radial-gradient`) et 4 liens de
  navigation (`.header-blur` est translucide, et le `<svg>` `.hero__arcs` passe
  dessous), sur les deux accueils FR et EN. La lever demanderait soit un
  vérificateur maison — rejeté plus haut, point 2 —, soit un changement de
  design qui rende le fond réductible à une couleur sous ces textes. **À
  arbitrer, et à ne pas relire comme « conforme ».**
- **Le niveau informatif de l'action composite.** Voir « En CI » : il existe
  mais bloque quand même. Son correctif est décrit là-bas et non appliqué.
