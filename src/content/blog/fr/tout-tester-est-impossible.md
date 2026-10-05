---
title: "Tout tester est impossible : qui choisit ce qu'on ne teste pas ?"
date: 2026-10-06
tag: "Pratiques QA"
excerpt: "Le test exhaustif est impossible : c'est le deuxième principe du syllabus ISTQB, et l'automatisation ne lève pas cette limite. Il restera donc toujours des choses non testées. La vraie question est de savoir qui les a choisies : le métier, le QA ou le calendrier."
lang: fr
slug: tout-tester-est-impossible
translationSlug: testing-everything-is-impossible
linkedin: https://www.linkedin.com/in/jeremy-bazan
draft: false
---

Avant une mise en production, la question arrive tôt ou tard : « On a tout
testé ? »

La réponse honnête est non, dans toutes les équipes et sur tout produit réel. Ce
n'est pas un aveu d'échec. Le vrai sujet est ailleurs : savoir ce qu'on n'a pas
testé, et qui l'a décidé.

## Un principe, pas une règle d'examen

Le syllabus ISTQB de niveau Fondation pose sept principes du test. Le deuxième
tient en une phrase : « Il n'est pas possible de tout tester, sauf dans les cas
triviaux. »

On le range parfois parmi les règles de certification. Le syllabus le rattache
pourtant à une référence de 1978, et il en tire aussitôt la conséquence
pratique : puisqu'on ne peut pas tout tester, on concentre l'effort avec trois
leviers, les techniques de test, la priorisation des cas de test et le test
basé sur les risques.

## Pourquoi « plus vite » ne règle rien

Prenez un formulaire de virement. Le seul champ du montant, au centime près,
entre 0,01 et 100 000 francs, accepte dix millions de valeurs. Ajoutez trois
devises, deux canaux, web et mobile, et quatre langues d'interface : 240 millions
de combinaisons, pour un seul écran. Sans compter le solde du compte, les
plafonds, l'ordre des actions ni le champ libre du motif.

Les techniques de test existent précisément pour cela. Les partitions
d'équivalence regroupent les valeurs que le système doit traiter de la même
façon : les montants valides, ceux qui dépassent le plafond, ceux qui sont nuls
ou négatifs. On teste une valeur par partition, puis les valeurs limites aux
frontières. Dix millions de montants deviennent une poignée de cas.

Les combinaisons, elles, continuent de se multiplier. Le syllabus le dit à
propos des tables de décisions : le nombre de règles croît de façon
exponentielle avec le nombre de conditions. Sa réponse est de réduire la table,
ou de passer par une approche basée sur les risques.

C'est là que l'automatisation, et aujourd'hui l'IA, déçoivent ceux qui
espéraient en finir avec le choix. Elles divisent le temps d'exécution. Chaque
paramètre ajouté, lui, multiplie le nombre de cas. Et chaque cas, qu'il
s'exécute en une milliseconde ou en une heure, a besoin d'un résultat attendu :
quelqu'un doit avoir défini le comportement correct. Exécuter plus vite ne dit
pas ce qui est juste.

## Quand personne ne choisit, le calendrier choisit

Il restera donc toujours des choses non testées, ou testées moins que d'autres.
Ce choix se fait dans tous les cas. La seule question est de savoir s'il est
fait par quelqu'un.

Sans décision explicite, on teste souvent dans l'ordre où les choses arrivent :
la fonctionnalité livrée la première, le scénario écrit le premier, le ticket le
plus visible. Quand le temps manque, ce qui reste de côté, c'est le bas de la
liste : le critère a été la position, pas le risque.

Le résultat peut même avoir l'air rassurant : beaucoup de tests, presque tous
verts. Mais un taux de réussite ne dit rien de ce qu'on n'a pas regardé.

## Décider à deux voix

Le syllabus propose un outil simple pour rendre ce choix visible : le
référentiel des risques, une liste où chaque risque porte sa probabilité, son
impact et les mesures prévues pour l'atténuer. Plus un risque est probable et
plus son impact est lourd, plus il mérite d'être testé tôt et en profondeur.

Ces deux dimensions ne relèvent pas des mêmes personnes. La probabilité se juge
plutôt côté technique : un module complexe, modifié souvent, qui a déjà
concentré des défauts. Le syllabus en fait d'ailleurs un autre de ses
principes : les défauts se regroupent. L'impact se juge plutôt côté métier : ce
qu'une défaillance coûterait en argent, en réputation, en conformité.

Le QA n'a donc pas à décider seul de ce qu'on ne teste pas. Le métier non plus,
sans la carte des risques que le test peut lui fournir. Le syllabus range
justement parmi les objectifs du test celui de « fournir des informations aux
parties prenantes pour leur permettre de prendre des décisions éclairées ».

## La liste qui manque

Concrètement, l'essentiel tient sur une page : la liste de ce qu'on ne
teste pas, ou de ce qu'on teste moins. Chaque ligne répond à quatre questions.

**Quoi.** Le périmètre laissé de côté, formulé en risques que tout le monde
comprend, pas en identifiants de cas de test.

**Pourquoi.** Un niveau de risque jugé faible, un environnement qui ne permet
pas de le tester, des données indisponibles.

**Qui.** La personne qui accepte ce risque, côté métier.

**Jusqu'à quand.** L'événement qui rouvre la décision : une nouvelle version
d'un composant, un incident en production, un changement réglementaire.

Si je ne devais garder qu'un seul document de test, ce serait celui-là. C'est
lui qui permet, au moment de la mise en production, de parler de risque
résiduel plutôt que d'un pourcentage de tests passés. Le syllabus le formule à
sa manière : relier les résultats de test aux risques permet d'évaluer le
niveau de risque résiduel.

Et il change la réponse à la question de départ. « On a tout testé ? » appelle
un non embarrassé. « Voici ce qu'on n'a pas testé, pourquoi, et qui l'a
accepté » est une réponse qu'on peut assumer devant n'importe quel comité.

## En medtech, ce choix est déjà écrit

Certains secteurs n'ont pas attendu. En medtech, la norme IEC 62304 proportionne
les activités exigées, documentation et vérification comprises, à la classe de
sécurité du logiciel : A, B ou C, selon la gravité du dommage auquel il peut
contribuer, compte tenu des mesures de maîtrise du risque extérieures au
logiciel. Tester moins n'y veut pas dire ne rien tester : depuis l'amendement
de 2015, les tests système sont exigés même en classe A.

Ce que la norme impose, n'importe quelle équipe peut se l'appliquer : décider du
niveau de test en fonction du dommage possible, et l'écrire.

## Ce que le test ne peut pas décider seul

Tout tester est impossible. Laisser le calendrier choisir n'est pas une
fatalité.

Le test sait dire où sont les risques et ce qu'il en a vérifié. Il ne peut pas
décider seul de ceux que l'entreprise accepte de courir.

Dans vos équipes, qui décide de ce qu'on ne teste pas : le métier, le QA ou le
calendrier ?

---

Sources : principes du test (§1.3), objectifs du test (§1.1.1), référentiel des
risques et traçabilité (§1.4.3 et §1.4.4), tables de décisions (§4.2.3),
syllabus ISTQB de niveau Fondation v4.0, traduction française du CFTL ;
[version anglaise v4.0.1, ISTQB](https://www.istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf) ;
classes de sécurité IEC 62304 et tests système en classe A,
[Johner Institute](https://blog.johner-institute.com/iec-62304-medical-software/safety-class-iec-62304/) (en anglais).
