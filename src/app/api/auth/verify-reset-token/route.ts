import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { verifyTokenSchema } from '@/lib/validations/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation des données
    const validatedData = verifyTokenSchema.parse(body)
    const { token } = validatedData

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

    return NextResponse.json(
      { message: 'Token valide' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error)

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