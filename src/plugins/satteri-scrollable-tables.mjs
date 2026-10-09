/**
 * Enveloppe chaque tableau Markdown dans une région défilable FOCALISABLE.
 *
 * POURQUOI, et la mesure qui l'a décidé (09.10) : `.prose table` portait
 * `display: block; overflow-x: auto`, le correctif courant. Il faisait son
 * travail — mesuré à 375px, `scrollWidth` 433 contre `clientWidth` 327, et
 * pousser `scrollLeft` à 106 ramène la dernière colonne entièrement dans le
 * viewport. Le contenu n'était donc PAS perdu, contrairement à ce qu'annonçait
 * l'exception de `mobile-375.spec.ts`.
 *
 * Le vrai défaut était ailleurs : `tabIndex` valait -1 sur ce scrollport, donc
 * personne au clavier ne pouvait le faire défiler (WCAG 2.1.1), et aucun
 * lecteur d'écran n'était prévenu qu'il y avait quelque chose à défiler.
 *
 * Mesuré aussi, et c'est ce qui permet de ne PAS craindre `display: block` :
 * les trois moteurs (Chromium 153, Firefox 155, WebKit 26.6) exposaient la
 * sémantique intacte — un rôle `table`, 7 `row`, 3 `columnheader`, 18 `cell`.
 * La perte de sémantique redoutée ne se vérifiait pas. Le tableau reprend
 * quand même `display: table`, parce que le scrollport déménage sur le
 * conteneur : c'est le conteneur qui doit être focalisable, et un
 * `role="region"` posé sur le `<table>` aurait écrasé son rôle.
 *
 * PLUGIN SÄTTERI, pas rehype : Astro 7 a remplacé le pipeline `unified` par
 * Sätteri, et `markdown.rehypePlugins` exige désormais d'installer
 * `@astrojs/markdown-remark` — un paquet de plus ET un retour à l'ancien
 * processeur, donc un risque de rendu changé sur les 22 articles. L'API hast
 * de Sätteri fait la même chose sans rien de tout ça, et son `wrapNode` existe
 * exactement pour ce geste.
 *
 * Le libellé vient de `src/i18n/*.json`, comme toute copie rendue de ce site :
 * il est annoncé par les lecteurs d'écran, donc c'est du texte publié.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const i18nDir = fileURLToPath(new URL('../i18n/', import.meta.url));

function label(lang) {
  const value = JSON.parse(readFileSync(`${i18nDir}${lang}.json`, 'utf8'))?.blog?.table_aria;
  // Échouer au build plutôt que de livrer une région sans nom accessible : une
  // `role="region"` sans `aria-label` n'est pas annoncée comme région du tout.
  if (!value) throw new Error(`blog.table_aria absent de src/i18n/${lang}.json`);
  return value;
}

const LABELS = { fr: label('fr'), en: label('en') };

/**
 * Plugin hast de Sätteri. Reçoit le contexte du document AVANT analyse, ce qui
 * permet de résoudre le libellé une seule fois par fichier.
 *
 * La locale vient du dossier source (`src/content/blog/<lang>/`), lue sur
 * `pathname` et non sur un chemin de système de fichiers : une URL sépare
 * toujours par `/`, y compris sur Windows où le chemin décodé ne le fait pas.
 */
export default function scrollableTables({ fileURL }) {
  const lang = (fileURL?.pathname ?? '').includes('/blog/en/') ? 'en' : 'fr';
  const ariaLabel = LABELS[lang];

  return {
    name: 'scrollable-tables',
    element: {
      filter: ['table'],
      visit(node, ctx) {
        ctx.wrapNode(node, {
          type: 'element',
          tagName: 'div',
          properties: {
            className: ['table-scroll'],
            role: 'region',
            'aria-label': ariaLabel,
            // Tout l'objet du plugin : rendre le scrollport atteignable au
            // clavier.
            //
            // ⚠️ MESURÉ le 09.10 : Sätteri sérialise `tabindex` en TOUT OU
            // RIEN. `tabIndex: 0`, `-1`, `5`, et la forme littérale
            // `'tabindex': '3'` sortent toutes `tabindex="0"` dans le HTML.
            // La valeur écrite ici n'est donc pas celle qui est servie :
            // seule la présence de la propriété compte. Ne pas croire
            // désactiver le focus en passant -1, et asserter sur les octets
            // servis (`invariants/scrollable-tables.spec.ts`) plutôt que sur
            // cette ligne.
            tabIndex: 0,
          },
          children: [],
        });
      },
    },
  };
}
