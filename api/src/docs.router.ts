// La documentation : openapi.yaml (écrit à la main) servi en JSON sur /api/openapi.json,
// et Swagger UI sur /api/docs pour l'explorer et l'essayer. Vous n'avez pas à modifier ce fichier.
import { readFileSync } from 'node:fs';
import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';

const spec = YAML.parse(readFileSync(new URL('../openapi.yaml', import.meta.url), 'utf8')) as Record<string, unknown>;
if (typeof spec?.openapi !== 'string') throw new Error('openapi.yaml : le document doit commencer par « openapi: 3.1.0 »');

// Le port réel, si l'API n'est pas sur 8000 (fichier .env)
if (process.env.API_PORT && process.env.API_PORT !== '8000') {
  spec.servers = [{ url: `http://localhost:${process.env.API_PORT}` }];
}

export const docsRouter = Router();

docsRouter.get('/openapi.json', (_req, res) => {
  res.json(spec);
});
docsRouter.use('/docs', swaggerUi.serve, swaggerUi.setup(spec, { customSiteTitle: 'GG League API' }));
