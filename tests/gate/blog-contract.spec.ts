/**
 * GATE — bloquant.
 *
 * Risque : probabilité moyenne-haute × impact moyen.
 *
 * La deuxième règle que le schéma Zod ne peut pas valider, et celle qui casse
 * le plus souvent : Jérémy fournit les articles lui-même, et le contrat est
 * documenté dans le README sans être vérifié par le build.
 *
 * Les deux pièges nommés dans ce contrat :
 *  - le corps ne doit PAS commencer par `#`, parce que le layout rend déjà
 *    `title` en `<h1>` — sinon la page a deux h1 ;
 *  - le `slug` est l'URL : kebab-case, sans espace ni accent, et le fichier
 *    porte le même nom que le slug.
 */
import { test, expect } from '@playwright/test';
import { articles } from '../fixtures/pages.ts';

test.describe('Contrat des articles', () => {
  for (const a of articles) {
    test(`${a.path} — un seul h1, égal au titre`, async ({ page }) => {
      await page.goto(a.path, { waitUntil: 'domcontentloaded' });

      const h1 = page.locator('h1');
      await expect(
        h1,
        `${a.file} : le layout rend déjà \`title\` en h1 — si le corps commence par « # », ` +
          `la page en a deux`,
      ).toHaveCount(1);

      expect((await h1.innerText()).trim()).toBe(a.title.trim());
    });
  }

  test('aucun saut de niveau de titre', async ({ page }) => {
    // h1 → h3 sans h2 casse la navigation par titres des lecteurs d'écran.
    const bad: string[] = [];
    for (const a of articles) {
      await page.goto(a.path, { waitUntil: 'domcontentloaded' });
      const levels = await page.evaluate(() =>
        [...document.querySelectorAll('main h1, main h2, main h3, main h4, main h5, main h6')].map(
          (h) => Number(h.tagName[1]),
        ),
      );
      for (let i = 1; i < levels.length; i++) {
        if (levels[i] - levels[i - 1] > 1) {
          bad.push(`${a.path} : h${levels[i - 1]} suivi de h${levels[i]}`);
        }
      }
    }
    expect(bad, bad.length ? `Sauts de niveau de titre :\n  ${bad.join('\n  ')}` : '').toEqual([]);
  });

  test('la date affichée correspond au frontmatter', async ({ page }) => {
    const bad: string[] = [];
    for (const a of articles) {
      await page.goto(a.path, { waitUntil: 'domcontentloaded' });
      const dt = await page.locator('time[datetime]').first().getAttribute('datetime');
      if (!dt) {
        bad.push(`${a.path} : aucun <time datetime>`);
        continue;
      }
      const shown = new Date(dt);
      if (Number.isNaN(shown.getTime())) {
        bad.push(`${a.path} : datetime « ${dt} » n'est pas une date valide`);
        continue;
      }
      // Comparaison au jour : le frontmatter est une date nue, le rendu peut
      // porter une heure.
      const expected = a.date.slice(0, 10);
      if (dt.slice(0, 10) !== expected) {
        bad.push(`${a.path} : affiche ${dt.slice(0, 10)}, frontmatter dit ${expected}`);
      }
    }
    expect(bad, bad.length ? `Dates incohérentes :\n  ${bad.join('\n  ')}` : '').toEqual([]);
  });

  test('les slugs sont en kebab-case strict et le fichier porte le même nom', () => {
    // Le slug EST l'URL. Une espace ou un accent produit une URL encodée qui
    // part telle quelle dans le sitemap.
    const bad: string[] = [];
    for (const a of articles) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(a.slug)) {
        bad.push(`${a.file} : slug « ${a.slug} » n'est pas en kebab-case ASCII strict`);
      }
      if (a.stem !== a.slug) {
        bad.push(`${a.file} : le fichier s'appelle « ${a.stem} » mais le slug est « ${a.slug} »`);
      }
    }
    expect(bad, bad.length ? `Slugs non conformes :\n  ${bad.join('\n  ')}` : '').toEqual([]);
  });
});
