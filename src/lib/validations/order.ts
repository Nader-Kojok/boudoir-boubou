import { z } from 'zod';

// Schémas de validation pour les commandes
export const orderItemSchema = z.object({
  articleId: z.string().min(1, 'L\'article est requis'),
  quantity: z.number().min(1, 'La quantité doit être au moins 1'),
  price: z.number().min(0.01, 'Le prix doit être supérieur à 0'),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Au moins un article est requis'),
  shippingAddress: z.object({
    street: z.string().min(1, 'L\'adresse est requise'),
    city: z.string().min(1, 'La ville est requise'),
    postalCode: z.string().min(1, 'Le code postal est requis'),
    country: z.string().min(1, 'Le pays est requis'),
  }),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'], {
    required_error: 'Le statut est requis',
  }),
});

// Types TypeScript dérivés des schémas
export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

// Constantes pour les énumérations
export const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

// Labels pour l'affichage
export const ORDER_STATUS_LABELS = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  SHIPPED: 'Expédiée',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée',
} as const;