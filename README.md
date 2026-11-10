# Certif-IA Hub — HTML original enrichi V1.7

Cette version **conserve le design du HTML original fourni** : sidebar anthracite, topbar blanche, cartes et tableaux, violet #7134f5, typographies DM Sans et Manrope, logo Certif-IA original.

## Comment ouvrir

**Sans installation :** double-cliquez sur `Certif-IA-Hub-V1.7-autonome.html` pour ouvrir la démonstration dans Chrome, Safari ou Firefox. Le logo et les scripts sont inclus dans ce fichier unique.

**Pour tester la PWA :** dans le dossier extrait, exécutez `python3 -m http.server 8080`, puis ouvrez `http://localhost:8080/`. Sur navigateur compatible, l'installation de la PWA peut être proposée. **Aucun npm n'est nécessaire.** Le cache PWA est réservé aux ressources statiques de cette démo et non à des informations clients réelles.

## Fonctionnalités

**AMO : 8 modules** — Vue d'ensemble, Planning global, Formations, Formateurs, Clients, Staffing assisté, Livrables & bilans, Monthly AMO.

**Formateur : 5 modules** — Mon espace, Mes missions, Mon agenda, Mes livrables, Mon profil.

- KPI d'accueil cliquables ; annuaire Formateurs Cards / Tableau avec fiche à onglets (expérience, connaissances, forces, axes d'amélioration, missions et scores d'évaluation de démonstration) ; emplacements pour les champs Notion et LinkedIn, sans import de données réelles.
- Annuaire Clients avec références HubSpot à connecter et formateurs intervenus selon les affectations de démonstration.
- Planning AMO mois/semaine/jour, superposition de plusieurs agendas, créneaux déclarés, changement de date, horaires, lieu, modalité et formateur, avec revalidation des affectations.
- Matching staffing avec score **fictif et explicable** ; grille 40 % expertise, 30 % disponibilité, 20 % zone, 10 % expérience, **non validée métier**. Certaines indisponibilités ou interdictions bloquent l'éligibilité même lorsque le score semble élevé. Propositions et affectations distinctes.
- Livrables par client/mission avec % de dépôt, versions, vérification et correction ; premier rappel PWA et deuxième rappel WhatsApp simulé après **48 heures**. Bouton « Tester le passage de 48 h » permettant de vérifier l'automatisation sans attendre ; **aucun message n'est envoyé**.
- Monthly AMO mensuel : volume sessions/affectations, clients et formateurs, livrables, NPS illustratifs, pool Numéro 10 et cartons, export CSV de démonstration ; score de fiabilité avec pondération **proposée** 35 % ponctualité documentaire, 30 % NPS, 20 % retours, 15 % incidents. Aucune décision RH automatisée.
- Portail Formateur : KPI cliquables, dossier de mission avec informations client autorisées et itinéraire, déclaration disponibilité avec date/horaires/zone, livrables par dossier avec progression.
- Sauvegarde des opérations fictives en `localStorage` et réinitialisation ; aucune synchronisation externe.

## IMPORTANT — Démonstration exclusivement

Cette application **n'utilise aucune donnée réelle** des profils Notion, HubSpot ou LinkedIn. Les profils, adresses, clients, tarifs, scores de compatibilité et évaluations affichés sont **fictifs** ; les liens LinkedIn n'ont pas été inventés. Les actions et alertes enregistrent une simulation locale, sans envoyer WhatsApp, push système, e-mail ni données vers des serveurs. Aucun fichier sélectionné n'est transféré : le nom est seulement conservé en mémoire locale. Aucune authentification, aucune autorisation serveur ni intégration API ne sont implémentées : ne pas utiliser avec des données personnelles réelles.

L'application lit des créneaux déclarés fictifs et ne lit pas Google Agenda. Une case vide n'est jamais une preuve de disponibilité. Les relances WhatsApp automatiques dans un vrai produit nécessiteront consentement/base légale, fournisseur agréé, vérification de l'échéance et des permissions, journalisation et limitation des envois.

**Tests effectués :** validation syntaxique JS (`node --check`), test navigateur des huit modules AMO et cinq modules Formateur, score d'explication, clients, agenda multi-formateurs, édition session, relance simulée à 48h, export Monthly AMO, dossier livrables ; tests dimensions 1440×900, 1024×768, 768×1024, 390×844. Les captures navigateur sont créées dans un contexte contrôlé sans connexion aux polices externes ni chargement direct des images ; des tests visuels sur matériel réel et d'installation PWA sont à faire.

## Sources de référence

- Visuel : HTML original fourni et https://certif-ia-hub.vercel.app/
- Spécifications métier : Notion → AMO Hub → Référentiel de conception Certif-IA Hub (V1 à V1.7)

## Statut

Version HTML interactive **V1.7 démo**, non mise en production. Aucune modification GitHub/Vercel réalisée.


## Correctif V1.7.1 — Staffing assisté

- Corrige la balise HTML manquante dans la liste des six candidats qui provoquait des cards imbriquées, une colonne très étroite et le panneau « Mission sélectionnée » placé sous les candidats.
- Rétablit le layout à deux colonnes sur laptop et l’empilement normal sur tablette/mobile.
- Vérifié : trois onglets, score explicatif, choix de formateur, blocage des doublons, préparation/autorisation/envoi simulé, réponse Formateur et confirmation d’affectation.
- Aucune modification de la connexion aux outils réels ni de la logique métier des autres modules.

## Publication GitHub — V1.7.1

Le fichier `index.html` à la racine est la **version HTML autonome V1.7.1 corrigée**, incluant directement scripts, styles et logo. Elle remplace l'ancienne maquette. Le dépôt contient aussi le manifeste, les icônes et le service worker pour la démo PWA ; aucun `npm install` n'est nécessaire.

Données et actions **100 % fictives** : aucune authentification, connexion HubSpot/Notion/Drive/Google Agenda ou WhatsApp effective. La sauvegarde navigateur n'est pas une base de données sécurisée.
