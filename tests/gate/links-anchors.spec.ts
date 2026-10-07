/**
 * GATE — bloquant.
 *
 * Risque : probabilité moyenne-haute × impact haut.
 *
 * Les `id` de section viennent de `src/i18n/*.json` et les liens de navigation
 * sont construits par concaténation (`${home}#${item.id}`). Une faute de frappe
 * dans un `id`, ou un `id` renommé d'un seul côté, produit donc une ancre morte
 * qui ne casse aucun build et ne se voit qu'au clic.
 *
 * Trois choses sont vérifiées, dont une qui encode une décision verrouillée :
 *
 *  (a) tout lien interne résout — une cible `#x` existe bien comme `id` dans
 *      le DOM de la page visée, y compris quand le lien est inter-pages
 *      (`/#outils` depuis un article) ;
 *  (b) aucune ancre ni segment d'URL ne tombe dans la liste rouge ;
 *  (c) les ensembles d'`id` de section FR et EN sont IDENTIQUES.
 *
 * Le point (c) est le plus subtil : les ancres ne sont pas traduites, alors que
 * les libellés le sont. Un libellé anglais légitime peut donc coexister avec un
 * `id` qui doit rester en français. Traduire l'`id` « par cohérence » casserait
 * tous les liens entrants — c'est exactement ce que cette assertion empêche.
 */
import { test, expect } from '@playwright/test';
import { pages } from '../fixtures/pages.ts';
import { sectionIds } from '../fixtures/i18n.ts';
import { scan, formatFindings, type Finding } from '../helpers/vocabulary.ts';

interface PageFacts {
  readonly path: string;
  readonly ids: Set<string>;
  readonly internalHrefs: readonly string[];
}

const ORIGIN = 'http://localhost:4321';

test.describe('Liens internes et ancres', () => {
  test('les ensembles d\'id de section sont identiques en FR et en EN', () => {
    // Décision verrouillée : les ancres ne sont pas traduites.
    const fr = sectionIds('fr');
    const en = sectionIds('en');
    expect(
      en,
      'les id de section ont divergé entre les locales — toute ancre partagée devient morte',
    ).toEqual(fr);
  });

  test('aucun lien interne ne pointe une ancre inexistante', async ({ page }) => {
    // Un seul test, un seul parcours des 26 pages : on collecte d'abord tous
    // les `id` de chaque page, puis on valide tous les liens contre cette
    // carte. Valider page par page obligerait à recharger les cibles.
    const facts: PageFacts[] = [];

    for (const p of pages) {
      await page.goto(p.path, { waitUntil: 'domcontentloaded' });
      const collected = await page.evaluate(() => ({
        ids: [...document.querySelectorAll('[id]')].map((el) => el.id),
        hrefs: [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href') ?? ''),
      }));
      facts.push({
        path: p.path,
        ids: new Set(collected.ids),
        internalHrefs: collected.hrefs.filter((h) => h.startsWith('/') || h.startsWith('#')),
      });
    }

    const idsByPath = new Map(facts.map((f) => [f.path, f.ids]));
    const knownPaths = new Set(pages.map((p) => p.path));
    const broken: string[] = [];

    for (const f of facts) {
      for (const href of f.internalHrefs) {
        const url = new URL(href, ORIGIN + f.path);
        // Les liens de carte émettent `/blog/<slug>` sans slash final, ce qui
        // 301 en production : on compare donc sur la forme canonique.
        const targetPath = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`;
        const fragment = decodeURIComponent(url.hash.replace(/^#/, ''));

        if (!knownPaths.has(targetPath)) {
          broken.push(`${f.path} → « ${href} » : la page ${targetPath} n'existe pas`);
          continue;
        }
        if (!fragment) continue;

        const targetIds = idsByPath.get(targetPath);
        if (!targetIds?.has(fragment)) {
          broken.push(`${f.path} → « ${href} » : aucun id « ${fragment} » dans ${targetPath}`);
        }
      }
    }

    expect(broken, broken.length ? `Liens internes morts :\n  ${broken.join('\n  ')}` : '').toEqual(
      [],
    );
  });

  test('aucune ancre ni segment d\'URL dans la liste rouge', async ({ page }) => {
    const findings: Finding[] = [];

    for (const p of pages) {
      await page.goto(p.path, { waitUntil: 'domcontentloaded' });
      const hrefs = await page.evaluate(() =>
        [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href') ?? ''),
      );
      for (const href of hrefs.filter((h) => h.startsWith('/') || h.startsWith('#'))) {
        findings.push(...scan(decodeURIComponent(href), `${p.path} → href « ${href} »`));
      }
    }

    expect(
      findings,
      findings.length
        ? `Vocabulaire interdit dans une URL ou une ancre :\n\n${formatFindings(findings)}`
        : '',
    ).toEqual([]);
  });

  test('l\'ancre #tools n\'existe nulle part', async ({ page }) => {
    // `#tools` n'est pas interdit par la liste rouge du vocabulaire — il est
    // interdit par la décision « les ancres ne sont pas traduites ». La version
    // EN pointe donc la même ancre que la FR. Vérifié sur la locale EN, là où
    // la tentation de traduire est maximale.
    const forbidden = '#tools';
    for (const p of pages.filter((x) => x.lang === 'en')) {
      await page.goto(p.path, { waitUntil: 'domcontentloaded' });
      const hrefs = await page.evaluate(() =>
        [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href') ?? ''),
      );
      const offenders = hrefs.filter((h) => h.toLowerCase().includes(forbidden));
      expect(
        offenders,
        offenders.length ? `${p.path} utilise « ${forbidden} » : les ancres ne sont pas traduites` : '',
      ).toEqual([]);
    }
  });
});
