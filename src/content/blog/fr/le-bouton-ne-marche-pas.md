---
title: "« Le bouton ne marche pas » : reconstruire ce que quelqu'un savait déjà"
date: 2026-09-08
tag: "IA & QA"
excerpt: "Un signalement d'une ligne coûte dix à trente minutes à reconstruire, et le contexte perdu ne revient jamais entier. J'ai outillé cette reconstruction — l'outil a commencé par se tromper trois fois sur lui-même."
lang: fr
slug: le-bouton-ne-marche-pas
translationSlug: the-button-does-not-work
linkedin: https://www.linkedin.com/in/jeremy-bazan
draft: false
---

Il y a quelques jours, j'écrivais que le QA qui arrive au refinement arrive déjà trop tard, et que j'avais choisi de remonter au cadrage. C'est une porte du cycle.

Il y en a une deuxième, et on la surveille beaucoup moins : celle par laquelle les problèmes reviennent.

« Le bouton ne marche pas. »
« La page plante. »
« La recherche ne fonctionne pas, parfois. »

Le « parfois » est le pire des trois. C'est le mot qui contient toute l'information utile et qui n'en livre aucune.

## Ce que coûte une ligne

Reconstruire un ticket exploitable à partir d'un signalement comme ça prend entre dix et trente minutes. Quel bouton, quel écran, quelle version, quel compte, quelles données, reproductible ou non.

Ce qui me frappe, ce n'est pas le temps. C'est que la personne qui a écrit la ligne **savait** tout ça au moment où elle l'écrivait. Elle l'avait sous les yeux. Elle ne l'a pas écrit parce qu'il n'y avait pas de place prévue pour le mettre, et parce que rien ne lui a demandé.

Alors quelqu'un d'autre le reconstitue, plus tard, avec moins d'informations. Multipliez par le nombre de signalements d'une semaine.

En contexte régulé, il y a un coût supplémentaire, plus discret : la qualification réglementaire d'un défaut arrive presque toujours en fin de course. Le ticket a déjà été priorisé au jugé, souvent par quelqu'un qui n'avait pas les éléments pour le faire.

## Ce que je voulais supprimer, et ce que je ne voulais pas toucher

Je voulais supprimer le temps de rédaction. Pas le jugement.

Cette distinction a structuré tout le reste. C'est ce qui a donné testscribe : quatre agents qui prennent un signalement brut et rendent un rapport de défaut structuré.

- Un **enrichisseur** qui normalise le titre et pose les étapes en Given/When/Then.
- Un **scoreur de sévérité**, sur un CVSS allégé à quatre dimensions calibrées pour le QA. Ce n'est pas du CVSS 3.1 complet, et c'est explicite : la sortie est une pré-qualification pour prioriser une journée, pas un avis réglementaire.
- Un **classifieur de doublons**, sur ChromaDB et TF-IDF.
- Un **tagueur de conformité**, qui pose une classe IEC 62304 côté dispositif médical, ou un rattachement PSD2 côté paiement.

Trois de ces agents tournent dans deux modes : le modèle de langage pour la finesse sémantique, et un repli déterministe à règles pour l'intégration continue. Le quatrième, le classifieur de doublons, n'appelle aucun modèle de langage : il compare des vecteurs TF-IDF, et retombe sur des mots-clés quand la similarité est trop basse.

Ce repli n'est pas une roue de secours. C'est une exigence d'architecture. Un outil qualité dont la suite de tests dépend d'un service externe n'est pas un outil qualité — il est juste vert tant que le réseau tient.

Et chaque rapport enrichi porte deux champs : ce qui l'a produit, et avec quelle confiance. On sait toujours qui a écrit quoi.

## Les trois fois où l'outil s'est trompé sur lui-même

C'est la partie que je n'avais pas prévue en commençant.

**Un.** Un signalement disant « ça ne plante pas *toujours* » ressortait classé comme reproductible systématiquement. L'outil avait attrapé le mot et laissé la négation derrière. Exactement l'inverse de ce que la phrase disait. Corrigé par un lookbehind négatif.

**Deux.** Une alarme de pompe à perfusion scorée en sévérité haute au lieu de critique. Sur un dispositif médical, l'écart entre les deux, ce n'est pas une nuance de vocabulaire : c'est la position du ticket dans la file. Seuil abaissé de 8,5 à 8,0.

**Trois.** Un défaut purement cosmétique classé en classe B au sens de l'IEC 62304. Un problème d'affichage promu au rang de risque patient. Expression régulière resserrée.

Aucun des trois n'a été trouvé en relisant le code. Les trois ont été trouvés par la suite de tests de l'outil, qui en compte 144 aujourd'hui.

Le troisième est celui qui m'a le plus gêné, et pas pour la raison qu'on croit. Une sévérité sous-évaluée finit par se rattraper : quelqu'un râle, le ticket remonte. Un tag réglementaire posé à tort ne se rattrape pas, parce qu'il **rassure**. Personne ne va rouvrir une classification qui a l'air sérieuse.

C'est le vrai risque de ce type d'outillage. Pas la proposition manifestement fausse, qu'on écarte en trois secondes. La proposition plausible que personne ne vérifie.

## Ce qui reste humain, et pourquoi

La sévérité finale. La décision de fusionner deux tickets. La classe réglementaire. Ces trois-là ne sortent jamais de l'outil comme décisions — seulement comme propositions, avec leur niveau de confiance affiché à côté.

Et le repli déterministe ne comble pas les trous par du plausible. Quand aucune règle de conformité ne correspond, l'article PSD2 reste vide, et le tag de traçabilité sort marqué `UNTRACED` — pas un identifiant d'exigence inventé. Là où le champ doit contenir une valeur — les quatre dimensions de sévérité, par exemple — le repli n'improvise pas davantage : il applique un défaut conservateur, écrit dans le code et commenté comme tel, choisi pour ne pas sous-estimer.

Ça paraît anodin. C'est la règle qui rattrape toutes les autres. Un champ vide, ou un défaut annoncé comme tel, se voit. Une valeur fausse et crédible ne se voit pas.

## Ce que ça ne règle pas

Ça ne fait pas écrire de meilleurs signalements. La personne qui tape « le bouton ne marche pas » continuera de le taper — et elle a raison, ce n'est pas son métier de rédiger des rapports de défaut.

Ça ne remplace pas non plus la reproduction. Un rapport bien structuré à partir d'une ligne floue reste un rapport construit sur une ligne floue : mieux rangé, pas mieux informé.

Ce qui a changé, c'est la répartition du temps. Le temps de mise en forme a disparu. Le temps de décision est resté entier, et c'est le seul échange qui me paraisse honnête.

Le déterministe d'abord, l'IA là où elle apporte — le QA reste l'arbitre.

Et chez vous, qui reconstruit le contexte d'un signalement d'une ligne, et combien de fois par semaine ?

---

*Dépôt public : [github.com/BazanJeremy/testscribe](https://github.com/BazanJeremy/testscribe)*
