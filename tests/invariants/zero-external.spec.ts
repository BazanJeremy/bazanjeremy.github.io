/**
 * GATE — bloquant.
 *
 * Risque : probabilité basse-moyenne × impact moyen-haut.
 *
 * Le site revendique « 0 requête externe » : les polices sont auto-hébergées
 * précisément pour ne pas appeler de CDN, et aucun script tiers n'est chargé.
 * C'est un engagement de confidentialité affiché, donc une régression ici
 * contredit la copy publiée.
 *
 * DISTINCTION ESSENTIELLE, mesurée le 07.10 : `dist/` référence bel et bien
 * des origines externes — GitHub, LinkedIn, et les sources citées par les
 * articles (istqb.org, nist.gov, handicap.fr…). Ce sont des **destinations de
 * navigation** (`<a href>`), pas des chargements : le navigateur n'y va que si
 * le lecteur clique. Un test qui les interdirait serait faux.
 *
 * Ce qui est interdit, c'est ce que la page CHARGE : `src`, `srcset`, et les
 * `<link>` qui tirent une ressource. L'assertion concluante est donc celle du
 * navigateur, qui observe les requêtes réellement émises.
 */
import { test, expect } from '@playwright/test';
import { listHtmlFiles, readDistText, requireDist } from '../fixtures/dist.ts';

/** Un échantillon couvrant chaque gabarit distinct, pas les 26 pages. */
const SAMPLE = ['/', '/en/', '/blog/', '/en/blog/'] as const;

test.describe('Invariant 0 requête externe', () => {
  test.beforeAll(() => requireDist());

  test('aucun attribut de CHARGEMENT ne pointe une origine externe', () => {
    // `src` / `srcset` chargent toujours. Pour `<link>`, seuls comptent les
    // rel qui tirent une ressource — `alternate` et `canonical` sont des
    // métadonnées, et elles portent légitimement l'URL absolue du site.
    const LOADING_REL = /rel="(stylesheet|preload|prefetch|preconnect|icon|apple-touch-icon|manifest)"/i;
    const offenders: string[] = [];

    for (const f of listHtmlFiles()) {
      const html = readDistText(f);

      for (const m of html.matchAll(/<[^>]*\s(?:src|srcset)="(https?:\/\/[^"]+)"/gi)) {
        offenders.push(`${f} : chargement de ${m[1]}`);
      }
      for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
        const tag = m[0];
        if (!LOADING_REL.test(tag)) continue;
        if (/href="https?:\/\//i.test(tag)) offenders.push(`${f} : ${tag.slice(0, 70)}…`);
      }
    }

    expect(
      offenders,
      offenders.length ? `Ressources externes chargées :\n  ${offenders.join('\n  ')}` : '',
    ).toEqual([]);
  });

  for (const path of SAMPLE) {
    test(`${path} — toutes les requêtes restent sur l'origine`, async ({ page, baseURL }) => {
      // La mesure concluante : ce que le navigateur demande réellement.
      const origin = new URL(baseURL ?? 'http://localhost:4321').origin;
      const foreign: string[] = [];

      page.on('request', (req) => {
        const u = new URL(req.url());
        if (u.origin !== origin && u.protocol !== 'data:') {
          foreign.push(`${req.resourceType()} → ${req.url()}`);
        }
      });

      await page.goto(path, { waitUntil: 'load' });

      expect(
        foreign,
        foreign.length ? `Requêtes sortant de l'origine :\n  ${foreign.join('\n  ')}` : '',
      ).toEqual([]);
    });
  }

  test('les liens externes sont des liens de navigation, et portent rel=noopener', () => {
    // Le pendant du test ci-dessus : les `<a>` externes sont légitimes, mais
    // ceux qui ouvrent un nouvel onglet doivent porter `rel`. Un `target=_blank`
    // sans `noopener` donne à la page ouverte une référence sur la nôtre.
    const offenders: string[] = [];
    for (const f of listHtmlFiles()) {
      for (const m of readDistText(f).matchAll(/<a\b[^>]*>/gi)) {
        const tag = m[0];
        if (!/target="_blank"/i.test(tag)) continue;
        if (!/rel="[^"]*noopener/i.test(tag)) {
          offenders.push(`${f} : ${tag.slice(0, 90)}…`);
        }
      }
    }
    expect(
      offenders,
      offenders.length ? `target="_blank" sans rel=noopener :\n  ${offenders.join('\n  ')}` : '',
    ).toEqual([]);
  });

  test('le lien mailto ne porte ni target ni rel', () => {
    // Ouvrir un client mail dans un nouvel onglet laisse un onglet vide.
    // Le composant Contact fait la distinction : c'est elle qu'on verrouille.
    const offenders: string[] = [];
    for (const f of listHtmlFiles()) {
      for (const m of readDistText(f).matchAll(/<a\b[^>]*href="mailto:[^"]*"[^>]*>/gi)) {
        if (/target=|rel=/i.test(m[0])) offenders.push(`${f} : ${m[0].slice(0, 90)}…`);
      }
    }
    expect(offenders, offenders.length ? `mailto avec target/rel :\n  ${offenders.join('\n  ')}` : '')
      .toEqual([]);
  });
});
