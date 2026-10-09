/**
 * La ligne rouge du vocabulaire public (CLAUDE.md, 30.07).
 *
 * Les mots ci-dessous sont bannis de TOUT texte rendu : copy, navigation,
 * libellés de boutons, et ancres d'URL. On dit « outils », « série d'outils »,
 * ou le nom du projet.
 *
 * Cette règle a déjà échappé deux fois. La seconde fois, elle a survécu dans
 * une image Open Graph où le texte est incrusté dans les pixels : aucun `grep`
 * ne pouvait la voir. C'est pourquoi le scan porte sur plusieurs surfaces
 * distinctes plutôt que sur une seule.
 *
 * `Portfolio.astro` garde son nom : c'est du code, pas du texte publié. Donc
 * on ne scanne jamais les noms de fichiers source, seulement ce qui est rendu.
 */

export interface BannedPattern {
  readonly name: string;
  readonly re: RegExp;
  readonly why: string;
}

export const BANNED: readonly BannedPattern[] = [
  {
    name: 'portfolio',
    re: /portfolio/i,
    why: 'banni du texte public ; dire « outils » ou « série d\'outils »',
  },
  {
    name: 'entretien',
    re: /entretiens?/i,
    why: 'banni du texte public (vitrine, pas candidature)',
  },
  {
    name: 'recruteur',
    re: /recruteur(s|se|ses)?|recruiter/i,
    why: 'banni du texte public : le site ne nomme pas son lecteur',
  },
  {
    name: 'démonstration',
    re: /d[ée]monstration|\bdemo\b/i,
    why: 'banni du texte public ; ce sont des outils, pas des démonstrations',
  },
  {
    name: 'P1-P7',
    re: /\bP[1-7]\b/,
    why: 'nomenclature interne des projets, jamais publiée (sensible à la casse)',
  },
];

export interface Finding {
  readonly pattern: string;
  readonly why: string;
  readonly surface: string;
  readonly match: string;
  /** Un peu de contexte autour du match, pour localiser sans relire la page. */
  readonly context: string;
}

/** Cherche tous les motifs bannis dans une chaîne, en nommant la surface scannée. */
export function scan(text: string, surface: string): Finding[] {
  const out: Finding[] = [];
  for (const p of BANNED) {
    const m = p.re.exec(text);
    if (!m) continue;
    const at = m.index;
    out.push({
      pattern: p.name,
      why: p.why,
      surface,
      match: m[0],
      context: text.slice(Math.max(0, at - 60), at + m[0].length + 60).replace(/\s+/g, ' '),
    });
  }
  return out;
}

/** Message d'échec lisible : quoi, où, et pourquoi c'est banni. */
export function formatFindings(findings: readonly Finding[]): string {
  return findings
    .map(
      (f) =>
        `  • « ${f.match} » (motif ${f.pattern})\n` +
        `    surface : ${f.surface}\n` +
        `    pourquoi : ${f.why}\n` +
        `    contexte : …${f.context}…`,
    )
    .join('\n\n');
}

/**
 * Surfaces extraites d'une page rendue.
 *
 * On extrait le texte et les valeurs d'attributs VISIBLES plutôt que le markup
 * brut : scanner le HTML brut ferait un faux positif de `\bP[1-7]\b` sur un nom
 * d'asset haché — `_astro_content.<hash>.css`, dont le hash est tiré à chaque
 * build et peut contenir un `P` suivi d'un chiffre. C'est pour ça que
 * l'extraction passe par le navigateur et pas par un `grep`. (Pas de hash
 * réel ici : écrit en dur, il serait relu comme l'état courant une fois
 * périmé.)
 */
export interface PageSurfaces {
  readonly innerText: string;
  readonly title: string;
  readonly attributes: readonly { readonly where: string; readonly value: string }[];
}

/** À exécuter dans la page (`page.evaluate`). */
export function extractSurfaces(): PageSurfaces {
  const attributes: { where: string; value: string }[] = [];
  const push = (where: string, value: string | null) => {
    if (value && value.trim()) attributes.push({ where, value });
  };

  document.querySelectorAll('[href]').forEach((el, i) => push(`[href] #${i} <${el.tagName.toLowerCase()}>`, el.getAttribute('href')));
  document.querySelectorAll('[aria-label]').forEach((el, i) => push(`[aria-label] #${i}`, el.getAttribute('aria-label')));
  document.querySelectorAll('[alt]').forEach((el, i) => push(`[alt] #${i}`, el.getAttribute('alt')));
  document.querySelectorAll('[title]').forEach((el, i) => push(`[title] #${i}`, el.getAttribute('title')));
  document.querySelectorAll('meta[content]').forEach((el) => {
    const key = el.getAttribute('name') ?? el.getAttribute('property') ?? '?';
    push(`meta[${key}]`, el.getAttribute('content'));
  });

  return {
    innerText: document.body.innerText,
    title: document.title,
    attributes,
  };
}
