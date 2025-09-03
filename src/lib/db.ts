import { PrismaClient, Prisma } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import type { Article, Category, User, ArticleCondition, UserRole, ArticleStatus } from '@prisma/client'

// Type for the extended Prisma client
type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined
}

// Configuration optimisée pour le développement
const createPrismaClient = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
  
  // Extend with Accelerate for connection pooling and caching
  return client.$extends(withAccelerate())
}

// Instance globale pour le développement uniquement
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Wrapper pour les opérations de base de données avec gestion automatique des connexions
export async function withPrisma<T>(operation: (client: ExtendedPrismaClient) => Promise<T>): Promise<T> {
  if (process.env.NODE_ENV === 'production') {
    // En production, créer une nouvelle instance avec Accelerate pour chaque opération
    const client = createPrismaClient()
    try {
      return await operation(client)
    } finally {
      // Accelerate gère automatiquement les connexions, pas besoin de disconnect explicite
    }
  } else {
    // En développement, utiliser l'instance globale
    return await operation(prisma)
  }
}

// Gestion automatique de la déconnexion en production
if (process.env.NODE_ENV === 'production') {
  // Déconnexion propre lors de l'arrêt du processus
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
  
  process.on('SIGINT', async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
  
  process.on('SIGTERM', async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}

// Fonction pour fermer proprement les connexions
export async function disconnectPrisma() {
  await prisma.$disconnect()
}

// Fonction pour vérifier la santé de la connexion
export async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

// Export types from Prisma
export type { Article, Category, User, ArticleCondition, UserRole, ArticleStatus }

// Types for better type safety
type ArticleWithDetails = Prisma.ArticleGetPayload<{
  include: {
    seller: {
      select: {
        id: true
        name: true
        image: true
        location: true
        whatsappNumber: true
        phone: true
      }
    }
    category: true
    _count: {
      select: {
        favorites: true
        reviews: true
      }
    }
  }
}>

type UserWithCounts = Prisma.UserGetPayload<{
  include: {
    _count: {
      select: {
        articles: {
          where: {
            isAvailable: true
          }
        }
        reviews: true
      }
    }
  }
}>

// Utility function to parse images from JSON string
function parseImages(images: string): string[] {
  try {
    return JSON.parse(images)
  } catch {
    return []
  }
}

// Transform article to include parsed images
function transformArticle(article: Record<string, unknown>): Record<string, unknown> {
  if (article && article.images) {
    return {
      ...article,
      images: parseImages(article.images as string)
    }
  }
  return article
}

// Import des utilitaires de connexion
import { safeDbOperation } from './db-connection'

// Article functions
export async function getArticles(filters?: {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: ArticleCondition;
  sellerId?: string;
  search?: string;
}): Promise<ArticleWithDetails[]> {
  const where: {
    isAvailable: boolean;
    status: ArticleStatus;
    categoryId?: string;
    price?: { gte?: number; lte?: number };
    condition?: ArticleCondition;
    sellerId?: string;
    OR?: Array<{ title?: { contains: string; mode: Prisma.QueryMode } } | { description?: { contains: string; mode: Prisma.QueryMode } }>;
  } = {
    isAvailable: true,
    status: 'APPROVED' as ArticleStatus,
  }

  if (filters?.categoryId) {
    where.categoryId = filters.categoryId
  }

  if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
    where.price = {}
    if (filters.minPrice !== undefined) where.price.gte = filters.minPrice
    if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice
  }

  if (filters?.condition) {
    where.condition = filters.condition
  }

  if (filters?.sellerId) {
    where.sellerId = filters.sellerId
  }

  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: Prisma.QueryMode.insensitive } },
      { description: { contains: filters.search, mode: Prisma.QueryMode.insensitive } },
    ]
  }

  try {
    const articles = await withPrisma(
      (client) => client.article.findMany({
        where,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              image: true,
              location: true,
              whatsappNumber: true,
              phone: true,
            },
          },
          category: true,
          _count: {
            select: {
              favorites: true,
              reviews: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        cacheStrategy: { ttl: 180 }, // Cache for 3 minutes
      })
    )

    return articles.map(transformArticle) as ArticleWithDetails[]
  } catch (error) {
    console.error('Erreur lors de la récupération des articles:', error)
    return []
  }
}

export async function getArticleById(id: string): Promise<Prisma.ArticleGetPayload<{
  include: {
    seller: {
      select: {
        id: true
        name: true
        image: true
        location: true
        bio: true
        whatsappNumber: true
        phone: true
      }
    }
    category: true
    reviews: {
      include: {
        reviewer: {
          select: {
            id: true
            name: true
            image: true
          }
        }
      }
      orderBy: {
        createdAt: 'desc'
      }
    }
    _count: {
      select: {
        favorites: true
      }
    }
  }
}> | null> {
  const article = await withPrisma((client) => client.article.findUnique({
    where: { id },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          image: true,
          location: true,
          bio: true,
          whatsappNumber: true,
          phone: true,
        },
      },
      category: true,
      reviews: {
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      _count: {
        select: {
          favorites: true,
        },
      },
    },
  }))
  
  return article ? (transformArticle(article) as typeof article) : null
}

