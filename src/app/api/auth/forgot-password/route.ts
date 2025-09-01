import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { forgotPasswordSchema } from '@/lib/validations/auth'
import { z } from 'zod'
import { randomBytes } from 'crypto'

// TODO: Remplacer par un vrai service de SMS
const sendPasswordResetSMS = async (phone: string, token: string) => {
  // Simuler l'envoi de SMS
  console.log(`SMS de réinitialisation envoyé à ${phone} avec le token: ${token}`)
  console.log(`Lien de réinitialisation: ${process.env.NEXTAUTH_URL}/reset-password?token=${token}`)
  
  // TODO: Intégrer avec un service de SMS comme Twilio, etc.
  // await smsService.send({
  //   to: phone,
  //   message: `Réinitialisez votre mot de passe Boudoir: ${process.env.NEXTAUTH_URL}/reset-password?token=${token} (expire dans 1h)`,
  // })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation des données
    const validatedData = forgotPasswordSchema.parse(body)
    const { phone } = validatedData

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { phone },
    })

    // Pour des raisons de sécurité, on renvoie toujours une réponse positive
    // même si l'utilisateur n'existe pas
    if (!user) {
      return NextResponse.json(
        {
          message: 'Si un compte avec ce numéro existe, vous recevrez un SMS de réinitialisation.',
        },
        { status: 200 }
      )
    }

    // Générer un token de réinitialisation sécurisé
    const resetToken = randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 heure

    // Sauvegarder le token dans la base de données
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    })

    // Envoyer le SMS de réinitialisation
    await sendPasswordResetSMS(phone, resetToken)

    // En mode développement, inclure le token dans la réponse
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    return NextResponse.json(
      {
        message: 'Si un compte avec ce numéro existe, vous recevrez un SMS de réinitialisation.',
        ...(isDevelopment && {
          developmentToken: resetToken,
          resetLink: `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`
        })
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation:', error)

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