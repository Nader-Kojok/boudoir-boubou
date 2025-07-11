import { z } from 'zod';

// Schémas de validation pour l'authentification
export const loginSchema = z.object({
  phone: z
    .string()
    .min(1, 'Le numéro de téléphone est requis')
    .regex(
      /^(\+221|221)?[0-9]{9}$/,
      'Format de numéro invalide (ex: +221771234567 ou 771234567)'
    ),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis')
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom est requis')
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  phone: z
    .string()
    .min(1, 'Le numéro de téléphone est requis')
    .regex(
      /^(\+221|221)?[0-9]{9}$/,
      'Format de numéro invalide (ex: +221771234567 ou 771234567)'
    ),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis')
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
    ),
  confirmPassword: z.string().min(1, 'Confirmez votre mot de passe'),
  role: z.enum(['SELLER', 'BUYER'], {
    required_error: 'Veuillez sélectionner un rôle',
  }),
  acceptTerms: z
    .boolean()
    .refine(val => val === true, 'Vous devez accepter les conditions d\'utilisation'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  phone: z
    .string()
    .min(1, 'Le numéro de téléphone est requis')
    .regex(
      /^(\+221|221)?[0-9]{9}$/,
      'Format de numéro invalide (ex: +221771234567 ou 771234567)'
    ),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(1, 'Le mot de passe est requis')
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
    ),
  confirmPassword: z.string().min(1, 'Confirmez votre mot de passe'),
  token: z.string().min(1, 'Token de réinitialisation requis'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export const verifyPhoneSchema = z.object({
  token: z.string().min(1, 'Token de vérification requis'),
});

export const resendVerificationSchema = z.object({
  phone: z
    .string()
    .min(1, 'Le numéro de téléphone est requis')
    .regex(
      /^(\+221|221)?[0-9]{9}$/,
      'Format de numéro invalide (ex: +221771234567 ou 771234567)'
    ),
});

export const verifyTokenSchema = z.object({
  token: z.string().min(1, 'Token requis'),
});

// Types TypeScript dérivés des schémas
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyPhoneInput = z.infer<typeof verifyPhoneSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
export type VerifyTokenInput = z.infer<typeof verifyTokenSchema>;