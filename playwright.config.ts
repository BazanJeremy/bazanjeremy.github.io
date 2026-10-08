import { defineConfig, devices } from '@playwright/test';

/**
 * Suite QA du site — voir `tests/README.md` pour le registre de risque, et
 * surtout pour la liste de ce qui n'est délibérément PAS testé.
 *
 * Trois décisions structurent ce fichier :
 *
 * 1. LA CIBLE EST UN PROJET, PAS UNE VARIABLE. Sur Windows, la forme
 *    `VAR=x npx playwright test` ne fonctionne ni en PowerShell ni en cmd, et
 *    `cross-env` est hors de la stack verrouillée. `--project=` suffit donc
 *    pour tout cas courant ; `PW_BASE_URL` reste là pour les cas tordus.
 *
 * 2. `reducedMotion: 'reduce'` PARTOUT. Le site anime `.reveal` au scroll via
 *    `animation-timeline: view()`, derrière `@media (prefers-reduced-motion:
 *    no-preference)`. Motion réduit ⇒ le bloc ne matche jamais ⇒ les éléments
 *    restent à opacité 1 ⇒ les assertions sont déterministes. Le gate ne doit
 *    jamais dépendre de l'avancement d'une animation : `gate/reveal-css` tient
 *    la révélation au scroll en lisant les OCTETS SERVIS et le CSSOM, et le
 *    projet `motion` (en nuit) est le seul à regarder un rendu animé.
 *
 * 3. RETRIES À 0 PAR DÉFAUT. Un gate est une mesure à tentative unique ; les
 *    retries sont un instrument de mesure de l'instabilité, pas un
 *    comportement de gate. Les deux ne partagent jamais le même run — le
 *    nocturne les activera via `PW_RETRIES`.
 */

// `||` et non `??` : GitHub Actions pose une variable non renseignée à CHAÎNE
// VIDE, pas à `undefined`. Avec `??`, `baseURL` vaudrait alors `''` et toute
// navigation relative casserait — en CI seulement, donc invisible en local.
const baseURL = process.env.PW_BASE_URL || 'http://localhost:4321';

