---
title: "La même vérification a eu raison, puis tort"
date: 2026-10-13
tag: "Fiabilité des tests"
excerpt: "Une animation de mon site n'a jamais fonctionné en production, et personne ne l'a remarqué. La suite de tests posée la semaine dernière a trouvé le défaut. Une fois l'animation réparée, la même vérification l'a déclarée morte une seconde fois, à tort. Ce que ça dit de la confiance qu'on accorde à un test, surtout quand on ne l'a pas écrit soi-même."
lang: fr
slug: meme-verification-raison-puis-tort
translationSlug: same-check-right-then-wrong
linkedin: https://www.linkedin.com/in/jeremy-bazan
draft: false
---

Mon site a une animation : les sections apparaissent en fondu quand on fait défiler la page. Du moins, c'était prévu.

Elle n'a jamais fonctionné. Pas un seul jour depuis la mise en ligne, mi-juillet. Je ne m'en suis pas aperçu, et personne ne me l'a signalé : le contenu s'affichait normalement, il arrivait simplement sans effet. Un défaut qui ne retire rien ne se remarque pas.

Je l'ai appris le 8 octobre, en mettant en place sur le site une suite de tests automatisés, Playwright avec un rapport Allure. Ce n'est pas moi qui l'ai écrite : c'est un agent de code. J'ai validé le plan, et chaque changement attend mon feu vert pour entrer. J'ai aussi posé une condition dès la première version, et c'est elle qui fait le sujet de cet article : voir chaque vérification échouer avant de m'y fier.

## Le code était juste, le fichier servi ne l'était pas

La règle CSS de l'animation tenait en trois déclarations, toutes correctes. Mais le site ne sert pas la source. Il sert la sortie du minifieur, et le minifieur en avait fusionné deux en un seul raccourci `animation`, timeline liée au défilement comprise : une écriture que la spécification admet, mais qu'aucun des principaux navigateurs ne gère encore.

Dans ce cas, le navigateur ne garde pas ce qu'il comprend : il ignore la déclaration entière. Plus d'animation du tout.

Les relectures lisaient la source. Le navigateur lisait le fichier minifié. Personne ne regardait le second.

Le correctif tient en quelques lignes : écrire chaque propriété séparément, ce que le minifieur ne refusionne pas. Le test qui le protège fait comme le navigateur : il lit le CSS produit par le build, pas la source, et il bloque le déploiement.

## La même vérification, cette fois à tort

Restait à vérifier le correctif sur le vrai site, pas sur une copie locale.

La vérification qui avait trouvé l'animation morte l'a déclarée morte une seconde fois. Deux exécutions sur deux. Or le CSS servi était identique, octet pour octet, à celui du build local. Ce n'était donc pas le site.

C'était le test. Le site n'a pas de JavaScript. Sans script pour le retenir, le navigateur peut déclarer le document prêt avant que la feuille de style principale soit chargée, et le test lisait le style à cet instant-là. Il ne voyait que la petite feuille intégrée à la page, et concluait à l'absence d'animation. En local, le serveur répond si vite que la feuille arrive toujours à temps. La suite était verte en local, verte en intégration continue, et fausse sur le site réel.

Le remède attend que la feuille soit appliquée avant de lire quoi que ce soit. Et quand elle ne l'est pas, le message d'échec dit que « la feuille de style externe n'est pas appliquée », au lieu d'accuser le site. Un test qui accuse le mauvais coupable coûte une enquête à chaque fois.

## Voir les tests échouer, exprès

La condition que j'avais posée tient en une phrase : une suite verte ne prouve rien sur la suite. Chaque fichier de tests doit avoir été vu rouge au moins une fois, sur un défaut introduit volontairement puis retiré. C'est le principe du test par mutation, appliqué à la main : quatorze mutations pour la première version de la suite, d'autres ensuite.

La plupart confirment ce qu'on attend : on casse, ça rougit. Certaines apprennent quelque chose. Deux exemples.

Quatre mutations d'affilée sur un module qui transforme les tableaux des articles sont restées vertes. Le code était cassé, et la suite ne voyait rien : elle testait un HTML gardé en cache, pas le code modifié. Cache vidé, les mêmes mutations ont rougi aussitôt. Sans elles, ce vert serait passé pour une preuve.

Le second exemple porte sur l'accessibilité. Feuille de style coupée, l'outil d'audit a rendu zéro violation et 85 éléments conformes. Il mesurait les contrastes du noir sur blanc par défaut du navigateur, sur une page nue. Ce qui protège ici, c'est l'attente de la feuille de style, pas l'audit.

La fausse alerte en production et ces deux mutations ont la même forme. L'assertion ne mentait pas. C'est la condition dans laquelle elle s'exécutait qui décidait du verdict, et on ne le découvre qu'en forçant le test à échouer, ou en le lançant là où vit la vérité.

## Quand on n'a pas écrit les tests soi-même

L'agent a écrit l'essentiel de la suite en trois jours. Écrire des tests est devenu bon marché. Leur faire confiance, non.

Ce qui m'est resté, c'est ce qui ne se délègue pas. Décider de ce qu'on teste, et de [ce qu'on ne teste pas](https://bazanjeremy.github.io/blog/tout-tester-est-impossible) : pas de comparaison visuelle d'écrans, par exemple, faute de références stables entre mon poste et l'intégration continue. Exiger la preuve que chaque vérification sait échouer. Et trancher ce que la mesure ne tranche pas : l'outil d'accessibilité refuse de se prononcer sur le contraste de dix éléments de la page d'accueil. Ils restent notés « inconnus », pas « conformes ». La décision me revient, et elle n'est pas encore prise.

Un test que je n'ai jamais vu échouer, je ne sais pas ce qu'il vérifie. Un test que je n'ai lancé qu'en local, je ne sais pas où il a raison.

Et vous, quand avez-vous vu un de vos tests échouer exprès pour la dernière fois ?

---

*La suite est publique, mutations comprises : [tests/README.md](https://github.com/BazanJeremy/bazanjeremy.github.io/blob/main/tests/README.md), section « Prouver que les tests savent échouer ». Sources : la timeline dans le raccourci `animation` et son support par navigateur, [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation) (en anglais) ; ce que `DOMContentLoaded` n'attend pas, [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event) (en anglais).*
