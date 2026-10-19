# J1 · TD — `Team` puis `Player`, ensemble

> Antisèches : [TypeScript](cheatsheets/typescript.md) · [Express](cheatsheets/express.md) · [pg et zod](cheatsheets/pg-zod.md) · [HTTP et REST](cheatsheets/http-rest.md)

Ce matin, on construit **deux ressources** sur le modèle de l'exemple fourni, `Game` : d'abord `Team`, en lecture
puis en écriture, puis `Player`, qui a une relation avec `Team`, une pagination et des filtres. À chaque étape,
un fichier de test passe au vert.

**Chaque étape commence par un temps de réflexion, seul** (encadré « À vous ») : lisez le test, regardez
l'exemple, essayez. Ensuite, on construit la solution ensemble au vidéoprojecteur (« Ensemble »). Si vous êtes en
avance, continuez ; si vous êtes bloqué, attendez le moment « Ensemble », c'est prévu pour ça.

Trois réflexes, les mêmes qu'hier :

- **`make test f=0N` après chaque étape.** Le fichier de test est le contrat : il dit ce qu'on attend, et où ça
  coince (`make test ERRORS=long` pour voir la réponse complète).
- **`make logs`** dès que quelque chose ne répond pas comme prévu : le serveur se recharge à chaque sauvegarde
  et affiche ses erreurs là. Une erreur de **types** se voit avec `make typecheck`.
