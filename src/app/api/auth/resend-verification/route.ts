import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { resendVerificationSchema } from '@/lib/validations/auth';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone } = resendVerificationSchema.parse(body)

    // Rechercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { phone },
    })

    // Pour des raisons de sécurité, on renvoie toujours une réponse positive
    // même si l'utilisateur n'existe pas
    if (!user) {
      return NextResponse.json(
        { message: 'Si un compte existe avec ce numéro, un SMS de vérification a été envoyé.' },
        { status: 200 }
      )
    }

    // Si le téléphone est déjà vérifié
    if (user.phoneVerified) {
      return NextResponse.json(
        { message: 'Numéro de téléphone déjà vérifié' },
        { status: 400 }
      )
    }

    // Générer un nouveau token de vérification
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 heures

    // Mettre à jour l'utilisateur avec le nouveau token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        phoneVerificationToken: verificationToken,
        phoneVerificationExpiry: expiryDate,
      },
    })

    // TODO: Envoyer le SMS de vérification
    // await sendVerificationSMS(user.phone, verificationToken)
    console.log(`SMS de vérification envoyé à ${user.phone} avec le token: ${verificationToken}`)

    return NextResponse.json(
      { message: 'SMS de vérification renvoyé avec succès' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors du renvoi de l\'email de vérification:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Données invalides', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}