/**
 * GATE — bloquant.
 *
 * Risque : probabilité HAUTE × impact HAUT. La spec la plus utile de la suite.
 *
 * Elle automatise une règle que le schéma Zod ne peut structurellement pas
 * valider : `translationSlug` est un lien bidirectionnel maintenu à la main,
 * article par article, et son mode de panne est documenté dans le README du
 * projet — « le toggle de langue retombe sur l'index du blog de l'autre
 * langue ». Jérémy ajoute les paires d'articles lui-même, donc la probabilité
 * d'oubli est réelle et récurrente.
 *
 * Le toggle est le SEUL élément interactif d'un site à 0 JS. S'il mène à la
 * mauvaise page, un lecteur anglophone atterrit sur un index au lieu de
 * l'article qu'il lisait, et rien dans le build ne le signale.
 *
 * Attention aux sélecteurs : le composant est rendu DEUX FOIS par page (header
 * et footer). Tout sélecteur est donc scopé, et l'égalité des deux est
 * elle-même assérée — une divergence signalerait que `BaseLayout` ne passe plus
 * les mêmes `altPaths` aux deux.
 */
import { test, expect } from '@playwright/test';
import { pages, articles, type Locale } from '../fixtures/pages.ts';

const other = (lang: Locale): Locale => (lang === 'fr' ? 'en' : 'fr');

/** Normalise en chemin, que l'attribut soit relatif ou absolu. */
const toPath = (href: string): string => new URL(href, 'http://localhost:4321').pathname;

test.describe('Toggle de langue et chaînage des traductions', () => {
  for (const p of pages) {
    test(`${p.path} — aller-retour vers ${other(p.lang).toUpperCase()}`, async ({ page }) => {
      expect(
        p.altPath,
        `aucune page équivalente connue pour ${p.path} : ` +
          `un article sans \`translationSlug\` ferait retomber le toggle sur l'index du blog`,
      ).toBeTruthy();

      await page.goto(p.path, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('html')).toHaveAttribute('lang', p.lang);

      const target = other(p.lang);

      // 1. Les deux toggles de la page portent le même href.
      const headerHref = await page.locator(`header a[hreflang="${target}"]`).getAttribute('href');
      const footerHref = await page.locator(`footer a[hreflang="${target}"]`).getAttribute('href');
      expect(
        headerHref,
        'les toggles du header et du footer divergent — BaseLayout ne leur passe plus les mêmes altPaths',
      ).toBe(footerHref);

      // 2. Il mène à la page attendue.
      expect(toPath(headerHref ?? ''), `le toggle de ${p.path} ne mène pas à la traduction attendue`)
        .toBe(p.altPath);

      // 3. Les `link rel=alternate` disent la même chose que le toggle.
      //    Les deux dérivent d'`altPaths`, donc toute divergence est une
      //    régression de BaseLayout, pas un choix.
      const alternate = await page
        .locator(`link[rel="alternate"][hreflang="${target}"]`)
        .getAttribute('href');
      expect(toPath(alternate ?? ''), 'rel=alternate et le toggle ne pointent pas la même page').toBe(
        p.altPath,
      );

      // 4. `x-default` pointe toujours la version FR.
      const xDefault = await page
        .locator('link[rel="alternate"][hreflang="x-default"]')
        .getAttribute('href');
      const frPath = p.lang === 'fr' ? p.path : p.altPath;
      expect(toPath(xDefault ?? ''), 'x-default doit pointer la version française').toBe(frPath);

      // 5. On suit le lien et on vérifie l'arrivée.
      await page.locator(`header a[hreflang="${target}"]`).click();
      await page.waitForLoadState('domcontentloaded');
      expect(new URL(page.url()).pathname).toBe(p.altPath);
      await expect(page.locator('html')).toHaveAttribute('lang', target);

      // 6. Aller-retour identitaire : le toggle de la page d'arrivée doit
      //    ramener exactement d'où l'on vient. C'est ce qui attrape une paire
      //    mal chaînée dans un seul sens.
      const back = await page.locator(`header a[hreflang="${p.lang}"]`).getAttribute('href');
      expect(toPath(back ?? ''), `l'aller-retour ne revient pas sur ${p.path}`).toBe(p.path);
    });
  }

  test('aucun article ne retombe sur l\'index du blog', () => {
    // Le mode de panne documenté, asséré sur les données plutôt que page par
    // page : plus rapide à lire dans un rapport, et il nomme l'article fautif.
    const fallbacks = articles
      .filter((a) => !a.translationSlug)
      .map((a) => `${a.file} (slug: ${a.slug})`);

    expect(
      fallbacks,
      fallbacks.length
        ? `Articles sans \`translationSlug\` — leur toggle retombera sur l'index :\n  ` +
            fallbacks.join('\n  ')
        : '',
    ).toEqual([]);
  });

  test('le chaînage des traductions est bidirectionnel', () => {
    // Un `translationSlug` qui pointe un slug inexistant, ou une paire chaînée
    // dans un seul sens, produit un lien mort que le schéma ne voit pas.
    const bySlug = new Map(articles.map((a) => [`${a.lang}:${a.slug}`, a]));
    const broken: string[] = [];

    for (const a of articles) {
      if (!a.translationSlug) continue;
      const target = bySlug.get(`${other(a.lang)}:${a.translationSlug}`);
      if (!target) {
        broken.push(`${a.file} pointe « ${a.translationSlug} », qui n'existe pas en ${other(a.lang)}`);
        continue;
      }
      if (target.translationSlug !== a.slug) {
        broken.push(
          `chaînage asymétrique : ${a.file} pointe « ${a.translationSlug} », ` +
            `mais celui-ci pointe « ${target.translationSlug} » au lieu de « ${a.slug} »`,
        );
      }
    }

    expect(broken, broken.length ? `Chaînage rompu :\n  ${broken.join('\n  ')}` : '').toEqual([]);
  });
});
