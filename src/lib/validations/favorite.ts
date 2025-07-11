import { z } from 'zod';

// Schémas de validation pour les favoris
export const createFavoriteSchema = z.object({
  articleId: z.string().min(1, 'L\'article est requis'),
});

export const favoriteFilterSchema = z.object({
  userId: z.string().optional(),
  categoryId: z.string().optional(),
  sortBy: z.enum(['date_desc', 'date_asc', 'price_asc', 'price_desc']).default('date_desc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(12),
});

// Types TypeScript dérivés des schémas
export type CreateFavoriteInput = z.infer<typeof createFavoriteSchema>;
export type FavoriteFilterInput = z.infer<typeof favoriteFilterSchema>;

// Constantes pour les énumérations
export const FAVORITE_SORT_OPTIONS = ['date_desc', 'date_asc', 'price_asc', 'price_desc'] as const;

// Labels pour l'affichage
export const FAVORITE_SORT_LABELS = {
  date_desc: 'Plus récent',
  date_asc: 'Plus ancien',
  price_asc: 'Prix croissant',
  price_desc: 'Prix décroissant',
} as const;