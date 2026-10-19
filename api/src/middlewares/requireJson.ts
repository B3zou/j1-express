// Refuse en 415 une écriture (POST, PUT, PATCH) qui n'annonce pas du JSON.
// Équivalent du 415 de #[MapRequestPayload] au J0.
import type { Request, Response, NextFunction } from 'express';

export function requireJson(req: Request, res: Response, next: NextFunction) {
  const writes = ['POST', 'PUT', 'PATCH'];
  if (writes.includes(req.method) && !req.is('application/json')) {
    res.status(415).json({ title: 'Unsupported Media Type', status: 415 });
    return; // on répond : on n'appelle pas next()
  }
  next(); // sinon : on passe la main
}
