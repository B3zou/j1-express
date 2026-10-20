import {z} from "zod";

/** Une ligne de la table player (ce que le repository lit et écrit). */
export interface Player {
  id: number;
  nickname: string;
  country: string;
  role: string | null;
  rating: number;
  birthDate: string | null; // AAAA-MM-JJ en écriture ; donnée personnelle, jamais renvoyée par l'API
  teamId: number | null;
}

/** Ce que l'API renvoie : l'équipe imbriquée (id, name, tag), pas de date de naissance. */
export interface PlayerView {
  id: number;
  nickname: string;
  country: string;
  role: string | null;
  rating: number;
  team: { id: number; name: string; tag: string } | null;
}

/** Un joueur vu depuis son équipe (GET /api/teams/:id). */
export interface PlayerSummary {
  id: number;
  nickname: string;
  role: string | null;
  rating: number;
}

export const PlayerSchema = z.object({
  nickname: z.string().trim().min(2).max(30),
  country: z.string().regex(/^[A-Z]{2}$/, 'must be a 2-letter uppercase country code'),
  role: z.string().trim().max(30).nullish(),
  rating: z.number().int().min(0).max(3000).optional(), // défaut : 1000 (schema.sql)
  birthDate: z.iso
    .date()
    .refine((date) => {
      const limit = new Date();
      limit.setFullYear(limit.getFullYear() - 13);
      return date <= limit.toISOString().slice(0, 10); // AAAA-MM-JJ : l'ordre des chaînes est celui des dates
    }, 'must be at least 13 years old')
    .nullish(),
  teamId: z.number().int().positive().nullish(), // null = agent libre
});
export type PlayerInput = z.infer<typeof PlayerSchema>;
export const PlayerPatchSchema = PlayerSchema.partial();
