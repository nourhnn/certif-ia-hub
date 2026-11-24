# Certif-IA Hub V2 · Reporting, performance et upsell

Branche `feat/v2-reporting-performance`, issue de `main` au commit `0c93365` après fusion des phases 1 et 2.

## Audit initial

| Parcours | Constat et intervention |
| --- | --- |
| Monthly AMO | La vue et le calcul de rapport filtraient séparément le mois. La vue pouvait inclure une session annulée que l’export excluait. La vue, les chiffres et les exports consomment maintenant le même rapport. |
| Satisfaction | Le calcul NPS global acceptait des notes finies hors de l’échelle alors que le calcul par client les filtrait. L’extension KPI recompilait les évaluations après rendu. Les mesures AMO partagent désormais les mêmes règles de validité. |
| Exports | Le graphique était construit sur les jours du mois. Les deux exports détaillés utilisaient déjà des lignes communes, avec UTF‑8 et BOM pour le CSV. Le graphique suit maintenant la plage sélectionnée et les deux détails reprennent les mêmes lignes enrichies. |
| Cartons | La règle des deux jaunes actifs, les motifs et les retraits étaient déjà présents. Les deux justificatifs restent visibles dans l’historique. Les accès à l’écriture sont vérifiés sur la fiche interne du formateur ciblé. |
| Bonus | La fiche et le reporting comptaient tous les bonus, sans action de retrait. Le retrait motivé reste dans l’historique et exclut le bonus des totaux actifs. |
| Retours Formateurs | La dictée au clavier, le brouillon et la génération de synthèse utilisaient la même fenêtre. La question commerciale est ajoutée à cette fenêtre. La restitution conserve les quatre rubriques d’origine et leur ajoute les faits commerciaux dans un bloc associé, repris à la copie. |

## Règles de calcul

- **Période.** Le rapport s’ouvre au mois. La semaine va du lundi au dimanche. Le trimestre est calendaire. Les bornes sont inclusives et affichées. Les décisions internes sont rattachées au jour de leur création, heure de Paris, puis filtrées selon leur état actif actuel.
- **Activité.** Les sessions sont dédupliquées par identifiant et les annulations exclues. Les formations sont comptées par identifiant de dossier parmi ces sessions. Les clients distincts sont les clients identifiables par leur fiche. Les sessions sans client identifié restent dans une ligne « Client non renseigné ». Les formateurs mobilisés proviennent des affectations confirmées ou réalisées sur la période.
- **Évaluations.** Une évaluation par identifiant d’affectation. Les moyennes ne retiennent que les nombres finis appartenant à leur échelle. Les champs de note historiques et actuels sont reconnus. Chaque moyenne a son propre dénominateur. Aucune réponse valide donne « Non renseigné ». Une valeur mesurée de zéro reste valide.
- **NPS.** La moyenne reste sur 10. Sur les réponses individuelles, une note de 9 à 10 compte comme promoteur et une note de 0 à 6 comme détracteur. Les autres valeurs valides restent dans le dénominateur. Les comptes par client agrègent les réponses, sans classer le client d’après sa moyenne.
- **Upsell.** Une remontée « Oui » ou « À confirmer » exige un besoin factuel avant envoi. Un brouillon et une réponse « Non » ne comptent pas. Une remontée transmise est comptée une fois par session, jour et formateur. La date correspond à la journée du retour. Plusieurs retours peuvent documenter le même besoin, dont la consolidation reste une décision de qualification AMO.
- **Qualité.** Les bonus actifs restent à cinq points chacun, avec le plafond de fiabilité existant. Le retrait ne supprime pas le motif. Les calculs et pondérations existants de fiabilité restent en place. Aucun modèle de classement supplémentaire n’est introduit.

## Reproduire les tests

Lancer `node server-local.mjs`, puis exécuter avec Playwright installé.

```sh
node qa/reporting-performance.mjs
QA_ENGINE=webkit node qa/reporting-performance.mjs
node qa/operations.mjs
QA_ENGINE=webkit node qa/amo-phase1.mjs
QA_ENGINE=webkit node qa/formateurs-staffing.mjs
```

Les variables `HUB_URL`, `QA_OUTPUT` et `CHROME_PATH` permettent de choisir le serveur, la sortie des captures et un Chrome installé. Les données spécifiques aux tests sont créées dans le navigateur de test. La synthèse à quatre points est vérifiée avec une réponse interceptée de l’endpoint existant. Aucun service IA réel n’est sollicité.

## Limites

Les rôles, le suivi commercial et les décisions internes utilisent le stockage local de la démonstration. « Transmise aux Sales » est un état saisi par l’AMO. Le partage entre comptes et les permissions effectives requièrent un backend. Les données de reporting suivent le référentiel et les évaluations disponibles. Les règles de classement métier supplémentaires restent à valider.

La branche a son déploiement Git automatique désactivé dans Vercel.

## Résultats locaux

- Chrome et WebKit passent les scénarios de la phase 3. Semaine avec et sans données, mois et trimestre, client multi-formations, formation multi-sessions, notes absentes et hors échelle, classification des réponses, trois exports, conversion et retrait motivé des cartons, ajout et retrait des bonus, réponses d’upsell, synthèse à quatre points et fiche sans client identifiable.
- Les écrans de reporting passent à 1440, 1024, 768, 390, 375 et 320 px, en clair et en sombre, sans débordement horizontal de la page ni erreur JavaScript rapportée.
- Les 13 scénarios Chrome de la suite opérations et les suites des phases 1 et 2 sous WebKit passent.
