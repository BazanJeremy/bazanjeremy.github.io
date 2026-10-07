/**
 * GATE — bloquant. Sans navigateur.
 *
 * Risque : probabilité basse × impact HAUT, pour une raison précise.
 *
 * Les cartes Open Graph incrustent leur texte DANS LES PIXELS du PNG. Aucun
 * scan de texte, aucun `grep`, aucune relecture de la copy ne peut donc voir ce
 * qu'elles disent. C'est exactement par là que la ligne rouge du vocabulaire a
 * fui : un mot interdit a survécu à une purge complète du site pendant près de
 * deux mois, dans une image, visible seulement par quelqu'un qui partageait un
 * lien.
 *
 * Cette spec scanne la COPY DU GÉNÉRATEUR, `scripts/og-image.mjs`, qui porte le
 * texte et la mise en page. C'est le seul endroit lisible par une machine.
 *
 * CE QUE ÇA NE PROUVE PAS, et qui doit rester dit : que les PNG commités
 * correspondent au script. Le générateur est lancé à la main, jamais par le
 * build. Un PNG retouché ou régénéré depuis une version antérieure du script
 * passerait ce test. La seule parade serait de régénérer et comparer, ce qui
 * exige `sharp` — présent via Astro mais non déclaré — et des polices système
 * identiques. Hors périmètre : on ferme le trou par lequel la fuite a eu lieu,
 * pas tous les trous imaginables.
 */
import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { repoRoot } from '../fixtures/paths.ts';
import { scan, formatFindings, type Finding } from '../helpers/vocabulary.ts';

const GENERATOR = 'scripts/og-image.mjs';

test.describe('Copy des cartes Open Graph', () => {
  test('le générateur existe toujours à l\'emplacement attendu', () => {
    expect(
      existsSync(join(repoRoot, GENERATOR)),
      `${GENERATOR} est absent : les PNG ne seraient plus régénérables, et cette spec ` +
        `ne vérifierait plus rien`,
    ).toBe(true);
  });

  test('aucun mot de la liste rouge dans les chaînes du générateur', () => {
    const src = readFileSync(join(repoRoot, GENERATOR), 'utf8').replace(/\r\n/g, '\n');

    // On écarte les lignes de commentaire plutôt que d'extraire les littéraux
    // par expression régulière : un commentaire peut légitimement nommer la
    // règle (comme le fait l'en-tête de cette spec), et une regex
    // d'extraction de chaînes JS correcte est plus fragile que ce qu'elle
    // apporte ici. Ce qui compte est scanné : les lignes de code.
    const codeLines = src
      .split('\n')
      .map((text, i) => ({ text, line: i + 1 }))
      .filter(({ text }) => {
        const t = text.trim();
        return t.length > 0 && !t.startsWith('//') && !t.startsWith('*') && !t.startsWith('/*');
      });

    expect(
      codeLines.length,
      `aucune ligne de code trouvée dans ${GENERATOR} — le scan ne vérifiait rien`,
    ).toBeGreaterThan(0);

    const findings: Finding[] = codeLines.flatMap(({ text, line }) =>
      scan(text, `${GENERATOR}:${line}`),
    );

    expect(
      findings,
      findings.length
        ? `Vocabulaire interdit dans la copy des cartes Open Graph — ` +
            `il finira incrusté dans les pixels, où aucun grep ne le trouvera :\n\n` +
            formatFindings(findings)
        : '',
    ).toEqual([]);
  });

  test('le générateur produit bien les deux images attendues', () => {
    // Si le script cessait d'écrire l'une des deux, la locale concernée
    // retomberait sur une image absente ou périmée.
    const src = readFileSync(join(repoRoot, GENERATOR), 'utf8');
    for (const name of ['og-image.png', 'og-image-en.png']) {
      expect(src, `${GENERATOR} ne mentionne plus ${name}`).toContain(name);
    }
  });
});
