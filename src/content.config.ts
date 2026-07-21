import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Veille / blog — Markdown articles, bilingual (fr/en).
 * Files live in src/content/blog/<lang>/<slug>.md; `lang` + `slug` in the
 * frontmatter drive routing (/blog/<slug> and /en/blog/<slug>).
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tag: z.string(),
    excerpt: z.string(),
    lang: z.enum(['fr', 'en']),
    slug: z.string(),
    /** Slug of the same article in the other language — drives the language
     *  toggle and hreflang on /blog/<slug> pages. Omit if untranslated
     *  (the toggle then falls back to the other language's blog index). */
    translationSlug: z.string().optional(),
    linkedin: z.string().url().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
