'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { CheckCircle, Users, ShoppingBag, Shield, Heart, Star, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function HowItWorksPage() {
  const steps = [
    {
      icon: Users,
      title: "Rejoignez la communauté",
      description: "Créez votre compte gratuitement et rejoignez notre communauté de passionnées de mode africaine.",
      details: [
        "Inscription simple et rapide",
        "Profil personnalisé",
        "Accès à toutes les fonctionnalités"
      ]
    },
    {
      icon: ShoppingBag,
      title: "Explorez et achetez",
      description: "Découvrez des pièces uniques vendues par d&apos;autres membres de la communauté.",
      details: [
        "Catalogue varié et authentique",
        "Filtres de recherche avancés",
        "Photos détaillées et descriptions"
      ]
    },
    {
      icon: Heart,
      title: "Vendez vos trésors",
      description: "Donnez une seconde vie à vos vêtements en les vendant à d&apos;autres passionnées.",
      details: [
        "Publication facile d&apos;annonces",
        "Gestion simplifiée des ventes",
        "Commission réduite"
      ]
    }
  ]

  const benefits = [
    {
      icon: Shield,
      title: "Transactions sécurisées",
      description: "Tous les paiements sont protégés et sécurisés."
    },
    {
      icon: Star,
      title: "Qualité garantie",
      description: "Système d&apos;évaluation pour maintenir la qualité."
    },
    {
      icon: Users,
      title: "Communauté bienveillante",
      description: "Échangez avec des passionnées comme vous."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f5] via-white to-[#f0f7f6]">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#faf8f5] via-white to-[#f0f7f6]" />
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-boudoir-ocre-200 rounded-full opacity-20 animate-pulse" />
        <div className="absolute bottom-32 right-16 w-32 h-32 bg-boudoir-vert-eau-200 rounded-full opacity-20 animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-boudoir-ocre-300 rounded-full opacity-10 animate-bounce" />
        <div className="absolute top-1/3 right-1/3 w-12 h-12 bg-boudoir-vert-eau-300 rounded-full opacity-15 animate-pulse delay-500" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-boudoir-ocre-200 rounded-full px-4 py-2 mb-8">
              <Sparkles className="w-4 h-4 text-boudoir-ocre-500" />
              <span className="text-sm font-medium text-boudoir-ocre-700">
                Comment ça marche
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Votre{" "}
              <span className="bg-gradient-to-r from-[#a67c3a] to-[#9bc5c0] bg-clip-text text-transparent font-extrabold inline-block">
                marketplace
              </span>
              {" "}de mode africaine
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Découvrez comment Le Boudoir du Boubou révolutionne l&apos;achat et la vente de vêtements africains entre particuliers.
            </p>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-300 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 lg:py-24 bg-white px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <span className="text-boudoir-ocre-600 font-medium text-sm uppercase tracking-wide">
              Processus Simple
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2 mb-4">
              En 3 étapes simples
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Rejoignez notre communauté et commencez à acheter ou vendre dès aujourd&apos;hui
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <Card key={index} className="relative border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-boudoir-ocre-400 to-boudoir-vert-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-boudoir-ocre-500 to-boudoir-ocre-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                      {index + 1}
                    </div>
                    <CardTitle className="text-xl text-gray-900">{step.title}</CardTitle>
                    <CardDescription className="text-base text-gray-600">
                      {step.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-[#faf8f5] to-[#f0f7f6] px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <span className="text-boudoir-ocre-600 font-medium text-sm uppercase tracking-wide">
              Nos Avantages
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2 mb-4">
              Pourquoi choisir Le Boudoir du Boubou ?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Une plateforme pensée pour la communauté, par la communauté
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 group bg-white">
                  <CardContent className="p-8">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#f5f0e8] to-[#e6f2f1] rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-8 h-8 text-boudoir-ocre-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-24 bg-white px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <span className="text-boudoir-ocre-600 font-medium text-sm uppercase tracking-wide">
              Support
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2 mb-4">
              Questions fréquentes
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Trouvez rapidement les réponses à vos questions les plus courantes
            </p>
          </div>

          <div className="space-y-6 max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Comment puis-je être sûre de la qualité des articles ?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  Chaque vendeur dispose d&apos;un système d&apos;évaluation. Les acheteurs peuvent laisser des avis après chaque transaction, 
                  ce qui permet de maintenir un niveau de qualité élevé dans notre communauté.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Quels sont les frais de commission ?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  Nous appliquons une commission réduite de 5% sur chaque vente réussie. 
                  Cette commission nous permet de maintenir la plateforme et d&apos;assurer la sécurité des transactions.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Comment se déroule la livraison ?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  La livraison est organisée directement entre l&apos;acheteur et le vendeur. 
                  Nous recommandons l&apos;utilisation de services de livraison avec suivi pour plus de sécurité.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Puis-je retourner un article ?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  Les conditions de retour sont définies par chaque vendeur dans sa politique de vente. 
                  Nous encourageons la communication entre acheteurs et vendeurs pour résoudre tout problème.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-boudoir-ocre-50 to-boudoir-vert-50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-boudoir-ocre-200 rounded-full opacity-20 animate-pulse" />
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-boudoir-vert-eau-200 rounded-full opacity-20 animate-pulse delay-1000" />
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Prête à rejoindre la communauté ?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
              Commencez dès maintenant à explorer notre catalogue ou à vendre vos propres pièces.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild 
                size="lg" 
                className="bg-gradient-to-r from-[#a67c3a] to-[#8b5a2b] hover:from-[#8b5a2b] hover:to-[#6d4422] text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <Link href="/catalogue">
                  Explorer le catalogue
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="border-2 border-boudoir-vert-eau-300 text-boudoir-vert-eau-700 hover:bg-boudoir-vert-eau-50 px-8 py-3 rounded-full transition-all duration-300"
              >
                <Link href="/seller/vendre">
                  Vendre un article
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}