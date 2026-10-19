// Accès à PostgreSQL : un pool de connexions et une fonction query<T>() pour tout le projet.
import { Pool } from 'pg';

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * Exécute une requête SQL paramétrée ($1, $2…) et renvoie les lignes.
 * Le type T décrit la forme d'une ligne : c'est une promesse faite au compilateur, pas une
 * vérification (si la requête renvoie team_size, la propriété teamSize sera undefined :
 * d'où les alias SQL `team_size AS "teamSize"`).
 */
export async function query<T>(text: string, values: unknown[] = []): Promise<T[]> {
  const result = await pool.query<T & Record<string, unknown>>(text, values);
  return result.rows;
}
