---
title: "« Accessible à 71 % » : ce que le taux ne dit pas"
date: 2026-10-01
tag: "Pratiques QA"
excerpt: "Un site peut respecter 71 % des critères d'accessibilité et rester impraticable pour qui navigue au clavier. Ce qu'un taux mesure, ce qu'il tait, et comment tester l'accessibilité comme un risque, parcours par parcours."
lang: fr
slug: accessible-a-71-pourcent
translationSlug: accessible-at-71-percent
linkedin: https://www.linkedin.com/in/jeremy-bazan
draft: false
---

Le 4 juin 2026, le tribunal judiciaire de Caen, saisi en référé, a ordonné à une
grande enseigne de rendre son site et son application pleinement accessibles aux
personnes handicapées, dans un délai de six mois et sous astreinte. L'enseigne
faisait valoir un taux de conformité de 71 %. Le juge a rappelé que
l'accessibilité numérique est une obligation de résultat : un site marchand ne
peut pas être « un peu » accessible.

Ce 71 % mérite qu'on s'y arrête. Il ressemble à beaucoup d'indicateurs de qualité :
rassurant, calculable, et silencieux sur l'essentiel.

## Le cadre, en quelques lignes

Longtemps, l'obligation d'accessibilité numérique a surtout visé le secteur
public. Depuis le 28 juin 2025, la directive européenne sur l'accessibilité
(European Accessibility Act, ou EAA) l'étend à une série de produits et de
services, parmi lesquels le commerce en ligne, les services bancaires aux
consommateurs, les communications électroniques, les livres numériques et
certains services de transport de voyageurs. Les micro-entreprises qui
fournissent des services en sont exemptées.

En France, le décret du 24 août 2026 a mis à jour le régime qui concerne le
secteur public et certaines entreprises, notamment celles dont le chiffre
d'affaires atteint 250 millions d'euros. Il ne crée pas d'obligation générale
nouvelle : il aligne le dispositif sur le calendrier européen et renvoie aux
normes européennes harmonisées, que le référentiel français, le RGAA, devra au
moins égaler.

## Un taux compte des critères, un utilisateur vit un parcours

Un taux de conformité répond à une question : combien de critères sont
respectés ? Un utilisateur s'en pose une autre : est-ce que je peux aller au bout ?

Prenez un parcours d'achat en six étapes. Cinq sont irréprochables. À la sixième,
le bouton de paiement ne peut pas être utilisé au clavier. Le taux reste
flatteur. Pour la personne qui navigue au clavier, le parcours vaut zéro : elle ne
peut pas payer.

Les défauts d'accessibilité ne se compensent pas entre eux. Une moyenne les
dilue ; un parcours les additionne, et il suffit d'un seul défaut bloquant pour
tout arrêter.

## Ce qu'un outil automatique voit, et ce qu'il ne voit pas

Les contrôleurs automatiques, comme axe, sont précieux. Ils repèrent en quelques
secondes une image sans alternative textuelle, un texte trop peu contrasté, un
champ de formulaire sans étiquette, une page sans langue déclarée. Ils sont
rapides, répétables, et se branchent sur les tests existants : la documentation
de Playwright montre comment intégrer axe-core à une suite de bout en bout, pour
que la vérification tourne à chaque exécution.

Ce qu'ils ne savent pas juger, c'est le sens. Ils voient qu'une image a une
alternative ; ils ne savent pas si elle décrit ce qui compte. Ils ne savent pas
si l'ordre du focus suit la logique de la page, si l'on peut sortir d'une fenêtre
modale au clavier, si un message d'erreur dit comment corriger, ou si le lecteur d'écran
annonce que le panier vient d'être mis à jour.

La documentation de Playwright le dit d'ailleurs sans détour : beaucoup de problèmes ne se
découvrent qu'en test manuel, et elle recommande de combiner tests automatisés,
évaluations manuelles et tests inclusifs avec des utilisateurs. Quant au score
d'accessibilité sur 100 que calcule Lighthouse, c'est un taux de plus : utile
pour suivre une tendance, muet sur un parcours.

Une analyse récente des sites des dix universités françaises qui accueillent le
plus d'étudiants relevait notamment des contrastes insuffisants et une navigation
au clavier déficiente. Le premier défaut se détecte le plus souvent automatiquement. Le second
demande presque toujours quelqu'un au clavier.

