---
title: "Mot de passe « robuste » : et si vos critères d'acceptation dataient de 2003 ?"
date: 2026-07-21
tag: "Sécurité & QA"
excerpt: "Le NIST a inversé les règles héritées de 2003 : composition interdite, rotation proscrite, la longueur d'abord. Combien de suites de tests valident encore l'ancien modèle ?"
lang: fr
slug: mots-de-passe-criteres-2003
translationSlug: passwords-acceptance-criteria-2003
linkedin: https://www.linkedin.com/in/jeremy-bazan
draft: false
---

Une majuscule, un chiffre, un caractère spécial. Renouvellement tous les 90 jours.

Ce critère d'acceptation, je l'ai croisé sur la plupart des applications que j'ai testées. Il rassure tout le monde : le product owner, l'auditeur, l'utilisateur qui a l'impression de bien faire. Un seul problème — la source qui l'a inspiré l'a enterré.

## Ce que dit réellement NIST

Le NIST — l'institut américain dont les recommandations font référence bien au-delà des agences fédérales — a finalisé en juillet 2025 la révision 4 de ses Digital Identity Guidelines (SP 800-63B-4). Elle ne nuance pas les anciennes règles : elle les inverse.

- **Les règles de composition sont interdites.** Exiger une majuscule, un chiffre ou un caractère spécial n'est plus « déconseillé » : c'est un SHALL NOT.
- **La rotation périodique est proscrite.** Le changement forcé n'est légitime qu'en cas d'indice de compromission — fuite de la base, activité frauduleuse.
- **La longueur prime.** 15 caractères minimum quand le mot de passe est le seul facteur d'authentification, 8 s'il est adossé à du MFA. Et le champ doit accepter au moins 64 caractères : la passphrase devient la norme.
- **Le filtrage remplace la composition.** Chaque mot de passe candidat est comparé à une liste de valeurs courantes, attendues ou compromises.
- **Les gestionnaires de mots de passe sont des alliés.** Le collage doit être autorisé, l'Unicode accepté.
- **Les questions de sécurité sont hors jeu**, y compris pour la réinitialisation. « Le nom de votre premier animal » n'est pas un secret.
- Et une lucidité utile : **un mot de passe n'est pas résistant au phishing**. C'est un plancher de sécurité, pas un plafond.

## Pourquoi l'ancien modèle a échoué

Pas à cause de la cryptographie. À cause du comportement humain.

L'histoire mérite d'être connue : les règles de composition et la rotation à 90 jours remontent à un guide NIST de 2003 — huit pages rédigées par un ingénieur nommé Bill Burr, devenues le modèle des politiques de mots de passe du monde entier. En 2017, Burr a publiquement admis au Wall Street Journal regretter l'essentiel de ses recommandations.

Ce que ces règles avaient sous-estimé : face à une contrainte de composition, l'utilisateur applique la transformation minimale prévisible — majuscule en tête, « 1! » en queue. Face à une rotation imposée, il incrémente le dernier chiffre. Le résultat tient dans un exemple que NIST cite lui-même : `Password1!` satisfait toutes les règles de composition classiques… et figure parmi les mots de passe les plus utilisés au monde.

Ces règles mesuraient la conformité. Pas la sécurité.

## La traduction QA : ce que nos tests devraient vérifier

C'est ici que le sujet devient un sujet de test. Combien de suites de tests valident encore, avec rigueur et à chaque pipeline, des exigences que le standard a inversées ?

| Exigence héritée | NIST SP 800-63B-4 | Le cas de test à écrire aujourd'hui |
|---|---|---|
| Majuscule, chiffre et caractère spécial obligatoires | Règles de composition interdites | Une passphrase longue sans caractère spécial est acceptée |
| Expiration forcée tous les 90 jours | Changement uniquement sur compromission | Aucune expiration périodique ; le changement forcé se déclenche bien après un signalement |
| Champ limité à 12-16 caractères, collage bloqué | Au moins 64 caractères, collage autorisé | Une passphrase de 64 caractères, collée depuis un gestionnaire, avec des caractères Unicode |
| Aucun contrôle des mots de passe courants | Filtrage obligatoire contre une blocklist | `Password1!` est rejeté — alors qu'il coche toutes les anciennes règles |
| Questions de sécurité pour la réinitialisation | Proscrites, y compris pour le reset | Le parcours de réinitialisation ne repose sur aucune question de connaissance |
| Tentatives de connexion illimitées | Limitation du débit exigée | Le throttling se déclenche et borne les attaques par essais successifs |

Chaque ligne de la colonne de gauche est, quelque part en ce moment, un test qui passe au vert. Vert sur une exigence périmée.

## La vraie leçon dépasse les mots de passe

Une exigence peut survivre des années à la source qui l'a produite. Et nos suites de test sont l'endroit exact où elle se fossilise : automatisée, versionnée, exécutée à chaque pipeline — jamais questionnée.

Un test qui passe sur une exigence périmée ne produit pas de la qualité. Il produit de la fausse assurance.

C'est pour ça que je considère l'examen des critères d'acceptation comme un acte de test à part entière. Dans ma pratique, l'évaluation des risques intervient dès le cadrage, sur l'ensemble des user stories du sprint — avant la première ligne de code. Interroger la fraîcheur d'une exigence relève du même geste : le shift-left ne commence pas au code, il commence à la spécification.

De quand datent les critères d'acceptation de votre formulaire d'authentification ?

---

### Sources

- NIST SP 800-63B-4, *Digital Identity Guidelines: Authentication and Authenticator Management* — version finale, juillet 2025 : [csrc.nist.gov/pubs/sp/800/63/b/4/final](https://csrc.nist.gov/pubs/sp/800/63/b/4/final)
- FAQ NIST SP 800-63 (rationale détaillé des révisions) : [pages.nist.gov/800-63-FAQ](https://pages.nist.gov/800-63-FAQ/)
- Interview de Bill Burr, *The Wall Street Journal*, août 2017.
