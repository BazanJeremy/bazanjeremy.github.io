/**
 * GATE — bloquant.
 *
 * Risque : probabilité basse-moyenne × impact moyen.
 *
 * Le sitemap est produit par `@astrojs/sitemap` à partir des pages construites,
 * donc il ne peut pas inventer d'URL. Le risque est ailleurs : un `slug` mal
 * formé entre dans le sitemap sous forme encodée. Le piège documenté du projet
 * est `/blog/mon%20article/` — un slug avec une espace ou un accent produit une
 * URL encodée que les moteurs indexent telle quelle.
 *
 * Ce qui n'est PAS asséré ici : la présence des alternates `xhtml:link`.
 * Mesuré absents le 07.10 alors que le namespace est déclaré — l'option `i18n`
 * de `@astrojs/sitemap` n'est pas passée. C'est une fonctionnalité manquante,
 * pas une régression : l'assérer rendrait le gate rouge dès le premier jour.
 * Décision de configuration à arbitrer séparément.
 */
import { test, expect } from '@playwright/test';
import { pages } from '../fixtures/pages.ts';
import { readDistText, requireDist } from '../fixtures/dist.ts';

const SITE = 'https://bazanjeremy.github.io';

function locs(): string[] {
  const xml = readDistText('sitemap-0.xml');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

test.describe('Sitemap', () => {
  test.beforeAll(() => requireDist());

  test('l\'ensemble des URLs correspond exactement aux pages construites', () => {
    const inSitemap = new Set(locs().map((u) => new URL(u).pathname));
    const expected = new Set(pages.map((p) => p.path));

    const missing = [...expected].filter((p) => !inSitemap.has(p)).sort();
    const extra = [...inSitemap].filter((p) => !expected.has(p)).sort();

    expect({ missing, extra }, 'écart entre le sitemap et les pages construites').toEqual({
      missing: [],
      extra: [],
    });
  });

  test('chaque URL est absolue, sur le bon domaine, et finit par un slash', () => {
    const bad: string[] = [];
    for (const u of locs()) {
      if (!u.startsWith(`${SITE}/`)) bad.push(`${u} : domaine inattendu`);
      if (!u.endsWith('/')) bad.push(`${u} : pas de slash final (toute canonical du site en porte un)`);
    }
    expect(bad, bad.length ? `URLs mal formées :\n  ${bad.join('\n  ')}` : '').toEqual([]);
  });

  test('aucune URL encodée (le piège du slug mal formé)', () => {
    // Un `%` dans une URL de sitemap signifie qu'un slug contenait une espace,
    // un accent ou un caractère à encoder. L'URL part telle quelle dans le
    // sitemap et devient l'adresse indexée.
    const encoded = locs().filter((u) => u.includes('%'));
    expect(
      encoded,
      encoded.length
        ? `URLs encodées — un slug est mal formé :\n  ${encoded.join('\n  ')}\n` +
            `Le slug doit être en kebab-case, sans espace ni accent.`
        : '',
    ).toEqual([]);
  });

  test('aucun doublon', () => {
    const all = locs();
    const seen = new Set<string>();
    const dupes = all.filter((u) => (seen.has(u) ? true : (seen.add(u), false)));
    expect(dupes, dupes.length ? `URLs en doublon : ${dupes.join(', ')}` : '').toEqual([]);
  });

  test('sitemap-index.xml référence bien sitemap-0.xml', () => {
    expect(readDistText('sitemap-index.xml')).toContain('sitemap-0.xml');
  });

  test('chaque URL du sitemap répond 200', async ({ request, baseURL }) => {
    // Contre le preview local : vérifier la production est le travail du
    // nocturne, pas d'un gate qui doit rester déterministe et hors ligne.
    const failures: string[] = [];
    for (const u of locs()) {
      const path = new URL(u).pathname;
      const res = await request.get(new URL(path, baseURL).toString());
      if (res.status() !== 200) failures.push(`${path} → ${res.status()}`);
    }
    expect(failures, failures.length ? `URLs du sitemap en échec :\n  ${failures.join('\n  ')}` : '')
      .toEqual([]);
  });
});
