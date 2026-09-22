---
title: "Le droit à l'erreur d'une IA de détection"
date: 2026-09-22
tag: "IA & QA"
excerpt: "Une IA de détection va se tromper. La question utile est de savoir où elle en a le droit, et d'écrire avant, sous forme de seuils bloquants, ce qu'elle n'a pas le droit de rater."
lang: fr
slug: droit-a-lerreur-ia-de-detection
translationSlug: detection-ai-right-to-be-wrong
linkedin: https://www.linkedin.com/in/jeremy-bazan
draft: false
---

anomaly-sentinel n'est né ni d'un incident ni d'une demande client. Il est né
d'une question qui m'est restée au fil de mes lectures et de ma veille. Des
classifieurs d'anomalies à base de LLM arrivent dans des secteurs où un faux
négatif a un coût réel : une désaturation en oxygène non signalée, une fraude au
virement non bloquée. Or ces composants ne sont pas déterministes. Comment leur
imposer des exigences qui, elles, le sont ?

Ma réponse part du principe qui guide tous mes outils : le déterministe d'abord,
l'IA là où elle apporte — le QA reste l'arbitre. Concrètement, le classifieur
n'aide pas à écrire les tests. C'est lui qu'on teste, comme un système sous test.

## Écrire le droit à l'erreur avant de tester

Une IA de détection va se tromper. La question utile n'est pas de savoir si elle
se trompera, mais où elle en a le droit, et où elle ne l'a pas.

Dans anomaly-sentinel, ce droit est écrit sous forme de seuils bloquants. Sur
cent cas normaux, le classifieur a le droit d'en signaler cinq à tort, au
maximum. Il doit aussi tenir au moins 85 % de précision et 85 % de rappel. Sur
les cas critiques, la tolérance tombe à zéro : une désaturation en oxygène doit
être détectée dix fois sur dix, et un capteur dégradé ne doit jamais être classé
en urgence clinique. Enfin, une prédiction annoncée avec une confiance de 0,85 ou
plus doit être juste.

Deux secteurs sont simulés, la fintech et la medtech, avec des scénarios
étiquetés à partir de référentiels publics. Chaque prédiction est confrontée au
label attendu.

## Le prompt est un artefact de configuration

Un prompt qui change peut dégrader un classifieur sans qu'une seule ligne de code
ait bougé. Chaque version est donc versionnée et rejouée sur le même corpus, et
doit passer les mêmes seuils bloquants. Ce contrôle ne porte que sur le mode
LLM : sans clé, aucun prompt n'est lu.

En amont, des contrats de données rejettent les entrées invalides avant qu'elles
n'atteignent le LLM, et retirent les identifiants directs (patient, compte,
appareil) du contexte transmis.

## Des règles comme spécification exécutable

Sans clé API, la suite complète — 182 tests — tourne en mode déterministe. Le LLM
y est remplacé par des règles qui décrivent le comportement attendu : pas un
bouchon, une spécification exécutable. Avec une clé, c'est le LLM qui est soumis
exactement aux mêmes tests. S'il s'écarte de la spécification, un test échoue et
déclenche une révision du prompt.

Pendant le développement, la suite a attrapé cinq défauts réels avant toute revue
manuelle : quatre corrigés dans les générateurs de scénarios, un dans les règles
elles-mêmes. Celui-là : un capteur à batterie faible classé en alerte clinique,
parce que la règle de batterie était évaluée après celle qui surveille la
variation de saturation. Une spécification exécutable se teste aussi.

## Ce que ce framework ne prouve pas

Les données sont simulées, générées à partir de référentiels publics : aucun flux
de production réel. La CI publique valide le mode déterministe ; les métriques du
LLM ne sont mesurées que lorsqu'une clé est fournie, et je ne l'ai pas encore
fait. Le traitement se fait par lots, sans temps réel ni tests de charge. Et dix
détections sur dix restent un garde-fou de non-régression, pas une preuve de
sûreté.

anomaly-sentinel montre une méthode, pas une performance sur des flux réels. Elle
tient en une phrase : une IA a le droit de se tromper, mais ce qu'elle n'a pas le
droit de rater doit être écrit avant, et bloquant.
