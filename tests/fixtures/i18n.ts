/**
 * Accès typé aux dictionnaires i18n, lus à la source.
 *
 * Lecture par `fs` plutôt que par `import … with { type: 'json' }` : le projet
 * est en `"type": "module"`, et les assertions d'import JSON sont un terrain
 * mouvant selon le loader. Le `fs` ne dépend de rien et normalise le CRLF au
 * passage.
 *
 * Les specs lisent ces fichiers au lieu de recopier des littéraux. Le FR écrit
 * « 100 % » avec une espace, l'EN « 100% » sans : partager une chaîne entre
 * locales produirait un test faux pour une raison invisible.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { repoRoot } from './paths.ts';
import type { Locale } from './pages.ts';

export interface NavItem {
  readonly id: string;
  readonly label: string;
}

export interface Repo {
  readonly name: string;
  readonly description: string;
  readonly url: string;
}

/** Forme utile aux specs — volontairement partielle, pas une redéfinition du schéma. */
export interface Dictionary {
  readonly meta: { readonly title: string; readonly description: string; readonly og_locale: string };
  readonly nav: { readonly skip: string; readonly items: readonly NavItem[] };
  readonly hero: {
    readonly id: string;
    readonly cta_primary: { readonly label: string; readonly href: string };
    readonly cta_secondary: { readonly label: string; readonly href: string };
  };
  readonly proofs: { readonly id: string; readonly items: readonly { readonly value: string; readonly text: string }[] };
  readonly portfolio: { readonly id: string; readonly blocks: readonly { readonly title: string; readonly repos: readonly Repo[] }[] };
  readonly blog: { readonly id: string; readonly index_title: string; readonly index_description: string };
  readonly stack: { readonly id: string; readonly items: readonly string[] };
  readonly journey: { readonly id: string };
  readonly contact: {
    readonly id: string;
    readonly items: readonly { readonly label: string; readonly value: string; readonly href: string }[];
  };
  readonly footer: { readonly copyright: string };
}

function read(lang: Locale): Dictionary {
  const raw = readFileSync(join(repoRoot, 'src', 'i18n', `${lang}.json`), 'utf8');
  return JSON.parse(raw.replace(/\r\n/g, '\n')) as Dictionary;
}

export const dict: Readonly<Record<Locale, Dictionary>> = { fr: read('fr'), en: read('en') };

/**
 * Les `id` de section, dans l'ordre d'apparition dans la page.
 *
 * Décision verrouillée du projet : **les ancres ne sont pas traduites**. Ces
 * `id` doivent donc être identiques en FR et en EN, même quand les libellés
 * diffèrent légitimement.
 */
export function sectionIds(lang: Locale): string[] {
  const d = dict[lang];
  return [d.hero.id, d.proofs.id, d.portfolio.id, d.blog.id, d.stack.id, d.journey.id, d.contact.id];
}

/** Les 7 dépôts de la cartographie, pour la locale donnée. */
export function repos(lang: Locale): Repo[] {
  return dict[lang].portfolio.blocks.flatMap((b) => [...b.repos]);
}

/** Préfixe d'URL de la locale : `''` pour le FR servi à la racine, `/en` pour l'EN. */
export const localeBase = (lang: Locale): string => (lang === 'fr' ? '' : '/en');
