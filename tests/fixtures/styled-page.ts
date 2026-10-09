/**
 * Navigation pour les specs qui lisent du STYLE (style calculé, géométrie,
 * CSSOM) et non seulement du DOM.
 *
 * POURQUOI CE HELPER EXISTE, mesuré le 08.10 contre la production. Ce site a
 * **0 JS**, et `DOMContentLoaded` n'attend pas les feuilles de style externes
 * en l'absence de script à bloquer. Lire un style à `domcontentloaded` est donc
 * une COURSE contre le chargement de la feuille :
 *
 *   | moment              | feuilles appliquées | règles | animationName |
 *   |---------------------|---------------------|--------|---------------|
 *   | `domcontentloaded`  | 1 (l'inline seule)  | 7      | `none`        |
 *   | `load`              | 2                   | 38     | `reveal-fade` |
 *
 * En local, `astro preview` sert la feuille si vite que la course est toujours
 * gagnée — d'où une suite verte en local ET en CI. Pointée sur la production,
 * `nightly/reduced-motion` l'a perdue deux fois de suite, pendant que
 * `gate-desktop` et `gate-mobile` la gagnaient. **La répartition gagne/perd est
 * de cause inconnue** ; seul le mécanisme est mesuré. Un test qui dépend d'une
 * course est inutilisable, qu'il passe ou non.
 *
 * C'est la famille de défaut déjà rencontrée avec `astro preview` qui se
 * démonise : vert là où on le lance, faux ailleurs. Ici l'asymétrie est
 * inversée (vert en local, faux sur le réseau), mais le remède est le même —
 * rendre la précondition EXPLICITE au lieu de dépendre d'un délai.
 *
 * Les specs qui ne lisent que du DOM (texte, attributs, métadonnées, liens)
 * restent volontairement en `domcontentloaded` : c'est plus rapide et c'est
 * correct, puisque rien n'y dépend de la feuille.
 */
import { expect, type Page } from '@playwright/test';

/** Vrai quand au moins une feuille EXTERNE est chargée et lisible. */
const externalSheetApplied = () =>
  [...document.styleSheets].some((sheet) => {
    if (!sheet.href) return false;
    try {
      return sheet.cssRules.length > 0;
    } catch {
      // Feuille cross-origin : présente mais illisible. Le site n'en a aucune
      // — `invariants/zero-external` le vérifie —, donc on ne la compte pas.
      return false;
    }
  });

/**
 * Navigue vers `path` et n'en revient qu'une fois la feuille externe
 * **appliquée**. Toute spec qui lit un style doit passer par ici.
 */
export async function gotoStyled(page: Page, path: string): Promise<void> {
  await page.goto(path, { waitUntil: 'load' });

  await expect
    .poll(() => page.evaluate(externalSheetApplied), {
      message:
        `la feuille de style externe n'est pas appliquée sur ${path} : toute lecture de ` +
        'style serait faite sur une page non stylée, et conclurait à un défaut inexistant',
      timeout: 10_000,
    })
    .toBe(true);
}
