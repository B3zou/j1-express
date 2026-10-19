// Création de l'application Express et ORDRE des middlewares.
import express from 'express';
import { healthRouter } from './health.router.js';

const app = express();

app.use(express.json());
app.use('/api/health', healthRouter);

export default app;
