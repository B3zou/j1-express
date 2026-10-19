# ─────────────────────────────────────────────────────────────────────────────
# J1 · TP bonus — Un en-tête sur toutes les réponses, et une route de statistiques
# Attendu : X-Response-Time: <durée>ms sur chaque réponse (posé par votre requestLogger)
#           GET /api/teams/{id}/stats → { played, won, lost, averageRating }
# Lancer : make test f=07
# ─────────────────────────────────────────────────────────────────────────────

GET {{host}}/api/games
HTTP 200
[Asserts]
header "X-Response-Time" matches "^\\d+(\\.\\d+)?ms$"

GET {{host}}/api/nothing-here
HTTP 404
[Asserts]
header "X-Response-Time" exists

POST {{host}}/api/teams
Content-Type: application/json
{ "name": "Stats Alpha", "tag": "STA", "country": "FR" }
HTTP 201
[Captures]
sta_id: jsonpath "$.id"

POST {{host}}/api/teams
Content-Type: application/json
{ "name": "Stats Beta", "tag": "STB", "country": "DE" }
HTTP 201
[Captures]
stb_id: jsonpath "$.id"

POST {{host}}/api/teams
Content-Type: application/json
{ "name": "Stats Idle", "tag": "STI", "country": "IT" }
HTTP 201
[Captures]
sti_id: jsonpath "$.id"

POST {{host}}/api/players
Content-Type: application/json
{ "nickname": "St_One", "country": "FR", "rating": 2000, "teamId": {{sta_id}} }
HTTP 201

POST {{host}}/api/players
Content-Type: application/json
{ "nickname": "St_Two", "country": "FR", "rating": 1800, "teamId": {{sta_id}} }
HTTP 201

POST {{host}}/api/players
Content-Type: application/json
{ "nickname": "St_Three", "country": "DE", "rating": 1500, "teamId": {{stb_id}} }
HTTP 201

# Avant tout match
GET {{host}}/api/teams/{{sta_id}}/stats
HTTP 200
[Asserts]
jsonpath "$.played" == 0
jsonpath "$.won" == 0
jsonpath "$.lost" == 0
jsonpath "$.averageRating" == 1900

# Deux matchs joués avec la graine 42 (1900 contre 1500 : avec cette graine, Alpha perd 1-3)
POST {{host}}/api/matches
Content-Type: application/json
{ "teamAId": {{sta_id}}, "teamBId": {{stb_id}} }
HTTP 201
[Captures]
m1_url: header "Location"

POST {{host}}/api/matches
Content-Type: application/json
{ "teamAId": {{stb_id}}, "teamBId": {{sta_id}} }
HTTP 201
[Captures]
m2_url: header "Location"

POST {{host}}/api/matches
Content-Type: application/json
{ "teamAId": {{sta_id}}, "teamBId": {{stb_id}} }
HTTP 201

POST {{host}}{{m1_url}}/play?seed=42
HTTP 200
[Asserts]
jsonpath "$.winner" == "STB"

POST {{host}}{{m2_url}}/play?seed=42
HTTP 200
[Captures]
winner2: jsonpath "$.winner"

# Seuls les matchs joués comptent
GET {{host}}/api/teams/{{sta_id}}/stats
HTTP 200
[Asserts]
jsonpath "$.played" == 2
jsonpath "$.won" isInteger
jsonpath "$.lost" isInteger
jsonpath "$.won" <= 1
jsonpath "$.lost" >= 1

GET {{host}}/api/teams/{{stb_id}}/stats
HTTP 200
[Asserts]
jsonpath "$.played" == 2
jsonpath "$.won" >= 1
jsonpath "$.averageRating" == 1500

# Une équipe sans joueur et sans match : des zéros, averageRating null
GET {{host}}/api/teams/{{sti_id}}/stats
HTTP 200
[Asserts]
jsonpath "$.played" == 0
jsonpath "$.averageRating" == null

GET {{host}}/api/teams/999999/stats
HTTP 404
