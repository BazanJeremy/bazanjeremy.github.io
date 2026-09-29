---
title: "Qui décide qu'une release peut partir ?"
date: 2026-09-29
tag: "Fiabilité des tests"
excerpt: "Des tests verts n'autorisent rien. La décision de sortie croise des signaux qui vivent dans trois outils différents, et une part de mémoire qui ne vit nulle part. Verrous durs d'abord, score ensuite : un verdict de release qui se relit."
lang: fr
slug: qui-decide-release-peut-partir
translationSlug: who-decides-a-release-can-ship
linkedin: https://www.linkedin.com/in/jeremy-bazan
draft: false
---

Il y a un moment, dans chaque équipe, où quelqu'un dit « c'est bon, on peut
sortir ». Ce moment n'est presque jamais documenté. On regarde le rapport de
tests, on jette un œil au tableau de bord de couverture, et on se souvient que tel
test échoue une fois sur trois depuis des mois. Puis on tranche.

Cette synthèse est souvent juste. Elle est aussi non auditable, non répétable, et
absente le jour où la personne qui la fait ne l'est pas.

J'ai voulu voir ce qu'il fallait pour l'écrire. Le résultat s'appelle
**ReleaseGuard** : trois artefacts de CI en entrée — un rapport JUnit, une
couverture Cobertura, un rapport [flakysense](https://bazanjeremy.github.io/blog/tests-flaky-qui-decide),
seul le premier étant obligatoire — et un verdict **GO / CONDITIONAL GO / NO GO**
en sortie, avec son raisonnement.

## Des tests verts n'autorisent rien

Un rapport JUnit dit ce qui a échoué. Il ne dit pas si l'échec est un défaut ou
du bruit. Une couverture à 78 % dit combien de lignes ont été exécutées. Elle ne
dit pas lesquelles comptent.

La décision réelle croise ces deux sources avec une troisième, qui n'est écrite
nulle part : la connaissance de ce qui est « habituellement instable ». C'est
cette troisième source qui rend la décision fragile, pas les deux premières.

## Moyenner est l'anti-pattern

Le réflexe naturel est de pondérer les trois signaux et de fixer un seuil. C'est
exactement ce qu'il ne faut pas faire en premier.

L'ordre retenu est l'inverse : **verrous durs d'abord, score ensuite.** Deux
verrous non compensables. Un échec réel, non identifié comme instable, déclenche
NO GO. Une couverture ligne sous 60 % déclenche NO GO. Si aucun ne tombe, alors
seulement le score entre en jeu : moitié tests, quart couverture, quart
flakiness. GO à partir de 0,80, CONDITIONAL GO en dessous.

Si l'on calcule le score d'abord, une excellente couverture compense
arithmétiquement un test de fumée en échec. Le verdict devient une moyenne, et une
moyenne ignore qu'un test de fumée n'est pas un test comme les autres.

La symétrie compte autant : **un NO GO exige un blocant nommé.** Le score seul ne
peut jamais opposer un veto. Une qualité moyenne sans défaut identifiable est une
livraison dégradée, pas un blocage. Une équipe qui reçoit un refus sans nom cesse
vite de le respecter.

Les réglages suivent la même prudence : les seuils se règlent à chaque exécution,
les pondérations non. Un poids qui change est une décision de gouvernance, pas une
option de ligne de commande. Sans quoi la première équipe pressée passera le poids
des tests à 0,9 pour faire passer sa sortie.

## La décision qui n'existe qu'à la fusion

Un test en échec, identifié comme instable par flakysense, est excusé. Avec deux
garde-fous.

Le premier : l'excuse est **nominative**. Le nom du test excusé figure dans les
conditions du verdict, pas dans un log. Une relecture voit exactement quels échecs
ont été mis de côté, et peut les contester.

Le second : un échec excusé **plafonne le verdict à CONDITIONAL GO**, jamais GO.
La sortie passe, avec un signal explicite de dette de fiabilité.

Le point intéressant est ailleurs. Aucun parseur ne peut produire cette décision
seul. Le parseur JUnit voit un échec. Le rapport flakysense voit un test instable.
« Cet échec est excusable » n'existe qu'à la fusion des deux : c'est une décision
qui n'appartient à aucune des sources qui la fondent.

## Ce que l'IA n'a pas le droit de faire

La couche IA est facultative. Elle rédige le raisonnement des CONDITIONAL GO, rien
d'autre : jamais le verdict, jamais le score, jamais les conditions. Des tests le
verrouillent, au même titre que le reste.

Sans clé API, un raisonnement déterministe s'affiche à la place, et le verdict est
identique. **Le verdict ne dépend jamais d'un LLM** : son rôle se limite à rendre
lisible une décision que la logique a déjà rendue.

## Le vrai piège était ailleurs

Le piège n'était pas dans le calcul du score. Il était dans la jointure.

Pour excuser un échec, il faut apparier le test du rapport JUnit et le test du
rapport de flakiness. La conception naïve joint sur le nom court. Elle fonctionne,
jusqu'à ce que deux fichiers contiennent un test du même nom. J'ai vérifié ce cas
en conditions réelles : un vrai échec dans un fichier, un test instable homonyme
dans un autre, et la jointure par nom court transforme un NO GO en CONDITIONAL
GO. Un feu vert à tort. Un test de régression fige désormais ce cas.

L'appariement se fait donc sur les identifiants de nœud pytest complets,
reconstruits depuis le rapport JUnit. Et la règle de repli est asymétrique :
**un échec de jointure ne peut que durcir le verdict, jamais excuser à tort.** En
cas de doute, l'outil refuse plutôt qu'il n'autorise.

Dernier détail, qui n'en est pas un : à chaque push, la CI du dépôt exécute
ReleaseGuard sur ses propres artefacts. L'outil est le verrou de sortie du projet,
pas une vitrine posée à côté.

## Ce que ça déplace

La décision reste humaine. Ce qui change, c'est qu'elle est écrite : relisible,
transmissible, contestable, et identique que la personne qui « sait » soit là ou
non.

Le code est public : [github.com/BazanJeremy/ReleaseGuard](https://github.com/BazanJeremy/ReleaseGuard), 89 tests.

Dans votre équipe, la décision de sortie s'appuie-t-elle sur une règle écrite, ou
sur quelqu'un qui sait ?
