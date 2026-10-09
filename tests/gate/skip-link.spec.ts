/**
 * GATE — bloquant.
 *
 * Risque : probabilité basse × impact moyen.
 *
 * Le lien d'évitement est la SEULE interaction clavier que possède un site à
 * 0 JS, et il est entièrement porté par du CSS : il vit à `left: -9999px` et ne
 * revient à l'écran qu'au `:focus`. Un changement de cette règle le rendrait
 * soit inutilisable (jamais visible), soit disgracieux (toujours visible), dans
 * les deux cas sans rien casser au build.
 *
 * DEUX CHOSES DISTINCTES, séparées après une mesure du 08.10. Le rejeu sur
 * WebKit faisait échouer cette spec, et la cause n'était pas le site :
 *
 *   - dans WebKit, un `Tab` laisse le focus sur `<body>` — Safari ne tabule pas
 *     sur les liens sans l'option « Press Tab to highlight each item on a
 *     webpage ». C'est un modèle clavier de navigateur, pas un défaut.
 *   - mais un `focus()` programmé y fonctionne parfaitement : le lien passe de
 *     `left: -9999` à `left: 0`. Le CSS du site est donc correct dans WebKit.
 *
 * D'où la séparation : le comportement du SITE (hors écran, puis visible au
 * focus, puis mène au contenu) est vérifié sur tous les moteurs par focus
 * programmé ; « un seul Tab suffit » n'est vérifié que là où Tab atteint les
 * liens. Mélanger les deux faisait porter à la spec une affirmation fausse sur
 * un moteur.
 */
import { test, expect } from '@playwright/test';
import { gotoStyled } from '../fixtures/styled-page.ts';

const ENTRY_POINTS = ['/', '/en/'] as const;

test.describe('Lien d\'évitement', () => {
  for (const path of ENTRY_POINTS) {
    test(`${path} — hors écran, puis visible au focus, puis mène au contenu`, async ({ page }) => {
      await gotoStyled(page, path);

      // La cible doit exister avant de parler du lien.
      await expect(page.locator('main#contenu')).toHaveCount(1);

      const link = page.locator('a.skip-link');
      await expect(link).toHaveAttribute('href', '#contenu');

      // Hors focus : hors écran. Au focus : de retour. Les deux mesures dans la
      // même évaluation, pour qu'aucune ne puisse valoir sans l'autre.
      const geometry = await page.evaluate(() => {
        const el = document.querySelector('a.skip-link') as HTMLElement | null;
        if (!el) return null;
        const before = el.getBoundingClientRect().left;
        el.focus();
        const after = el.getBoundingClientRect().left;
        return { before, after, focused: document.activeElement === el };
      });

      expect(geometry, 'aucun lien d\'évitement dans la page').not.toBeNull();
      expect(
        geometry?.before ?? 0,
        'le lien d\'évitement devrait être hors écran sans le focus',
      ).toBeLessThan(0);
      expect(
        geometry?.after ?? -1,
        'le lien d\'évitement reste hors écran malgré le focus — il est inutilisable',
      ).toBeGreaterThanOrEqual(0);
      expect(geometry?.focused, 'le lien d\'évitement n\'est pas focalisable').toBe(true);

      // Et il mène bien au contenu.
      await page.keyboard.press('Enter');
      expect(new URL(page.url()).hash).toBe('#contenu');
    });
  }

  for (const path of ENTRY_POINTS) {
    test(`${path} — un seul Tab atteint le lien`, async ({ page, browserName }) => {
      // Mesuré le 08.10 : dans WebKit, `Tab` laisse le focus sur `<body>`, les
      // liens n'étant pas dans l'ordre de tabulation par défaut de Safari. Ce
      // n'est pas un défaut du site — le focus programmé y fonctionne, ce que
      // les tests ci-dessus vérifient sur tous les moteurs.
      test.skip(
        browserName === 'webkit',
        'WebKit ne tabule pas sur les liens par défaut (préférence Safari), le site n\'y est pour rien',
      );

      await gotoStyled(page, path);
      await page.keyboard.press('Tab');
      await expect(
        page.locator('a.skip-link'),
        'le lien d\'évitement n\'est pas le premier élément focalisable',
      ).toBeFocused();
    });
  }
});
