// req.params.id est une chaîne ("3", mais aussi "abc") : on en fait un entier positif, sinon 404.
// Au J0, c'était Requirement::DIGITS sur la route.
import { HttpError } from '../errors.js';

export function parseId(value: unknown, what: string): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) throw new HttpError(404, `${what} not found`);
  return id;
}
