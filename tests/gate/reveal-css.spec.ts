/**
 * GATE — bloquant.
 *
 * Risque : probabilité MOYENNE × impact faible à l'écran, MOYEN à l'impression.
 *
 * Cette spec existe parce que le défaut qu'elle verrouille a vécu en production
 * depuis la mise en place de l'animation sans que personne le voie, revue
 * manuelle comprise. Il n'était visible ni dans la source (correcte) ni à l'œil
 * (le contenu restait lisible) : seulement dans les octets servis.
 *
 * LE DÉFAUT, mesuré le 08.10. La source écrivait le raccourci puis la timeline :
 *
 *     animation: reveal-fade linear both;
 *     animation-timeline: view();
 *
 * et `lightningcss` — la passe d'optimisation de Tailwind 4, PAS esbuild ; les
 * deux sont présents dans ce dépôt, et l'attribution a été mesurée en rejouant
 * le minifieur seul sur l'extrait — les refusionnait en :
 *
 *     animation: linear both reveal-fade view()
 *
 * Or le raccourci `animation` n'accepte aucune valeur de timeline. Poser cette
 * déclaration dans un navigateur donne `cssText: ""` : elle est rejetée EN
 * ENTIER, donc `animation-name: none`. Le garde `@supports` était innocent
 * (`CSS.supports('animation-timeline', 'view()')` vaut bien `true` sur
 * Chromium).
 *
 * TROIS NATURES D'ASSERTION, et c'est voulu :
 *
 *   1. AU NIVEAU DU FICHIER, aucune dépendance à un moteur : aucun raccourci
 *      `animation` ne doit transporter de fonction de timeline. Formulée en
 *      général et non sur `.reveal`, parce que c'est le minifieur qu'on
 *      surveille, pas cette règle-ci. C'est l'assertion qui attrapera une
 *      version future de `lightningcss` qui se remettrait à fusionner.
 *   2. AU NIVEAU DU MOTEUR, via le CSSOM : la déclaration a réellement été
 *      ACCEPTÉE. Un fichier correct qu'un moteur rejette donnerait la même page
 *      morte, et c'est exactement le mode de panne vécu.
 *   3. LA PORTÉE `screen`, parce qu'à l'impression il n'y a pas de scrollport :
 *      une timeline de vue n'y progresse jamais et `animation-fill-mode: both`
 *      figerait les sections à opacité 0. Mesuré sous `media: print` avant ce
 *      garde : 11 `.reveal` sur 11 à opacité 0. Tant que le raccourci était
 *      rejeté, l'impression était intacte PAR ACCIDENT ; réparer l'animation
 *      sans ce garde aurait transformé un embellissement absent en pages
 *      blanches à l'impression.
 *
 * Ce qui n'est PAS ici : l'animation vue comme un comportement (elle progresse,
 * le contenu atteint l'opacité 1). Ça demande `prefers-reduced-motion:
 * no-preference` et de l'avancement d'animation, donc ça vit dans le projet
 * `motion`, en nuit — voir `tests/nightly/reduced-motion.spec.ts`. Un gate ne
 * dépend jamais de l'avancement d'une animation.
 */
import { test, expect } from '@playwright/test';
import { listFiles, readDistText, requireDist } from '../fixtures/dist.ts';

/** Le CSS réellement servi, tous fichiers concaténés. */
function servedCss(): string {
  requireDist();
  const sheets = listFiles().filter((f) => f.endsWith('.css'));
  expect(
    sheets.length,
    'aucune feuille de style dans dist/ — la mesure serait vide',
  ).toBeGreaterThan(0);
  return sheets.map((f) => readDistText(f)).join('\n');
}

/**
 * Les valeurs des raccourcis `animation` du CSS servi. Le préfixe obligatoire
 * écarte `animation-name:` & co : on ne veut QUE le raccourci.
 */
function animationShorthandValues(css: string): string[] {
  return [...css.matchAll(/(?:^|[;{\s])animation\s*:\s*([^;}]+)/g)].map((m) => m[1].trim());
}

/**
 * Les blocs de déclarations dont le sélecteur porte `.reveal`, à blancs
 * supprimés.
 *
 * ON NE CHERCHE PAS DANS TOUT LE FICHIER, et c'est une correction apportée
 * après mutation : `animation-timeline:view()` figure AUSSI dans la condition
 * `@supports (animation-timeline:view())`. Un `toContain` sur la feuille
 * entière restait donc vert alors que la déclaration avait été supprimée de la
 * règle — l'assertion ne mesurait rien.
 */
function revealDeclarationBlocks(css: string): string[] {
  return [...css.matchAll(/([^{}]*)\{([^{}]*)\}/g)]
    .filter((m) => /(?:^|[,\s])\.reveal(?![\w-])/.test(m[1]))
    .map((m) => m[2].replace(/\s+/g, ''));
}

/**
 * Ce que le moteur a retenu de la règle `.reveal`, lu dans le CSSOM.
 *
 * PIÈGE, mesuré en écrivant cette spec : depuis le nesting CSS, un
 * `CSSStyleRule` expose LUI AUSSI une collection `cssRules` (vide la plupart du
 * temps). Un parcours qui descend dès que `cssRules` existe saute donc toutes
 * les règles de style et ne trouve jamais rien — premier jet rouge pour cette
 * raison, pas pour un défaut du site. D'où le test sur `selectorText` d'abord.
 */
