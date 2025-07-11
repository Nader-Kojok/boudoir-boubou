import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { registerSchema } from '@/lib/validations/auth'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation des données
    const validatedData = registerSchema.parse(body)
    const { name, phone, password, role } = validatedData

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Un compte avec ce numéro de téléphone existe déjà' },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        name,
        phone,
        password: hashedPassword,
        role,
        phoneVerified: null, // Le téléphone n'est pas encore vérifié
      },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    })

    // TODO: Envoyer un SMS de vérification
    // await sendVerificationSMS(user.phone, user.id)

    return NextResponse.json(
      {
        message: 'Compte créé avec succès',
        user,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error)

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