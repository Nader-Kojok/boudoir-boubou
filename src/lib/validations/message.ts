import { z } from 'zod';

// Schémas de validation pour les messages
export const createMessageSchema = z.object({
  receiverId: z.string().min(1, 'Le destinataire est requis'),
  content: z
    .string()
    .min(1, 'Le message est requis')
    .min(5, 'Le message doit contenir au moins 5 caractères')
    .max(1000, 'Le message ne peut pas dépasser 1000 caractères'),
  articleId: z.string().optional(), // Pour les messages liés à un article
});

export const updateMessageSchema = z.object({
  content: z
    .string()
    .min(5, 'Le message doit contenir au moins 5 caractères')
    .max(1000, 'Le message ne peut pas dépasser 1000 caractères')
    .optional(),
  isRead: z.boolean().optional(),
});

export const messageFilterSchema = z.object({
  senderId: z.string().optional(),
  receiverId: z.string().optional(),
  articleId: z.string().optional(),
  isRead: z.boolean().optional(),
  sortBy: z.enum(['date_desc', 'date_asc']).default('date_desc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
});

// Schéma pour marquer les messages comme lus
export const markAsReadSchema = z.object({
  messageIds: z.array(z.string()).min(1, 'Au moins un message doit être sélectionné'),
});

// Types TypeScript dérivés des schémas
export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;
export type MessageFilterInput = z.infer<typeof messageFilterSchema>;
export type MarkAsReadInput = z.infer<typeof markAsReadSchema>;

// Constantes pour les énumérations
export const MESSAGE_SORT_OPTIONS = ['date_desc', 'date_asc'] as const;

// Labels pour l'affichage
export const MESSAGE_SORT_LABELS = {
  date_desc: 'Plus récent',
  date_asc: 'Plus ancien',
} as const;