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
      description: "Découvrez des pièces uniques vendues par d'autres membres de la communauté.",
      details: [
        "Catalogue varié et authentique",
        "Filtres de recherche avancés",
        "Photos détaillées et descriptions"
      ]
    },
    {
      icon: Heart,
      title: "Vendez vos trésors",
      description: "Donnez une seconde vie à vos vêtements en les vendant à d'autres passionnées.",
      details: [
        "Publication facile d'annonces",
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
      description: "Système d'évaluation pour maintenir la qualité."
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
      <section className="bg-white border-b border-gray-100 py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
              <Link href="/" className="hover:text-boudoir-ocre-600 transition-colors">
                Accueil
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Comment ça marche</span>
            </nav>
            
            {/* Main content */}
            <div className="text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-boudoir-ocre-700 mb-6 leading-tight">
                Comment fonctionne{" "}
                <span className="text-boudoir-ocre-600">
                  Le Boudoir du Boubou
                </span>
                {" "}?
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Découvrez en quelques étapes simples comment acheter et vendre vos vêtements africains 
                sur notre plateforme communautaire.
              </p>
              
              {/* Quick navigation */}
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => document.getElementById('steps-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Les étapes
                </button>
                <button 
                  onClick={() => document.getElementById('benefits-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Nos avantages
                </button>
                <button 
                  onClick={() => document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Questions fréquentes
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section id="steps-section" className="py-16 lg:py-24 bg-white px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <span className="text-boudoir-ocre-600 font-medium text-sm uppercase tracking-wide">
              Processus Simple
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-boudoir-ocre-700 mt-2 mb-4">
              En 3 étapes simples
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Rejoignez notre communauté et commencez à acheter ou vendre dès aujourd'hui
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <Card key={index} className="relative border-0 shadow-lg hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-boudoir-ocre-100 to-boudoir-ocre-200 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-8 h-8 text-boudoir-ocre-700" />
                    </div>
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-boudoir-ocre-100 to-boudoir-ocre-200 text-boudoir-ocre-700 rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-boudoir-ocre-300">
                      {index + 1}
                    </div>
                    <CardTitle className="text-xl text-gray-900">{step.title}</CardTitle>
                    <CardDescription className="text-base text-gray-600">
                      {step.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
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
      <section id="benefits-section" className="py-16 lg:py-24 bg-gradient-to-br from-[#faf8f5] to-[#f0f7f6] px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <span className="text-boudoir-ocre-600 font-medium text-sm uppercase tracking-wide">
              Nos Avantages
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-boudoir-ocre-700 mt-2 mb-4">
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
                <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 group bg-white flex flex-col h-full">
                  <CardContent className="p-8 flex-grow">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#f5f0e8] to-[#e6f2f1] rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-8 h-8 text-boudoir-ocre-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-boudoir-ocre-700 mb-3">
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
      <section id="faq-section" className="py-16 lg:py-24 bg-white px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <span className="text-boudoir-ocre-600 font-medium text-sm uppercase tracking-wide">
              Support
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-boudoir-ocre-700 mt-2 mb-4">
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
                  Chaque vendeur dispose d'un système d'évaluation. Les acheteurs peuvent laisser des avis après chaque transaction, 
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
                  Frais de commission : 300 F / article posté. 
                  Cette commission nous permet de maintenir la plateforme et d'assurer la sécurité des transactions.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Comment se déroule la livraison ?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  La livraison est organisée directement entre l'acheteur et le vendeur. 
                  Nous recommandons l'utilisation de services de livraison avec suivi pour plus de sécurité.
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
            <h2 className="text-3xl lg:text-4xl font-bold text-boudoir-ocre-700 mb-6">
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