/**
 * Retire le traceur Google Analytics du rapport Allure généré.
 *
 * Pourquoi : le plugin `awesome` d'Allure 3 (3.20.1) injecte un script
 * `googletagmanager.com/gtag/js?id=G-LNDJ3J7WT0` INCONDITIONNELLEMENT. Mesuré
 * le 07.10 dans `node_modules/@allurereport/plugin-awesome/dist/generators.js` :
 *
 *     analyticsEnable: true,          // ← en dur
 *
 * là où le plugin historique `allure2` respecte un opt-out :
 *
 *     analyticsEnable: process.env.ALLURE_NO_ANALYTICS?.toLowerCase() !== "true"
 *
 * Il n'existe donc aucune option ni variable d'environnement pour le désactiver
 * sur le plugin `awesome`. Or ce dépôt revendique « 0 requête externe » et
 * auto-héberge ses polices pour ne pas appeler de CDN tiers : ouvrir notre
 * propre rapport QA ne doit pas téléphoner à Google.
 *
 * Ce script est volontairement strict : s'il ne trouve rien à retirer, il
 * échoue. Un jour Allure corrigera peut-être le problème en amont, ou changera
 * son markup — dans les deux cas on veut le savoir, pas découvrir en silence
 * que l'étape ne fait plus rien.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const REPORT = 'allure-report/index.html';

if (!existsSync(REPORT)) {
  console.error(`[allure] ${REPORT} est absent — lance d'abord \`allure generate\`.`);
  process.exit(1);
}

const before = readFileSync(REPORT, 'utf8');

// 1. La balise qui charge gtag.js depuis googletagmanager.com.
// 2. Le script inline qui l'initialise (window.dataLayer / gtag(...)).
const after = before
  .replace(/<script\s+async\s+src="https:\/\/www\.googletagmanager\.com\/[^"]*"><\/script>\s*/g, '')
  .replace(/<script>\s*window\.dataLayer\s*=\s*window\.dataLayer\s*\|\|\s*\[\][\s\S]*?<\/script>\s*/g, '');

const remaining = [...after.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)].map((m) => m[1]);

if (after === before) {
  console.error(
    '[allure] aucun traceur trouvé à retirer.\n' +
      "Soit Allure a corrigé le problème en amont (tant mieux : supprime cette étape),\n" +
      'soit son markup a changé et ce script ne protège plus rien. Vérifie avant de continuer.',
  );
  process.exit(1);
}

if (remaining.length > 0) {
  console.error(`[allure] des requêtes externes subsistent : ${remaining.join(', ')}`);
  process.exit(1);
}

writeFileSync(REPORT, after, 'utf8');
const saved = before.length - after.length;
console.log(
  `[allure] traceur Google Analytics retiré (${saved} octets) — ` +
    `rapport autonome, 0 requête externe.`,
);