- **Swagger UI** (http://localhost:8000/api/docs) et `curl` pour essayer ce que vous venez d'écrire.

**Un commit par étape**, poussé sur votre fork.

---

## Étape 0 — Découvrir le squelette → `00-games.hurl`

### Ce qu'on cherche à comprendre

Comment une requête traverse l'application, et où vit chaque responsabilité (HTTP, SQL, validation).

### 0.1 Vérifier que tout tourne

```bash
make up && make test f=00
```

`00-games` est vert. Ouvrez http://localhost:8000/api/docs : Swagger UI montre `Game`, et seulement `Game`.
Essayez `GET /api/games` depuis la page (« Try it out »), puis en ligne de commande :

```bash
API=http://localhost:8000
curl -s $API/api/games | jq '.[0]'
curl -s $API/api/games/999 | jq
curl -s -X POST -H 'Content-Type: application/json' -d '{"name":"","genre":"fps","teamSize":42}' $API/api/games | jq
```

Un tableau, un 404 en JSON, un 422 avec la liste des problèmes : exactement la forme que les tests attendent.

### 0.2 Lire `app.ts`

Ouvrez `api/src/app.ts`. Six `app.use()`, dans un ordre précis, commentés. C'est **le** fichier du cours :
l'ordre des `app.use()` est l'ordre d'exécution.

### À vous

1. Dans `app.ts`, que se passe-t-il pour `GET /api/nothing` ? Quels middlewares s'exécutent, lequel répond ?
2. Et pour `POST /api/games` avec un corps `{"name": ""}` ? Qui répond 422 : le routeur ou `errorHandler` ?
3. Ouvrez `api/src/games/` : trois fichiers. Lequel contient du SQL ? Lequel connaît Express ? Lequel ni l'un ni
   l'autre ?

### Ensemble

On suit une requête à la main, de `express.json()` jusqu'à `errorHandler`, avec `make logs` ouvert à côté.
Puis on lit les trois fichiers de `games/` :

- `game.schema.ts` : les **types** (`Game`, `Genre`) et les **schémas zod** (`GameSchema`, `GamePatchSchema`,
  `GameQuerySchema`). C'est l'entité d'hier et ses `#[Assert\…]`, en un seul fichier.
- `game.repository.ts` : `games = new GameRepository()`, qui hérite de `BaseRepository<Game>` (lisez
  `src/repository.ts` : `findAll`, `findOne`, `insert`, `update`, `delete`, et le SQL que ça génère). Une méthode
  écrite à la main, `findByGenre`, avec son SQL.
- `game.router.ts` : cinq routes, qui lisent `req`, appellent le repository, et choisissent le code de statut.
  Pas de SQL ici. Repérez `validate(GameSchema)`, `parseId(...)`, `throw new HttpError(404, ...)`,
  `res.status(201).location(...)`.

Tableau à retenir : le routeur parle HTTP, le repository parle SQL, le schéma décrit les données.

---

## Étape 1 — Un premier middleware : `requestLogger`

### Ce qu'on cherche à comprendre

Ce qu'est un middleware, comment il s'insère dans la chaîne, et pourquoi sa position compte.

### La cible

Une ligne dans `make logs` pour **chaque** requête, y compris celles qui finissent en 404 ou en erreur :

```text
GET /api/games → 200 (3.1 ms)
GET /api/nope → 404 (0.4 ms)
POST /api/games → 422 (8.7 ms)
```

Pas de test Hurl pour cette étape : la preuve, c'est `make logs`.

### À vous

Lisez `src/middlewares/requireJson.ts` (le code vu en cours, avec un détail de plus : un POST sans corps
est accepté) et l'antisèche Express, section
« Écrire un middleware ».

1. Un middleware reçoit `(req, res, next)`. Quelles informations de `req` voulez-vous afficher ?
2. Au moment où votre middleware s'exécute, la réponse n'est pas encore envoyée : comment connaître le code de
   statut et la durée ? (Indice : `res` émet un événement quand la réponse est partie.)
3. Où le placer dans `app.ts` pour voir **toutes** les requêtes, même celles qui finissent dans `notFound` ?

Créez `src/middlewares/requestLogger.ts`, exportez une fonction `requestLogger`, montez-la, et regardez
`make logs`.

### Ensemble

On écrit `requestLogger` : on note l'heure de départ (`performance.now()`), on écoute `res.on('finish', ...)`,
et surtout on appelle `next()`, sinon la requête ne répond jamais. On le monte **en premier** dans `app.ts`,
et on le déplace après `notFound` pour constater ce qui disparaît des logs. Commit : `TD 1 : requestLogger`.

---

## Étape 2 — `Team` en lecture → `01-teams.hurl` (première moitié)

### Ce qu'on cherche à comprendre

Comment une ressource est faite de trois fichiers, et comment le repository renvoie `null` pour que le routeur
décide du 404.

### La cible

`GET /api/teams` (un tableau trié par nom, filtre `?country=FR`, `?country=fr` accepté) et
`GET /api/teams/:id` (un élément, ou 404 en JSON). Lisez `tests/01-teams.hurl` jusqu'au premier `PATCH`.

### À vous

1. Quelles colonnes la table `team` a-t-elle (`db/schema.sql`) ? Quel `interface Team` en découle ?
2. Avec `BaseRepository<Team>`, que vous reste-t-il à écrire pour `GET /api/teams/:id` ? Et pour le filtre
   `?country=` ? (Indice : regardez `findByGenre`.)
3. `?country=fr` doit trouver les équipes `FR` : où mettre en majuscules, dans le routeur, le repository ou le
   schéma zod du paramètre ?

Créez le dossier `src/teams/` avec `team.schema.ts`, `team.repository.ts`, `team.router.ts`, et montez le routeur
dans `app.ts`.

### Ensemble

- `team.schema.ts` : `interface Team { id, name, tag, country }` et `TeamQuerySchema` (zod : deux lettres,
  `.transform(s => s.toUpperCase())`, `.optional()`).
- `team.repository.ts` : `class TeamRepository extends BaseRepository<Team>` (table `team`, colonnes
  `['id', 'name', 'tag', 'country']`, tri `name`), une méthode `findByCountry(country?: string)` avec deux
  requêtes SQL (avec ou sans `WHERE country = $1`), et `export const teams = new TeamRepository()`.
- `team.router.ts` : `GET /` avec `validateQuery(TeamQuerySchema)` et `res.locals.query`, `GET /:id` avec
  `parseId` et `HttpError(404, 'Team not found')`.
- `app.ts` : `app.use('/api/teams', teamRouter)` après `games`.

```bash
curl -s "$API/api/teams?country=fr" | jq
curl -s $API/api/teams/999 | jq
```

Commit : `TD 2 : Team en lecture`.

---

## Étape 3 — `Team` en écriture → `01-teams.hurl` (vert)

### Ce qu'on cherche à comprendre

Le chemin complet d'une écriture : 415 → 400 → 422 → 409, et pourquoi chaque code est produit par une brique
différente.

### La cible

`POST /api/teams` (201 + `Location`), `PATCH /api/teams/:id`, `DELETE /api/teams/:id` (204), et les règles :
`name` 2 à 50 caractères, `tag` `/^[A-Z0-9]{2,5}$/`, `country` deux lettres majuscules, `name` et `tag` uniques
(409). Lisez la suite de `tests/01-teams.hurl`.

### À vous

1. Écrivez `TeamSchema` (zod) d'après les règles. Comment obtenir le schéma du PATCH sans le réécrire ?
2. Le test attend `409` quand le nom existe déjà. Qui détecte le doublon : zod, le repository, PostgreSQL ?
   Où est-il transformé en 409 ? (Indice : `translatePgError` dans `src/db.ts`.)
3. Que renvoie `teams.update(id, {})` ? Et `teams.delete(999999)` ? Quel code de statut dans chaque cas ?

### Ensemble

- `team.schema.ts` : `TeamSchema`, `TeamInput = z.infer<typeof TeamSchema>`, `TeamPatchSchema =
  TeamSchema.partial()`.
- `team.router.ts` : `POST /` avec `validate(TeamSchema)` → `teams.insert(req.body as TeamInput)` →
  `res.status(201).location(...).json(team)` ; `PATCH /:id` avec `validate(TeamPatchSchema)` → `teams.update`
  → 404 si `null` ; `DELETE /:id` → `teams.delete` → 204 ou 404.
- On provoque chaque erreur avec `curl` et on regarde **qui** répond : `requireJson` (415), `express.json()` +
  `errorHandler` (400), `validate` (422), PostgreSQL + `translatePgError` (409).

```bash
make test f=01
```

Commit : `TD 3 : Team en écriture`.

---

## Étape 4 — `Player` et la relation avec `Team` → `02-players.hurl`

### Ce qu'on cherche à comprendre

Comment une relation s'exprime sans ORM : une clé étrangère en entrée, un objet imbriqué en sortie, et deux
représentations d'une même ressource.

### La cible

Lisez `tests/02-players.hurl`. En entrée, `teamId` (ou `null`) ; en sortie, `team: { id, name, tag }` (ou
`null`), jamais `birthDate`. Côté équipe, `GET /api/teams/:id` renvoie `players: [{ id, nickname, role,
rating }]` triés par pseudo. `rating` vaut 1000 par défaut, `teamId` inconnu → 422 sur `teamId`.

### À vous

1. Deux formes pour un joueur : la **ligne** de la table (`team_id`, `birth_date`…) et la **vue** renvoyée par
   l'API (`team: {…}`, pas de `birthDate`). Écrivez les deux `interface`.
2. Quelle requête SQL renvoie la vue d'un joueur avec son équipe imbriquée ? (Indice : `LEFT JOIN` et
   `json_build_object`, antisèche pg et zod.)
