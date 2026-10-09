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
 *
 * ET C'EST CETTE QUESTION QUI A FAIT TOMBER UNE LISTE D'EXCEPTIONS (09.10).
 * Le contrôle (2) portait une liste `KNOWN_TEXT_OVERFLOW` de deux pages, au
 * motif que la 3e colonne de leur tableau était « ni visible ni accessible par
 * défilement ». C'était une déduction, et la mesure l'a démentie : le tableau
 * était un scrollport qui défilait pour de bon (`scrollWidth` 433 contre
 * `clientWidth` 327, `scrollLeft` poussé à 106 ramenant la colonne dans le
 * viewport). Le défaut réel était que ce scrollport avait `tabIndex` à -1,
 * donc personne au clavier ne pouvait l'atteindre.
 *
 * Un texte dans un scrollport dépasse donc le viewport SANS être inatteignable
 * — c'est la définition d'un scrollport. Le contrôle exclut maintenant ces
 * textes par une RÈGLE, et non par une liste de chemins : si l'ancêtre défile
 * horizontalement et que son propre rectangle tient dans le viewport, le texte
 * est atteignable en défilant. Que ce défilement soit possible AU CLAVIER est
 * vérifié juste en dessous, et la structure qui le permet par
 * `invariants/scrollable-tables.spec.ts`.
 */
import { test, expect } from '@playwright/test';
import { gotoStyled } from '../fixtures/styled-page.ts';
import { pages } from '../fixtures/pages.ts';

const EXPECTED_WIDTH = 375;

test.describe('Mobile 375px', () => {
  for (const p of pages) {
    test(`${p.path} — la page ne défile pas horizontalement`, async ({ page }) => {
      await gotoStyled(page, p.path);

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

  test('aucun texte inatteignable hors du viewport', async ({ page }) => {
    const offenders = new Map<string, string[]>();

    for (const p of pages) {
      await gotoStyled(page, p.path);

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

          // Un texte dans un scrollport horizontal est ATTEIGNABLE en
          // défilant : son dépassement est la définition du scrollport, pas un
          // défaut. On ne l'exclut qu'à deux conditions mesurées — l'ancêtre
          // défile réellement, et son propre rectangle tient dans le viewport,
          // sans quoi défiler ne suffirait pas à amener le texte dedans.
          let scrollport: HTMLElement | null = el;
          let atteignable = false;
          while (scrollport && scrollport !== document.body) {
            const style = getComputedStyle(scrollport);
            const defile =
              /(auto|scroll)/.test(style.overflowX) &&
              scrollport.scrollWidth > scrollport.clientWidth;
            if (defile) {
              const box = scrollport.getBoundingClientRect();
              if (box.left >= -1 && box.right <= limit + 1) atteignable = true;
              break;
            }
            scrollport = scrollport.parentElement;
          }
          if (atteignable) continue;

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

    const messages = [...offenders.entries()].map(
      ([path, found]) => `${path} :\n    ${found.join('\n    ')}`,
    );

    expect(
      messages,
      messages.length
        ? `Texte peint hors du viewport et non atteignable par défilement :\n  ${messages.join('\n  ')}`
        : '',
    ).toEqual([]);
  });

  test('la région défilable d\'un tableau est atteignable au clavier', async ({ page }) => {
    // Le défaut réel derrière l'ancienne liste d'exceptions. Mesuré le 09.10 :
    // le scrollport défilait déjà, mais `tabIndex` valait -1, donc la dernière
    // colonne était hors d'atteinte pour qui navigue au clavier (WCAG 2.1.1).
    //
    // La page testée est DÉRIVÉE du contenu, pas codée en dur : le premier
    // article qui sort un tableau fait l'affaire, et le jour où aucun n'en sort
    // le test le dit plutôt que de passer à vide.
    const withTable: string[] = [];
    for (const p of pages) {
      await gotoStyled(page, p.path);
      if (await page.locator('.prose .table-scroll').count()) withTable.push(p.path);
    }
    expect(withTable, 'aucune page ne sert de tableau : ce test ne mesure plus rien').not.toEqual([]);

    for (const path of withTable) {
      await gotoStyled(page, path);
      const region = page.locator('.prose .table-scroll').first();

      const avant = await region.evaluate((el) => ({
        tabIndex: el.tabIndex,
        role: el.getAttribute('role'),
        nom: el.getAttribute('aria-label'),
        defile: el.scrollWidth > el.clientWidth,
        scrollLeft: el.scrollLeft,
      }));

      expect(avant.tabIndex, `${path} : la région défilable n'est pas focalisable`).toBe(0);
      expect(avant.role, `${path} : la région n'est pas annoncée`).toBe('region');
      expect(avant.nom?.trim().length ?? 0, `${path} : région sans nom accessible`).toBeGreaterThan(0);
      expect(avant.defile, `${path} : la région ne défile pas, le test ne prouverait rien`).toBe(true);

      // Le focus doit atterrir sur la région elle-même, puis les flèches la
      // faire défiler. `ArrowRight`, pas `End` : `End` défile verticalement.
      await region.focus();
      expect(
        await region.evaluate((el) => el === document.activeElement),
        `${path} : le focus n'atterrit pas sur la région`,
      ).toBe(true);

      await page.keyboard.press('ArrowRight');
      await expect
        .poll(() => region.evaluate((el) => el.scrollLeft), {
          message: `${path} : les touches fléchées ne font pas défiler la région`,
          timeout: 2000,
        })
        .toBeGreaterThan(avant.scrollLeft);
    }
  });
});
