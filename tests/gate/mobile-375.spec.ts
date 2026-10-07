/**
 * GATE — bloquant. Projet `gate-mobile` (viewport 375×667).
 *
 * Risque : probabilité moyenne × impact haut.
 *
 * Automatise le contrôle fait à la main à chaque PR du projet — et encode LE
 * PIÈGE DE MESURE comme précondition.
 *
 * Historique : lors d'une tâche précédente, l'outil d'émulation a répondu
 * « Viewport set to 375x812 » sans que l'émulation soit appliquée. La mesure a
 * été prise à 785px et rapportée comme un contrôle à 375px. Un test qui ne
 * vérifierait que l'absence de débordement passerait pour exactement la même
 * mauvaise raison : à 1280px, rien ne déborde. D'où la première assertion, qui
 * relit la largeur réelle DANS LA MÊME MESURE que le débordement.
 *
 * Deux défauts distincts, donc deux contrôles — et le second a été ajouté
 * APRÈS avoir constaté que le premier ne suffit pas :
 *
 *  1. `scrollWidth > clientWidth` — la page défile horizontalement.
 *  2. du texte peint AU-DELÀ du viewport sans que la page défile. Le contenu
 *     est alors simplement inatteignable, et le contrôle (1) ne le voit pas.
 *     Mesuré le 07.10 : c'est le cas sur 2 des 26 pages (voir plus bas).
 *
 * Le contrôle (2) porte sur les rectangles du TEXTE (via `Range`), pas sur ceux
 * des éléments. Une première version mesurait les éléments et signalait deux
 * faux positifs : les arcs décoratifs du Hero, qui débordent volontairement et
 * sont rognés (`aria-hidden`, la page ne défile pas), et les boîtes internes
 * d'un tableau, dont le rectangle est plus large que le tableau lui-même alors
 * que celui-ci tient dans le viewport. Mesurer le texte visible répond à la
 * vraie question : ce texte est-il atteignable ?
 */
import { test, expect } from '@playwright/test';
import { pages } from '../fixtures/pages.ts';

const EXPECTED_WIDTH = 375;

/**
 * Défaut connu, mesuré le 07.10, NON corrigé — en attente de l'arbitrage de
 * Jérémy (c'est du contenu et du design, pas un défaut technique à trancher
 * seul).
 *
 * Sur ces deux pages, la troisième colonne du tableau Markdown est peinte
 * jusqu'à ~440px alors que le viewport fait 375px. Le `<table>` lui-même tient
 * (359px de large, bord droit à 367px) et le document ne défile pas, donc la
 * colonne n'est ni visible ni accessible par défilement : elle est perdue.
 *
 * Le correctif est côté CSS (rendre les tableaux de `.prose` défilables
 * horizontalement), donc il change le CSS de production : il mérite sa propre
 * PR et sa propre vérification.
 *
 * Cette liste échoue DANS LES DEUX SENS : une page de plus qui déborde fait
 * rougir le test, et le correctif appliqué aussi — ce qui force à retirer
 * l'exception au lieu de la laisser pourrir.
 */
const KNOWN_TEXT_OVERFLOW: readonly string[] = [
  '/blog/mots-de-passe-criteres-2003/',
  '/en/blog/passwords-acceptance-criteria-2003/',
];

test.describe('Mobile 375px', () => {
  for (const p of pages) {
    test(`${p.path} — la page ne défile pas horizontalement`, async ({ page }) => {
      await page.goto(p.path, { waitUntil: 'domcontentloaded' });

      // Une seule évaluation : la largeur constatée et le débordement viennent
      // du même instant, donc l'une valide l'autre.
      const m = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
      }));

      expect(
        m.clientWidth,
        `l'émulation de viewport n'a pas été appliquée (largeur réelle ${m.clientWidth}px) — ` +
          `la mesure de débordement qui suit ne vaudrait rien`,
      ).toBe(EXPECTED_WIDTH);

      expect(
        m.scrollWidth,
        `débordement horizontal : le document mesure ${m.scrollWidth}px dans ${m.clientWidth}px`,
      ).toBeLessThanOrEqual(m.clientWidth);

      expect(m.bodyScrollWidth, 'le body déborde du viewport').toBeLessThanOrEqual(m.clientWidth);
    });
  }

  test('aucun texte n\'est peint hors du viewport (hors défaut connu)', async ({ page }) => {
    const offenders = new Map<string, string[]>();

    for (const p of pages) {
      await page.goto(p.path, { waitUntil: 'domcontentloaded' });

      const found = await page.evaluate((limit) => {
        const out: string[] = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node: Node | null;
        while ((node = walker.nextNode())) {
          const text = node.textContent?.trim();
          if (!text) continue;
          const el = node.parentElement;
          // Le décor est exclu : il déborde volontairement et est rogné.
          if (!el || el.closest('[aria-hidden="true"]')) continue;

          const range = document.createRange();
          range.selectNodeContents(node);
          const rect = range.getBoundingClientRect();
          if (rect.width === 0) continue;
          if (rect.right > limit + 1) {
            out.push(`<${el.tagName.toLowerCase()}> jusqu'à ${Math.round(rect.right)}px : « ${text.slice(0, 40)} »`);
          }
        }
        return out.slice(0, 3);
      }, EXPECTED_WIDTH);

      if (found.length) offenders.set(p.path, found);
    }

    const unexpected = [...offenders.keys()].filter((p) => !KNOWN_TEXT_OVERFLOW.includes(p));
    const fixed = KNOWN_TEXT_OVERFLOW.filter((p) => !offenders.has(p));

    const messages: string[] = [];
    for (const p of unexpected) {
      messages.push(`NOUVEAU — ${p} :\n    ${(offenders.get(p) ?? []).join('\n    ')}`);
    }
    for (const p of fixed) {
      messages.push(
        `CORRIGÉ — ${p} ne déborde plus : retire-le de KNOWN_TEXT_OVERFLOW dans cette spec.`,
      );
    }

    expect(messages, messages.length ? `Texte hors viewport :\n  ${messages.join('\n  ')}` : '').toEqual(
      [],
    );
  });
});
