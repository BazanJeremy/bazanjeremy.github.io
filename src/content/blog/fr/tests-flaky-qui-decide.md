---
title: "Tests flaky : qui décide qu'un test est instable ?"
date: 2026-08-07
tag: "Fiabilité des tests"
excerpt: "Un score déterministe sur trois signaux, un plancher de quatre runs, et une réponse « unknown » quand la confiance manque. Ce que j'ai appris en outillant le diagnostic — et pourquoi le LLM n'y décide rien."
lang: fr
slug: tests-flaky-qui-decide
translationSlug: flaky-tests-who-decides
linkedin: https://www.linkedin.com/in/jeremy-bazan
draft: false
---

Un test flaky échoue, puis repasse au run suivant, sans qu'une ligne de code ait bougé entre les deux. Vu de loin, l'incident paraît mineur : un test sur des centaines, un job à relancer, on passe à autre chose.

Le coût réel est ailleurs. Il porte sur le signal.

Quand une suite contient assez de tests instables, « rouge » cesse de vouloir dire « il y a un défaut ». Ça veut dire « relance le job ». Le re-run en aveugle devient un réflexe, puis une habitude, puis une procédure tacite. À partir de là, les vraies régressions se rangent au même endroit que le bruit — dans la colonne des échecs que plus personne ne lit.

C'est une perte de confiance avant d'être une perte de temps. Et elle ne se répare pas test par test : elle se répare en rendant au rouge sa signification.

## Le problème n'est pas la correction, c'est la décision

Dans la plupart des équipes, la réponse à « ce test est-il flaky ? » vit dans la tête de quelqu'un. Un lead qui *sait* que celui-là tombe une fois sur cinq depuis la migration. C'est de la connaissance réelle, souvent juste — mais non écrite, non vérifiable par un tiers, et perdue le jour où la personne change d'équipe.

Tant que cette décision reste tacite, tout ce qui vient après est fragile : la mise en quarantaine, la priorisation des corrections, l'arbitrage « on livre ou pas ».

J'ai donc pris la question par ce bout-là : **à partir de quoi peut-on affirmer qu'un test est instable, de façon qu'une autre personne puisse refaire le calcul ?**

