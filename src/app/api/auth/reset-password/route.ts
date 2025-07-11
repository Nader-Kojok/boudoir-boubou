import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { resetPasswordSchema } from '@/lib/validations/auth'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation des données
    const validatedData = resetPasswordSchema.parse(body)
    const { token, password } = validatedData

    // Vérifier si le token existe et n'est pas expiré
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(), // Token non expiré
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Token invalide ou expiré' },
        { status: 400 }
      )
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Mettre à jour le mot de passe et supprimer le token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        // Marquer le téléphone comme vérifié si ce n'était pas déjà fait
        phoneVerified: user.phoneVerified || new Date(),
      },
    })

    return NextResponse.json(
      { message: 'Mot de passe réinitialisé avec succès' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: 'Données invalides',
          errors: error.errors,
        },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}