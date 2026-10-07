/**
 * GATE — bloquant. Sans navigateur : assertions fs seules sur `dist/`.
 *
 * Risque : probabilité basse × impact maximal.
 *
 * Cette mesure est l'argument du projet face à chaque alerte Dependabot. Le
 * site étant statique et sans aucun JS client, un CVE de disponibilité dans
 * une dépendance de build n'a pas d'entrée hostile ici — mais cet argument ne
 * tient que si la mesure est vraie. Jusqu'ici elle ne vivait que dans une
 * phrase de CLAUDE.md, revérifiée à la main de loin en loin. Elle est
 * maintenant vérifiée à chaque passage.
 *
 * La probabilité est basse aujourd'hui, mais elle n'est pas nulle : une seule
 * intégration Astro ajoutée, un composant de framework, ou une balise <script>
 * dans un article, et l'argument tombe sans que personne le remarque.
 *
 * Mesuré le 07.10 sur `dist/` : 0 fichier `.js`, 0 balise `<script>` sur les
 * 26 pages, un seul asset (la feuille de style).
 */
import { test, expect } from '@playwright/test';
import { listFiles, listHtmlFiles, readDistText, requireDist } from '../fixtures/dist.ts';
import { pages } from '../fixtures/pages.ts';

test.describe('Invariant 0-JS', () => {
  test.beforeAll(() => requireDist());

  test('aucun fichier JavaScript dans dist/', () => {
    const js = listFiles().filter((f) => /\.(js|mjs|cjs)$/.test(f));
    expect(
      js,
      js.length
        ? `dist/ contient du JavaScript : ${js.join(', ')}\n` +
            `C'est l'argument qui répond aux alertes Dependabot — il vient de tomber.`
        : '',
    ).toEqual([]);
  });

  test('aucune balise <script> dans les pages construites', () => {
    const offenders = listHtmlFiles().filter((f) => /<script[\s>]/i.test(readDistText(f)));
    expect(
      offenders,
      offenders.length ? `Pages contenant une balise <script> : ${offenders.join(', ')}` : '',
    ).toEqual([]);
  });

  test('aucun gestionnaire d\'événement en attribut inline', () => {
    // Un `onclick=` ne serait pas attrapé par la recherche de <script> mais
    // exécuterait quand même du JS chez le visiteur.
    const re = /\son(click|load|error|mouseover|focus|submit|change|input|keydown)\s*=/i;
    const offenders = listHtmlFiles().filter((f) => re.test(readDistText(f)));
    expect(
      offenders,
      offenders.length ? `Pages avec un handler inline : ${offenders.join(', ')}` : '',
    ).toEqual([]);
  });

  test('toutes les pages déclarées par le contenu sont construites', () => {
    // Garde-fou du scan lui-meme : un scan qui ne voit aucune page passerait
    // vert sans rien avoir vérifié. C'est la même précaution que la
    // précondition de largeur dans mobile-375.
    //
    // Le compte attendu est DÉRIVÉ du catalogue (lui-même dérivé de
    // `src/content/blog/`), jamais code en dur : un nombre en dur se
    // casserait à chaque paire d'articles ajoutée — le même piège que le
    // `minTestsCount` d'Allure. Dérivé, il assère quelque chose de plus fort :
    // chaque page que le contenu déclare a bien été construite, donc une
    // régression de `getStaticPaths` qui en perdrait une se voit.
    const html = listHtmlFiles();
    expect(html.length, 'aucune page construite — le scan ne vérifiait rien').toBeGreaterThan(0);

    const built = new Set(html.map((f) => `/${f.replace(/index\.html$/, '')}`));
    const missing = pages.map((p) => p.path).filter((p) => !built.has(p));
    const unexpected = [...built].filter((p) => !pages.some((x) => x.path === p));

    expect(
      { missing, unexpected },
      'écart entre les pages déclarées par le contenu et les pages construites',
    ).toEqual({ missing: [], unexpected: [] });
  });
});
