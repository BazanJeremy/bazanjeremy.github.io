import frRaw from './fr.json';
import enRaw from './en.json';

/** Supported locales. `fr` is the default (served at `/`), `en` at `/en/`. */
export const locales = ['fr', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'fr';

/** The FR dictionary is the canonical shape; EN mirrors it (values may be "TODO"). */
export type Dictionary = typeof frRaw;

const dictionaries: Record<Locale, Dictionary> = {
  fr: frRaw,
  en: enRaw as Dictionary,
};

/** Returns the translation dictionary for a locale, typed against the FR shape. */
export function useTranslations(lang: Locale): Dictionary {
  return dictionaries[lang];
}

/** Derives the active locale from a URL pathname (`/en/...` -> `en`, else `fr`). */
export function getLocaleFromUrl(url: URL): Locale {
  const segment = url.pathname.split('/')[1];
  return segment === 'en' ? 'en' : 'fr';
}

/** Paths of one page in both languages (used by hreflang + language toggle). */
export type AltPaths = Record<Locale, string>;

/**
 * Returns the equivalent path in `target` locale, preserving the current path.
 * Mechanical `/x` <-> `/en/x` mapping — only valid when both languages share
 * the same path. Blog articles have per-language slugs: their pages must pass
 * explicit `altPaths` to BaseLayout instead.
 */
export function switchLocalePath(url: URL, target: Locale): string {
  let path = url.pathname;

  // Normalize to the default-locale (fr) path by stripping any `/en` prefix.
  if (path === '/en' || path === '/en/') path = '/';
  else if (path.startsWith('/en/')) path = path.slice('/en'.length);

  if (target === 'en') {
    return path === '/' ? '/en/' : `/en${path}`;
  }
  return path;
}
