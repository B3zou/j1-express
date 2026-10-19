// La documentation : openapi.yaml (écrit à la main) servi en JSON sur /api/openapi.json,
// et Swagger UI sur /api/docs pour l'explorer et l'essayer. Vous n'avez pas à modifier ce fichier.
import { readFileSync } from 'node:fs';
import { Router, type NextFunction, type Request, type Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';

const file = new URL('../openapi.yaml', import.meta.url);

/** Relit openapi.yaml à chaque appel : modifiez-le, rechargez la page, c'est à jour. */
function loadSpec(): Record<string, unknown> {
  const spec = YAML.parse(readFileSync(file, 'utf8')) as Record<string, unknown>;
  if (typeof spec?.openapi !== 'string') throw new Error('openapi.yaml : le document doit commencer par « openapi: 3.1.0 »');
  // Le port réel, si l'API n'est pas sur 8000 (fichier .env)
  if (process.env.API_PORT && process.env.API_PORT !== '8000') {
    spec.servers = [{ url: `http://localhost:${process.env.API_PORT}` }];
  }
  return spec;
}

loadSpec(); // au démarrage : un YAML cassé arrête l'API tout de suite, avec le message d'erreur

export const docsRouter = Router();

docsRouter.get('/openapi.json', (_req, res) => {
  res.json(loadSpec());
});

docsRouter.use(
  '/docs',
  swaggerUi.serve,
  (req: Request & { swaggerDoc?: unknown }, _res: Response, next: NextFunction) => {
    req.swaggerDoc = loadSpec(); // swagger-ui-express lit le document sur req.swaggerDoc
    next();
  },
  swaggerUi.setup(undefined, { customSiteTitle: 'GG League API' }),
);
