/**
 * NUIT — jamais bloquant. PRODUCTION UNIQUEMENT, sans navigateur.
 *
 * Risque : impact faible-moyen, mais c'est la seule spec qui regarde le site
 * tel qu'il est réellement servi — le reste de la suite regarde un `dist/`
 * servi en local.
 *
 * POURQUOI ELLE NE PEUT PAS VIVRE DANS LE GATE. Mesuré dans le plugin de
 * preview installé : `trailingSlash` n'étant pas configuré, il vaut `ignore`,
 * donc `astro preview` réécrit la requête en `pathname + "/index.html"` et
 * répond 200 sans redirection. Le 301 de GitHub Pages n'existe tout simplement
 * pas en local — et plus généralement, seule la production dit ce que reçoit
 * réellement un visiteur.
 *
 * Elle assère la FORME de la réalité mesurée plutôt que d'échouer dessus : les
 * liens de carte émettent `/blog/<slug>` sans slash, ce qui 301 vers la forme
 * canonique. Ce n'est pas un défaut à faire rougir — un 200 direct serait même
 * mieux. Les défauts, ce sont un 404, une cible de redirection erronée, ou une
 * chaîne de redirections.
 *
 * D'où un GARDE-FOU explicite, ajouté après avoir constaté que la spec passait
 * aussi contre le preview local : sans lui, elle acceptait un 200 partout et ne
 * vérifiait donc plus rien de propre à la production. Le garde exige qu'au
 * moins un lien non canonique redirige réellement. S'il devient rouge, c'est
 * que GitHub Pages a changé de comportement — une information, pas un défaut
 * du site, et la spec devra être relue plutôt que rafistolée.
 */
import { test, expect } from '@playwright/test';
import { pages } from '../fixtures/pages.ts';

const SITE = 'https://bazanjeremy.github.io';

test.describe('Production — comportement HTTP réel', () => {
  test('chaque page du catalogue répond 200', async ({ request, baseURL }) => {
    const failures: string[] = [];
    for (const p of pages) {
      const res = await request.get(new URL(p.path, baseURL).toString(), { maxRedirects: 0 });
      if (res.status() !== 200) failures.push(`${p.path} → ${res.status()}`);
    }
    expect(failures, failures.length ? `Pages en échec :\n  ${failures.join('\n  ')}` : '').toEqual([]);
  });

  test('chaque URL du sitemap répond 200', async ({ request, baseURL }) => {
    // Le sitemap sert à l'indexation : une URL morte dedans est une page
    // promise aux moteurs et absente.
    const xml = await (await request.get(new URL('/sitemap-0.xml', baseURL).toString())).text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

    expect(locs.length, 'sitemap vide ou illisible — le scan ne vérifiait rien').toBeGreaterThan(0);

    const failures: string[] = [];
    for (const u of locs) {
      const res = await request.get(u, { maxRedirects: 0 });
      if (res.status() !== 200) failures.push(`${u} → ${res.status()}`);
    }
    expect(failures, failures.length ? `URLs du sitemap en échec :\n  ${failures.join('\n  ')}` : '')
      .toEqual([]);
  });

  test('un lien interne sans slash final redirige en une seule étape vers sa canonique', async ({
    request,
    baseURL,
  }) => {
    // On collecte les liens tels que les pages les émettent, sans navigateur :
    // il n'y a pas de JS, donc le HTML servi EST le DOM.
    const seen = new Set<string>();
    for (const p of pages.filter((x) => x.kind !== 'article')) {
      const html = await (await request.get(new URL(p.path, baseURL).toString())).text();
      for (const m of html.matchAll(/href="(\/[^"#?]*)"/g)) {
        if (!m[1].endsWith('/')) seen.add(m[1]);
      }
    }

    expect(
      seen.size,
      'aucun lien interne sans slash trouvé — le scan ne vérifiait rien, ' +
        'ou les liens ont été corrigés (auquel cas cette spec doit évoluer)',
    ).toBeGreaterThan(0);

    const problems: string[] = [];
    let redirected = 0;
    for (const href of [...seen].sort()) {
      const res = await request.get(new URL(href, baseURL).toString(), { maxRedirects: 0 });

      if (res.status() === 200) continue; // déjà canonique, rien à dire

      if (res.status() !== 301) {
        problems.push(`${href} → ${res.status()} (attendu 200 ou 301)`);
        continue;
      }

      const location = res.headers()['location'] ?? '';
      const expected = `${SITE}${href}/`;
      if (location !== expected) {
        problems.push(`${href} → 301 vers « ${location} » au lieu de « ${expected} »`);
        continue;
      }

      // Une seule étape : la cible doit répondre 200 directement.
      const hop = await request.get(location, { maxRedirects: 0 });
      if (hop.status() !== 200) {
        problems.push(`${href} → 301 → ${hop.status()} : chaîne de redirections`);
        continue;
      }
      redirected += 1;
    }

    expect(problems, problems.length ? `Redirections anormales :\n  ${problems.join('\n  ')}` : '')
      .toEqual([]);

    // Le garde-fou. Sans lui, un environnement qui répond 200 partout — le
    // preview local, par exemple — ferait passer cette spec sans qu'elle ait
    // rien vérifié de propre à la production.
    expect(
      redirected,
      'aucun lien non canonique ne redirige : soit cette spec ne tourne pas contre ' +
        'la production, soit GitHub Pages a changé de comportement. Dans les deux cas, ' +
        'elle ne vérifie plus ce qu\'elle prétend vérifier.',
    ).toBeGreaterThan(0);
  });

  test('un chemin inconnu répond 404', async ({ request, baseURL }) => {
    // Il n'y a pas de `404.astro` : GitHub Pages sert sa propre page. On
    // vérifie le STATUT, pas la page — le jour où un `404.astro` arrivera,
    // cette assertion restera vraie et c'est bien ce qu'on veut.
    const res = await request.get(
      new URL('/cette-page-nexiste-pas-7f3a9/', baseURL).toString(),
      { maxRedirects: 0 },
    );
    expect(res.status(), 'un chemin inconnu devrait répondre 404').toBe(404);
  });

  test('le CSS référencé par la page d\'accueil est bien servi', async ({ request, baseURL }) => {
    // Le nom du fichier est un hash de son contenu : s'il est référencé mais
    // absent, c'est un déploiement partiel — le pire cas, parce que la page
    // s'affiche sans aucun style.
    const html = await (await request.get(new URL('/', baseURL).toString())).text();
    const href = /<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/.exec(html)?.[1];
    expect(href, 'aucune feuille de style référencée par la page d\'accueil').toBeTruthy();

    const res = await request.get(new URL(href ?? '', baseURL).toString(), { maxRedirects: 0 });
    expect(res.status(), `${href} n'est pas servi`).toBe(200);
  });
});
