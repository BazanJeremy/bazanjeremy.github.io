/**
 * GATE — bloquant.
 *
 * Risque : probabilité moyenne × impact haut. Les contrastes WCAG AA étaient le
 * seul contrôle que la suite ne reprenait pas, et un défaut de contraste ne
 * casse rien au build : il ne se voit que chez le lecteur qu'il exclut.
 *
 * POURQUOI BLOQUANT, alors que le plan écrit visait le niveau informatif. Deux
 * mesures du 10.10 ont changé la réponse, et dans cet ordre.
 *
 *   1. Le motif attendu du niveau informatif — « axe est un tiers, donc pas
 *      déterministe » — ne tient pas ici : 0 violation sur les 26 pages, trois
 *      runs verts, aucune dépendance à un tiers au moment du run, et
 *      `@axe-core/playwright` est épinglé EXACT. Un changement de jeu de
 *      règles ne peut donc arriver que dans une PR de dépendance, qui est
 *      exactement l'endroit où l'on veut voir le rouge.
 *   2. Le niveau informatif ne pouvait de toute façon pas être informatif. Les
 *      deux runs de l'action composite écrivent dans le MÊME `allure-results`,
 *      le quality gate porte `maxFailures: 0`, et l'étape de rapport n'est pas
 *      en `continue-on-error`. Reproduit : 150 résultats bloquants verts plus
 *      2 échecs informatifs donnent `maxFailures actual 2` et un code de
 *      sortie 1, donc un job rouge. Un contrôle qui fait échouer le job EST un
 *      gate ; le nommer autrement n'aurait trompé que nous. Détail dans
 *      `.github/actions/qa/action.yml`, entrée `check-projects`.
 *
 * TROIS CHOSES DISTINCTES, et la troisième est la seule qui ne soit pas
 * évidente.
 *
 * 1. AUCUNE VIOLATION sur les 26 pages, règles WCAG 2.0 et 2.1 niveaux A et AA.
 *    Mesuré le 10.10 : 0 violation sur 26 pages, axe-core 4.13.0. Les
 *    étiquettes `best-practice` d'axe sont délibérément EXCLUES — ce sont des
 *    opinions d'outil, pas des critères de conformité, et les mélanger ferait
 *    porter au gate des règles qu'aucun référentiel n'exige.
 *
 * 2. LA RÈGLE DE CONTRASTE A TROUVÉ QUELQUE CHOSE À MESURER — et ce point est
 *    plus faible que je ne l'avais écrit, la mesure ayant corrigé l'énoncé.
 *
 *    L'intention était de se protéger de la course documentée dans
 *    `fixtures/styled-page.ts` : lire du style avant que la feuille externe
 *    soit appliquée. MESURÉ le 10.10, feuille `_astro/*.css` coupée par
 *    `page.route(...).abort()` et navigation en `domcontentloaded` : axe rend
 *    **0 violation et 85 nœuds de contraste CONFORMES**, sans rien déclarer
 *    d'inapplicable ni d'indécis. Il mesure tranquillement le noir sur blanc
 *    par défaut du navigateur. Donc un run d'axe vert ne dit RIEN tant que la
 *    feuille n'est pas prouvée appliquée, et aucune assertion de comptage ne
 *    rattrape ça : 85 nœuds non stylés contre 74 stylés, le nombre ne
 *    discrimine pas.
 *
 *    Ce qui protège est donc `gotoStyled`, et lui seul — vérifié dans la même
 *    mesure : sur la page privée de sa feuille, il échoue avec son propre
 *    message. Les deux assertions ci-dessous gardent un périmètre réel mais
 *    ÉTROIT, et il est écrit ici pour ne pas être relu plus large : elles
 *    attrapent une page où axe n'a mesuré aucun texte du tout — page blanche,
 *    injection ratée, catalogue qui pointe une URL sans contenu —, pas une
 *    page mal stylée. Mesuré sur les 26 pages : 31 à 82 nœuds conformes, et
 *    `color-contrast` n'est `inapplicable` sur aucune.
 *
 * 3. L'INDÉCISION EST BORNÉE PAR UNE RÈGLE, PAS PAR UNE LISTE. axe classe en
 *    `incomplete` ce qu'il refuse de trancher, et refuser de trancher est le
 *    comportement correct : un « indécis » n'est pas un « conforme ». Mesuré le
 *    10.10 sur les 26 pages : 10 nœuds indécis, tous sur les deux pages
 *    d'accueil (FR et EN, les mêmes 10 en miroir), avec exactement deux motifs
 *    donnés par axe lui-même :
 *
 *      - `bgGradient` (6 nœuds du Hero) : `.hero__bg` empile deux
 *        `radial-gradient`, donc le fond n'est pas réductible à une couleur.
 *      - `imgNode` (4 liens de navigation) : `.header-blur` vaut
 *        `color-mix(in srgb, var(--color-bg) 82%, transparent)` — le header
 *        `sticky` est TRANSLUCIDE —, et ce qui se trouve derrière, en haut de
 *        l'accueil, est le `<svg>` décoratif `.hero__arcs`. axe voit donc un
 *        nœud image dans la pile de fond.
 *
 *    Les deux causes sont dans la source, pas dans l'instrument. La parade
 *    n'est donc PAS d'énumérer ces 10 sélecteurs : une liste d'exceptions se
 *    périme au premier élément de navigation ajouté, et la leçon de T31 est
 *    qu'une règle vaut mieux qu'une liste. La règle tenue ici : un nœud indécis
 *    n'est toléré que là où le design met SCIEMMENT du texte au-dessus d'un
 *    dégradé ou du décor — dans le Hero ou dans le header translucide —, et
 *    seulement avec ces deux motifs. Un dégradé posé derrière du texte
 *    ailleurs, ou un motif d'indécision nouveau, passe au rouge en se nommant.
 *
 *    Ce que cette spec NE dit pas, écrit ici pour qu'on ne le relise pas comme
 *    une garantie : le contraste de ces 10 nœuds reste INCONNU. Il n'est ni
 *    vérifié ni en défaut. Le mesurer demanderait un vérificateur maison, que
 *    `tests/README.md` rejette explicitement au motif qu'un second
 *    vérificateur finirait par contredire le premier.
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { pages } from '../fixtures/pages.ts';
import { gotoStyled } from '../fixtures/styled-page.ts';

/**
 * Conformité seulement. WCAG 2.2 n'est pas exclu par principe mais parce que
 * ses critères automatisables n'apportent rien ici : le site n'a ni formulaire,
 * ni cible tactile dense, ni interaction au survol.
 */
