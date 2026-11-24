# Certif-IA Hub V2 · Optimisation AMO, phase 1

Branche `feat/v2-amo-optimisation`, issue de `main` au commit `a3ceb90`.

## Audit initial

| Écran ou couche | Constat sur `main` |
| --- | --- |
| Accueil AMO | Le KPI Livrables et la liste de priorités reprenaient les mêmes documents sans distinguer urgence, échéance et validation. Le module Jalons, la navigation vers le planning et le centre de notifications existaient déjà. |
| Dossiers documentaires | La matrice contrôlait présence et format, en retenant le premier document par catégorie. Un dossier pouvait paraître complet avec un dépôt encore en vérification ou une obligation enregistrée supplémentaire. |
| Cadrage | Le module maintenait déjà un enregistrement par formation, avec les états à planifier, proposé, confirmé, réalisé et annulé. |
| Formateurs | Les cartes et la fiche étaient rendues dans `hub.js`, puis remaniées dans le DOM par `kpi-v2.js`. Le NPS et la satisfaction avaient déjà des sources distinctes. La formule des gains apparaissait uniquement dans des vues AMO sur ce commit. |
| Données et PWA | Application HTML/CSS/JS avec des données de démonstration dans le navigateur, des fichiers en IndexedDB et un service worker. Les modules Agenda, Cadrage et KPI étaient chargés par la page et absents du précache. |

## Fonctionnement retenu

- Les alertes de l’accueil sont calculées à chaque rendu. Les dépôts manquants sont regroupés par dossier et les besoins de staffing par session. Le seuil de sept jours concerne les sessions imminentes et les livrables avant formation. Une échéance explicite plus proche peut aussi déclencher l’alerte documentaire. Le cadrage prend le niveau prioritaire à J-14. Les affectations à revalider et les conflits d’agenda sont calculés depuis leurs états actifs.
- Le filtre « À traiter » inclut les dossiers dont la seule action est une validation. « En attente » isole ces dossiers. La clôture exige la conformité et l’état « Validé » pour chaque obligation applicable, bilan compris. Les cinq catégories utilisées par la matrice restent la base du dossier. Tout autre livrable enregistré est pris en compte. Une obligation marquée « Non applicable » est exclue et les dossiers annulés restent accessibles via « Toutes ».
- L’annuaire présente la satisfaction sur cinq uniquement à partir des évaluations communicables renseignées. Le NPS conserve sa source d’origine. Les observations, cartons et autres indicateurs internes restent dans la fiche AMO. Le nombre de missions affiché dans l’annuaire reste celui du référentiel de démonstration. Les gains estimés utilisent la formule existante dans le profil Formateur.
- L’AMO enregistre les champs destinés au client et peut consulter les sources professionnelles disponibles, reprendre la bio du profil, activer la photo et choisir les références à publier. L’aperçu, la copie, le brouillon et l’export texte utilisent les champs de présentation enregistrés. La photo est visible dans l’aperçu et le fichier TXT contient le texte. L’utilisateur doit vérifier les informations publiables avant de partager.

## Fichiers

- `amo-phase1.js`, `hub.js`, `operations.js`, `scoping-calls.js`, `proposition.js` et `kpi-v2.js` contiennent les règles, écrans et raccordements.
- `extra.css`, `proposition.css`, `index.html` et `sw.js` contiennent les styles ciblés, le chargement et le précache.
- `qa/amo-phase1.mjs` contient les scénarios et les captures reproductibles. `qa/operations.mjs` utilise le bouton « Mon profil » de l’en-tête mobile.

## Exécution

Lancer `node server-local.mjs`, puis exécuter les commandes suivantes dans un autre terminal.

```sh
npm install --no-save --package-lock=false playwright
npx playwright install chromium webkit
node qa/amo-phase1.mjs
QA_ENGINE=webkit node qa/amo-phase1.mjs
node qa/operations.mjs
```

`HUB_URL` désigne l’URL locale et `CHROME_PATH` permet de choisir Chrome installé. Les captures après modification sont enregistrées dans `/tmp/certif-amo-phase1-qa` par défaut. Les scénarios fonctionnels injectent leurs cas métier dans le navigateur de test.

## Résultats locaux

| Contrôle | Résultat |
| --- | --- |
| Scénarios de la phase 1 sous Chrome et WebKit | Réussis. Alertes et liens directs, cas J-7, bilan manquant, statut en attente, clôture, format et refus, NPS absent, biographie incomplète, enregistrement, export et gains côté Formateur. Copie testée sous Chrome. |
| Navigation et rendu | 1440, 1024, 768, 390, 375 et 320 px dans les deux moteurs. Cinq écrans vérifiés en clair et en sombre, sans débordement horizontal de la page ni erreur JavaScript. |
| Suite existante | 13 contrôles réussis sous Chrome et 1 contrôle de rendu sous WebKit. |
| Service worker | Précache activé sous Chrome. Ouverture de l’accueil et navigation vers l’annuaire après simulation de la coupure réseau. |
| Captures | Avant et après à 1440 et 390 px. |

## Validation avant lancement

Les présentations sont locales au navigateur de démonstration. La synchronisation et les autorisations d’accès serveur restent à confirmer avant usage de données réelles. La publication de chaque photo ou référence reste une décision éditoriale. L’installation sur appareil et le comportement de la mise à jour PWA en conditions réelles restent à vérifier.