L'outil qui en est sorti s'appelle [flakysense](https://github.com/BazanJeremy/flakysense). En entrée, un historique de rapports JUnit — le format que produit déjà à peu près toute chaîne d'intégration. En sortie, un score d'instabilité, une famille de cause probable, une explication et une action corrective.

Ce qui suit n'est pas sa documentation. Ce sont les trois choix qui l'ont structuré, et les objections que ces choix appellent.

## Choix 1 — trois signaux, et rien d'autre

Le score combine trois mesures, toutes déterministes :

- **l'intermittence** — le test alterne-t-il entre succès et échec sur la période observée ?
- **le taux de bascule entre runs** — à quelle fréquence change-t-il d'état d'un run au suivant ?
- **l'instabilité de durée** — son temps d'exécution est-il erratique ?

Trois signaux, calculables à la main, vérifiables ligne à ligne par quelqu'un qui n'a pas écrit le code.

S'y ajoute une contrainte qui pèse autant que le calcul lui-même : **sous quatre runs d'historique, le score s'amortit.** Peu de données, pas de verdict confiant.

C'est la première chose qu'un instrument de mesure doit savoir faire — se taire quand il ne sait pas encore. Un score de flakiness calculé sur deux runs n'est pas un score faible, c'est un score qui n'a pas de sens ; l'afficher comme les autres reviendrait à maquiller une absence de données en information.

## Choix 2 — une cause, ou `unknown`

Un score seul ne mène nulle part. Il signale qu'il y a un problème, pas quoi en faire. L'outil propose donc une famille de cause parmi quatre : timing, ordre d'exécution, environnement, contention.

Là non plus, rien de génératif. Chaque heuristique score indépendamment, la plus forte l'emporte. Et sous un plancher de confiance, la réponse est `unknown`.

Ce `unknown` est la pièce la plus importante du dispositif — et celle qui demande le plus de discipline à écrire, parce qu'il est toujours tentant de renvoyer la moins mauvaise hypothèse plutôt que rien.

Un outil qui répond systématiquement quelque chose est un outil qu'on cesse de croire à la troisième réponse fausse. Un outil qui sait annoncer qu'il ne sait pas conserve sa valeur sur les cas où il répond. La crédibilité d'un diagnostic tient à ses abstentions autant qu'à ses verdicts.

## Choix 3 — le LLM n'entre qu'après la décision

L'architecture suit un pipeline de quatre étages, sur le schéma System 1 / System 2 : un détecteur, un classifieur, un explicateur, un recommandeur.

Les deux premiers sont entièrement déterministes. Ce sont eux qui décident.

Le LLM n'intervient qu'aux deux derniers, et à deux conditions cumulatives : que le score atteigne 0.5, et qu'une clé API soit configurée. Son travail se limite alors à rédiger — expliquer en langage naturel un verdict déjà rendu, et formuler une action corrective lisible.

Chaque étage embarque son repli déterministe. Les 60 tests de la suite et la chaîne d'intégration tournent avec zéro clé API, et la sortie garde exactement la même forme. L'absence de LLM dégrade la lisibilité du rapport, jamais sa structure ni son verdict.

Ce point n'est pas une précaution de confort. Un outil de qualité dont la suite de tests dépend d'un service externe n'est pas un outil de qualité — c'est une dépendance de plus dans une chaîne qu'on cherchait justement à fiabiliser.

## Trois objections

Ces choix se défendent, mais ils ne vont pas de soi. Voici les trois questions qui reviennent le plus souvent, et ce que je réponds.

### « Pourquoi pas un modèle de machine learning ? »

Parce que la surface de calibration est trop mince. Un modèle réclame un corpus étiqueté de tests flaky — précisément ce que la plupart des équipes n'ont pas, et ce qu'elles ne peuvent constituer qu'en résolvant d'abord le problème qu'on cherche à outiller.

Les trois signaux, eux, tiennent en quelques dizaines de lignes. Chaque décision est traçable, et un lead QA peut refaire le calcul sur un coin de table pour vérifier qu'il est d'accord. C'est un choix de gouvernance autant qu'un choix technique : je préfère un instrument dont on peut contester le résultat à un modèle dont on ne peut que constater la sortie.

### « D'où sort le seuil de 0.5 ? »

D'un arbitrage de coût, documenté dans un ADR dédié, et tenu par une constante unique de l'orchestrateur — les quatre étages, eux, ignorent jusqu'à l'existence de l'escalade.

Le raisonnement : en dessous de 0.5, le motif est trop faible pour justifier le coût d'un appel LLM ; au-dessus, la valeur d'une explication en langage naturel dépasse ce coût. Ce seuil-là se distingue de celui de détection, fixé à 0.3 : « assez instable pour figurer au rapport » et « assez instable pour qu'on dépense du raisonnement dessus » sont deux questions différentes.

La valeur reste calibrée sur des jeux de données synthétiques — l'ADR l'écrit noir sur blanc, et prévoit de la revoir le jour où de vrais historiques CI remplaceront les fixtures. La ligne de commande expose bien un `--escalation-threshold` pour qui veut explorer, mais le défaut ne se règle pas au fil des pipelines : il ne bouge que par un ADR qui remplace le précédent. Un seuil qu'on ajuste projet par projet finit toujours par être ajusté par l'équipe la plus pressée, un vendredi. La stabilité du contrat de décision fait partie du contrat.

### « 60 tests, pour un outil qui juge des tests ? »

Volontaire. La suite couvre les modèles Pydantic, chaque heuristique de scoring, le repli déterministe de chaque étage, et le contrat de la ligne de commande de bout en bout.

Ajouter des tests redondants dilue le signal. Je préfère 60 tests dont je peux nommer la raison d'être à 300 dont la moitié vérifie que Python compile. C'est d'ailleurs le même raisonnement que celui qui a produit l'outil : un chiffre n'a de valeur que si l'on sait ce qu'il mesure.

## Ce que j'en retire

Le plus instructif est arrivé en cours d'écriture, en testant l'hypothèse inverse.

Lâché sur un historique de runs, un LLM trouve toujours un motif intéressant. Il en trouve dans les vraies séquences instables — et il en trouve tout autant dans le bruit statistique, avec la même assurance et la même qualité de rédaction. Rien dans la forme de la réponse ne permet de distinguer les deux cas.

C'est une excellente faculté narrative et une très mauvaise faculté de jugement. La décision de flakiness ne s'écrit pas en langage naturel : elle s'écrit en signaux, en seuils et en planchers de confiance.

**La statistique décide, l'IA raconte.**

Le partage des rôles n'a rien d'anecdotique. Il détermine ce qu'on peut auditer, ce qu'on peut contester, et ce qui reste vrai le jour où le service externe est indisponible.

Et chez vous — qu'est-ce qui tranche aujourd'hui qu'un test est flaky : une règle écrite, ou la mémoire de l'équipe ?

---

*Le code est public : [github.com/BazanJeremy/flakysense](https://github.com/BazanJeremy/flakysense) — exécution locale, aucune clé API requise.*
