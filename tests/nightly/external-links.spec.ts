/**
 * NUIT — jamais bloquant. Sans navigateur.
 *
 * Risque : probabilité basse-moyenne × impact moyen. Un dépôt renommé ou rendu
 * privé transforme une carte de la cartographie en lien mort, et rien dans ce
 * dépôt-ci ne le signale.
 *
 * POURQUOI JAMAIS DANS LE GATE. Ces vérifications dépendent de la
 * disponibilité de tiers. Les mettre dans le gate importerait l'indisponibilité
 * des autres dans le déploiement de ce site — un incident GitHub bloquerait la
 * publication d'un article. C'est le cas d'école de la séparation entre un gate
 * (déterministe, et qui ne dépend que de nous) et un monitoring (informatif, et
 * qui regarde le monde).
 *
 * LE FILET « INCONNU », et pourquoi il existe. Mesuré le 08.10, deux clients
 * donnent deux réponses pour la même URL LinkedIn : `curl` reçoit **999** — le
 * code anti-robot — là où le client de Playwright, qui envoie un User-Agent de
 * navigateur, reçoit moins de 400. Aujourd'hui les 9 destinations sont donc
 * toutes joignables, et rien n'est classé « inconnu ».
 *
 * La liste `ANTI_BOT` reste néanmoins, comme filet : le jour où LinkedIn se
 * met à limiter le débit, le statut qu'il renvoie ne dira RIEN sur ce que voit
 * un humain — le lien peut être parfaitement valide comme parfaitement mort.
 * Le compter comme un succès serait une fausse assurance ; comme un échec, une
 * spec rouge pour toujours sans défaut. « Inconnu » est la seule réponse
 * honnête, et elle est affichée, pas tue.
 */
import { test, expect } from '@playwright/test';
import { articles } from '../fixtures/pages.ts';
import { dict, repos } from '../fixtures/i18n.ts';

/**
 * Hôtes dont on sait qu'ils refusent les clients non-navigateurs. Pour eux, le
 * résultat est « inconnu », jamais « vérifié ».
 */
const ANTI_BOT: Readonly<Record<string, readonly number[]>> = {
  'www.linkedin.com': [999, 403, 429],
  'linkedin.com': [999, 403, 429],
};

function externalTargets(): string[] {
  const urls = new Set<string>();
  for (const lang of ['fr', 'en'] as const) {
    for (const r of repos(lang)) urls.add(r.url);
    for (const item of dict[lang].contact.items) {
      if (item.href.startsWith('http')) urls.add(item.href);
    }
  }
  for (const a of articles) if (a.linkedin) urls.add(a.linkedin);
  return [...urls].sort();
}

test.describe('Destinations externes', () => {
  test('aucune destination externe n\'est morte', async ({ request }) => {
    const targets = externalTargets();

    expect(
      targets.length,
      'aucune destination externe collectée — le scan ne vérifiait rien',
    ).toBeGreaterThan(0);

    const dead: string[] = [];
    const unknown: string[] = [];

    for (const url of targets) {
      const host = new URL(url).host;
      let status: number;
      try {
        status = (await request.get(url, { timeout: 20_000 })).status();
      } catch (err) {
        dead.push(`${url} → injoignable (${err instanceof Error ? err.message.split('\n')[0] : err})`);
        continue;
      }

      if (status < 400) continue;

      if (ANTI_BOT[host]?.includes(status)) {
        unknown.push(`${url} → ${status} (${host} refuse les clients non-navigateurs)`);
        continue;
      }
      dead.push(`${url} → ${status}`);
    }

    // Le « non vérifié » est une information, pas un silence : il apparaît dans
    // le rapport même quand tout va bien.
    console.log(
      `Destinations externes : ${targets.length} testées, ` +
        `${targets.length - dead.length - unknown.length} joignables, ` +
        `${unknown.length} non vérifiables, ${dead.length} mortes.`,
    );
    for (const u of unknown) console.log(`  non vérifiable : ${u}`);

    expect(dead, dead.length ? `Destinations mortes :\n  ${dead.join('\n  ')}` : '').toEqual([]);
  });

  test('les 7 dépôts de la cartographie existent toujours', async ({ request }) => {
    // Assertion séparée parce que ce sont EUX la vitrine : un dépôt renommé ou
    // repassé en privé est le cas le plus probable, et le plus coûteux.
    const expected = repos('fr');
    expect(expected.length, 'la cartographie ne liste plus de dépôt').toBe(7);

    const missing: string[] = [];
    for (const r of expected) {
      const res = await request.get(r.url, { timeout: 20_000 });
      if (res.status() >= 400) missing.push(`${r.name} (${r.url}) → ${res.status()}`);
    }
    expect(
      missing,
      missing.length
        ? `Dépôts inaccessibles — renommés, privés ou supprimés :\n  ${missing.join('\n  ')}`
        : '',
    ).toEqual([]);
  });

  test('les URLs de dépôt sont identiques dans les deux locales', () => {
    // Elles ne sont pas traduites. Une divergence signifierait qu'une locale a
    // été mise à jour et pas l'autre.
    expect(repos('en').map((r) => r.url)).toEqual(repos('fr').map((r) => r.url));
  });
});
