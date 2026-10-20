import {BaseRepository} from "../repository.js";
import type {Player, PlayerSummary, PlayerView} from "./player.schema.js";
import {query} from "../db.js";

const VIEW_COLUMNS = `p.id, p.nickname, p.country, p.role, p.rating,
         CASE WHEN t.id IS NULL THEN NULL
              ELSE json_build_object('id', t.id, 'name', t.name, 'tag', t.tag) END AS team`;
const VIEW_FROM = `FROM player p LEFT JOIN team t ON t.id = p.team_id`;
const VIEW = `SELECT ${VIEW_COLUMNS} ${VIEW_FROM}`;

class PlayerRepository extends BaseRepository<Player> {
  constructor() {
    super('player', ['id', 'nickname', 'country', 'role', 'rating', 'birth_date AS "birthDate"', 'team_id AS "teamId"'], 'nickname');
  }

  /** La vue d'un joueur, ou null. */
  async findView(id: number): Promise<PlayerView | null> {
    const [row] = await query<PlayerView>(`${VIEW} WHERE p.id = $1`, [id]);
    return row ?? null;
  }

  findByTeam(teamId: number): Promise<PlayerSummary[]> {
    return query<PlayerSummary>(
      `SELECT id, nickname, role, rating FROM player WHERE team_id = $1 ORDER BY nickname`,
      [teamId],
    );
  }
}

export const players = new PlayerRepository();