const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] as const;

/** Les deux motifs d'indécision mesurés, et leur cause dans la source. */
const TOLERATED_INCOMPLETE = new Map([
  ['bgGradient', 'texte au-dessus des radial-gradient de .hero__bg'],
  ['imgNode', 'header translucide (.header-blur) au-dessus du <svg> .hero__arcs'],
]);

/** Là où le design met sciemment du texte au-dessus d'un fond non réductible. */
const TOLERATED_CONTAINERS = '.hero, header';

test.describe('Axe — WCAG 2.1 AA', () => {
  for (const p of pages) {
    test(`${p.path} — aucune violation, contraste réellement mesuré`, async ({ page }) => {
      // `gotoStyled` et non `domcontentloaded` : cette spec lit du STYLE
      // CALCULÉ. Voir le point 2 de l'en-tête.
      await gotoStyled(page, p.path);

      const result = await new AxeBuilder({ page }).withTags([...WCAG_AA_TAGS]).analyze();

      // --- 1. Aucune violation ------------------------------------------------
      // Le message localise le défaut : règle, gravité, premiers sélecteurs
      // fautifs. Un « 3 violations » sans sélecteur obligerait à rejouer axe à
      // la main pour savoir quoi corriger.
      const detail = result.violations
        .map((v) => {
          const targets = v.nodes
            .slice(0, 5)
            .map((n) => n.target.join(' '))
            .join(' | ');
          const more = v.nodes.length > 5 ? ` (+${v.nodes.length - 5} autres)` : '';
          return `  · ${v.id} [${v.impact}] ${v.nodes.length} nœud(s) : ${targets}${more}`;
        })
        .join('\n');

      expect(
        result.violations.map((v) => v.id),
        `violations WCAG A/AA sur ${p.path} (axe-core ${result.testEngine.version}) :\n${detail}`,
      ).toEqual([]);

      // --- 2. La règle de contraste a tourné ----------------------------------
      const contrastPasses = result.passes.find((r) => r.id === 'color-contrast');
      const contrastInapplicable = result.inapplicable.some((r) => r.id === 'color-contrast');

      expect(
        contrastInapplicable,
        `axe déclare color-contrast INAPPLICABLE sur ${p.path} : la page n'aurait donc aucun ` +
          "texte du tout, ce qui ne peut pas être vrai. Chercher une page blanche, une " +
          "injection d'axe ratée, ou un catalogue qui pointe une URL sans contenu — pas un " +
          'défaut de style, qu\'axe ne verrait de toute façon pas (cf. en-tête, point 2).',
      ).toBe(false);

      expect(
        contrastPasses?.nodes.length ?? 0,
        `aucun nœud CONFORME au contraste sur ${p.path} : la règle n'a trouvé aucun texte à ` +
          'mesurer, donc « aucune violation » est creux. Même cause à chercher que ci-dessus.',
      ).toBeGreaterThan(0);

      // --- 3. L'indécision reste bornée par une règle --------------------------
      const undecidedNodes = result.incomplete.find((r) => r.id === 'color-contrast')?.nodes ?? [];
      if (undecidedNodes.length === 0) return;

      // Le motif, tel qu'axe le nomme lui-même (`messageKey`). Un motif absent
      // de la carte signale une cause NOUVELLE, donc à mesurer avant d'être
      // tolérée.
      const motives = [
        ...new Set(
          undecidedNodes.flatMap((n) =>
            n.any
              .filter((c) => c.id === 'color-contrast')
              .map((c) => String((c.data as { messageKey?: string } | undefined)?.messageKey ?? 'sans-motif')),
          ),
        ),
      ].sort();

      const unknownMotives = motives.filter((m) => !TOLERATED_INCOMPLETE.has(m));
      expect(
        unknownMotives,
        `motif d'indécision NOUVEAU sur ${p.path} : ${unknownMotives.join(', ')}. Les deux ` +
          'motifs mesurés le 10.10 sont bgGradient (dégradés de .hero__bg) et imgNode ' +
          '(header translucide au-dessus du <svg> .hero__arcs). Un troisième motif est une ' +
          "cause nouvelle : la mesurer avant de l'ajouter à la carte.",
      ).toEqual([]);

      // LA RÈGLE, et non la liste des 10 sélecteurs : l'indécision n'est
      // tolérée que dans le Hero ou le header translucide.
      const outside = await page.evaluate(
        ({ selectors, containers }) =>
          selectors.filter((sel) => {
            const el = document.querySelector(sel);
            // Un sélecteur qu'on ne retrouve pas est compté DEHORS : on ne
            // tolère pas ce qu'on n'a pas pu situer.
            if (!el) return true;
            return el.closest(containers) === null;
          }),
        {
          selectors: undecidedNodes.map((n) => String(n.target[0])),
          containers: TOLERATED_CONTAINERS,
        },
      );

      expect(
        outside,
        `contraste indécis HORS du Hero et du header sur ${p.path} : ${outside.join(' | ')}. ` +
          "Du texte a été posé au-dessus d'un fond qu'axe ne peut pas réduire à une couleur " +
          "(dégradé, image, transparence) là où ce n'était pas le cas. Son contraste est " +
          'désormais INCONNU, donc non vérifiable par la suite.',
      ).toEqual([]);

      // L'inconnu reste VISIBLE dans le rapport au lieu d'être avalé par un
      // test vert : c'est tout l'intérêt de le borner plutôt que de l'ignorer.
      test.info().annotations.push({
        type: 'contraste inconnu',
        description:
          `${undecidedNodes.length} nœud(s) qu'axe refuse de trancher sur ${p.path} — motifs : ` +
          `${motives.map((m) => `${m} (${TOLERATED_INCOMPLETE.get(m)})`).join(' ; ')}. ` +
          'Ni conforme ni en défaut : inconnu.',
      });
    });
  }
});
