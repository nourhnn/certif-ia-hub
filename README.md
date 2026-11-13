# Certif-IA Hub V1.9 — évolution du suivi documentaire et des formateurs

## Démarrer
- Démo HTML autonome : double-cliquez sur `Certif-IA-Hub-V1.9-autonome.html` (aucun npm).
- PWA : lancer `python3 -m http.server 8000` dans ce dossier et ouvrir `http://localhost:8000` pour vérifier dans un navigateur. Installer uniquement sur origine HTTPS ou localhost compatible.

## Changements
- Livrables & bilans AMO : tableau de conformité Audit / Cadrage / Programme PDF / Support / Bilan, compteurs, recherche, tri, liens d'ouverture de dossier, fiches mobiles, dépôt et rappels fictifs conservés.
- Formateurs AMO : fiabilité en pourcentage **illustratif (démo)** colorée 85–100 vert, 60–84 orange, 0–59 rouge ; missions, TJM TTC et gains **estimés** (TJM actuel × nombre de missions fictives).
- Fiche Formateur : grille de pondération proposée 40% satisfaction, 30% ponctualité, 20% incidents vérifiés et 10% retours ; notes et cartons internes avec justificatif et historique en démonstration ; taux de réponse des propositions reçues.
- Présentation : liens e-mail, téléphone, LinkedIn lorsque ces informations existent ; ne pas inventer les données absentes.
- Formateur : état de réception de l'audit dans Mes missions ; retour client communicable dans la fiche de mission ; documents regroupés par client avec progression, états de dépôt et validation distincts.
- Interface desktop initiale conservée hors modules concernés ; mobile V1.8 avec navigation inférieure à cinq onglets et bottom sheets maintenu.

## Très important
Tout est **fictif et local** : aucune donnée réelle Notion/HubSpot/Drive/Google Agenda, aucun message PWA/WhatsApp réellement envoyé, aucun fichier stocké après sélection (seul le nom est enregistré), pas d'authentification ni de sécurité de production. Les cartons internes ne sont pas rendus dans les vues Formateur, mais une vraie séparation des données côté serveur sera impérative avant usage réel.

La source HTML de référence « Préparation formation - Certif-ia.html » contient une logique de connecteurs spécifique aux artefacts Claude. Cette logique n'a pas été recopiée car elle ne fonctionnerait pas dans Vercel sans backend autorisé.

## Vérifications
- Syntaxe JS : `node --check hub.js`.
- Vérification des sorties HTML de la page documentaire, des Cards formateurs, fiche interne, missions et livrables via tests Node `vm`.
- Browser QA non exécutée : le navigateur Chromium de l'environnement bloque les URLs locales. Prévoir tests manuels 1440px, iPad portrait/paysage et iPhone réel avant publication.

Cette archive ne modifie pas le dépôt GitHub et n'a pas été publiée sur Vercel.