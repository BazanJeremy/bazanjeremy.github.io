/**
 * Rend en Markdown les sorties de `flakysense` et de `ReleaseGuard`, pour la
 * page du run (`$GITHUB_STEP_SUMMARY`).
 *
 * Pourquoi un script et pas du `jq` dans le workflow : la forme de ces deux
 * JSON est le contrat de deux AUTRES depots. Un script se relit, se teste hors
 * CI, et dit clairement ce qu'il attend. Les cles utilisees ici ont ete
 * relevees sur des sorties reelles le 12.10 :
 *   ReleaseGuard : verdict, score, gates[{gate_id,name,tripped,detail}],
 *                  signals[{kind,score,weight,detail}], conditions, rationale
 *   flakysense   : [{test_id, detection{score,is_flaky}, classification{cause},
 *                   confidence, recommendation}]
 *
 * Les deux fichiers sont optionnels : un nocturne dont l'historique est trop
 * court doit rendre un resume utile, pas une pile d'erreurs.
 */
import { existsSync, readFileSync } from 'node:fs';

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i !== -1 && process.argv[i + 1]) return process.argv[i + 1];
  return fallback;
}

function readJson(file) {
  if (!file || !existsSync(file)) return undefined;
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (err) {
    console.error(`> ⚠️ ${file} illisible : ${err instanceof Error ? err.message : String(err)}`);
    return undefined;
  }
}

const flaky = readJson(arg('flaky'));
const verdict = readJson(arg('verdict'));
const runs = arg('runs', '0');

const VERDICT_LABEL = { go: 'GO', conditional_go: 'CONDITIONAL GO', no_go: 'NO GO' };
const out = [];

out.push('## Verdict de sortie et instabilité', '');
out.push(`Historique lu : **${runs} run(s)** de la série \`main-gate\`.`, '');

if (verdict) {
  const label = VERDICT_LABEL[verdict.verdict] ?? verdict.verdict;
  const score = typeof verdict.score === 'number' ? verdict.score.toFixed(2) : '—';
  out.push(`### ReleaseGuard : ${label}`, '');
  out.push('| | |', '|---|---|', `| verdict | **${label}** |`, `| score | ${score} |`);
  for (const g of verdict.gates ?? []) {
    out.push(`| ${g.gate_id} ${g.name} | ${g.tripped ? '**BLOCK**' : 'pass'} — ${g.detail} |`);
  }
  for (const s of verdict.signals ?? []) {
    out.push(`| signal \`${s.kind}\` | ${s.score.toFixed(2)} (poids ${s.weight.toFixed(2)}) — ${s.detail} |`);
  }
  out.push('');
  if ((verdict.conditions ?? []).length) {
    out.push('Conditions :', '');
    for (const c of verdict.conditions) out.push(`- ${c}`);
    out.push('');
  }
  out.push(`_${verdict.rationale}_`, '');
} else {
  out.push('### ReleaseGuard', '', 'Pas de verdict : aucun rapport produit.', '');
}

if (Array.isArray(flaky)) {
  out.push(`### FlakySense : ${flaky.length} test(s) instable(s)`, '');
  if (flaky.length === 0) {
    out.push('Aucun test instable détecté sur la fenêtre lue.', '');
  } else {
    out.push('| test | score | cause | confiance |', '|---|---|---|---|');
    for (const r of [...flaky].sort((a, b) => b.detection.score - a.detection.score).slice(0, 10)) {
      // Les `|` d'un nom de test casseraient le tableau Markdown.
      const id = String(r.test_id).replace(/\|/g, '\|');
      out.push(
        `| \`${id}\` | ${r.detection.score.toFixed(2)} | ${r.classification.cause} | ${r.confidence.toFixed(2)} |`,
      );
    }
    if (flaky.length > 10) out.push('', `… et ${flaky.length - 10} autre(s).`);
    out.push('');
  }
} else {
  out.push('### FlakySense', '', 'Pas de rapport : historique absent ou trop court.', '');
}

// À LIRE AVANT DE CROIRE LE VERDICT. Mesure du 12.10, faite en installant les
// deux outils et en les enchaînant sur un vrai JUnit Playwright.
out.push(
  '> ⚠️ **La jonction d\'identité entre les deux outils ne fonctionne pas sur du JUnit Playwright.**',
  "> Mesuré le 12.10 : `flakysense` dérive `<classname>::<name>`, soit",
  '> `invariants/zero-external.spec.ts::[invariants-gate] …`, tandis que ReleaseGuard reconstruit',
  "> un identifiant de nœud pytest depuis le `classname` (son ADR-002), soit",
  '> `invariants/zero-external/spec/ts.py::[invariants-gate] …`. Les quatre tests signalés',
  '> instables par le premier ont donc été déclarés « 4 non-flaky failure(s) » par le second.',
  '>',
  "> Conséquence : **l'excuse d'un échec connu comme instable ne se déclenche jamais ici**, donc",
  '> ReleaseGuard est plus STRICT que conçu, jamais plus laxiste — le mode de panne est du bon',
  '> côté. Le signal d\'instabilité, lui, fonctionne (il ne compte que la longueur de la liste),',
  '> donc le score et le partage GO / CONDITIONAL GO sont justes.',
  '',
);

console.log(out.join('\n'));
