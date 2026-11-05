---
title: "Sans critère d'acceptation, je ne sais pas tester"
date: 2026-11-05
tag: "Pratiques QA"
excerpt: "Une user story sans critère d'acceptation, on peut seulement la regarder fonctionner. Ce qu'un critère donne au test : au moins deux cas, une limite à interroger et un lien pour savoir quoi rejouer quand il change."
lang: fr
slug: sans-critere-dacceptation-pas-de-test
translationSlug: no-acceptance-criteria-no-test
linkedin: https://www.linkedin.com/in/jeremy-bazan
draft: false
---

Une user story sans critère d'acceptation, je ne sais pas la tester. Je sais
seulement la regarder fonctionner.

Sans critère, aucun comportement attendu n'est écrit. Chacun teste ce qu'il
imagine, et un test sans résultat attendu ne peut jamais échouer : il se
contente de passer.

## Ce que dit le syllabus

Pour le syllabus ISTQB de niveau Fondation, les critères d'acceptation sont les
conditions qu'une implémentation doit remplir pour être acceptée par les
parties prenantes. Ils délimitent le périmètre de la story, et ils décrivent des
scénarios positifs comme négatifs. Ils servent de base aux tests d'acceptation.

Le syllabus retient deux formats comme les plus courants : orienté scénario
(le format « Given / When / Then ») et orienté règle (une liste de
vérifications ou un tableau de correspondances entrées-sorties). Il admet un
format personnalisé, à condition qu'il soit défini et non ambigu.

## Un critère, deux cas au moins

Chaque critère me donne au moins deux cas : celui qui doit passer, et celui qui
doit échouer proprement. Le cas nominal, tout le monde l'écrit. C'est le cas
non passant qui fait arriver les questions.

Prenons un critère qui fixe une plage : « la quantité est comprise entre 1 et
100 ». Pour des quantités entières, le domaine se découpe en trois partitions
d'équivalence : 0 et moins (invalide), de 1 à 100 (valide), 101 et plus
(invalide). Le syllabus part de l'hypothèse que les valeurs d'une même partition
sont traitées de la même façon : un test par partition suffit.

Mais les erreurs se logent aux frontières. L'analyse des valeurs limites teste
les bornes des partitions. Dans sa version à deux valeurs, elle retient pour
chaque borne la valeur elle-même et son plus proche voisin de la partition
voisine : 0, 1, 100 et 101. Dans sa version à trois valeurs, elle retient la
borne et ses deux voisins : pour les bornes 1 et 100, cela donne 0, 1, 2, 99,
100 et 101.

Pourquoi pas 50 ? Il représente la partition valide, et une valeur de ce genre
suffit pour elle. Il n'apprend presque rien sur les frontières, là où les
erreurs sont les plus probables.

Le syllabus donne un exemple de défaut que seule la version à trois valeurs
attrape : une condition écrite `x ≤ 10` et implémentée `x = 10`. Les valeurs 10
et 11 donnent le même résultat dans les deux cas. C'est 9 qui révèle la
différence.

## C'est en cherchant la limite que la vraie question se pose

Au moment de choisir 100 et 101, deux questions arrivent. 100 est-il inclus ?
Que voit l'utilisateur à 101 : un message d'erreur, ou rien du tout ?

Le critère « entre 1 et 100 » n'y répond pas. Le format scénario force à le
faire. Par exemple : « Étant donné une quantité de 101, quand l'utilisateur
valide, alors un message indique que la quantité maximale est 100. » Ce texte
est un exemple de rédaction, pas un comportement que j'attribue à une
application.

Une ambiguïté trouvée à ce moment-là se règle en écrivant une phrase, avant
la première ligne de code. C'est la même logique que dans
[l'article sur le moment d'entrée du QA](/blog/qa-refinement-trop-tard).
Trouvée plus tard, elle se règle en réécrivant un critère déjà validé et des
tests déjà écrits.

## Chaque cas reste rattaché à son critère

Une fois les cas écrits, je les garde rattachés à leur critère. Une façon simple
de le faire : porter l'identifiant du critère dans le nom ou l'étiquette du
test.

Le syllabus appelle cela la traçabilité entre la base de test et le testware.
Il en cite plusieurs usages : vérifier que chaque exigence est couverte,
conduire l'analyse d'impact d'une modification, faciliter les audits.

Pour moi, la traçabilité n'est pas d'abord un tableau pour l'audit. C'est la
réponse à une question qui revient à chaque changement : qu'est-ce qu'on
rejoue ? Le jour où le critère change, je sais quels tests rejouer, et lesquels
deviennent faux.

## Ce que ça ne règle pas

Des tests dérivés des critères ne valent que ce que valent les critères. Un
critère oublié donne un cas oublié, et un critère trop vague donne un test que
personne ne peut contredire.

Les partitions et les valeurs limites traitent une entrée à la fois. Elles ne
disent rien des combinaisons ni de l'enchaînement des parcours : pour cela, il
faut encore choisir, comme je l'écrivais dans
[l'article sur ce qu'on ne teste pas](/blog/tout-tester-est-impossible).

Un critère clair ne remplace donc ni l'exploration ni l'analyse de risque. Il
donne seulement au test un point de départ qui peut échouer.

Quand un critère reste flou sur une limite, qui tranche chez vous : le PO, le
dev ou le test ?

---

Sources : critères d'acceptation (§4.5.2), partitions d'équivalence (§4.2.1),
analyse des valeurs limites, versions à deux et trois valeurs (§4.2.2),
traçabilité entre la base de test et le testware (§1.4.4), syllabus ISTQB de
niveau Fondation v4.0, traduction française du CFTL ;
[version anglaise v4.0.1, ISTQB](https://www.istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
(numérotation de cette version) ;
[livre blanc sur l'analyse des valeurs limites, ISTQB](https://istqb.org/wp-content/uploads/2025/10/Boundary-Value-Analysis-white-paper.pdf)
(en anglais).
