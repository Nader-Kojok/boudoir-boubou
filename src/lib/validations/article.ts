import { z } from 'zod';

// Schémas de validation pour les articles
export const articleSchema = z.object({
  title: z
    .string()
    .min(1, 'Le titre est requis')
    .min(3, 'Le titre doit contenir au moins 3 caractères')
    .max(100, 'Le titre ne peut pas dépasser 100 caractères'),
  description: z
    .string()
    .min(1, 'La description est requise')
    .min(10, 'La description doit contenir au moins 10 caractères')
    .max(1000, 'La description ne peut pas dépasser 1000 caractères'),
  price: z
    .number({
      required_error: 'Le prix est requis',
      invalid_type_error: 'Le prix doit être un nombre',
    })
    .min(1, 'Le prix doit être supérieur à 0')
    .max(10000, 'Le prix ne peut pas dépasser 10 000F'),
  categoryId: z
    .string()
    .min(1, 'La catégorie est requise'),
  size: z
    .string()
    .optional(),
  condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR'], {
    required_error: 'L\'état de l\'article est requis',
  }),
  images: z
    .array(z.string().url('URL d\'image invalide'))
    .min(1, 'Au moins une image est requise')
    .max(8, 'Maximum 8 images autorisées'),
  isAvailable: z.boolean().default(true),
});

export const articleUpdateSchema = articleSchema.partial();

export const articleFilterSchema = z.object({
  category: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR']).optional(),
  size: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'date_desc', 'date_asc']).default('date_desc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(12),
});

// Schéma pour la recherche
export const searchSchema = z.object({
  query: z
    .string()
    .min(1, 'Veuillez saisir un terme de recherche')
    .max(100, 'La recherche ne peut pas dépasser 100 caractères'),
  filters: articleFilterSchema.optional(),
});

// Schéma pour les catégories
export const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom de la catégorie est requis')
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  slug: z
    .string()
    .min(1, 'Le slug est requis')
    .regex(/^[a-z0-9-]+$/, 'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets'),
  description: z
    .string()
    .max(200, 'La description ne peut pas dépasser 200 caractères')
    .optional(),
});

// Types TypeScript dérivés des schémas
export type ArticleInput = z.infer<typeof articleSchema>;
export type ArticleUpdateInput = z.infer<typeof articleUpdateSchema>;
export type ArticleFilterInput = z.infer<typeof articleFilterSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;

// Constantes pour les énumérations
export const ARTICLE_CONDITIONS = ['EXCELLENT', 'GOOD', 'FAIR'] as const;
export const SORT_OPTIONS = ['price_asc', 'price_desc', 'date_desc', 'date_asc'] as const;

// Labels pour l'affichage
export const CONDITION_LABELS = {
  EXCELLENT: 'Excellent état',
  GOOD: 'Bon état',
  FAIR: 'État correct',
} as const;

export const SORT_LABELS = {
  price_asc: 'Prix croissant',
  price_desc: 'Prix décroissant',
  date_desc: 'Plus récent',
  date_asc: 'Plus ancien',
} as const;