3. `rating` absent du POST doit valoir 1000 : où est ce défaut déjà écrit ? Que doit faire `insert` d'une clé
   absente ? (Lisez `insert` dans `src/repository.ts`.)
4. `teamId: 999999` → 422 sur `teamId` : qui le détecte ?

### Ensemble

- `player.schema.ts` : `interface Player` (la ligne), `interface PlayerView` (la vue), `interface
  PlayerSummary` (pour l'équipe), `PlayerSchema` (`nickname` 2-30, `country`, `role` `.nullish()`, `rating`
  `.optional()`, `birthDate` `z.iso.date()` + `.refine(…)` pour les 13 ans, `teamId` `.nullish()`),
  `PlayerPatchSchema`.
- `player.repository.ts` : `class PlayerRepository extends BaseRepository<Player>` avec les colonnes aliasées
  (`'birth_date AS "birthDate"'`, `'team_id AS "teamId"'`), une constante `VIEW` (le `SELECT … LEFT JOIN team`
  avec `json_build_object`), `findView(id)`, `findViews()`, `findByTeam(teamId)`.
- `player.router.ts` : comme `Team`, mais après `insert` / `update` on **relit la vue** (`findView`) pour
  répondre avec l'équipe imbriquée.
- `team.repository.ts` : `findOneWithPlayers(id)` = `findOne` + `players.findByTeam(id)` ; `team.router.ts` :
  `GET /:id` l'utilise ; `team.schema.ts` : `interface TeamWithPlayers extends Team { players: PlayerSummary[] }`.