/** Le site en ligne. Certains comportements ne sont vrais QUE la-bas. */
const PRODUCTION = 'https://bazanjeremy.github.io';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // `||` pour la même raison que `baseURL` : une variable vide doit retomber
  // sur le défaut, pas produire `Number('')`.
  retries: Number(process.env.PW_RETRIES || 0),

  // Volontairement sous le nombre de cœurs du runner : la contention CPU est
  // une SOURCE de flakiness, et la sortie de cette suite alimentera un jour un
  // DÉTECTEUR de flakiness. Un instrument bruyant rend son verdict sans valeur.
  workers: process.env.CI ? 2 : '50%',

  timeout: 30_000,
  expect: { timeout: 5_000 },

  reporter: [
    [process.env.CI ? 'line' : 'list'],
    // Le nom `junit.xml` n'est pas cosmétique : les outils du dépôt qui
    // consommeront ce fichier plus tard cherchent ce nom littéral.
    ['junit', { outputFile: 'test-results/junit.xml', includeProjectInTestName: true }],
    ['allure-playwright', { resultsDir: 'allure-results' }],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],

  use: {
    baseURL,
    // `retain-on-failure` + pas de vidéo : le rapport Allure est généré en
    // `singleFile`, qui inline les pièces jointes en base64. Un run vert reste
    // donc léger, et seul un run rouge grossit.
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    reducedMotion: 'reduce',
  },

  projects: [
    {
      // Assertions fs sur `dist/`. Aucune page n'est ouverte, mais le projet
      // reste un projet Playwright ordinaire : le coût est nul et le rapport
      // est unifié.
      name: 'invariants-gate',
      testDir: './tests/invariants',
      use: { ...devices['Desktop Chrome'], reducedMotion: 'reduce' },
    },
    {
      name: 'gate-desktop',
      testDir: './tests/gate',
      // `mobile-375` porte une précondition de largeur : la faire tourner à
      // 1280 la ferait échouer pour la bonne raison, au mauvais endroit.
      testIgnore: '**/mobile-375.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
        reducedMotion: 'reduce',
      },
    },
    {
      name: 'gate-mobile',
      testDir: './tests/gate',
      testMatch: '**/mobile-375.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        // VIEWPORT EXPLICITE, pas un descripteur d'appareil. `isMobile: true`
        // change la gestion du viewport-meta et du touch, ce qui peut aussi
        // bien masquer que fabriquer un débordement. L'exigence du projet est
        // une largeur (iPhone SE, 375px) : on teste une largeur.
        viewport: { width: 375, height: 667 },
        reducedMotion: 'reduce',
      },
    },
    {
      name: 'prod-http',
      testDir: './tests/nightly',
      testMatch: '**/prod-http.spec.ts',
      use: {
        // PRODUCTION UNIQUEMENT, et ce n'est pas un detail : sous
        // `astro preview`, `trailingSlash` vaut `ignore` et la requete est
        // reecrite en `pathname + "/index.html"`, donc le 301 de GitHub
        // Pages n'existe pas. Un gate local asserterait quelque chose de
        // faux en production.
        baseURL: process.env.PW_BASE_URL || PRODUCTION,
      },
    },
    {
      name: 'external-links',
      testDir: './tests/nightly',
      testMatch: '**/external-links.spec.ts',
      // Depend de la disponibilite de tiers : jamais dans un gate, sinon on
      // importe l'indisponibilite des autres dans son propre deploiement.
      use: { baseURL: process.env.PW_BASE_URL || PRODUCTION },
    },
    {
      name: 'motion',
      testDir: './tests/nightly',
      testMatch: '**/reduced-motion.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
        // LE SEUL projet en mouvement. Tout le reste tourne en 'reduce'
        // pour etre deterministe ; c'est ici qu'on verifie que le
        // mouvement existe bel et bien quand il est demande.
        reducedMotion: 'no-preference',
      },
    },

    // Rejeu du gate sur les deux autres moteurs. Justifie, pas reflexe : le
    // site a 0 JS et une seule feuille de style, et la seule fonctionnalite
    // sensible au moteur est `animation-timeline: view()`, deja derriere un
    // `@supports` — un moteur qui ne la supporte pas n'anime pas, et c'est
    // le repli voulu. Assurance de regression, donc : en nuit, pas en gate.
    //
    // MESURE DU 08.10, qui justifie ce rejeu autrement que par principe :
    // Chromium 153 et WebKit 26.6 supportent `animation-timeline: view()` et
    // animent ; Firefox 155 repond `false` a `CSS.supports`, donc l'assertion
    // CSSOM de `reveal-css` s'y SAUTE avec son motif, et le repli laisse le
    // contenu a opacite 1. Trois moteurs, trois comportements, un seul voulu.
    {
      name: 'gate-firefox',
      testDir: './tests/gate',
      testIgnore: '**/mobile-375.spec.ts',
      use: { ...devices['Desktop Firefox'], reducedMotion: 'reduce' },
    },
    {
      name: 'gate-webkit',
      testDir: './tests/gate',
      testIgnore: '**/mobile-375.spec.ts',
      use: { ...devices['Desktop Safari'], reducedMotion: 'reduce' },
    },
  ],

  // `astro preview` SERT `dist/`, il ne le construit pas.
  //  - en CI, `dist/` existe deja (etape de build du meme job) -> pas de double build ;
  //  - en local, la forme `&&` garantit des octets frais, et
  //    `reuseExistingServer` permet de garder un preview ouvert pendant
  //    l'iteration.
  //
  // ATTENTION, mesure du 07.10 dans `node_modules/astro/dist/cli/preview/index.js` :
  // Astro 7 DEMONISE le preview quand il detecte un agent
  //   `const agentDetected = !process.env.ASTRO_PREVIEW_BACKGROUND && isRunByAgent()`
  //   `const wantsBackground = !!flags.background || agentDetected`
  // ou `isRunByAgent()` delegue au paquet `am-i-vibing`. La commande rend alors
  // la main aussitot et Playwright conclut « Process from config.webServer
  // exited early ». Poser `ASTRO_PREVIEW_BACKGROUND` suffit a desactiver cette
  // detection : le serveur reste au premier plan, ce que le contrat `webServer`
  // exige. Sans ca, la suite passe en CI (pas d'agent) mais echoue des qu'on la
  // lance depuis un agent — le pire des deux mondes.
  //
  // `--ignore-lock` couvre le symptome jumeau : un verrou laisse par un demon
  // d'une session precedente fait sortir `astro preview` sur « already running ».
  webServer: process.env.PW_NO_SERVER
    ? undefined
    : {
        command: process.env.CI
          ? 'npm run preview -- --ignore-lock'
          : 'npm run build && npm run preview -- --ignore-lock',
        url: 'http://localhost:4321/',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: { ASTRO_PREVIEW_BACKGROUND: '1' },
      },
});
