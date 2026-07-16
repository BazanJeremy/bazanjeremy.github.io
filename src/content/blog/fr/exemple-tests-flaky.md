---
title: "L'IA en QA "
date: 2026-07-16
tag: "veille"
excerpt: "Article de veille"
lang: fr
slug: veille - bas niveau
linkedin: https://www.linkedin.com/in/jeremy-bazan
draft: false
---


# Commencer par les tâches simples

*Relecture d'US contre la DOR, documentation : le ROI le plus rapide de l'IA n'est pas là où on le cherche.*

Les conversations sur l'IA en QA vont vite au spectaculaire : suites de tests auto-générées, agents autonomes de bout en bout. Sur le terrain, le retour sur investissement le plus rapide se joue ailleurs — sur des tâches simples, répétitives, et pourtant chronophages. Deux exemples vécus : la relecture d'une US contre la Definition of Ready, et la documentation.

## Relire une US contre la DOR

Une Definition of Ready (DOR) n'a de valeur que si elle est appliquée à chaque US. En pratique, cette vérification est souvent la première sacrifiée : répétitive, peu gratifiante, chacun suppose qu'un autre l'a faite. Résultat classique : l'US entre en sprint avec des critères d'acceptation invérifiables, et l'ambiguïté se paie plus tard — en allers-retours, en anomalies évitables.

C'est un cas d'école pour un LLM. On lui fournit la checklist DOR de l'équipe et l'US brute ; il signale les critères manquants ou flous : dépendance non identifiée, donnée de test absente, critère non testable. Il propose ensuite une dérivation des critères d'acceptation en scénarios passants et non-passants — matière directement réutilisable pour la stratégie de test.

Ce que le LLM ne voit pas : les règles métier implicites, celles qui ne sont écrites nulle part. C'est exactement là que le jugement du QA reprend la main : il tranche si l'US est réellement prête, et remonte au PO des points précis plutôt qu'un ressenti.

## Générer la documentation

Même logique pour les guidelines et la documentation QA : le LLM produit une première version structurée en quelques minutes ; le QA valide le fond, corrige, décide. Le temps gagné n'est pas du confort — il se réinvestit là où l'humain apporte le plus : analyse de risques, exploration, dialogue avec le produit.

## Ce que ça change, mesuré

Référent IA de mon pôle QA, j'ai installé ces usages au quotidien. Résultat mesuré : −60 à −80 % de temps sur les phases amont outillables par LLM — vérification des DOR, dérivation des critères d'acceptation en scénarios passants/non-passants, cadrage haut niveau de la stratégie de test.

Le paradoxe n'en est pas un : c'est parce que ces tâches sont simples et bien cadrées que l'IA y excelle avec un risque maîtrisé. Et c'est le meilleur terrain pour installer une gouvernance saine avant de viser plus ambitieux. Le déterministe d'abord, l'IA là où elle apporte — le QA reste l'arbitre.