- On vérifie `ON DELETE SET NULL` : supprimer une équipe rend ses joueurs agents libres.

```bash
make test f=02
```

Commit : `TD 4 : Player et la relation avec Team`.

---

## Étape 5 — Recherche et pagination → `03-players-search.hurl`

### Ce qu'on cherche à comprendre

Comment construire une requête SQL **à partir des filtres présents**, sans jamais coller une valeur dans le
texte SQL, et comment paginer.

### La cible

`GET /api/players?page=&limit=&country=&teamId=&q=` : 10 par page (`limit` 1 à 50), tri par pseudo, en-tête
`X-Total-Count`, 400 si un paramètre est invalide, `q` cherche dans le pseudo sans tenir compte de la casse.
Lisez `tests/03-players-search.hurl` à partir du premier `GET`.

### À vous

1. Les paramètres de requête sont des **chaînes** (`"2"`, pas `2`). Comment zod les convertit-il ? Quelles
   valeurs par défaut pour `page` et `limit` ?
2. Avec trois filtres optionnels, comment écrire **une** requête SQL paramétrée ? (Indice : un tableau de
   conditions et un tableau de valeurs, `$1`, `$2`… numérotés au fur et à mesure.)
3. Pour `ILIKE`, où vont les `%` : dans le SQL ou dans la valeur ?
4. Le total, avant `LIMIT` : une deuxième requête, ou `count(*) OVER ()` dans la première ?

### Ensemble

- `player.schema.ts` : `PlayerSearchSchema` avec `z.coerce.number().int().min(1).default(1)`, etc.
- `player.repository.ts` : `search({ page, limit, country, teamId, q })` qui construit `conditions` et
  `values`, calcule `OFFSET`, et renvoie `{ items, total }`.
- `player.router.ts` : `GET /` avec `validateQuery(PlayerSearchSchema)`, `res.set('X-Total-Count',
  String(total)).json(items)`.

```bash
make test f=03
make test        # 00 à 03 verts
```

Commit : `TD 5 : recherche et pagination`.

---

## Pour finir : hier et aujourd'hui

Remplissez la colonne de droite, de mémoire d'abord, puis en regardant votre code :

| Hier, Symfony | Aujourd'hui, Express |
|---|---|
| contrôleur et `#[Route]` | |
| entité et repository Doctrine | |
| `#[Assert\…]` | |
| `#[MapRequestPayload]` (415, 400, 422) | |
| résolveur d'entité (404) | |
| `kernel.exception` | |
| autowiring | |
| documentation générée | |

Et trois lignes dans `docs/mon-td.md` : ce que Symfony faisait pour vous et que vous avez dû écrire ; ce qui
vous a paru plus simple ; ce qui vous a paru plus risqué.