Un outil automatique donne un plancher, pas un verdict.

## Tester l'accessibilité comme un risque

Le test basé sur les risques, que le syllabus ISTQB place au cœur de la
priorisation, s'applique ici sans adaptation : on commence par ce qui bloquerait
le plus de monde, sur les parcours qui comptent le plus.

Si je n'avais qu'une heure pour évaluer un service en ligne, je ne calculerais
pas de taux. Je prendrais le parcours principal et je le ferais deux fois.

Au clavier seul d'abord : tout atteindre, tout activer, voir le focus à chaque
étape, ne jamais rester piégé. Puis au lecteur d'écran, NVDA ou VoiceOver sur
ordinateur, TalkBack ou VoiceOver sur mobile : chaque champ annoncé avec son nom,
chaque erreur annoncée et compréhensible. Ensuite viennent le zoom, les
contrastes, et les contrôles automatiques en intégration continue, pour qu'une
régression détectable ne revienne pas.

Le plus rentable reste d'écrire l'accessibilité dans la user story, en critères
que tout le monde comprend : « le paiement peut se faire entièrement au clavier,
le focus reste visible à chaque étape » ; « toute erreur de saisie est annoncée par
le lecteur d'écran et indique comment la corriger ». Écrit là, le critère se
teste à chaque sprint. Le même défaut, découvert à l'audit, se corrige sous
contrainte.

Pour les parcours majeurs, rien ne remplace une séance avec des personnes qui
utilisent des technologies d'assistance au quotidien.

## Dans la banque, le parcours passe par l'authentification

Le secteur bancaire est l'un des plus directement concernés. La directive vise
explicitement les services bancaires aux consommateurs de l'UE, y compris
lorsqu'ils sont fournis par un établissement situé hors de l'Union. Et elle ne s'arrête pas aux pages d'information : les moyens
d'identification, la signature électronique, les fonctions de sécurité et de
paiement doivent eux aussi être perceptibles, utilisables, compréhensibles et
robustes.

C'est là que le parcours peut casser. Un code à usage unique qui expire avant
d'avoir pu être saisi. Un clavier virtuel aux chiffres mélangés, s'il ne
fonctionne qu'à la souris. Un relevé de compte livré dans un PDF non balisé, que
le lecteur d'écran restitue mal. Chacun de ces défauts pèse peu dans un taux de
conformité ; chacun suffit à fermer l'accès au compte.

La directive ajoute une exigence moins connue : les informations sur ces
services doivent rester compréhensibles, sans dépasser le niveau B2 du cadre
européen commun de référence pour les langues. Aucun contrôleur d'accessibilité
ne le vérifie. Une relecture par quelqu'un d'extérieur au projet, si.

## Ce qui reste au métier

Le test sait dire si un parcours est praticable. Il ne sait pas dire lequel
compte le plus. La liste des parcours critiques — payer, s'authentifier,
ouvrir un compte, prendre un rendez-vous médical — appartient au métier. L'obligation,
elle, porte sur tout le service : cette liste fixe l'ordre dans lequel on le
vérifie, pas son périmètre.

Un taux de conformité reste utile pour suivre une progression. Il ne dit pas si
quelqu'un peut payer.

Dans vos équipes, l'accessibilité est-elle écrite dans les critères
d'acceptation, ou découverte à l'audit ?

---

Sources : décret n° 2026-816 du 24 août 2026 et analyse des sites universitaires,
[Handicap.fr, 3 septembre 2026](https://informations.handicap.fr/a-accessibilite-numerique-ce-qui-change-en-france-et-en-ue-39631.php) ;
ordonnance du tribunal judiciaire de Caen du 4 juin 2026,
[Handicap.fr](https://informations.handicap.fr/a-accessibilite-web-carrefour-condamne-par-la-justice-39309.php) ;
exigences propres aux services bancaires,
[directive (UE) 2019/882, annexe I](https://eur-lex.europa.eu/eli/dir/2019/882/oj/fra) ;
portée de la directive pour un établissement situé hors de l'Union,
[Oberson Abels, novembre 2025](https://obersonabels.com/wp-content/uploads/2025/11/OASA-Legal-Update-Accessibility-Act.pdf) ;
intégration d'axe-core et limites des tests automatisés,
[documentation de Playwright](https://playwright.dev/docs/accessibility-testing).
