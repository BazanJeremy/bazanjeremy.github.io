/**
 * GATE — bloquant. Sans navigateur.
 *
 * Risque : probabilité basse × impact moyen.
 *
 * Tout ce que la page référence doit exister dans `dist/`. Un 404 sur une
 * police n'empêche pas la page de s'afficher — elle tombe simplement sur une
 * police système, ce qui change tout le rendu sans rien casser.
 *
 * Les images Open Graph ont un contrat documenté : 1200×630, sans canal alpha
 * (le générateur applique `.flatten()`), ~70 Ko. Il est lu directement dans
 * l'en-tête IHDR du PNG — quatre champs à des positions fixes, donc aucune
 * bibliothèque image n'est nécessaire. Mesuré le 07.10 : les deux fichiers
 * sont en 1200×630, 8 bits, type couleur 2, 67 et 69 Ko.
 */
import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { distDir, listHtmlFiles, readDistText, requireDist } from '../fixtures/dist.ts';

const OG_IMAGES = ['og-image.png', 'og-image-en.png'] as const;
const FONTS = [
  'fonts/inter-latin-wght-normal.woff2',
  'fonts/jetbrains-mono-latin-wght-normal.woff2',
] as const;

/** Type couleur PNG 2 = couleur vraie sans canal alpha. */
const PNG_TRUECOLOR_NO_ALPHA = 2;

interface PngHeader {
  readonly width: number;
  readonly height: number;
  readonly bitDepth: number;
  readonly colorType: number;
  readonly bytes: number;
}

function readPngHeader(relPath: string): PngHeader {
  const b = readFileSync(join(distDir, relPath));
  expect(b.subarray(0, 8).toString('hex'), `${relPath} n'est pas un PNG`).toBe('89504e470d0a1a0a');
  expect(b.subarray(12, 16).toString('ascii'), `${relPath} : premier chunk inattendu`).toBe('IHDR');
  return {
    width: b.readUInt32BE(16),
    height: b.readUInt32BE(20),
    bitDepth: b[24],
    colorType: b[25],
    bytes: b.length,
  };
}

test.describe('Assets', () => {
  test.beforeAll(() => requireDist());

  test('les polices auto-hébergées sont présentes', () => {
    const missing = FONTS.filter((f) => !existsSync(join(distDir, f)));
    expect(
      missing,
      missing.length
        ? `Polices absentes : ${missing.join(', ')}\n` +
            `La page tomberait silencieusement sur une police système.`
        : '',
    ).toEqual([]);
  });

  test('chaque police préchargée existe et porte crossorigin', () => {
    // Un `preload` de police sans `crossorigin` est téléchargé DEUX FOIS :
    // une fois par le preload, une fois par `@font-face`. Défaut classique et
    // invisible.
    const problems: string[] = [];
    const html = readDistText('index.html');
    let fontPreloads = 0;

    for (const m of html.matchAll(/<link\b[^>]*rel="preload"[^>]*>/gi)) {
      const tag = m[0];
      if (!/as="font"/i.test(tag)) continue;
      fontPreloads += 1;
      const href = /href="([^"]+)"/i.exec(tag)?.[1];
      if (!href) {
        problems.push(`preload sans href : ${tag}`);
        continue;
      }
      if (!existsSync(join(distDir, href.replace(/^\//, '')))) {
        problems.push(`preload vers ${href}, absent de dist/`);
      }
      if (!/crossorigin/i.test(tag)) {
        problems.push(`${href} préchargé sans crossorigin — la police sera téléchargée deux fois`);
      }
    }

    // Garde-fou du scan : s'il ne trouve aucun preload, il passerait vert sans
    // rien avoir vérifié. Les deux polices du projet sont préchargées.
    expect(
      fontPreloads,
      'aucun preload de police trouvé — le scan ne vérifiait rien',
    ).toBe(FONTS.length);

    expect(problems, problems.length ? `Preloads de police :\n  ${problems.join('\n  ')}` : '').toEqual(
      [],
    );
  });

  test('le favicon et les deux images Open Graph existent', () => {
    const missing = ['favicon.svg', ...OG_IMAGES].filter((f) => !existsSync(join(distDir, f)));
    expect(missing, missing.length ? `Absents de dist/ : ${missing.join(', ')}` : '').toEqual([]);
  });

  for (const img of OG_IMAGES) {
    test(`${img} respecte le contrat 1200×630 sans alpha`, () => {
      const h = readPngHeader(img);
      expect({ width: h.width, height: h.height }, `${img} : dimensions hors contrat`).toEqual({
        width: 1200,
        height: 630,
      });
      expect(
        h.colorType,
        `${img} : type couleur ${h.colorType} — le générateur doit appliquer .flatten() ` +
          `pour retirer le canal alpha (type attendu ${PNG_TRUECOLOR_NO_ALPHA})`,
      ).toBe(PNG_TRUECOLOR_NO_ALPHA);
      expect(h.bitDepth).toBe(8);
      // Borne large : on surveille un dérapage d'ordre de grandeur, pas
      // quelques kilo-octets de compression.
      expect(h.bytes, `${img} fait ${Math.round(h.bytes / 1024)} Ko`).toBeLessThan(200 * 1024);
    });
  }

  test('aucune page ne référence un asset local absent', () => {
    const missing = new Set<string>();
    for (const f of listHtmlFiles()) {
      const html = readDistText(f);
      for (const m of html.matchAll(/(?:src|href)="(\/[^"#?]+\.[a-z0-9]{2,5})"/gi)) {
        const rel = m[1].replace(/^\//, '');
        if (!existsSync(join(distDir, rel))) missing.add(`${m[1]} (référencé par ${f})`);
      }
    }
    expect(
      [...missing],
      missing.size ? `Assets référencés mais absents :\n  ${[...missing].join('\n  ')}` : '',
    ).toEqual([]);
  });
});
