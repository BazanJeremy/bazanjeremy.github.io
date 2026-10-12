/**
 * Accumule le JUnit d'un run dans l'historique, puis elague.
 *
 * POURQUOI CE FICHIER EXISTE. `flakysense` ne sait rien dire d'UN run : il
 * compare un test a lui-meme a travers plusieurs runs. Il lui faut donc un
 * dossier par run, et il resout l'identifiant du run depuis LE NOM DU DOSSIER
 * PARENT du fichier (mesure dans son `ingest/junit.py` : `path.parent.name`).
 * D'ou la forme `<racine>/<run-id>/junit.xml`.
 *
 * LE NOM DU FICHIER EST CONTRAINT. `flakysense` cherche recursivement le nom
 * LITTERAL `junit.xml` (`path.rglob("junit.xml")`). Un fichier copie sous un
 * autre nom serait donc invisible, sans erreur et sans avertissement — il
 * manquerait simplement de l'historique. Ne pas renommer.
 *
 * L'ELAGAGE N'EST PAS DECORATIF. Mesure du 12.10 sur l'historique local :
 * 25 runs pesaient 6,7 Mo dans le `history.jsonl` d'Allure, soit ~270 Ko par
 * run et jusqu'a 530 Ko pour un run rouge. La croissance est non bornee des
 * deux cotes, et le cache d'Actions est plafonne a 10 Go par depot. Allure a
 * son propre plafond natif (`historyLimit`, dans `allurerc.mjs`) ; ce script
 * tient l'autre moitie, le JUnit.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i !== -1 && process.argv[i + 1]) return process.argv[i + 1];
  return fallback;
}

const junit = arg('junit', 'test-results/junit.xml');
const root = arg('root', '.qa-history/junit');
const keep = Number(arg('keep', '20'));
const runId = arg(
  'run-id',
  // Horodatage UTC d'abord, et de longueur fixe : c'est ce qui rend le tri
  // lexicographique des dossiers equivalent au tri chronologique, meme quand
  // le suffixe change de longueur.
  `${new Date().toISOString().replace(/[-:]/g, '').replace(/\..*$/, 'Z')}-local`,
);

if (!Number.isInteger(keep) || keep < 1) {
  console.error(`[qa-history] --keep doit etre un entier >= 1, recu ${JSON.stringify(arg('keep', '20'))}`);
  process.exit(1);
}

// Pas de JUnit = la suite n'a pas tourne. L'etape qui l'a lancee a deja fait
// echouer le job ; echouer ici en plus ne ferait que pointer le mauvais
// endroit. Meme raisonnement que l'etape de rapport de l'action composite.
if (!existsSync(junit)) {
  console.log(`[qa-history] ${junit} est absent : rien a accumuler. La suite n'a pas produit de JUnit.`);
  process.exit(0);
}

const dest = path.join(root, runId);
mkdirSync(dest, { recursive: true });
cpSync(junit, path.join(dest, 'junit.xml'));
console.log(`[qa-history] ${junit} -> ${path.join(dest, 'junit.xml')}`);

const runs = readdirSync(root)
  .filter((name) => statSync(path.join(root, name)).isDirectory())
  .sort();

const stale = runs.slice(0, Math.max(0, runs.length - keep));
for (const name of stale) {
  rmSync(path.join(root, name), { recursive: true, force: true });
}

console.log(
  `[qa-history] ${runs.length - stale.length} run(s) conserve(s)` +
    (stale.length ? `, ${stale.length} elague(s) : ${stale.join(', ')}` : ', rien a elaguer'),
);
