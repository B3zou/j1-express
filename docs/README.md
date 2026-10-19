# J1 — la journée en un coup d'œil

Hier, Symfony faisait beaucoup de choses à votre place : le routage, la désérialisation, la validation, les
erreurs en JSON, la documentation. Aujourd'hui, avec Express, **vous** branchez chaque brique, et vous voyez
exactement ce qu'elle fait. Le matin, on le fait **ensemble** sur `Team` puis `Player` : un premier middleware,
un routeur, un repository, un schéma de validation, la relation entre deux ressources, la pagination.
L'après-midi, vous refaites le chemin **seul** sur une ressource neuve, `Match`, vous ajoutez deux routes
métier, et vous documentez le tout dans `openapi.yaml`.

| Moment | Quoi | Support |
|---|---|---|
| Matin | Cours, puis **TD** : `Team` et `Player`, avec l'enseignant | [td.md](td.md) |
| Après-midi | **TP** : `Match`, `/versus` et `/players/top`, OpenAPI ; bonus | [tp.md](tp.md) |
| Fin de journée | `make test`, trois lignes de recul, commit et push | fin du TP |

## Comment travailler

**Chaque étape du TD commence par 5 à 10 minutes de réflexion, seul** : lisez le test, répondez aux questions de
l'encadré « À vous », essayez. Ensuite, on construit la solution ensemble au vidéoprojecteur. Si vous êtes en
avance, passez à l'étape suivante ; si vous êtes bloqué, c'est normal, c'est pour ça qu'on la fait ensemble.

Les étapes du TP sont marquées 🟢, 🔵 ou 🔴. Avancez à votre rythme : l'objectif est de comprendre, pas de tout
finir.

- 🟢 indispensable ;
- 🔵 attendu, avec des indices ;
- 🔴 pour aller plus loin, en autonomie.

## Les tests sont la spécification

Vous n'écrivez pas de tests aujourd'hui : ils sont fournis dans [`tests/`](../tests), et `make test` les exécute
sur une base de test séparée (`app_test`, recréée vide avant chaque lancement). Chaque fichier décrit précisément
ce que l'API doit faire : les URL, les codes de statut, la forme du JSON, les en-têtes. Avant chaque étape, ouvrez
le fichier correspondant et lisez-le comme un cahier des charges.

| Fichier | Ce qu'il vérifie | Étape |
|---|---|---|
| `00-games.hurl` | l'exemple fourni ; il est vert dès le début | TD, étape 0 |
| `01-teams.hurl` | `Team` : lecture, écriture, validation, 409, filtre `?country=` | TD, étapes 2 et 3 |
| `02-players.hurl` | `Player` : la relation avec `Team`, l'équipe imbriquée, `birthDate` jamais renvoyé | TD, étape 4 |
| `03-players-search.hurl` | pagination, `X-Total-Count`, filtres, recherche `?q=` | TD, étape 5 |
| `04-matches.hurl` | `Match` : table, création, règles, `POST …/play` | TP, partie 1 |
| `05-versus-top.hurl` | `GET /api/teams/{id}/versus/{opponentId}` et `GET /api/players/top` | TP, partie 2 |
| `06-openapi.hurl` | `openapi.yaml` décrit toutes vos routes et vos schémas | TP, partie 3 |
| `bonus-07-stats.hurl` | `X-Response-Time` et `/stats` (`make test f=07`) | TP, bonus |

`make test f=02` ne lance qu'un fichier ; `make test ERRORS=long` affiche les réponses complètes des requêtes en
échec. Sur une erreur 500, la cause est dans `make logs`.

## Le format des erreurs

Toutes les erreurs ont la même forme, c'est le `errorHandler` qui s'en charge :

```json
{ "title": "Validation Failed", "status": 422, "errors": [{ "path": "teamSize", "message": "…" }] }
```

| Code | Quand |
|---|---|
| 400 | JSON illisible, ou paramètre de requête invalide (`?page=abc`) |
| 404 | ressource absente, ou identifiant qui n'est pas un nombre |
| 409 | une valeur unique est déjà prise (contrainte UNIQUE de PostgreSQL) |
| 415 | une écriture sans `Content-Type: application/json` |
| 422 | le corps est lisible mais ne respecte pas les règles (zod, ou une règle métier) |
| 500 | un bug : message générique pour le client, le détail dans `make logs` |

## Antisèches

- [TypeScript](cheatsheets/typescript.md) : JavaScript moderne, les types, lire une erreur de compilation. **Commencez par là si TypeScript est nouveau pour vous.**
- [Express](cheatsheets/express.md) : app, Router, req/res, la chaîne de middlewares, les erreurs, Express 4 et 5.
- [pg et zod](cheatsheets/pg-zod.md) : requêtes paramétrées, `BaseRepository<T>`, jointures, pagination, schémas zod.
- [OpenAPI](cheatsheets/openapi.md) : la structure d'un `openapi.yaml`, chemins, schémas, réponses réutilisables.
- [HTTP et REST](cheatsheets/http-rest.md) : méthodes, codes, en-têtes, curl, lire un test Hurl.

## Et demain ?

Demain, on protège cette API : des comptes (admin et fan), des mots de passe hachés, des jetons JWT, des
middlewares `authenticate` et `requireRole`, et une donnée chiffrée en AES-256. Tout ce que vous écrivez
aujourd'hui (routeurs, repositories, schémas, `openapi.yaml`) resservira tel quel.
