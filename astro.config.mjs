// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { satteri } from '@astrojs/markdown-satteri';
import scrollableTables from './src/plugins/satteri-scrollable-tables.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://bazanjeremy.github.io',
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
    routing: {
      // fr served at /, en served at /en/
      prefixDefaultLocale: false,
    },
  },
  // Les tableaux Markdown sortent dans une région défilable focalisable : le
  // scrollport doit être atteignable au clavier, et le plugin porte la mesure
  // qui l'a décidé. `satteri()` est le processeur PAR DÉFAUT d'Astro 7 — on ne
  // le remplace pas, on le rappelle juste avec un plugin, ce qui laisse le
  // rendu des 22 articles inchangé.
  markdown: {
    processor: satteri({ hastPlugins: [scrollableTables] }),
  },
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
