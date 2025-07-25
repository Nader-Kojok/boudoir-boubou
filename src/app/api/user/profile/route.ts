import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom est requis')
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  phone: z
    .string()
    .min(1, 'Le téléphone est requis')
    .regex(
      /^(\+221|221)?[0-9]{9}$/,
      'Format de numéro invalide (ex: +221771234567 ou 771234567)'
    ),
  role: z.enum(['SELLER', 'BUYER', 'ADMIN'], {
    required_error: 'Veuillez sélectionner un rôle',
  }),
  image: z.string().optional().or(z.literal('')).refine(
    (val) => !val || val === '' || /^https?:\/\//.test(val) || /^data:image\//.test(val),
    'Format d\'image invalide (URL ou base64)'
  ),
  bannerImage: z.string().optional().or(z.literal('')).refine(
    (val) => !val || val === '' || /^https?:\/\//.test(val) || /^data:image\//.test(val),
    'Format d\'image invalide (URL ou base64)'
  ),
})

export async function PATCH(request: NextRequest) {
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
    const validatedData = updateProfileSchema.parse(body)
    const { name, phone, role, image, bannerImage } = validatedData

    // Récupérer l'utilisateur actuel pour vérifier le téléphone
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { phone: true },
    })

    if (!currentUser) {
      return NextResponse.json(
        { message: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier si le téléphone est déjà utilisé par un autre utilisateur
    if (phone !== currentUser.phone) {
      const existingUser = await prisma.user.findUnique({
        where: { phone },
      })

      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json(
          { message: 'Ce numéro de téléphone est déjà utilisé par un autre compte' },
          { status: 400 }
        )
      }
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        phone,
        role,
        image: image || null,
        bannerImage: bannerImage || null,
        // Si le téléphone change, marquer comme non vérifié
        ...(phone !== currentUser.phone && { phoneVerified: null }),
      },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        image: true,
        bannerImage: true,
        phoneVerified: true,
        updatedAt: true,
      },
    })

    // TODO: Si le téléphone a changé, envoyer un SMS de vérification
    // if (phone !== session.user.phone) {
    //   await sendVerificationSMS(phone, updatedUser.id)
    // }

    return NextResponse.json(
      {
        message: 'Profil mis à jour avec succès',
        user: updatedUser,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error)

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

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        phone: true,
        image: true,
        role: true,
        phoneVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error)
    
    return NextResponse.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}