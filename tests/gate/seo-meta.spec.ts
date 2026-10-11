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
import { articles, pages } from '../fixtures/pages.ts';
import { dict } from '../fixtures/i18n.ts';

const SITE = 'https://bazanjeremy.github.io';

const meta = (page: import('@playwright/test').Page, selector: string) =>
  page.locator(selector).getAttribute('content');

/**
 * Date de publication attendue, DÉRIVÉE du frontmatter — jamais recopiée.
 * Les 22 articles l'écrivent en `YYYY-MM-DD` (mesuré), et `z.coerce.date()`
 * en fait un minuit UTC, donc `toISOString()` est la forme servie.
 */
const publishedByPath = new Map(
  articles.map((a) => [a.path, new Date(a.date).toISOString()]),
);

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

      // `article:published_time`, que `og:type: article` appelle normalement.
      // Asséré DANS LES DEUX SENS pour la même raison qu'`og:type` : un
      // article doit la porter, et une page qui n'en est pas une ne doit pas
      // l'inventer. La valeur vient du frontmatter, pas d'un littéral.
      const published = page.locator('meta[property="article:published_time"]');
      if (p.kind === 'article') {
        const expected = publishedByPath.get(p.path);
        expect(expected, `aucune date au catalogue pour ${p.path}`).toBeDefined();
        await expect(
          published,
          `article:published_time manque sur ${p.path}, alors qu'og:type y vaut « article »`,
        ).toHaveCount(1);
        expect(
          await published.getAttribute('content'),
          `article:published_time ne correspond pas au frontmatter sur ${p.path}`,
        ).toBe(expected);
      } else {
        await expect(
          published,
          `article:published_time sur ${p.path}, qui est de type « ${p.kind} » et non un article`,
        ).toHaveCount(0);
      }

      // AUCUNE page ne sert `article:modified_time`, et c'est une DÉCISION,
      // pas un oubli : le dépôt n'a aucune source de vérité pour une date de
      // modification (le schéma de contenu porte `date` et rien d'autre).
      // La dériver de `date` affirmerait une modification qu'on ne connaît
      // pas, et la tirer du mtime git la ferait bouger à chaque reformatage.
      // Cette assertion est là pour qu'on ne la fabrique pas plus tard.
      await expect(
        page.locator('meta[property="article:modified_time"]'),
        `article:modified_time sur ${p.path} : aucune donnée du dépôt ne permet de l'affirmer`,
      ).toHaveCount(0);

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
