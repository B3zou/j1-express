# GG League · J1 — La même API, en TypeScript

Hier, vous avez écrit une API REST à la main avec Symfony. Aujourd'hui, vous écrivez **la même API** avec
**Node.js, TypeScript et Express** : un routeur par ressource, des requêtes SQL avec `pg`, une validation
avec `zod`, des middlewares que vous écrivez vous-mêmes, et une documentation OpenAPI rédigée à la main.
Même ligue, même base de données : seul le langage change, et tout ce que Symfony faisait « tout seul »
devient visible.

Ce dépôt contient le **squelette** : Docker, TypeScript configuré, un micro-ORM (`BaseRepository<T>`), les
middlewares de base, la ressource `Game` en exemple, le simulateur de match, et les tests Hurl de la journée.
`Team`, `Player` et `Match` sont à vous.

```
  navigateur (Swagger UI) ──▶ ┌──────────────────────────────────────┐
  curl, Postman            ──▶ │  api · Node 22 + Express 5 (TypeScript) │ ──▶ PostgreSQL 17
  make test (Hurl)         ──▶ │  http://localhost:8000/api            │
                               └──────────────────────────────────────┘
```

Les supports de la journée sont dans [`docs/`](docs/README.md) : le TD du matin (`Team` puis `Player`,
ensemble), le TP de l'après-midi (`Match`, les routes métier, OpenAPI, seul), cinq antisèches.

## Installation (à faire avant le cours si possible)

### Prérequis

| | Linux | macOS | Windows |
|---|---|---|---|
| Docker | Docker Engine + plugin Compose v2 | Docker Desktop | Docker Desktop **avec WSL 2** |
| Git, make | paquets `git`, `make` | `xcode-select --install` | dans WSL : `sudo apt install git make` |

Sous Windows, travaillez **dans WSL** (terminal Ubuntu) et clonez le dépôt dans le système de fichiers Linux
(`~/…`, pas `/mnt/c/…`) : c'est dix fois plus rapide. Avant de cloner : `git config --global core.autocrlf input`.

**Rien d'autre à installer** : Node.js tourne dans Docker. Votre éditeur (VS Code…) verra quand même les types
des bibliothèques, parce que `node_modules` est installé dans le dossier `api/` partagé avec le conteneur.

Prévoyez 4 Go de mémoire pour Docker et 2 Go d'espace disque.

### Récupérer le projet

1. Sur GitHub, faites un **fork privé** de ce dépôt et donnez-y accès à l'enseignant.
2. Clonez **votre fork**, puis déclarez le dépôt de l'enseignant comme `upstream` (il servira si un énoncé ou un
   test doit être corrigé en cours de journée) :

```bash
git clone <url de VOTRE fork> j1-express
cd j1-express
git remote add upstream <url du dépôt de l'enseignant>
```

Si le projet d'hier tourne encore sur votre poste, arrêtez-le d'abord (`make down` dans son dossier) : les deux
projets utilisent les mêmes ports.

### Vérifier et installer

```bash
make doctor     # vérifie Docker, les ports, git, les fins de ligne
make install    # construit l'image, installe les dépendances, crée la base et charge les données de démo
```

Quand c'est terminé :

| | |
|---|---|
| Votre API | http://localhost:8000/api/games |
| Swagger UI (la documentation, pour essayer l'API) | http://localhost:8000/api/docs |
| PostgreSQL (DBeaver, DataGrip…) | `localhost:5433`, base `app`, utilisateur `app`, mot de passe `app` |

```bash
make test       # le fichier 00-games doit être VERT ; les autres seront le travail de la journée
```

Si un port est déjà pris, copiez `.env.example` en `.env` et changez `API_PORT` ou `DB_PORT`.

## Au quotidien

```bash
make help            # toutes les commandes
make up / make down  # démarrer / arrêter (les données sont conservées)
make logs            # les requêtes, les erreurs et les rechargements, en direct
make typecheck       # vérifier les types (tsc --noEmit), sans lancer le serveur
make test            # tous les tests · make test f=01 · make test ERRORS=long
make db-reset        # recréer les tables (db/schema.sql) et les données de démo (db/seed.sql)
make db-shell        # une console psql
make npm c="…"       # npm dans le conteneur (installer un paquet, par exemple)
```

Le serveur se **recharge tout seul** à chaque fichier sauvegardé dans `api/src/` (`tsx watch`). Une erreur de
compilation ou une exception au démarrage s'affiche dans `make logs` : c'est le premier endroit où regarder.

## Le code

```
api/
  openapi.yaml           la spécification OpenAPI, écrite à la main (Swagger UI la lit)
  db/schema.sql          les tables (les mêmes qu'hier)
  db/seed.sql            les données de démo (5 jeux, 8 équipes, 26 joueurs)
  src/
    app.ts               création de l'app et ORDRE des middlewares
    server.ts            app.listen()
    db.ts                Pool pg, query<T>(), traduction des erreurs PostgreSQL
    repository.ts        BaseRepository<T> : findAll, findOne, insert, update, delete
    errors.ts            HttpError(status, message)
    middlewares/         requireJson, validate, notFound, errorHandler, parseId
    games/               l'exemple : game.schema.ts, game.repository.ts, game.router.ts
    matches/simulator.ts le simulateur de match (fourni)
tests/                   les tests Hurl : la spécification de la journée
docs/                    TD, TP, antisèches
```