export async function createArticle(data: {
  title: string;
  description: string;
  price: number;
  images: string[];
  size?: string;
  condition: ArticleCondition;
  sellerId: string;
  categoryId: string;
}): Promise<Prisma.ArticleGetPayload<{
  include: {
    seller: {
      select: {
        id: true
        name: true
        image: true
      }
    }
    category: true
  }
}>> {
  return await prisma.article.create({
    data: {
      ...data,
      images: JSON.stringify(data.images),
    },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      category: true,
    },
  })
}

export async function updateArticle(id: string, data: Partial<{
  title: string;
  description: string;
  price: number;
  images: string[];
  size?: string;
  condition: ArticleCondition;
  isAvailable: boolean;
  categoryId: string;
}>): Promise<Prisma.ArticleGetPayload<{
  include: {
    seller: {
      select: {
        id: true
        name: true
        image: true
      }
    }
    category: true
  }
}>> {
  const updateData: Record<string, unknown> = { ...data }
  if (data.images) {
    updateData.images = JSON.stringify(data.images)
  }
  
  return await prisma.article.update({
    where: { id },
    data: updateData,
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      category: true,
    },
  })
}

export async function deleteArticle(id: string): Promise<Article> {
  return await prisma.article.delete({
    where: { id },
  })
}

// Category functions
export async function getCategories(): Promise<Prisma.CategoryGetPayload<{
  include: {
    _count: {
      select: {
        articles: {
          where: {
            isAvailable: true
          }
        }
      }
    }
  }
}>[]> {
  return await prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
    include: {
      _count: {
        select: {
          articles: {
            where: {
              isAvailable: true,
            },
          },
        },
      },
    },
  })
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return await prisma.category.findUnique({
    where: { slug },
  })
}

export async function createCategory(data: {
  name: string;
  slug: string;
  description?: string;
  image?: string;
}): Promise<Category> {
  return await prisma.category.create({
    data,
  })
}

// User functions
export async function getUserById(id: string): Promise<UserWithCounts | null> {
  try {
    return await safeDbOperation(
      () => prisma.user.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              articles: {
                where: {
                  isAvailable: true,
                },
              },
              reviews: true,
            },
          },
        },
        cacheStrategy: { ttl: 300 }, // Cache for 5 minutes
      }),
      'getUserById'
    )
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error)
    return null
  }
}

export async function updateUser(id: string, data: Partial<{
  name: string;
  bio: string;
  location: string;
  whatsappNumber: string;
  role: UserRole;
}>): Promise<User> {
  return await prisma.user.update({
    where: { id },
    data,
  })
}

// Favorite functions
export async function toggleFavorite(userId: string, articleId: string): Promise<boolean> {
  const existingFavorite = await prisma.favorite.findUnique({
    where: {
      userId_articleId: {
        userId,
        articleId,
      },
    },
  })

  if (existingFavorite) {
    await prisma.favorite.delete({
      where: {
        id: existingFavorite.id,
      },
    })
    return false
  } else {
    await prisma.favorite.create({
      data: {
        userId,
        articleId,
      },
    })
    return true
  }
}

export async function getUserFavorites(userId: string): Promise<Prisma.FavoriteGetPayload<{
  include: {
    article: {
      include: {
        seller: {
          select: {
            id: true
            name: true
            image: true
          }
        }
        category: true
      }
    }
  }
}>[]> {
  return await prisma.favorite.findMany({
    where: { userId },
    include: {
      article: {
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          category: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    cacheStrategy: { ttl: 240 }, // Cache for 4 minutes
  })
}

// Review functions
export async function createReview(data: {
  rating: number;
  comment?: string;
  reviewerId: string;
  articleId: string;
}): Promise<Prisma.ReviewGetPayload<{
  include: {
    reviewer: {
      select: {
        id: true
        name: true
        image: true
      }
    }
  }
}>> {
  return await prisma.review.create({
    data,
    include: {
      reviewer: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  })
}

export async function getArticleReviews(articleId: string): Promise<Prisma.ReviewGetPayload<{
  include: {
    reviewer: {
      select: {
        id: true
        name: true
        image: true
      }
    }
  }
}>[]> {
  return await prisma.review.findMany({
    where: { articleId },
    include: {
      reviewer: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    cacheStrategy: { ttl: 600 }, // Cache for 10 minutes
  })
}