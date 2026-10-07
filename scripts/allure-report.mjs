/**
 * Genere le rapport Allure, puis en retire le traceur Google Analytics.
 *
 * POURQUOI UN SCRIPT ET PAS DEUX COMMANDES ENCHAINEES. La forme
 * `allure generate ... && node scripts/allure-strip-tracker.mjs` a un defaut
 * mesure le 07.10 : quand le quality gate echoue, `allure generate` sort avec
 * un code non nul, le `&&` court-circuite, et le retrait du traceur ne tourne
 * pas. Le rapport livre est alors exactement celui qu'on voulait eviter — et
 * c'est le cas ou on le regarde le plus, puisqu'il y a des echecs.
 * Un `;` ne corrige rien de maniere portable : npm passe par `sh` sur POSIX et
 * par `cmd.exe` sur Windows, ou `;` n'est pas un separateur.
 *
 * Ce script garantit donc l'ordre : generer, retirer le traceur quoi qu'il
 * arrive, puis ressortir le code de `allure generate` pour que le quality gate
 * garde son autorite.
 *
 * POURQUOI RETIRER LE TRACEUR. Le plugin `awesome` d'Allure 3 (3.20.1) injecte
 * `googletagmanager.com/gtag/js` INCONDITIONNELLEMENT. Mesure dans
 * `node_modules/@allurereport/plugin-awesome/dist/generators.js` :
 *
 *     analyticsEnable: true,          // en dur
 *
 * la ou le plugin historique `allure2` respecte un opt-out :
 *
 *     analyticsEnable: process.env.ALLURE_NO_ANALYTICS?.toLowerCase() !== "true"
 *
 * Il n'existe donc aucune option ni variable d'environnement pour le desactiver
 * sur `awesome` (verifie : `ALLURE_NO_ANALYTICS=1` ne change rien). Or ce depot
 * revendique « 0 requete externe » et auto-heberge ses polices pour ne pas
 * appeler de CDN tiers : ouvrir notre propre rapport QA ne doit pas telephoner
 * a Google.
 *
 * Le retrait est volontairement strict : s'il ne trouve rien, il echoue. Un
 * jour Allure corrigera peut-etre le probleme en amont, ou changera son
 * markup — dans les deux cas on veut le savoir, pas decouvrir en silence que
 * l'etape ne protege plus rien.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const RESULTS = './allure-results';
const REPORT = 'allure-report/index.html';

/** Retire le traceur. Renvoie un message, ou leve si rien n'a ete trouve. */
function stripTracker() {
  if (!existsSync(REPORT)) {
    throw new Error(`${REPORT} est absent : la generation n'a rien produit.`);
  }

  const before = readFileSync(REPORT, 'utf8');

  // 1. La balise qui charge gtag.js depuis googletagmanager.com.
  // 2. Le script en ligne qui l'initialise (window.dataLayer / gtag(...)).
  const after = before
    .replace(/<script\s+async\s+src="https:\/\/www\.googletagmanager\.com\/[^"]*"><\/script>\s*/g, '')
    .replace(/<script>\s*window\.dataLayer\s*=\s*window\.dataLayer\s*\|\|\s*\[\][\s\S]*?<\/script>\s*/g, '');

  if (after === before) {
    throw new Error(
      'aucun traceur trouve a retirer.\n' +
        "Soit Allure a corrige le probleme en amont (tant mieux : supprime cette etape),\n" +
        'soit son markup a change et ce script ne protege plus rien. Verifie avant de continuer.',
    );
  }

  const remaining = [...after.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)].map((m) => m[1]);
  if (remaining.length > 0) {
    throw new Error(`des requetes externes subsistent : ${remaining.join(', ')}`);
  }

  writeFileSync(REPORT, after, 'utf8');
  return `traceur Google Analytics retire (${before.length - after.length} octets) — rapport autonome, 0 requete externe.`;
}

const generate = spawnSync('npx', ['allure', 'generate', RESULTS], {
  stdio: 'inherit',
  shell: true,
});

// Le retrait tourne meme si le quality gate a echoue : c'est precisement le
// rapport qu'on va ouvrir.
try {
  console.log(`[allure] ${stripTracker()}`);
} catch (err) {
  console.error(`[allure] ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
}

// Le code de sortie reste celui de la generation, pour que le quality gate
// garde son autorite sur le resultat de la commande.
process.exit(generate.status ?? 1);
