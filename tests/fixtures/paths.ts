/** Racine du dépôt, résolue depuis l'emplacement de ce module. */
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** `tests/fixtures/` → la racine du dépôt. */
export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Sortie du build. Toute assertion sur `dist/` exige un `npm run build` préalable. */
export const distDir = resolve(repoRoot, 'dist');
