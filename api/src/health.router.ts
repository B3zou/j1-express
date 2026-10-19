// GET /api/health : l'API répond et la base de données aussi (utilisé par Docker pour attendre l'API).
import { Router } from 'express';
import { query } from './db.js';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  await query('SELECT 1');
  res.json({ status: 'ok', database: 'ok' });
});
