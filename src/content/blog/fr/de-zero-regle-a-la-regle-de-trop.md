---
title: "De zéro règle à la règle de trop"
date: 2026-09-20
tag: "Pratiques QA"
excerpt: "Un agent perd son coffre et écrit « plus jamais ». Une regex refuse un identifiant légitime. Les deux règles venaient d'une observation, pas d'une spécification — et une seule des deux s'est ravisée."
lang: fr
slug: de-zero-regle-a-la-regle-de-trop
translationSlug: from-no-rule-to-one-rule-too-many
linkedin: https://www.linkedin.com/in/jeremy-bazan
draft: false
---

Le 15 septembre, la société d'évaluation Vals AI a publié le compte rendu d'une
expérience : GPT-6 Astra, le dernier modèle d'OpenAI, a joué 141 heures à
Minecraft en direct, uniquement par contrôle de l'écran, du clavier et de la
souris. Le modèle est allé plus loin qu'aucun système qu'elle avait testé
auparavant : ferme à blazes semi-automatique, endermen tués, perles récupérées.

Puis il a rangé tout son butin dans un coffre, à côté de son lit. Un creeper a
fait sauter les deux.

Ce que le modèle a écrit ensuite pour lui-même est resté tel quel, espaces
manquants compris : « ALWAYS CARRY CRITICALITEMS withkeepInventory;
don'tstoreinunguardedchesteveragain. » Toujours. Plus jamais. Selon Vals AI, il a
ensuite passé des heures à ne plus faire grand-chose d'autre que cultiver des
pommes de terre.

Que la règle explique ou non ce qui a suivi, personne ne peut le dire : une
partie, un incident, aucun contrefactuel. Ce qui m'intéresse est ailleurs. C'est
la règle elle-même.

## La même règle, sans IA

Je n'ai pas eu besoin d'un agent pour rencontrer ce schéma.

Sur une application métier, un champ attendait un numéro : deux lettres, puis
des chiffres. Au départ, aucun contrôle de saisie — et les mauvaises surprises se
sont enchaînées. Nous avons donc ajouté une regex stricte : deux lettres, sept
chiffres. Sept, parce que c'était le format de tous les identifiants que nous
avions sous les yeux.

Un jour, un produit est arrivé avec un identifiant à huit chiffres. La regex a
bloqué ses mises en service. Nous l'avons adaptée au contexte.

## Une observation n'est pas une spécification

Les deux règles ont la même origine : une observation. Un incident pour Astra,
une population d'identifiants pour nous. Aucune des deux ne venait d'une
spécification. Les deux ont été écrites comme des lois.

Une règle tirée de ce qu'on observe est une hypothèse. Elle devient une loi le
jour où elle bloque quelque chose.

Il y a pourtant une différence, et elle ne joue pas en faveur du code. Astra a
fini par se corriger : devant une forme verte et verticale, il a noté que c'était
de la canne à sucre, pas un creeper. L'alerte a été levée.

Une regex, elle, ne se ravise jamais. Elle refuse le même identifiant à chaque
tentative, sans exception, jusqu'à ce qu'un humain change la règle. C'est
exactement sa valeur : elle est reproductible. C'est aussi pourquoi sa source
compte davantage que sa formulation. Le déterministe d'abord, l'IA là où elle
apporte — le QA reste l'arbitre.

## Trois questions à poser à n'importe quelle règle de validation

**D'où vient-elle ?** D'une spécification qui a un propriétaire, ou de
l'échantillon du moment ? Les deux sont acceptables. Une seule des deux doit être
écrite noir sur blanc, avec sa date.

**Que coûte son erreur ?** Une règle trop permissive coûte un ticket. Une règle
trop stricte refuse une saisie légitime et coûte une mise en service. Le second
cas se teste rarement : on teste ce qu'on connaît, et on ne connaît pas encore le
format qui n'existe pas.

**Comment change-t-elle ?** Par une décision tracée, ou par un correctif appliqué
à chaud par la personne de permanence ?

C'est ce que j'applique aux outils que je publie. Dans flakysense, le score de
flakiness est amorti sous quatre runs d'historique : peu de données, pas de
verdict confiant. Et le seuil d'escalade est bien exposé en ligne de commande,
pour qui veut explorer — mais sa valeur par défaut ne bouge que par un ADR qui
remplace le précédent. Ce n'est pas de la bureaucratie : c'est ce qui empêche une
règle de devenir une coutume dont plus personne ne connaît l'origine.

## Ce qui reste

Nous n'avons pas monté de référentiel après l'incident. Nous avons élargi la
règle. La leçon n'est donc pas un processus, c'est un statut : savoir, au moment
où on l'écrit, si une règle décrit une spécification ou seulement ce qu'on a sous
les yeux.

Les agents qu'on déploie aujourd'hui écrivent leurs propres règles, dans leur
propre mémoire, à chaud, juste après un incident. Personne ne les date, personne
ne les relit. Astra, au moins, avait plusieurs milliers de spectateurs pour
constater qu'il s'était mis à cultiver des pommes de terre.
