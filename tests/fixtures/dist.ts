/**
 * Helpers fs sur `dist/`, normalisant le CRLF.
 *
 * Cette machine extrait les fichiers en CRLF (`core.autocrlf=true`) alors que
 * la CI construit en LF. Toute comparaison de CONTENU doit donc normaliser, et
 * aucune assertion ne doit comparer des OCTETS — sinon les specs seraient
 * rouges en local et vertes en CI pour une raison sans rapport avec le site.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { distDir } from './paths.ts';

export { distDir };

/** Lève une erreur explicite plutôt que d'échouer obscurément plus loin. */
export function requireDist(): void {
  if (!existsSync(distDir)) {
    throw new Error(
      `dist/ est absent : ces tests assèrent la sortie du build.\n` +
        `Lance \`npm run build\` d'abord (ou \`npm run test:e2e\`, qui le fait).`,
    );
  }
}

/** Tous les fichiers de `dist/`, en chemins relatifs à slash avant. */
export function listFiles(dir: string = distDir): string[] {
  const out: string[] = [];
  const walk = (d: string): void => {
    for (const name of readdirSync(d).sort()) {
      const full = join(d, name);
      if (statSync(full).isDirectory()) walk(full);
      else out.push(relative(distDir, full).split(sep).join('/'));
    }
  };
  walk(dir);
  return out;
}

/** Les 26 fichiers `index.html` construits. */
export function listHtmlFiles(): string[] {
  return listFiles().filter((f) => f.endsWith('.html'));
}

/** Lit un fichier de `dist/` en normalisant les fins de ligne. */
export function readDistText(relPath: string): string {
  return readFileSync(join(distDir, relPath), 'utf8').replace(/\r\n/g, '\n');
}

/** `blog/mon-article/index.html` → `/blog/mon-article/` (la forme canonique). */
export function htmlFileToUrlPath(relPath: string): string {
  const withoutIndex = relPath.replace(/index\.html$/, '');
  return `/${withoutIndex}`;
}
