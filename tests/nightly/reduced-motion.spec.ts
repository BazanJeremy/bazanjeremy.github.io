/**
 * NUIT — jamais bloquant. Projet `motion` (`reducedMotion: 'no-preference'`).
 *
 * La SEULE spec autorisée à s'intéresser au mouvement. Tout le reste de la
 * suite tourne en `reduce`, ce qui fige les `.reveal` à opacité 1 et rend les
 * assertions déterministes ; c'est ici, et seulement ici, qu'on vérifie que le
 * mouvement existe quand il est demandé, et qu'il disparaît quand il ne l'est
 * pas.
 *
 * LE DÉFAUT QUE CETTE SPEC AVAIT TROUVÉ EST CORRIGÉ. Pour mémoire : la
 * révélation au scroll était morte en production depuis sa mise en place, le
 * minifieur refusionnant `animation` et `animation-timeline` en un raccourci
 * que le navigateur rejette en entier. Le correctif (longhands + portée
 * `screen`) et les assertions sur les octets servis vivent dans
 * `tests/gate/reveal-css.spec.ts`, qui est BLOQUANT : un défaut qui a survécu
 * à toutes les revues manuelles n'a pas à attendre la nuit pour être vu.
 * Ici reste le comportement, qui demande du mouvement réel.
 *
 * CE QU'ON N'ASSÈRE PAS, ET POURQUOI. L'opacité des `.reveal` À L'OUVERTURE
 * sous `no-preference` n'est PAS assérée : mesurée neuf fois le 08.10 sur le
 * même build, au même `scrollY` et au même viewport, elle rend `0` ou `1`
 * selon le run. CAUSE INCONNUE — ce n'est pas une explication qui manque de
 * place, c'est une mesure qu'on n'a pas faite. Assérer là-dessus fabriquerait
 * exactement le faux positif que ce dépôt refuse. L'invariant utile n'est de
 * toute façon pas celui-là : c'est qu'aucun contenu ne RESTE masqué.
 *
 * Car l'invariant d'origine (« tous les `.reveal` à opacité 1, dans les deux
 * préférences ») était vrai seulement TANT QUE l'animation était morte. Une
 * révélation au scroll qui fonctionne laisse légitimement à opacité 0 ce qui
 * n'est pas encore entré dans la vue — c'est l'effet lui-même. La formulation
 * qui protège réellement le lecteur est donc : sous `reduce`, rien n'est animé
 * et tout est visible ; sous `no-preference`, tout élément entré dans la vue
 * atteint l'opacité 1.
 */
import { test, expect } from '@playwright/test';

/** Nombre d'éléments et leurs styles calculés, en une seule évaluation. */
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
  test('sous `reduce`, rien n\'est animé et rien n\'est masqué', async ({ page }) => {
    // Le cas déterministe, et celui qui porte le risque le plus grave : une
    // apparition partant de `opacity: 0` et jamais déclenchée laisserait du
    // contenu invisible, et ça toucherait d'abord les lecteurs qui désactivent
    // les animations. Sous `reduce`, le bloc ne matche pas du tout : il n'y a
    // ni animation ni raison d'attendre quoi que ce soit.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const s = await page.evaluate(readReveal);
    expect(s.prefersReduce, 'l\'émulation de reduce n\'a pas été appliquée').toBe(true);
    expect(s.count, 'aucun élément .reveal — le scan ne vérifiait rien').toBeGreaterThan(0);
    expect(
      [...new Set(s.animationNames)],
      'une animation subsiste malgré reduce',
    ).toEqual(['none']);
    expect(
      [...new Set(s.opacities)],
      'sous reduce, des .reveal ne sont pas à opacité 1 — du contenu est masqué',
    ).toEqual(['1']);
  });

  test('sous `no-preference`, la révélation au scroll est active', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const s = await page.evaluate(readReveal);

    // Précondition : si le moteur ne supportait pas les timelines de vue, le
    // garde `@supports` désactiverait l'animation À RAISON, et conclure à un
    // défaut serait faux.
    test.skip(
      !s.supportsViewTimeline,
      'ce moteur ne supporte pas `animation-timeline: view()` — le repli @supports est alors correct',
    );

    expect(s.prefersReduce).toBe(false);
    expect(s.count).toBeGreaterThan(0);
    expect(
      [...new Set(s.animationNames)],
      'la révélation au scroll ne s\'applique pas — c\'était le mode de panne du raccourci fusionné',
    ).toEqual(['reveal-fade']);
  });

  test('aucun contenu ne RESTE masqué : chaque .reveal atteint l\'opacité 1 dans la vue', async ({
    page,
  }) => {
    // L'assertion qui compte. On ne lit pas une opacité à un instant choisi au
    // hasard : on amène l'élément dans la vue et on ATTEND qu'il devienne
    // visible, avec une borne. Un élément qui resterait masqué fait expirer
    // l'attente — rouge pour la bonne raison, et sans tolérer un vrai défaut.
    //
    // CENTRÉ, et pas `scrollIntoViewIfNeeded()`. Mesuré le 08.10 : cette
    // méthode fait défiler le MINIMUM, donc elle laisse l'élément collé au bord
    // du viewport — où la plage `entry 0% cover 20%` n'est légitimement pas
    // terminée, d'où une opacité intermédiaire. Le premier jet échouait pour
    // cette raison, pas pour un défaut du site : c'était l'instrument de mesure
    // qui était faux.
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const count = await page.locator('.reveal').count();
    expect(count, 'aucun élément .reveal — le scan ne vérifiait rien').toBeGreaterThan(0);

    for (let i = 0; i < count; i += 1) {
      await page.evaluate(
        (index) =>
          document
            .querySelectorAll('.reveal')[index]
            ?.scrollIntoView({ block: 'center', behavior: 'instant' }),
        i,
      );
      await page
        .waitForFunction(
          (index) => {
            const el = document.querySelectorAll('.reveal')[index];
            return !!el && getComputedStyle(el).opacity === '1';
          },
          i,
          { timeout: 5_000 },
        )
        .catch(() => {
          throw new Error(
            `le .reveal n°${i} n'atteint pas l'opacité 1 après être entré dans la vue : ` +
              'du contenu reste masqué pour un lecteur qui fait défiler la page',
          );
        });
    }
  });

  test('à l\'impression, rien n\'est animé et rien n\'est masqué', async ({ page }) => {
    // Garde introduit avec le correctif, et mesuré AVANT de l'écrire : à
    // l'impression il n'y a pas de scrollport, donc une timeline de vue ne
    // progresse jamais et `animation-fill-mode: both` figeait les 11 `.reveal`
    // à opacité 0 — des pages blanches. Tant que le raccourci était rejeté,
    // l'impression était intacte par accident ; c'est la portée `screen` du
    // bloc qui la préserve maintenant que l'animation fonctionne.
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.emulateMedia({ media: 'print' });

    const s = await page.evaluate(readReveal);
    expect(s.count).toBeGreaterThan(0);
    expect(
      [...new Set(s.animationNames)],
      'une animation s\'applique à l\'impression : la portée `screen` a disparu du bloc',
    ).toEqual(['none']);
    expect(
      [...new Set(s.opacities)],
      'des .reveal sont à opacité 0 à l\'impression — la page s\'imprimerait blanche par endroits',
    ).toEqual(['1']);
  });
});
