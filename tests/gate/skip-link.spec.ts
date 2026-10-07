/**
 * GATE — bloquant.
 *
 * Risque : probabilité basse × impact moyen.
 *
 * Le lien d'évitement est la SEULE interaction clavier que possède un site à
 * 0 JS, et il est entièrement porté par du CSS : il vit à `left:-9999px` et ne
 * revient à l'écran qu'au `:focus`. Un changement de cette règle le rendrait
 * soit invisible en permanence (donc inutilisable), soit visible en permanence
 * (donc un défaut d'affichage) — dans les deux cas sans rien casser au build.
 */
import { test, expect } from '@playwright/test';

const ENTRY_POINTS = ['/', '/en/'] as const;

test.describe('Lien d\'évitement', () => {
  for (const path of ENTRY_POINTS) {
    test(`${path} — premier Tab, puis saut vers le contenu`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' });

      // La cible doit exister avant de parler du lien.
      await expect(page.locator('main#contenu')).toHaveCount(1);

      const link = page.locator('a.skip-link');
      await expect(link).toHaveAttribute('href', '#contenu');

      // Hors focus : hors écran.
      const before = await link.boundingBox();
      expect(before, 'le lien d\'évitement n\'a pas de boîte').toBeTruthy();
      expect(
        (before?.x ?? 0) + (before?.width ?? 0),
        'le lien d\'évitement devrait être hors écran sans le focus',
      ).toBeLessThan(0);

      // Un seul Tab doit l'atteindre : c'est tout l'intérêt.
      await page.keyboard.press('Tab');
      await expect(link).toBeFocused();

      // Au focus : de retour à l'écran.
      const after = await link.boundingBox();
      expect(after?.x ?? -1, 'le lien d\'évitement reste hors écran malgré le focus').toBeGreaterThanOrEqual(
        0,
      );

      // Et il mène bien au contenu.
      await page.keyboard.press('Enter');
      expect(new URL(page.url()).hash).toBe('#contenu');
    });
  }
});
