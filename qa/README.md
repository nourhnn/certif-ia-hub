# Revue · Staffing, notifications et profil Formateur

Branche `feat/staffing-notifications-trainer-profile`, issue du commit `ba4bd06` de `origin/main`. La branche de refonte globale reste dans l’historique. Le projet conserve la V1.9 publiée comme référence de code et de design.

## Audit et priorités

| Priorité | Point audité | Intervention |
| --- | --- | --- |
| P0 | Une proposition, une confirmation et une affectation replanifiée ont des règles différentes | Précondition de disponibilité datée, contrôle des conflits, autorisation AMO avant l’envoi, contrôle avant confirmation et fermeture des propositions concurrentes quand la capacité est remplie |
| P0 | Les notifications lues disparaissaient côté AMO et l’ouverture du centre lisait tout côté Formateur | Historique par profil, lecture explicite, types, compteur de non-lues et aiguillage vers la proposition, la mission ou le dossier autorisé |
| P0 | Une relance WhatsApp pouvait rester implicitement en attente après dépôt | États En attente, Annulée et Terminée, déclenchement simulé après 48 h pour un livrable encore manquant, déduplication |
| P0 | Le suivi d’incident et les indicateurs personnels devaient rester dans leurs espaces respectifs | Historique et corrections dans la fiche AMO. Évaluations communicables et ponctualité personnelle dans le portail |
| P1 | La fiche et le staffing demandaient des allers-retours | Accès aux propositions existantes et à la préparation d’une mission compatible depuis la fiche |
| P1 | L’arbitrage manquait de contexte et les cartes prenaient de la place sur mobile | Session choisie en sélecteur, prochaines actions, états de retard, historique, filtres de compatibilité et de TJM |
| P2 | Les décisions et notifications devaient rester utilisables au clavier | Focus dans les feuilles, retour au déclencheur, cibles tactiles et réduction des animations |

## Notes de revue

- La grille de compatibilité reste indicative. Elle conserve les quatre critères de la V1.9. La carte ajoute le TJM TTC, la fiabilité illustrée, les missions terminées recensées et la mobilité lorsqu’elle a été déclarée. À score égal, une expertise vérifiée et l’historique chez le même client départagent les candidats. Une disponibilité datée couvrant la session a priorité sur l’indicateur général du profil, sous réserve des événements conflictuels et des exclusions internes.
- Les propositions nouvellement envoyées proposent une échéance de deux jours calendaires, plafonnée à la date de session si celle-ci est imminente. Le dépassement rend la réponse indisponible et l’AMO peut clôturer explicitement la proposition. Le remplacement libère l’affectation puis revient à la sélection de candidats. Les données d’historique sont conservées.
- La source de notifications reconstruit des événements structurés à partir du modèle métier local. Chaque boîte a ses propres clés d’événements et états de lecture. Lors du premier calcul sur des données existantes, la date enregistrée correspond à l’apparition dans cette boîte locale. Les relances PWA et WhatsApp restent simulées.
- Le profil renseigne uniquement les champs disponibles. La pondération de fiabilité 40/30/20/10 et le caractère indicatif des données de démonstration sont conservés. Les préférences de déplacement en texte libre restent des informations à vérifier lors de l’arbitrage.
- Les suivis, profils et notifications sont conservés dans le navigateur. Le futur service devra définir des événements serveur idempotents, une boîte filtrée par identité, les autorisations AMO et Formateur, la révocation des accès et un planificateur des relances. Les rôles de démonstration et les données du client ne constituent pas ces garanties.

## Vérifications reproductibles

Lancer `node server-local.mjs` puis, dans un autre terminal, installer Playwright si nécessaire et exécuter les scénarios.

```bash
npm install --no-save --package-lock=false playwright
npx playwright install chromium webkit
node qa/operations.mjs
QA_ENGINE=webkit node qa/operations.mjs
```

Le script accepte `CHROME_PATH` pour utiliser Chrome installé, `HUB_URL` pour changer l’URL et `QA_OUTPUT` pour choisir le répertoire des résultats. Par défaut, les fichiers JSON et les PNG sont enregistrés dans `/tmp/certifia-operations-qa`.

## Fichiers modifiés

- `operations.js` et `operations.css` contiennent les règles métier de démonstration, les composants des trois modules et leur styles ciblés.
- `hub.js` raccorde les parcours existants, la cloche du header, la fiche et le profil, la navigation Formateur et les états documentaires de relance.
- `index.html` et `sw.js` chargent et précachent les deux nouveaux actifs.
- `qa/operations.mjs` contient les tests et les captures. Ce document résume les changements pour la revue GitHub.

## Résultats du contrôle local

| Contrôle | Résultat |
| --- | --- |
| Chromium, parcours fonctionnels | 6 réussis, dont la confirmation, le remplacement, le refus, le conflit, la clôture sans réponse, la lecture et la persistance des notifications, le dépôt qui annule une relance et la confidentialité |
| Chromium, rendu et captures | 4 tailles contrôlées : 375 × 667, 390 × 844, 768 × 1024 et 1440 × 900 |
| WebKit, émulation iPhone | 390 × 844 contrôlé sur le staffing, le centre de notifications, la fiche AMO et le profil Formateur |

Aucun débordement horizontal ni erreur JavaScript n’a été observé dans les écrans contrôlés. Le test de conflit injecte un événement fictif dans l’agenda du navigateur. Le test des relances avance l’horodatage de la première notification et passe par le dépôt de fichier en interface. Les tests de capture utilisent un navigateur avec service worker désactivé. L’installation native de la PWA, VoiceOver sur iPhone et l’exécution en arrière-plan sur un appareil fermé restent à vérifier. Les relances de démonstration sont évaluées pendant l’utilisation du Hub.

La revue GitHub peut reprendre ce document comme description de PR. La branche est préparée localement pour éviter un éventuel déploiement de prévisualisation Vercel lors de la publication.
