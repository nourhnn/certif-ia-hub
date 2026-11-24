# Certif-IA Hub V2 · Phase 2

Branche `feat/v2-formateurs-staffing` à partir de `20745b1`, le dernier `main` après fusion de la phase 1.

## Audit initial

| Parcours | État sur main et problème relevé |
| --- | --- |
| Accueil et profil Formateur | Cinq onglets mobiles en place. L’accueil calculait le NPS à partir d’une source aussi utilisée par l’AMO. L’accès aux disponibilités passait par l’agenda. Les gains utilisaient déjà le TJM multiplié par le nombre de missions déclaré. |
| Agenda et disponibilités | Agenda V2, semaine habituelle dans `db.agendaV2` et créneaux datés dans `db.availability`. Les exceptions récentes étaient limitées à cinq. Capacité mensuelle, saisie par mois et blocage multi-jour manquaient. La connexion Google était une simulation locale. |
| Staffing assisté | La vérification de disponibilité et ses libellés étaient répartis entre le Hub et Agenda V2. La grille 40/30/20/10 attribuait des points même pour des signaux incomplets. Client connu, mobilité et historique existaient déjà. Le workflow WhatsApp était manuel. |
| Calls de cadrage | Les deux pages permettaient déjà de proposer et de confirmer un créneau. Le contrôle des conflits était distinct du staffing. Un call confirmé ne bloquait donc pas systématiquement le staffing. Réponses et notes locales, sans transport entre comptes. |
| Livrables et permissions | Les dossiers Formateur filtrent par mission et propriétaire. Les accès au détail mission, à l’audit et à certaines fenêtres internes nécessitaient des gardes supplémentaires. L’ensemble du modèle de démonstration et le sélecteur de rôle sont chargés dans le navigateur. |

## Règles mises en œuvre

- Une préférence hebdomadaire, un jour privilégié ou un volume souhaité n’excluent jamais un créneau libre vérifié. Un créneau daté déclaré complet peut alimenter le staffing manuel, avec le statut de vérification explicite. Une préférence hebdomadaire seule ne vérifie pas la disponibilité pour une mission donnée.
- Une mission, un événement occupé, un call confirmé ou une indisponibilité déclarée bloque le créneau concerné. Le statut occupé a priorité sur les préférences et les fenêtres libres.
- Les fenêtres synchronisées utilisent le contrat `externalAvailability = {status, validUntil, windows:[{date,start,end,status}]}`. La valeur fraîche `connected` et une fenêtre `free` couvrant le créneau permettent d’afficher « Libre vérifié ». Une fenêtre `busy` l’emporte. Un instantané expiré signale une synchronisation indisponible. La démo ne renseigne jamais cet instantané depuis son bouton de simulation.
- Les plages mensuelles et les journées d’indisponibilité utilisent les mêmes créneaux datés que l’agenda. Une période multi-jour devient une suite de jours occupés et reste modifiable jour par jour. Les préférences et le volume nul ou absent restent distincts.
- Le score garde ses pondérations 40/30/20/10. Une donnée nécessaire inconnue laisse le total non calculé. Expertise, expérience similaire, client connu, mobilité, capacité, TJM et satisfaction communicable accompagnent la décision. Le brouillon WhatsApp se copie et la confirmation reste manuelle.
- Les calls présentent six créneaux au départ, les réponses par créneau et les alternatives du formateur. Une proposition doit être acceptée et encore libre pour être confirmée. Le compte rendu, les pièces AUDIT et CADRAGE, le contact client et l’emplacement réservé à la synthèse sont conservés.
- Le NPS du portail agrège uniquement des évaluations communicables des missions réalisées. Les gains restent une estimation indicative liée au TJM et au nombre de missions du référentiel, avec une valeur absente si un facteur manque.

## Contrôles et dépendances backend

| Vue | Protection locale | Dépendance avant lancement externe |
| --- | --- | --- |
| Accueil, profil et indicateurs | Profil sélectionné et filtrage des évaluations communicables | Session authentifiée, projection serveur des données personnelles et communicables |
| Missions, documents et audit | Affectation ou proposition acceptée, filtre de propriétaire et garde sur le détail | Autorisation serveur par mission et pièce, téléchargement protégé, conservation des fichiers |
| Agenda et staffing | Vérification locale du chevauchement, libellés AMO sans titre privé | OAuth et serveur de synchronisation, fenêtres libre/occupé signées ou fournies par serveur, fraîcheur, gestion du consentement et révocation |
| Calls de cadrage | Séparations AMO/Formateur, propriétaire du call et des réponses, nouveau contrôle au moment de confirmer | Autorisations sur chaque transition, stockage partagé, écritures concurrentes avec versionnement, synchronisation des réponses et historique |
| Référentiel et CRM | Routes AMO masquées au Formateur, données de démo chargées dans le navigateur | Projections autorisées côté serveur, journal d’accès et droits par rôle. Le navigateur de démo ne constitue pas une frontière de sécurité. |

Les réponses et préférences restent dans le navigateur. Le dépôt documentaire de démonstration utilise IndexedDB. Le contrat agenda sépare les preuves de disponibilité des préférences et le magasin de cadrage expose la lecture et l’écriture des dossiers. Les transitions du prototype sont synchrones.

## Vérifications

Lancer `node server-local.mjs`, installer Playwright puis exécuter les suites depuis la racine.

```sh
npm install --no-save --package-lock=false playwright
npx playwright install chromium webkit
node qa/formateurs-staffing.mjs
QA_ENGINE=webkit node qa/formateurs-staffing.mjs
node qa/operations.mjs
QA_ENGINE=webkit node qa/amo-phase1.mjs
```

`HUB_URL` permet de changer l’URL locale. `CHROME_PATH` sélectionne un Chrome installé et `QA_OUTPUT` choisit le dossier des captures. Le scénario connecté injecte un instantané synthétique dans Playwright. Les captures sont produites à 1440 et 390 px dans les deux thèmes.

La configuration Vercel suspend le déploiement automatique de cette branche de revue. Le lancement externe reste conditionné à la persistance et aux autorisations serveur.

## Résultats

- Phase 2 réussie sous Chrome et WebKit. Les scénarios parcourent les préférences et le volume, le blocage et la suppression d’une indisponibilité, le staffing à plusieurs candidats, le client connu, la confidentialité et la séquence refus, acceptation, alternative et confirmation.
- Six parcours Formateur vérifiés dans les deux moteurs à 1440, 1024, 768, 390, 375 et 320 px, en clair et en sombre. Les contrôles n’ont relevé aucun débordement horizontal de page ni erreur JavaScript.
- Les 13 contrôles de la suite opérations passent sous Chrome. La suite AMO de la phase 1 passe sous WebKit.
- L’installation native et les mises à jour sur appareils physiques restent à vérifier.

### Disponibilités par semaine

Le planning affiche les dates du lundi au dimanche. Le mode « Chaque semaine » modifie la base récurrente. Le mode « Cette semaine seulement » enregistre une exception par date, que le formateur peut retirer pour retrouver son horaire habituel. Le test WebKit vérifie que le lundi activé se répète, qu’une exception reste limitée à la semaine choisie et que la restauration fonctionne. Les six largeurs passent dans les deux thèmes.
