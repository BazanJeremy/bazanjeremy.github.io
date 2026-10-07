/**
 * Catalogue des pages du site, DÉRIVÉ des sources — jamais codé en dur.
 *
 * Raison : un catalogue en dur se désynchronise au premier article ajouté, et
 * un test qui ne voit pas une page ne la teste pas sans rien signaler. Ici,
 * ajouter un article à `src/content/blog/` suffit pour qu'il entre dans la
 * suite.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { repoRoot } from './paths.ts';

export type Locale = 'fr' | 'en';

export interface Article {
  /** Chemin du fichier source, relatif à la racine du dépôt. */
  readonly file: string;
  /** Nom de fichier sans extension — doit égaler `slug`. */
  readonly stem: string;
  readonly lang: Locale;
  readonly slug: string;
  readonly translationSlug?: string;
  readonly title: string;
  readonly date: string;
  readonly tag: string;
  readonly excerpt: string;
  readonly linkedin?: string;
  readonly draft: boolean;
  /** URL servie, slash final compris. */
  readonly path: string;
}

export interface Page {
  /** Chemin servi, toujours avec slash final (la forme canonique). */
  readonly path: string;
  readonly lang: Locale;
  readonly kind: 'home' | 'blog-index' | 'article';
  /** Chemin de la page équivalente dans l'autre langue, si connu. */
  readonly altPath?: string;
}

const CONTENT_DIR = join(repoRoot, 'src', 'content', 'blog');

/**
 * Le frontmatter du projet est plat : `clé: valeur`, valeur nue ou entre
 * guillemets doubles. Pas de YAML imbriqué, donc pas de dépendance YAML —
 * on reste dans la stack verrouillée.
 */
function parseFrontmatter(raw: string): Record<string, string> {
  const text = raw.replace(/\r\n/g, '\n'); // CRLF : cette machine extrait en \r\n
  const match = /^---\n([\s\S]*?)\n---/.exec(text);
  if (!match) throw new Error('frontmatter absent ou mal délimité');

  const out: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    if (!line.trim()) continue;
    const sep = line.indexOf(':');
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim();
    let value = line.slice(sep + 1).trim();
    if (value.startsWith('"') && value.endsWith('"') && value.length >= 2) {
      // Scalaire YAML entre guillemets doubles : il faut déséchapper, pas
      // seulement retirer les guillemets extérieurs. Deux titres du dépôt
      // commencent par une citation (`"\"Strong\" passwords: …"`), et sans
      // déséchappement la valeur lue garde les antislashs — ce qui faisait
      // échouer la comparaison avec le h1 rendu pour une raison qui n'avait
      // rien à voir avec le site.
      value = value
        .slice(1, -1)
        .replace(/\\(["\\/])/g, '$1')
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t');
    }
    out[key] = value;
  }
  return out;
}

function readArticles(): Article[] {
  const out: Article[] = [];
  for (const lang of ['fr', 'en'] as const) {
    const dir = join(CONTENT_DIR, lang);
    for (const name of readdirSync(dir).filter((n) => n.endsWith('.md')).sort()) {
      const fm = parseFrontmatter(readFileSync(join(dir, name), 'utf8'));
      const stem = name.replace(/\.md$/, '');
      const slug = fm.slug ?? '';
      const draft = fm.draft === 'true';
      const base = lang === 'fr' ? '/blog/' : '/en/blog/';
      out.push({
        file: `src/content/blog/${lang}/${name}`,
        stem,
        lang,
        slug,
        translationSlug: fm.translationSlug || undefined,
        title: fm.title ?? '',
        date: fm.date ?? '',
        tag: fm.tag ?? '',
        excerpt: fm.excerpt ?? '',
        linkedin: fm.linkedin || undefined,
        draft,
        path: `${base}${slug}/`,
      });
    }
  }
  return out;
}

/** Tous les articles, brouillons compris. */
export const allArticles: readonly Article[] = readArticles();

/** Les articles réellement construits — `draft: true` est exclu du build. */
export const articles: readonly Article[] = allArticles.filter((a) => !a.draft);

export const articlesByLang = (lang: Locale): readonly Article[] =>
  articles.filter((a) => a.lang === lang);

function buildPages(): Page[] {
  const out: Page[] = [
    { path: '/', lang: 'fr', kind: 'home', altPath: '/en/' },
    { path: '/en/', lang: 'en', kind: 'home', altPath: '/' },
    { path: '/blog/', lang: 'fr', kind: 'blog-index', altPath: '/en/blog/' },
    { path: '/en/blog/', lang: 'en', kind: 'blog-index', altPath: '/blog/' },
  ];
  for (const a of articles) {
    const otherBase = a.lang === 'fr' ? '/en/blog/' : '/blog/';
    out.push({
      path: a.path,
      lang: a.lang,
      kind: 'article',
      altPath: a.translationSlug ? `${otherBase}${a.translationSlug}/` : undefined,
    });
  }
  return out;
}

/** Les 26 pages servies, en forme canonique (slash final). */
export const pages: readonly Page[] = buildPages();

export const pagesByLang = (lang: Locale): readonly Page[] =>
  pages.filter((p) => p.lang === lang);
