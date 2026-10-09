/**
 * GATE — bloquant. Sans navigateur : assertions fs seules sur `dist/`.
 *
 * Risque : probabilité basse × impact haut, et c'est un impact d'accessibilité
 * sur un site qui publie sur l'accessibilité.
 *
 * Tout tableau Markdown sort enveloppé dans une région défilable focalisable,
 * posée par `src/plugins/satteri-scrollable-tables.mjs`. Cet invariant vérifie
 * LES OCTETS SERVIS plutôt que le plugin : un plugin qui cesse d'être branché
 * (une option `markdown` réécrite, un bump d'Astro qui change l'API des
 * processeurs) laisserait les tableaux nus sans qu'aucun test du plugin ne
 * bronche.
 *
 * CE QUE LE CORRECTIF A RÉPARÉ, mesuré le 09.10 et non déduit : le scrollport
 * existait déjà (`display: block; overflow-x: auto` sur le `<table>`) et
 * défilait pour de bon — à 375px, `scrollWidth` 433 contre `clientWidth` 327,
 * et pousser `scrollLeft` à 106 ramenait la dernière colonne dans le viewport.
 * Ce qui manquait, c'est que `tabIndex` valait -1 : personne au clavier ne
 * pouvait le faire défiler (WCAG 2.1.1), et rien n'annonçait la région. C'est
 * `tabindex="0"` qui est l'objet de ce fichier, pas le débordement.
 *
 * Le comportement — défilement réel, touches fléchées, sémantique du tableau
 * intacte sur les trois moteurs — est vérifié par `gate/mobile-375.spec.ts`,
 * qui a un navigateur et la bonne largeur.
 */
import { test, expect } from '@playwright/test';
import { listHtmlFiles, readDistText, requireDist } from '../fixtures/dist.ts';
import { dict } from '../fixtures/i18n.ts';

/** Chaque ouverture de `<table>`, avec la balise qui la précède immédiatement. */
const TABLE_OPEN = /([^<]*(?:<[^>]+>)?)<table[\s>]/g;

test.describe('Invariant — tableaux dans une région défilable focalisable', () => {
  test.beforeAll(() => requireDist());

  test('chaque tableau servi est enveloppé, annoncé et focalisable', () => {
    const problemes: string[] = [];

    for (const file of listHtmlFiles()) {
      const html = readDistText(file);
      // `listHtmlFiles` normalise déjà les séparateurs en `/`.
      const lang = file.startsWith('en/') ? 'en' : 'fr';
      const attendu = dict[lang].blog.table_aria;

      for (const m of html.matchAll(TABLE_OPEN)) {
        const avant = m[1];
        const manque: string[] = [];
        if (!/class="[^"]*\btable-scroll\b[^"]*"/.test(avant)) manque.push('class table-scroll');
        if (!/role="region"/.test(avant)) manque.push('role="region"');
        if (!/tabindex="0"/.test(avant)) manque.push('tabindex="0"');

        const label = /aria-label="([^"]*)"/.exec(avant)?.[1];
        if (!label) manque.push('aria-label');
        else if (label !== attendu) {
          manque.push(`aria-label « ${label} » au lieu de « ${attendu} » (locale ${lang})`);
        }

        if (manque.length) problemes.push(`${file} : ${manque.join(', ')}`);
      }
    }

    expect(
      problemes,
      problemes.length
        ? `Tableaux servis sans région défilable focalisable :\n  ${problemes.join('\n  ')}\n` +
            `Un tableau plus large que le viewport redevient inatteignable au clavier.`
        : '',
    ).toEqual([]);
  });

  test('autant de régions que de tableaux, sur chaque page', () => {
    // Le pendant du test précédent : il attrape un conteneur laissé derrière
    // par une édition de contenu, qui annoncerait une région vide au lecteur
    // d'écran, et un tableau ajouté hors du plugin.
    const divergences = listHtmlFiles()
      .map((file) => {
        const html = readDistText(file);
        const regions = html.match(/class="[^"]*\btable-scroll\b[^"]*"/g)?.length ?? 0;
        const tableaux = html.match(/<table[\s>]/g)?.length ?? 0;
        return { file, regions, tableaux };
      })
      .filter((r) => r.regions !== r.tableaux)
      .map((r) => `${r.file} : ${r.regions} région(s) pour ${r.tableaux} tableau(x)`);

    expect(
      divergences,
      divergences.length ? `Comptes divergents :\n  ${divergences.join('\n  ')}` : '',
    ).toEqual([]);
  });
});
