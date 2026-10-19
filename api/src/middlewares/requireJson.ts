// Refuse en 415 une écriture (POST, PUT, PATCH) qui n'annonce pas du JSON.
// Équivalent du 415 de #[MapRequestPayload] au J0.
import type { Request, Response, NextFunction } from 'express';

export function requireJson(req: Request, res: Response, next: NextFunction) {
  const writes = ['POST', 'PUT', 'PATCH'];
  // req.is() renvoie null quand la requête n'a PAS de corps (un POST « action », sans données) :
  // rien à vérifier dans ce cas. false = il y a un corps, mais pas du JSON.
  if (writes.includes(req.method) && req.is('application/json') === false) {
    res.status(415).json({ title: 'Unsupported Media Type', status: 415 });
    return; // on répond : on n'appelle pas next()
  }
  next(); // sinon : on passe la main
}
