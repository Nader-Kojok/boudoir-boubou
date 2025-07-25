import { z } from 'zod';

// Schéma de validation pour le profil utilisateur
export const profileSchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom est requis')
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  bio: z
    .string()
    .max(500, 'La biographie ne peut pas dépasser 500 caractères')
    .optional(),
  location: z
    .string()
    .max(100, 'La localisation ne peut pas dépasser 100 caractères')
    .optional(),
  whatsappNumber: z
    .string()
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      'Numéro WhatsApp invalide (format international recommandé)'
    )
    .optional(),
  avatar: z
    .string()
    .url('URL d\'avatar invalide')
    .optional(),
  phone: z
    .string()
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      'Format de téléphone invalide (format international recommandé)'
    ),
  role: z.enum(['seller', 'buyer']),
});

export const profileUpdateSchema = profileSchema.partial().omit({ role: true });

// Schéma pour la mise à jour du téléphone
export const phoneUpdateSchema = z.object({
  phone: z
    .string()
    .min(1, 'Le téléphone est requis')
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      'Format de téléphone invalide (format international recommandé)'
    ),
  currentPassword: z
    .string()
    .min(1, 'Le mot de passe actuel est requis'),
});

// Schéma pour la mise à jour du mot de passe
export const passwordUpdateSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Le mot de passe actuel est requis'),
  newPassword: z
    .string()
    .min(6, 'Le nouveau mot de passe doit contenir au moins 6 caractères')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
    ),
  confirmPassword: z
    .string()
    .min(1, 'Confirmez votre nouveau mot de passe'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

// Schéma pour les préférences de notification
export const notificationPreferencesSchema = z.object({
  smsNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  marketingSms: z.boolean().default(false),

  articleSoldNotifications: z.boolean().default(true),
  priceDropNotifications: z.boolean().default(true),
});

// Schéma pour les paramètres de confidentialité
export const privacySettingsSchema = z.object({
  profileVisibility: z.enum(['public', 'private']).default('public'),
  showPhone: z.boolean().default(false),
  showWhatsapp: z.boolean().default(true),
  showLocation: z.boolean().default(true),

});

// Schéma pour la suppression de compte
export const deleteAccountSchema = z.object({
  password: z
    .string()
    .min(1, 'Le mot de passe est requis pour supprimer le compte'),
  confirmation: z
    .string()
    .refine(
      val => val === 'SUPPRIMER',
      'Veuillez taper "SUPPRIMER" pour confirmer'
    ),
  reason: z
    .string()
    .max(500, 'La raison ne peut pas dépasser 500 caractères')
    .optional(),
});

// Types TypeScript dérivés des schémas
export type ProfileInput = z.infer<typeof profileSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type PhoneUpdateInput = z.infer<typeof phoneUpdateSchema>;
export type PasswordUpdateInput = z.infer<typeof passwordUpdateSchema>;
export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>;
export type PrivacySettingsInput = z.infer<typeof privacySettingsSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;

// Constantes pour les énumérations
export const USER_ROLES = ['seller', 'buyer'] as const;
export const PROFILE_VISIBILITY = ['public', 'private'] as const;

// Labels pour l'affichage
export const ROLE_LABELS = {
  seller: 'Vendeur/Vendeuse',
  buyer: 'Acheteur/Acheteuse',
} as const;

export const VISIBILITY_LABELS = {
  public: 'Public',
  private: 'Privé',
} as const;