const readRevealRuleFromCssom = () => {
  const conditions: string[] = [];
  let hit: { animationName: string; animationTimeline: string; animationFillMode: string } | null =
    null;

  const walk = (rules: CSSRuleList, inherited: readonly string[]): void => {
    for (const rule of [...rules]) {
      const styleRule = rule as CSSStyleRule & { cssRules?: CSSRuleList };
      if (typeof styleRule.selectorText === 'string') {
        if (styleRule.selectorText === '.reveal' && styleRule.style?.animationName) {
          hit = {
            animationName: styleRule.style.animationName,
            animationTimeline: styleRule.style.animationTimeline,
            animationFillMode: styleRule.style.animationFillMode,
          };
          conditions.push(...inherited);
        }
        if (styleRule.cssRules?.length) walk(styleRule.cssRules, inherited);
        continue;
      }

      const group = rule as CSSRule & {
        cssRules?: CSSRuleList;
        conditionText?: string;
        media?: MediaList;
      };
      if (group.cssRules) {
        const own = group.media?.mediaText ?? group.conditionText ?? '';
        walk(group.cssRules, own ? [...inherited, own] : inherited);
      }
    }
  };

  for (const sheet of [...document.styleSheets]) {
    try {
      walk(sheet.cssRules, []);
    } catch {
      // Feuille inaccessible (cross-origin). Le site n'en a aucune — l'invariant
      // « 0 requête externe » le vérifie —, donc on ignore sans rien masquer.
    }
  }

  return {
    supportsViewTimeline: CSS.supports('animation-timeline', 'view()'),
    found: hit !== null,
    rule: hit as { animationName: string; animationTimeline: string; animationFillMode: string } | null,
    conditions,
  };
};

test.describe('Révélation au scroll — les octets servis', () => {
  test('aucun raccourci `animation` ne transporte de timeline', () => {
    // L'assertion générale : c'est le minifieur qu'on surveille. Un raccourci
    // `animation` portant `view()` ou `scroll()` est rejeté en entier par le
    // navigateur, donc la règle qui le contient est morte, pas dégradée.
    const fautifs = animationShorthandValues(servedCss()).filter((v) =>
      /\b(?:view|scroll)\s*\(/.test(v),
    );

    expect(
      fautifs,
      'un raccourci `animation` embarque une fonction de timeline : le navigateur ' +
        'rejette la déclaration ENTIÈRE (`animation-name: none`). Écrire les ' +
        'longhands — le minifieur ne les refusionne pas.',
    ).toEqual([]);
  });

  test('`.reveal` déclare sa timeline en longhand dans le CSS servi', () => {
    const css = servedCss();
    const blocs = revealDeclarationBlocks(css);

    // La règle doit exister et porter ses pièces en longhand, DANS SON PROPRE
    // BLOC. Sans ça, l'assertion générale ci-dessus passerait aussi quand il
    // n'y a plus d'animation du tout.
    expect(blocs.length, 'aucun bloc de déclarations pour `.reveal` dans le CSS servi').toBeGreaterThan(0);
    for (const attendu of ['animation-name:reveal-fade', 'animation-timeline:view()']) {
      expect(
        blocs.some((b) => b.includes(attendu)),
        `aucun bloc \`.reveal\` ne déclare \`${attendu}\` — blocs trouvés : ${JSON.stringify(blocs)}`,
      ).toBe(true);
    }
    expect(
      css,
      'les keyframes `reveal-fade` ont disparu — il n\'y a plus rien à animer',
    ).toContain('@keyframes reveal-fade');
  });

  test('la révélation est restreinte à `screen`', () => {
    // Mesuré : sans `screen`, l'impression fige les sections à opacité 0, une
    // timeline de vue n'ayant pas de scrollport à l'impression — `both`
    // applique alors la keyframe de départ.
    const preludes = [
      ...servedCss().matchAll(/@media([^{]*prefers-reduced-motion\s*:\s*no-preference[^{]*)/g),
    ].map((m) => m[1].trim());

    expect(
      preludes.length,
      'aucune media query `no-preference` : la révélation a disparu',
    ).toBeGreaterThan(0);
    for (const prelude of preludes) {
      expect(
        prelude,
        `la media query \`${prelude}\` n'est pas restreinte à \`screen\` : à l'impression, ` +
          'la timeline de vue ne progresse pas et `animation-fill-mode: both` laisse ' +
          'les sections à opacité 0 — pages blanches.',
      ).toMatch(/\bscreen\b/);
    }
  });

  test('le moteur ACCEPTE la déclaration (CSSOM)', async ({ page }) => {
    // Lecture du CSSOM, pas du rendu : elle est donc valide dans ce projet, qui
    // tourne en `prefers-reduced-motion: reduce`. Une règle sous une media query
    // qui ne matche pas reste présente et analysée.
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const lu = await page.evaluate(readRevealRuleFromCssom);

    // Précondition honnête : un moteur sans timelines de vue laisse tomber la
    // déclaration À RAISON, et le repli `@supports` est alors le comportement
    // voulu. Conclure au défaut y serait faux — c'est la leçon WebKit du lien
    // d'évitement.
    test.skip(
      !lu.supportsViewTimeline,
      'ce moteur ne supporte pas `animation-timeline: view()` — le repli @supports est correct, rien à asserter',
    );

    expect(lu.found, 'aucune règle `.reveal` portant un `animation-name` dans le CSSOM').toBe(true);
    expect(
      lu.rule?.animationName,
      'le moteur n\'a pas retenu `animation-name` : la déclaration a été rejetée',
    ).toBe('reveal-fade');
    expect(
      lu.rule?.animationTimeline,
      'le moteur n\'a pas retenu `animation-timeline` : c\'est le mode de panne exact du raccourci fusionné',
    ).toBe('view()');
    expect(
      lu.conditions.join(' | '),
      'la règle `.reveal` n\'est pas sous une condition `screen`',
    ).toMatch(/\bscreen\b/);
  });
});
