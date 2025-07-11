import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { verifyPhoneSchema } from '@/lib/validations/auth';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = verifyPhoneSchema.parse(body)

    // Rechercher l'utilisateur avec ce token de vérification
    const user = await prisma.user.findFirst({
      where: {
        phoneVerificationToken: token,
        phoneVerificationExpiry: {
          gt: new Date(), // Token non expiré
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Token de vérification invalide ou expiré' },
        { status: 400 }
      )
    }

    // Marquer le téléphone comme vérifié et supprimer le token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        phoneVerified: new Date(),
        phoneVerificationToken: null,
        phoneVerificationExpiry: null,
      },
    })

    return NextResponse.json(
      { message: 'Numéro de téléphone vérifié avec succès' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de la vérification d\'email:', error)

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