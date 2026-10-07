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
 *    jamais dépendre de l'avancement d'une animation. L'animation elle-même
 *    sera testée par une spec dédiée qui rebascule en `no-preference`.
 *
 * 3. RETRIES À 0 PAR DÉFAUT. Un gate est une mesure à tentative unique ; les
 *    retries sont un instrument de mesure de l'instabilité, pas un
 *    comportement de gate. Les deux ne partagent jamais le même run — le
 *    nocturne les activera via `PW_RETRIES`.
 */

const baseURL = process.env.PW_BASE_URL ?? 'http://localhost:4321';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: Number(process.env.PW_RETRIES ?? 0),

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
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
        reducedMotion: 'reduce',
      },
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
