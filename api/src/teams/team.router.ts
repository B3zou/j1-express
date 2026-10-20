import {Router} from "express";
import {validateQuery} from "../middlewares/validate.js";
import {type TeamQuery, TeamQuerySchema} from "./team.schema.js";
import {teamRepository} from "./team.repository.js";

export const teamRouter = Router();

teamRouter.get('/', validateQuery(TeamQuerySchema), async (_req, res) => {
  const { country } = _req.query as TeamQuery;
  res.json(await teamRepository.findByCountry(country));
});
