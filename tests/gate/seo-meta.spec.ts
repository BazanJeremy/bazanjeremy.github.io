/**
 * GATE — bloquant.
 *
 * Risque : probabilité moyenne × impact moyen-haut.
 *
 * `BaseLayout` calcule canonical, hreflang, OG et Twitter pour les 26 pages à
 * partir de `Astro.url` et de `lang`. Une régression y est invisible au rendu :
 * la page s'affiche parfaitement et c'est le partage sur un réseau, ou
 * l'indexation, qui casse — donc personne ne le voit avant longtemps.
 *
 * Le cas des images Open Graph mérite une mention : `BaseLayout` choisit entre
 * deux PNG selon la locale, et le texte y est INCRUSTÉ DANS LES PIXELS. Servir
 * l'image FR sur une page EN est donc un défaut invisible à tout scan de texte.
 */
import { test, expect } from '@playwright/test';
import { pages } from '../fixtures/pages.ts';
import { dict } from '../fixtures/i18n.ts';

const SITE = 'https://bazanjeremy.github.io';

const meta = (page: import('@playwright/test').Page, selector: string) =>
  page.locator(selector).getAttribute('content');

test.describe('Métadonnées SEO et Open Graph', () => {
  for (const p of pages) {
    test(`${p.path}`, async ({ page }) => {
      await page.goto(p.path, { waitUntil: 'domcontentloaded' });

      // `lang` de la racine, cohérent avec le chemin.
      await expect(page.locator('html')).toHaveAttribute('lang', p.lang);

      // Canonical : absolue, bon domaine, slash final, et égale à og:url.
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical, 'canonical absente').toBeTruthy();
      expect(canonical).toBe(`${SITE}${p.path}`);

      const ogUrl = await meta(page, 'meta[property="og:url"]');
      expect(ogUrl, 'og:url doit égaler la canonical').toBe(canonical);

      // Image OG par locale — le texte est incrusté dans le PNG.
      const ogImage = await meta(page, 'meta[property="og:image"]');
      const expectedImage = p.lang === 'en' ? '/og-image-en.png' : '/og-image.png';
      expect(ogImage, `l'image OG ne correspond pas à la locale ${p.lang}`).toBe(
        `${SITE}${expectedImage}`,
      );

      // og:locale, depuis le dictionnaire plutôt qu'un littéral recopié.
      expect(await meta(page, 'meta[property="og:locale"]')).toBe(dict[p.lang].meta.og_locale);

      // og:type dérivé du `kind` du catalogue, donc asséré DANS LES DEUX
      // SENS : un article doit dire `article`, et une page qui n'en est pas
      // une doit rester `website`. C'était un `test.fail()` sur un seul
      // article jusqu'au 09.10 — il ne voyait ni les 21 autres, ni la
      // régression inverse, et il fallait penser à retirer le marqueur.
      const expectedOgType = p.kind === 'article' ? 'article' : 'website';
      expect(
        await meta(page, 'meta[property="og:type"]'),
        `og:type doit valoir « ${expectedOgType} » sur une page de type « ${p.kind} »`,
      ).toBe(expectedOgType);

      // Titre et description non vides.
      expect((await page.title()).trim().length, 'titre vide').toBeGreaterThan(0);
      expect(
        ((await meta(page, 'meta[name="description"]')) ?? '').trim().length,
        'description vide',
      ).toBeGreaterThan(0);

      // Carte Twitter cohérente avec OG.
      expect(await meta(page, 'meta[name="twitter:card"]')).toBe('summary_large_image');
      expect(await meta(page, 'meta[name="twitter:image"]')).toBe(ogImage);
    });
  }

  test('les titres sont uniques sur les 26 pages', async ({ page }) => {
    // Deux pages au même titre, et un moteur en choisit une : l'autre
    // disparaît des résultats sans que rien ne le signale.
    const byTitle = new Map<string, string[]>();
    for (const p of pages) {
      await page.goto(p.path, { waitUntil: 'domcontentloaded' });
      const t = await page.title();
      byTitle.set(t, [...(byTitle.get(t) ?? []), p.path]);
    }
    const dupes = [...byTitle.entries()]
      .filter(([, paths]) => paths.length > 1)
      .map(([t, paths]) => `« ${t} » : ${paths.join(', ')}`);

    expect(dupes, dupes.length ? `Titres en doublon :\n  ${dupes.join('\n  ')}` : '').toEqual([]);
  });

  test('les trois hreflang sont présents et cohérents', async ({ page }) => {
    // Le détail du chaînage est couvert par `i18n-toggle`. Ici on vérifie
    // seulement que les trois balises existent partout : une seule manquante
    // et le signal de langue devient ambigu pour les moteurs.
    const incomplete: string[] = [];
    for (const p of pages) {
      await page.goto(p.path, { waitUntil: 'domcontentloaded' });
      for (const h of ['fr', 'en', 'x-default']) {
        const n = await page.locator(`link[rel="alternate"][hreflang="${h}"]`).count();
        if (n !== 1) incomplete.push(`${p.path} : ${n} balise(s) hreflang="${h}"`);
      }
    }
    expect(incomplete, incomplete.length ? `hreflang incomplets :\n  ${incomplete.join('\n  ')}` : '')
      .toEqual([]);
  });
});
