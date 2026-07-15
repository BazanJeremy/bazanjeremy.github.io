---
title: "[EXEMPLE] Fiabiliser les tests flaky avec l'analyse d'historique CI"
date: 2026-07-02
tag: "Fiabilité des tests"
excerpt: "Article de démonstration — remplace le titre, le résumé et le corps par ta vraie veille. Le contenu est du Markdown."
lang: fr
slug: exemple-tests-flaky
linkedin: https://www.linkedin.com/in/jeremy-bazan
draft: false
---

> **Ceci est un article d'exemple.** Il montre la mise en page. Remplace-le (ou
> supprime-le) et ajoute tes vraies notes de veille dans
> `src/content/blog/fr/`. Chaque fichier `.md` devient une page `/blog/<slug>`.

## Le problème

Un test *flaky* échoue sans changement de code. Plutôt que de le relancer en
boucle, on interroge l'historique CI pour séparer le bruit du vrai signal.

## Une base déterministe

L'analyse commence sans IA : un simple taux d'échec sur la fenêtre récente.

```python
def flakiness(runs):
    fails = [r for r in runs if r.status == "fail"]
    return len(fails) / len(runs)
```

La couche IA reste **optionnelle** : elle explique, elle ne décide pas. Le QA
garde l'arbitrage.

## Ce que tu peux mettre ici

- des listes,
- du `code inline`,
- des liens vers tes dépôts ou un post LinkedIn,
- des titres de section.

Bonne veille.
