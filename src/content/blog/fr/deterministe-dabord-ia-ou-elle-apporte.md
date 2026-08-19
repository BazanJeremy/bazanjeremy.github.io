---
title: "Le déterministe d'abord, l'IA là où elle apporte"
date: 2026-08-19
tag: "IA & QA"
excerpt: "Sept outils, la même décision d'architecture prise sept fois : interdire au LLM de trancher. Comment je trace la frontière, ce que la règle m'a coûté, et le cas où elle ne suffit pas."
lang: fr
slug: deterministe-dabord-ia-ou-elle-apporte
translationSlug: deterministic-first-ai-earns-its-place
linkedin: https://www.linkedin.com/in/jeremy-bazan
draft: false
---

J'ai publié sept outils QA × IA. En les relisant, je me suis rendu compte que j'avais pris sept fois la même décision d'architecture, sans jamais l'avoir formulée : **le LLM n'a le droit de décider de rien.**

La première fois, c'était un accident de conception. Les suivantes, c'est devenu une méthode. Voici ce que j'en ai appris, y compris ce qu'elle coûte.

## Le réflexe inverse

Quand on ajoute de l'IA à un outil qualité, le réflexe est de mettre le LLM au centre et d'ajouter des garde-fous autour. On lui donne le problème, il produit un verdict, et on écrit ensuite des règles pour rattraper ses écarts.

C'est logique en apparence. Le LLM est la partie impressionnante : autant lui confier le travail intéressant. Et ça marche — pendant la phase où l'on regarde les sorties une par une.

Le problème apparaît plus tard, quand l'outil tourne seul. Un LLM lâché sur un historique de runs de tests trouvera toujours un pattern intéressant à raconter. Y compris dans du bruit statistique pur. Il ne dira jamais « je ne sais pas » spontanément : ce n'est pas dans sa nature de générateur. Il produira une cause plausible, bien écrite, avec le ton de l'évidence.

Une cause plausible et fausse coûte plus cher que pas de cause du tout. Elle oriente une investigation, elle rassure, et personne ne va la vérifier puisque la formulation est convaincante.

## La ligne de partage

La règle que j'applique maintenant tient en une phrase : **ce qui doit être reproductible ne peut pas être probabiliste.**

En pratique, je pose trois questions devant chaque fonctionnalité qui pourrait appeler un modèle.

**Devrai-je justifier cette sortie à quelqu'un dans six mois ?** Si oui, elle doit être calculée, pas générée. Un auditeur qui demande pourquoi un test a été classé instable veut voir un calcul, pas une explication.

**Deux exécutions identiques doivent-elles produire la même chose ?** Si oui, le LLM est disqualifié d'office, quelle que soit la température.

**Une erreur ici se verrait-elle, ou se cacherait-elle ?** C'est la question la plus utile. Une mauvaise reformulation se voit tout de suite. Un mauvais score de sévérité, non — il se fond dans un tableau de bord et personne ne le retrouvera jamais.

Ce qui reste après ce tri, c'est là que le LLM travaille bien : reformuler, expliquer, proposer, enrichir. Des tâches où sa sortie est immédiatement évaluable par la personne qui la lit.

## Trois façons d'appliquer la même règle

Dans **flakysense**, le score d'instabilité combine trois signaux calculés, et il est amorti proportionnellement sous quatre runs d'historique : peu de données, pas de score confiant. Le refus de conclure vient un cran plus loin — sous un plancher de confiance, la classification de la cause répond `unknown` au lieu de deviner. Le LLM n'entre qu'à partir du seuil d'escalade, et uniquement pour expliquer une décision déjà prise. Soixante tests et la chaîne d'intégration tournent avec zéro clé API.

Dans **ReleaseGuard**, le verdict de mise en production sort de deux verrous non compensables et d'un score pondéré. La couche IA rédige le texte qui accompagne un verdict conditionnel — jamais le verdict, jamais le score. Ce n'est pas une convention d'équipe : c'est verrouillé par des tests, et le dépôt s'applique son propre verrou à chaque push.

