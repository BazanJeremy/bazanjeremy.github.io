/**
 * Génère les cartes Open Graph / Twitter (1200×630), une par langue.
 *
 *   node scripts/og-image.mjs          → public/og-image.png + public/og-image-en.png
 *   node scripts/og-image.mjs --out X  → écrit ailleurs (mise au point)
 *
 * Rendu par `sharp`, présent dans node_modules via Astro (service d'images).
 * Ce n'est pas une dépendance déclarée du projet : le script est un outil de
 * génération lancé à la main, pas une étape du build.
 *
 * Les polices sont celles du système (le SVG est rendu par librsvg) : Inter et
 * JetBrains Mono ne sont pas utilisées ici, elles ne servent qu'au site.
 *
 * Le décor (halo, arcs) est une reconstruction : le script d'origine (#7)
 * n'avait pas été versionné. La géométrie du texte, elle, reprend les mesures
 * de l'image d'origine au pixel près.
 */
import sharp from 'sharp';

const W = 1200;
const H = 630;

const COLOR = {
  bg: '#0d1117',
  line: '#232a2f',
  fg: '#e6edf3',
  muted: '#8b949e',
  accent: '#4cbf88',
};

const SANS = 'Segoe UI, DejaVu Sans, sans-serif';
const MONO = 'Consolas, DejaVu Sans Mono, monospace';

/**
 * Géométrie relevée sur l'image d'origine : chaque bloc a été calibré en
 * rendant le texte à différentes tailles jusqu'à retrouver la largeur et la
 * position verticale mesurées sur `public/og-image.png` (écart ≤ 2 px).
 */
const LAYOUT = {
  margin: 96,
  bar: 6,
  kicker: { dashFrom: 96, dashTo: 140, dashY: 150, x: 158, baseline: 157, size: 23.5, spacing: 3.5 },
  name: { x: 96, baseline: 269, size: 90.5 },
  title: { x: 96, baseline: 332, size: 37 },
  thesis: { x: 96, baseline: 420, size: 31, lineHeight: 44 },
  rule: { y: 536, from: 96, to: 1104 },
  foot: { baseline: 579, size: 22, spacing: 1, right: 1104 },
};

const LOCALES = {
  fr: {
    file: 'og-image.png',
    kicker: 'OUTILS QA × IA',
    name: 'Jérémy Bazan',
    title: 'QA Engineer confirmé · Testing augmenté par l’IA',
    thesis: ['Le déterministe d’abord, l’IA là où elle apporte —', 'le QA reste l’arbitre.'],
    footLeft: 'bazanjeremy.github.io',
    footRight: 'Suisse romande · CDI',
  },
  en: {
    file: 'og-image-en.png',
    kicker: 'QA × AI TOOLS',
    name: 'Jérémy Bazan',
    title: 'Senior QA Engineer · AI-augmented testing',
    thesis: ['Deterministic first, AI where it earns its place —', 'QA stays the arbiter.'],
    footLeft: 'bazanjeremy.github.io',
    footRight: 'French-speaking Switzerland · Permanent role',
  },
};

const escape = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function svg(locale) {
  const t = LOCALES[locale];
  const L = LAYOUT;

  const thesis = t.thesis
    .map(
      (line, i) =>
        `<text x="${L.thesis.x}" y="${L.thesis.baseline + i * L.thesis.lineHeight}" font-family="${SANS}" font-size="${L.thesis.size}" fill="${COLOR.muted}">${escape(line)}</text>`,
    )
    .join('\n    ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <!-- Halo : centre et décroissance ajustés sur les valeurs relevées dans
         l'image d'origine (il s'éteint avant le tiers gauche). -->
    <radialGradient id="halo" cx="1000" cy="700" r="620" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${COLOR.accent}" stop-opacity="0.11" />
      <stop offset="0.35" stop-color="${COLOR.accent}" stop-opacity="0.09" />
      <stop offset="0.6" stop-color="${COLOR.accent}" stop-opacity="0.045" />
      <stop offset="0.85" stop-color="${COLOR.accent}" stop-opacity="0.02" />
      <stop offset="1" stop-color="${COLOR.accent}" stop-opacity="0" />
    </radialGradient>
    <clipPath id="frame"><rect width="${W}" height="${H}" /></clipPath>
  </defs>

  <rect width="${W}" height="${H}" fill="${COLOR.bg}" />
  <rect width="${W}" height="${H}" fill="url(#halo)" />

  <!-- Arcs concentriques : centre et rayons déduits des points relevés sur
       l'image d'origine (ils ne débordent pas du tiers droit). -->
  <g clip-path="url(#frame)" fill="none" stroke="${COLOR.accent}" stroke-width="1.5">
    <circle cx="1342" cy="701" r="280" opacity="0.10" />
    <circle cx="1342" cy="701" r="405" opacity="0.08" />
    <circle cx="1342" cy="701" r="530" opacity="0.07" />
    <circle cx="1342" cy="701" r="655" opacity="0.06" />
  </g>

  <rect width="${W}" height="${L.bar}" fill="${COLOR.accent}" />

  <line x1="${L.kicker.dashFrom}" y1="${L.kicker.dashY}" x2="${L.kicker.dashTo}" y2="${L.kicker.dashY}" stroke="${COLOR.accent}" stroke-width="2" />
  <text x="${L.kicker.x}" y="${L.kicker.baseline}" font-family="${MONO}" font-size="${L.kicker.size}" letter-spacing="${L.kicker.spacing}" fill="${COLOR.accent}">${escape(t.kicker)}</text>

  <text x="${L.name.x}" y="${L.name.baseline}" font-family="${SANS}" font-size="${L.name.size}" font-weight="700" fill="${COLOR.fg}">${escape(t.name)}</text>
  <text x="${L.title.x}" y="${L.title.baseline}" font-family="${SANS}" font-size="${L.title.size}" font-weight="600" fill="${COLOR.accent}">${escape(t.title)}</text>

    ${thesis}

  <line x1="${L.rule.from}" y1="${L.rule.y}" x2="${L.rule.to}" y2="${L.rule.y}" stroke="${COLOR.line}" stroke-width="1" />

  <text x="${L.margin}" y="${L.foot.baseline}" font-family="${MONO}" font-size="${L.foot.size}" letter-spacing="${L.foot.spacing}" fill="${COLOR.muted}">${escape(t.footLeft)}</text>
  <text x="${L.foot.right}" y="${L.foot.baseline}" font-family="${MONO}" font-size="${L.foot.size}" letter-spacing="${L.foot.spacing}" text-anchor="end" fill="${COLOR.accent}">${escape(t.footRight)}</text>
</svg>`;
}

const outDir = process.argv.includes('--out')
  ? process.argv[process.argv.indexOf('--out') + 1]
  : 'public';

for (const locale of Object.keys(LOCALES)) {
  const target = `${outDir}/${LOCALES[locale].file}`;
  await sharp(Buffer.from(svg(locale)))
    .flatten({ background: COLOR.bg }) // PNG sRGB sans canal alpha, comme l'original
    .png({ compressionLevel: 9, palette: false })
    .toFile(target);
  console.log(`écrit ${target}`);
}
