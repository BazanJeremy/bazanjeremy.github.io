/**
 * NUIT — jamais bloquant. Projet `motion` (`reducedMotion: 'no-preference'`).
 *
 * La SEULE spec autorisée à s'intéresser au mouvement. Tout le reste de la
 * suite tourne en `reduce`, ce qui fige les `.reveal` à opacité 1 et rend les
 * assertions déterministes ; c'est ici, et seulement ici, qu'on vérifie que le
 * mouvement existe quand il est demandé, et qu'il disparaît quand il ne l'est
 * pas.
 *
 * DÉFAUT TROUVÉ EN ÉCRIVANT CETTE SPEC, mesuré le 08.10 : l'animation de
 * révélation au scroll est MORTE en production, et l'a toujours été. La source
 * est correcte, en trois déclarations :
 *
 *     animation: reveal-fade linear both;
 *     animation-timeline: view();
 *     animation-range: entry 0% cover 20%;
 *
 * mais le minifieur CSS les fusionne en un seul raccourci :
 *
 *     animation: linear both reveal-fade view()
 *
 * Or `animation-timeline` n'est pas une valeur acceptée par le raccourci
 * `animation`. Vérifié dans le navigateur : poser ce raccourci donne
 * `cssText: ""` — la déclaration est rejetée en entier — d'où
 * `animation-name: none` et `animation-timeline: auto`. La forme source, elle,
 * donne bien `animation-name: reveal-fade`. Et le CSS servi par la production
 * est identique à l'octet au build local, donc c'est l'état livré.
 *
 * Conséquence pour le visiteur : aucune. Le contenu reste à opacité 1, donc
 * rien n'est caché — c'est un embellissement absent, pas une régression de
 * contenu. C'est précisément pour ça que personne ne l'a vu.
 *
 * Le correctif est côté CSS, donc il change les octets servis : il mérite sa
 * propre PR.
 */
import { test, expect } from '@playwright/test';
import { readDistText, requireDist } from '../fixtures/dist.ts';
import { listFiles } from '../fixtures/dist.ts';

interface RevealState {
  readonly supportsViewTimeline: boolean;
  readonly count: number;
  readonly animationNames: readonly string[];
  readonly opacities: readonly string[];
  readonly prefersReduce: boolean;
}

const readReveal = () => ({
  supportsViewTimeline: CSS.supports('animation-timeline', 'view()'),
  count: document.querySelectorAll('.reveal').length,
  animationNames: [...document.querySelectorAll('.reveal')].map(
    (el) => getComputedStyle(el).animationName,
  ),
  opacities: [...document.querySelectorAll('.reveal')].map(
    (el) => getComputedStyle(el).opacity,
  ),
  prefersReduce: matchMedia('(prefers-reduced-motion: reduce)').matches,
});

test.describe('Mouvement et prefers-reduced-motion', () => {
  test('le contenu n\'est JAMAIS masqué, dans les deux préférences', async ({ page }) => {
    // L'assertion qui compte vraiment. Une animation d'apparition qui part de
    // `opacity: 0` et ne se déclenche pas laisse du contenu invisible — c'est
    // le mode de panne grave de ce motif, et il toucherait d'abord les
    // lecteurs qui désactivent les animations.
    for (const pref of ['no-preference', 'reduce'] as const) {
      await page.emulateMedia({ reducedMotion: pref });
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      const s: RevealState = await page.evaluate(readReveal);
      expect(s.count, 'aucun élément .reveal — le scan ne vérifiait rien').toBeGreaterThan(0);
      expect(
        [...new Set(s.opacities)],
        `avec prefers-reduced-motion: ${pref}, des .reveal ne sont pas à opacité 1`,
      ).toEqual(['1']);
    }
  });

  test('sous `reduce`, aucune animation n\'est appliquée', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const s: RevealState = await page.evaluate(readReveal);
    expect(s.prefersReduce, 'l\'émulation de reduce n\'a pas été appliquée').toBe(true);
    expect([...new Set(s.animationNames)], 'une animation subsiste malgré reduce').toEqual(['none']);
  });

  test('les keyframes de la révélation existent dans le CSS livré', () => {
    // Garde-fou pour le jour où le raccourci sera corrigé : la correction n'a
    // de sens que s'il reste quelque chose à animer.
    requireDist();
    const css = listFiles().filter((f) => f.endsWith('.css')).map((f) => readDistText(f)).join('\n');
    expect(css, 'les keyframes `reveal-fade` ont disparu du CSS').toContain('@keyframes reveal-fade');
  });

  test('sous `no-preference`, la révélation au scroll est active', async ({ page }) => {
    // DÉFAUT CONNU — voir l'en-tête de ce fichier. Marqué `test.fail()` : la
    // spec écrit le comportement VOULU, reste verte tant que le défaut existe,
    // et passera au rouge le jour où le raccourci sera corrigé, ce qui invitera
    // à retirer le marqueur.
    test.fail();

    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const s: RevealState = await page.evaluate(readReveal);

    // Précondition : si le moteur ne supportait pas les timelines de vue, le
    // garde `@supports` désactiverait l'animation À RAISON, et conclure à un
    // défaut serait faux.
    expect(
      s.supportsViewTimeline,
      'ce moteur ne supporte pas `animation-timeline: view()` — le repli @supports est alors correct',
    ).toBe(true);
    expect(s.prefersReduce).toBe(false);

    expect(
      [...new Set(s.animationNames)],
      'la révélation au scroll ne s\'applique pas : le minifieur a fusionné ' +
        '`animation` et `animation-timeline` en un raccourci invalide',
    ).toEqual(['reveal-fade']);
  });
});
