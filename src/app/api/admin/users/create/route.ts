import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Validation schema for user creation
const createUserSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  phone: z.string().min(10, 'Le numéro de téléphone doit contenir au moins 10 caractères'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  role: z.enum(['BUYER', 'SELLER', 'ADMIN', 'MODERATOR'], {
    errorMap: () => ({ message: 'Rôle invalide' })
  }),
  bio: z.string().optional(),
  location: z.string().optional(),
  whatsappNumber: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validation des données
    const validationResult = createUserSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Données invalides',
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const { name, phone, password, role, bio, location, whatsappNumber } = validationResult.data

    // Vérifier si le numéro de téléphone existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { phone }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ce numéro de téléphone est déjà utilisé' },
        { status: 409 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)

    // Créer l'utilisateur
    const newUser = await prisma.user.create({
      data: {
        name,
        phone,
        password: hashedPassword,
        role,
        bio,
        location,
        whatsappNumber,
        phoneVerified: new Date(), // Marquer comme vérifié par défaut pour les utilisateurs créés par admin
        isVerified: true
      },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        bio: true,
        location: true,
        whatsappNumber: true,
        createdAt: true,
        phoneVerified: true,
        isVerified: true
      }
    })

    return NextResponse.json({
      message: 'Utilisateur créé avec succès',
      user: newUser
    }, { status: 201 })

  } catch (error) {
    console.error('Erreur API admin users create:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}