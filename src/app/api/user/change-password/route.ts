import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Le mot de passe actuel est requis'),
  newPassword: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une lettre majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une lettre minuscule')
    .regex(/\d/, 'Le mot de passe doit contenir au moins un chiffre')
    .regex(/[^\w\s]/, 'Le mot de passe doit contenir au moins un caractère spécial'),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validation des données
    const validatedData = changePasswordSchema.parse(body)
    const { currentPassword, newPassword } = validatedData

    // Récupérer l'utilisateur avec son mot de passe
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        password: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier si l'utilisateur a un mot de passe (peut être connecté via OAuth)
    if (!user.password) {
      return NextResponse.json(
        { 
          message: 'Impossible de changer le mot de passe. Votre compte est connecté via un fournisseur externe (Google, etc.).' 
        },
        { status: 400 }
      )
    }

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { message: 'Le mot de passe actuel est incorrect' },
        { status: 400 }
      )
    }

    // Vérifier que le nouveau mot de passe est différent de l'ancien
    const isSamePassword = await bcrypt.compare(newPassword, user.password)
    
    if (isSamePassword) {
      return NextResponse.json(
        { message: 'Le nouveau mot de passe doit être différent du mot de passe actuel' },
        { status: 400 }
      )
    }

    // Hacher le nouveau mot de passe
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedNewPassword,
      },
    })

    return NextResponse.json(
      { message: 'Mot de passe modifié avec succès' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error)

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