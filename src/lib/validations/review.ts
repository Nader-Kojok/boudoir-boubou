import { z } from 'zod';

// Schémas de validation pour les avis
export const createReviewSchema = z.object({
  articleId: z.string().min(1, 'L\'article est requis'),
  rating: z
    .number({
      required_error: 'La note est requise',
      invalid_type_error: 'La note doit être un nombre',
    })
    .min(1, 'La note doit être entre 1 et 5')
    .max(5, 'La note doit être entre 1 et 5'),
  comment: z
    .string()
    .min(1, 'Le commentaire est requis')
    .min(10, 'Le commentaire doit contenir au moins 10 caractères')
    .max(500, 'Le commentaire ne peut pas dépasser 500 caractères'),
});

export const updateReviewSchema = z.object({
  rating: z
    .number()
    .min(1, 'La note doit être entre 1 et 5')
    .max(5, 'La note doit être entre 1 et 5')
    .optional(),
  comment: z
    .string()
    .min(10, 'Le commentaire doit contenir au moins 10 caractères')
    .max(500, 'Le commentaire ne peut pas dépasser 500 caractères')
    .optional(),
});

export const reviewFilterSchema = z.object({
  articleId: z.string().optional(),
  userId: z.string().optional(),
  minRating: z.number().min(1).max(5).optional(),
  maxRating: z.number().min(1).max(5).optional(),
  sortBy: z.enum(['rating_asc', 'rating_desc', 'date_desc', 'date_asc']).default('date_desc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10),
});

// Types TypeScript dérivés des schémas
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type ReviewFilterInput = z.infer<typeof reviewFilterSchema>;

// Constantes pour les énumérations
export const REVIEW_SORT_OPTIONS = ['rating_asc', 'rating_desc', 'date_desc', 'date_asc'] as const;

// Labels pour l'affichage
export const REVIEW_SORT_LABELS = {
  rating_asc: 'Note croissante',
  rating_desc: 'Note décroissante',
  date_desc: 'Plus récent',
  date_asc: 'Plus ancien',
} as const;