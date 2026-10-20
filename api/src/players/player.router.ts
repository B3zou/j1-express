import {Router} from "express";
import {validate} from "../middlewares/validate.js";
import {players} from "./player.repository.js";
import {parseId} from "../middlewares/params.js";
import {HttpError} from "../errors.js";
import {type PlayerInput, PlayerPatchSchema, PlayerSchema} from "./player.schema.js";

export const playerRouter = Router();

playerRouter.get('/', async (_req, res) => {
  const players1 = await players.findAll();
  res.json(players1);
});

// GET /api/players/:id
playerRouter.get('/:id', async (req, res) => {
  const player = await players.findView(parseId(req.params.id, 'Player'));
  if (!player) throw new HttpError(404, 'Player not found');
  res.json(player);
});

// POST /api/players : on insère la ligne, puis on relit la vue (avec l'équipe imbriquée)
playerRouter.post('/', validate(PlayerSchema), async (req, res) => {
  const { id } = await players.insert(req.body as PlayerInput);
  res.status(201).location(`/api/players/${id}`).json(await players.findView(id));
});

// PATCH /api/players/:id
playerRouter.patch('/:id', validate(PlayerPatchSchema), async (req, res) => {
  const id = parseId(req.params.id, 'Player');
  const updated = await players.update(id, req.body as Partial<PlayerInput>);
  if (!updated) throw new HttpError(404, 'Player not found');
  res.json(await players.findView(id));
});

// DELETE /api/players/:id
playerRouter.delete('/:id', async (req, res) => {
  const deleted = await players.delete(parseId(req.params.id, 'Player'));
  if (!deleted) throw new HttpError(404, 'Player not found');
  res.sendStatus(204);
});
