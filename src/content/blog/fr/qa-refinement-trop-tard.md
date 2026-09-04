---
title: "Le QA qui arrive au refinement arrive déjà trop tard"
date: 2026-09-03
tag: "Pratiques QA"
excerpt: "Quand la fonction QA n'existe pas encore, personne n'a décidé à quel moment le QA entre dans le cycle. J'ai choisi le cadrage plutôt que le refinement — ce que ça change, ce que ça coûte, et ce que ça ne règle pas."
lang: fr
slug: qa-refinement-trop-tard
translationSlug: qa-refinement-too-late
linkedin: https://www.linkedin.com/in/jeremy-bazan
draft: false
---

Quand j'ai pris mon poste actuel, la fonction n'existait pas. J'étais le premier QA engineer de l'entreprise. L'équipe s'est staffée ensuite jusqu'à sept personnes, mais au début il n'y avait rien — et surtout, personne n'avait décidé à quel moment un QA entrait dans le cycle.

C'est une question qu'on ne se pose plus quand la réponse est héritée. Le QA entre au refinement, parce que c'est là qu'il entrait l'année dernière.

J'ai eu la chance de devoir la trancher. J'ai tranché : le cadrage, pas le refinement.

## Ce qui se passe vraiment au refinement

Le refinement, c'est le moment où l'équipe lit la story ensemble. Le QA y pose de bonnes questions. Trois reviennent toujours : et si le champ est vide ? et si l'utilisateur revient en arrière ? et si le service d'à côté ne répond pas ?

Ce sont les bonnes questions. Elles arrivent au mauvais moment.

À ce stade, la story est écrite. Quelqu'un l'a formulée, quelqu'un l'a priorisée, souvent quelqu'un l'a déjà annoncée. Les questions du QA ne façonnent plus la story : elles l'attaquent. La différence n'est pas sémantique. Une ambiguïté trouvée au cadrage se règle en écrivant une phrase. La même ambiguïté trouvée au refinement se règle en réécrivant un critère déjà validé — et il faut convaincre.

## Ce que je fais à la place

Une évaluation de risque dès le cadrage, sur 100 % des user stories du sprint. Avant la première ligne de code.

Ce n'est pas une revue qualité. C'est court. On regarde ce qui peut mal tourner, ce qui n'est pas dit, et surtout ce qui dépend d'ailleurs.

Ce dernier point est le plus rentable. Le risque le plus fréquent que je remonte n'est presque jamais dans la story : il est entre deux équipes qui ne savent pas qu'elles travaillent sur le même objet. Je cartographie donc les dépendances silotées avant que le sprint démarre. Une story parfaitement écrite qui suppose qu'une autre équipe aura livré son endpoint reste une story qui ne partira pas.

## L'objection sérieuse : ça prend du temps

Oui. C'est la seule objection qui tienne, et elle est fondée.

Le faire sur une story, c'est agréable. Le faire sur 100 % des stories d'un sprint, chaque sprint, c'est un coût récurrent en concurrence directe avec l'exécution des tests. C'est exactement pour ça que la pratique meurt dans la plupart des équipes qui l'essaient : elle est adoptée, elle est juste, et elle est abandonnée au troisième sprint chargé.

Ce qui l'a rendue tenable, c'est l'outillage. Trois tâches amont sont largement automatisables : la vérification des DOR, la dérivation des critères d'acceptation en scénarios passants et non-passants, et le cadrage haut niveau de la stratégie de test. Sur ces phases, je mesure entre 60 et 80 % de temps en moins.

Avec une limite que je tiens fermement : le modèle produit la matière, il ne décide pas ce qui est risqué. Il dérive des scénarios à partir d'un critère d'acceptation ; il ne sait pas que le module d'à côté a cassé deux fois ce trimestre. Le tri reste à moi. Ce qui est délégué, c'est la rédaction — jamais le jugement.

Sans ce gain, je ne tiendrais pas les 100 %. Je serais revenu au refinement au bout d'un mois, comme tout le monde.

## Ce que ça ne règle pas

Trois choses, et je préfère les dire.

Ça ne couvre que les stories du sprint. Ce qui entre en cours de route — l'urgence, le correctif, la demande arrivée un jeudi soir — passe à côté du dispositif par construction.

Ça ne remplace pas le test. Un risque identifié au cadrage reste un risque identifié : il faudra l'exécuter pour savoir.

Et être en amont ne rend pas plus juste. Un risque signalé qui ne se matérialise jamais coûte quelque chose. Trois sprints de fausses alertes, et plus personne ne lit la colonne. C'est le vrai danger de cette pratique — pas qu'elle prenne du temps, mais qu'elle devienne un bruit qu'on apprend à ignorer.

## Pourquoi ça compte plus qu'avant

Un dernier point, qui me paraît sous-estimé.

Quand la génération de code accélère, l'écriture n'est plus le goulot d'étranglement. Ce qui coûte, c'est de découvrir en fin de cycle que le comportement produit n'était pas celui qu'on voulait — parce que personne n'avait écrit ce qu'on voulait avec assez de précision.

Autrement dit : plus le code s'écrit vite, plus la qualité de ce qui est demandé devient le facteur limitant. Un QA positionné en aval de cette écriture arrive après le moment où il aurait servi.

Le refinement n'est pas le mauvais rituel. C'est la deuxième chance, pas la première.

Et chez vous — à quel moment un QA entre-t-il dans une story ? Et qui a décidé de ce moment ?