Le cas le plus intéressant est **EvalForge**, parce qu'il évalue des systèmes LLM avec un juge LLM. La règle tient quand même : le juge est mesuré contre des étiquettes humaines via le kappa de Cohen, et tant qu'il n'a pas passé cette calibration, ses notes restent visibles mais sortent du score. Un juge sycophante qui note tout au maximum échoue la calibration par construction, parce que les étiquettes humaines couvrent délibérément toute l'échelle. L'invariant vit dans les modèles de données : un rapport qui le viole ne peut littéralement pas être construit.

## Un corollaire que je n'avais pas anticipé

Si la décision est déterministe, alors l'outil doit fonctionner sans le LLM. Pas « en mode dégradé » — vraiment fonctionner, avec la même forme de sortie.

Ça a l'air d'un détail d'implémentation. C'en est un au début, quand on écrit le repli pour faire tourner la chaîne d'intégration sans clé API. Puis on s'aperçoit que c'est une exigence : un outil qualité dont la suite de tests dépend d'un service externe n'est pas un outil qualité.

Et il y a un effet de bord que je n'avais pas vu venir. Cette contrainte, prise pour des raisons de reproductibilité, règle au passage la question qui bloque le plus souvent l'adoption de l'IA en secteur régulé : rien ne sort du réseau tant qu'on ne l'a pas explicitement décidé. La conformité n'était pas mon objectif de départ. Elle est tombée dans le panier.

## Ce que la règle coûte

Je ne veux pas la présenter comme gratuite.

Elle coûte du code. Chaque heuristique déterministe est du travail que le LLM aurait fait tout seul, et il faut la maintenir.

Elle coûte en finesse. Pour la détection de doublons dans **testscribe**, le chemin par défaut — et celui de la chaîne d'intégration — est TF-IDF, pas le modèle sémantique. TF-IDF capte mal la proximité de sens, c'est un fait : « crash » et « freeze » y restent deux mots étrangers, et je perds des doublons formulés différemment. Mais il tourne sans réseau, sans modèle à télécharger et à versionner, de façon reproductible. Le modèle neuronal reste accessible derrière un drapeau de configuration ; ce qui est verrouillé, c'est que le comportement par défaut, lui, soit reproductible. J'ai choisi la reproductibilité contre la finesse, et c'est documenté comme tel.

Elle coûte enfin des cas où le LLM ferait objectivement mieux. Sous un plancher de confiance, mes outils répondent `unknown`. Un modèle aurait proposé quelque chose. Parfois il aurait eu raison.

Je prends ce coût parce que l'inverse — un outil qui a raison souvent, sans qu'on sache quand — n'est pas utilisable dans une chaîne de qualité.

## Où la règle s'arrête

Il reste des zones sans règle écrivable.

La détection d'anomalies comportementales en est une. Une séquence d'opérations dont chaque étape est légitime, mais dont l'enchaînement ne tient pas debout : c'est ce qu'un auditeur cherche, et c'est très difficile à couvrir par des règles statiques. C'est le terrain d'**anomaly-sentinel**, et là, le LLM apporte quelque chose que le déterministe ne sait pas faire.

Le langage naturel en est une autre. Transformer « le bouton ne marche pas » en étapes de reproduction structurées, aucun jeu de règles ne le fera bien.

Dans ces zones, le LLM entre — mais il entre sous contrainte. Sa sortie porte la trace de qui l'a produite et avec quel niveau de confiance, elle est présentée comme une proposition, et la décision finale reste à un humain qui peut la refuser sans avoir à se justifier.

## Ce que ça dit du métier

On me demande parfois si cette position n'est pas de la méfiance envers l'IA. Je la vois autrement.

J'ai délégué à des LLM une part importante de mes phases amont — vérification des critères d'entrée, dérivation des critères d'acceptation en scénarios, cadrage de stratégie. Le gain est réel et je ne reviendrai pas dessus. Ce n'est pas quelqu'un qui se méfie de l'outil qui écrit ça.

Mais un test qui passe au vert n'est une information que si l'on sait pourquoi il est vert. C'est le cœur du métier, et ça ne se délègue pas à un système dont on ne peut pas rejouer le raisonnement.

Le déterministe d'abord, l'IA là où elle apporte — le QA reste l'arbitre.

---

*Les sept outils évoqués ici sont publics : [github.com/BazanJeremy](https://github.com/BazanJeremy). Chacun documente ses seuils et ses choix d'architecture.*
