/**
 * GATE — bloquant.
 *
 * Risque : probabilité moyenne × impact très haut.
 *
 * La règle du vocabulaire public est une décision verrouillée du projet, et
 * elle a déjà échappé DEUX fois : une fois dans la copy, une fois dans une
 * image Open Graph où le texte est incrusté dans les pixels. Elle n'était
 * jusqu'ici gardée que par la vigilance humaine à la relecture.
 *
 * Trois surfaces indépendantes sont scannées, parce qu'aucune ne couvre les
 * autres :
 *   1. le texte rendu et les attributs visibles des 26 pages (via le
 *      navigateur, pas via un grep — voir helpers/vocabulary.ts) ;
 *   2. les URLs réellement produites, c'est-à-dire les noms de dossiers de
 *      `dist/` — les ancres et segments d'URL ne sont pas traduits ;
 *   3. les VALEURS des dictionnaires i18n, à la source.
 *
 * Ce qui n'est délibérément PAS scanné : les noms de clés i18n et les noms de
 * fichiers source. `"portfolio"` est une clé de structure dans `fr.json`, et
 * `Portfolio.astro` est un nom de composant : c'est du code, pas du texte
 * publié. Mesuré le 07.10 : le texte rendu des 26 pages ne contient aucun mot
 * banni, et les deux seules occurrences du mot dans les sources sont ces clés.
 */
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pages } from '../fixtures/pages.ts';
import { repoRoot } from '../fixtures/paths.ts';
import { listFiles, requireDist } from '../fixtures/dist.ts';
import { scan, formatFindings, extractSurfaces, type Finding } from '../helpers/vocabulary.ts';

test.describe('Vocabulaire public — ligne rouge', () => {
  for (const p of pages) {
    test(`aucun mot banni dans le rendu de ${p.path}`, async ({ page }) => {
      await page.goto(p.path, { waitUntil: 'domcontentloaded' });

      const surfaces = await page.evaluate(extractSurfaces);
      const findings: Finding[] = [
        ...scan(surfaces.title, `${p.path} <title>`),
        ...scan(surfaces.innerText, `${p.path} body.innerText`),
        ...surfaces.attributes.flatMap((a) => scan(a.value, `${p.path} ${a.where}`)),
      ];

      expect(
        findings,
        findings.length
          ? `Vocabulaire banni dans le rendu :\n\n${formatFindings(findings)}`
          : '',
      ).toEqual([]);
    });
  }

  test('aucun mot banni dans les URLs produites (noms de dossiers de dist/)', () => {
    requireDist();
    // Les segments d'URL ne sont pas traduits : `#outils` en FR comme en EN.
    // On scanne les chemins, pas le contenu — donc pas de faux positif sur un
    // nom d'asset haché, qui est un nom de FICHIER et non de dossier.
    const dirs = new Set<string>();
    for (const f of listFiles()) {
      const parts = f.split('/');
      parts.pop();
      for (let i = 0; i < parts.length; i++) dirs.add(parts.slice(0, i + 1).join('/'));
    }

    const findings = [...dirs].flatMap((d) => scan(d, `dist/${d}/ (segment d'URL)`));
    expect(
      findings,
      findings.length ? `Vocabulaire banni dans une URL :\n\n${formatFindings(findings)}` : '',
    ).toEqual([]);
  });

  for (const lang of ['fr', 'en'] as const) {
    test(`aucun mot banni dans les valeurs de ${lang}.json`, () => {
      const raw = readFileSync(join(repoRoot, 'src', 'i18n', `${lang}.json`), 'utf8');
      const dict: unknown = JSON.parse(raw.replace(/\r\n/g, '\n'));

      // On parcourt les VALEURS, jamais les clés : une clé est de la structure
      // (`"portfolio": { … }`), une valeur est de la copy publiée.
      const findings: Finding[] = [];
      const walk = (node: unknown, path: string): void => {
        if (typeof node === 'string') {
          findings.push(...scan(node, `src/i18n/${lang}.json → ${path}`));
        } else if (Array.isArray(node)) {
          node.forEach((v, i) => walk(v, `${path}[${i}]`));
        } else if (node && typeof node === 'object') {
          for (const [k, v] of Object.entries(node)) walk(v, `${path}.${k}`);
        }
      };
      walk(dict, lang);

      expect(
        findings,
        findings.length
          ? `Vocabulaire banni dans la copy ${lang.toUpperCase()} :\n\n${formatFindings(findings)}`
          : '',
      ).toEqual([]);
    });
  }
});
