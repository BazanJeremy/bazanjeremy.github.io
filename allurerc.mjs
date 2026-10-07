import { defineConfig } from 'allure';

/**
 * Rapport Allure 3.
 *
 * `singleFile: true` produit UN fichier HTML autonome : c'est ce qui permet de
 * publier le rapport comme simple artefact de workflow sans toucher au site.
 * Le site est lui-même l'unique site GitHub Pages de ce dépôt, et son invariant
 * « dist/ ne contient aucun .js » est l'argument qui répond aux alertes
 * Dependabot — y déverser un rapport Allure le ferait tomber.
 *
 * Le quality gate est conditionné par variable d'environnement, parce que les
 * deux usages de la suite sont incompatibles : celui d'Allure ne fonctionne pas
 * avec les retries. Run de gate (retries 0, gate actif) et run d'instrument
 * (retries 2, gate inactif) restent donc deux runs distincts.
 *
 * DEUX MESURES DU 07.10 À CONNAÎTRE :
 *
 * 1. Seul `allure generate` lit ce fichier. `allure awesome ./allure-results`
 *    ignore le bloc `plugins.awesome.options` et sort un rapport
 *    multi-fichiers de 3,1 Mo au lieu du fichier unique. Passer par
 *    `npm run test:report`.
 *
 * 2. Le plugin `awesome` injecte un traceur Google Analytics en dur
 *    (`analyticsEnable: true`, sans opt-out, contrairement au plugin
 *    `allure2` qui respecte ALLURE_NO_ANALYTICS). `npm run test:report` passe
 *    donc par `scripts/allure-report.mjs`, qui génère puis le retire, et
 *    vérifie qu'il ne reste aucune requête externe. C'est un script, et non un
 *    enchaînement par `&&`, parce qu'un gate en échec fait sortir
 *    `allure generate` en non-zéro : le `&&` court-circuiterait et le traceur
 *    resterait dans le rapport qu'on va justement ouvrir.
 */
const qualityGateEnabled = process.env.ALLURE_QUALITY_GATE === '1';

export default defineConfig({
  name: 'bazanjeremy.github.io — suite QA',
  output: 'allure-report',
  historyPath: '.qa-history/allure/history.jsonl',

  ...(qualityGateEnabled
    ? {
        qualityGate: {
          rules: [
            { maxFailures: 0 },
            // Plancher délibérément loin du compte réel. La suite est
            // paramétrée sur les articles, donc AJOUTER UN ARTICLE CHANGE LE
            // NOMBRE DE TESTS. Un seuil serré se briserait à chaque article,
            // et surtout : ne jamais publier le nombre de tests de cette
            // suite dans un article — ce serait lier l'article au dépôt.
            { minTestsCount: 20 },
          ],
        },
      }
    : {}),

  plugins: {
    awesome: {
      options: {
        reportName: 'Suite QA — bazanjeremy.github.io',
        singleFile: true,
        reportLanguage: 'fr',
        groupBy: ['parentSuite', 'suite'],
      },
    },
  },
});
