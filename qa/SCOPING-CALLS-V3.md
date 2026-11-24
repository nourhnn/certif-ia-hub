# Certif-IA Hub · Calls de cadrage V3

Branche `feat/scoping-calls-v3-ux` issue de `main` au commit `0c93365`.

## Audit initial

| Composant | Constat sur main |
| --- | --- |
| Écran AMO | La liste et tous les formulaires étaient affichés ensemble. Les cartes dépendaient d’un statut `pending` qui désignait aussi les brouillons. |
| Propositions | Le choix d’un créneau le rendait visible au Formateur immédiatement. Copier un message ne créait aucun événement de transmission. Le message visait le contact client alors que le workflow suivait la réponse du Formateur. |
| Agenda et staffing | Agenda V2 centralise les chevauchements, le libre/occupé vérifié, les disponibilités déclarées et les préférences. Le staffing utilise déjà des contrôles de conflit avant changement d’état et un brouillon externe à copier. |
| Dashboard AMO et portail | Les cartes, badges, icônes SVG, feuilles mobiles et navigation à cinq onglets existent. Le Dashboard AMO utilise un accès direct au dossier concerné. |
| Données | Les calls sont dans `db.scoping.calls`, persistés dans localStorage avec le reste de la démo. Les notes Formateur jointes utilisent IndexedDB. Les formations, personnes, contacts, affectations et documents sont réutilisés. |
| Notifications | Le service worker installe et sert le cache. Le centre de notifications du Hub repose sur un historique local par profil. Aucun gestionnaire push, abonnement navigateur, destinataire authentifié, VAPID ou serveur d’envoi n’est présent. Les statuts de lecture de la boîte locale ne prouvent pas une livraison push. |
| Intégrations | Les données de Google Agenda ou Outlook ne sont pas synchronisées. Le compte rendu s’enregistre localement, avec copie manuelle pour HubSpot. La synthèse croisée du cadrage est un emplacement désactivé. |

## Parcours et transitions

- Le cockpit affiche quatre filtres rapides, une recherche, un filtre de statut et une carte par dossier. Le jalon urgent est celui existant de J‑14 pour les calls ouverts. La carte affiche la dernière activité enregistrée et l’action suggérée.
- Une route propre `#/interne/scoping-calls/<formation>` charge seulement le dossier, y compris après actualisation. Ses quatre espaces réutilisent l’agenda, le contact, les livrables, la note jointe par le Formateur et le compte rendu existants. L’écran reste dans la PWA sans navigation réseau entre les étapes.
- Planification présente six résultats au départ. Une sélection reste un brouillon. La copie externe conserve cet état. « J’ai envoyé les propositions » enregistre la date, le destinataire et le canal déclaré, après contrôle de tous les créneaux. Un échec de persistance laisse les brouillons dans leur état précédent.
- Le Formateur peut répondre sur les créneaux transmis à son profil, ou proposer une alternative. Le suivi conserve les refus et signale les créneaux expirés. Une alternative ajoutée par l’AMO est une disponibilité exprimée par le Formateur. Elle ne compte pas comme créneau envoyé par l’AMO.
- Des propositions historiques ayant déjà reçu une réponse restent visibles. Les anciens créneaux sans réponse ni preuve d’envoi restent des brouillons. Les calls confirmés ou réalisés et leur historique sont préservés. L’absence de date d’envoi ou de réponse historique est affichée comme telle.
- Confirmer exige un créneau accepté, futur et sans conflit confirmé. Les autres créneaux restent dans le suivi. Aucune invitation n’est créée. Le compte rendu conserve son état local et l’indication HubSpot à connecter.

## Relance push

« Relancer le formateur » ouvre un aperçu du message pour un call ouvert avec des créneaux transmis en attente. Le bouton d’envoi reste désactivé et porte le contexte « Notifications push à connecter ». Ouvrir l’aperçu ne crée aucun événement.

Le suivi peut lire des événements de relance de forme `{at, trainerId, channel, author, status, result}`. Les états décrivent la demande, la prise en charge, l’acceptation par le service push, l’échec, la réception ou la lecture. Les deux derniers exigent un événement attesté. Le délai de prototype est de 24 h après une demande prise en compte pour le même destinataire, regroupé dans `reminderCooldownMs`. La protection définitive devra s’exécuter côté serveur avec idempotence et autorisations. Les rôles de démonstration et la persistance navigateur ne permettent pas d’échanger entre appareils ou comptes indépendants.

## Tests reproductibles

Lancer `node server-local.mjs` puis exécuter les commandes avec Playwright installé.

```sh
node qa/scoping-calls-v3.mjs
QA_ENGINE=webkit node qa/scoping-calls-v3.mjs
QA_ENGINE=webkit node qa/amo-phase1.mjs
QA_ENGINE=webkit node qa/formateurs-staffing.mjs
```

`HUB_URL` définit le serveur local, `CHROME_PATH` permet de choisir Chrome installé et `QA_OUTPUT` définit le dossier des captures. Les fixtures de cadrage, y compris l’événement de relance utilisé pour tester le délai, existent uniquement dans le navigateur de test. L’essai PWA utilise le service worker réel et ouvre le cockpit puis le suivi hors ligne.

Le déploiement automatique de la branche est désactivé. Le commit de phase 3 déployé séparément n’était pas dans le `main` de départ et n’est pas incorporé à cette branche de refonte.

## Résultats locaux

- Chrome et WebKit valident le cockpit et le dossier à 1440, 1024, 768, 430, 390, 375 et 320 px dans les deux thèmes. Aucun débordement horizontal de la page ni erreur JavaScript n’a été signalé.
- Les scénarios couvrent la recherche, les filtres, la sélection multiple, l’extension des résultats, l’envoi déclaré, ses échecs de copie et de persistance, les réponses et alternatives, l’expiration, la relance désactivée et le délai, la confirmation concurrente à un conflit, les onglets, le rechargement et la préparation.
- Chrome valide le rechargement hors ligne de la PWA et l’ouverture du suivi. L’installation et la vérification sur un appareil physique restent à faire.
- Les suites de non-régression AMO et Formateur passent sous WebKit, y compris le dépôt de note et la lecture AMO.

## Parcours Formateur V3

Le Formateur ouvre ses calls depuis un écran dédié. Les filtres « Tous », « À répondre » et « Confirmés » orientent vers les dossiers, dont l’adresse reste utilisable après actualisation. Un dossier affiche les créneaux et la note de cadrage dans deux onglets. Le créneau confirmé apparaît en premier et l’historique reste accessible. Le formulaire d’alternative se déplie à la demande. Les mêmes règles de visibilité et de stockage local s’appliquent.
