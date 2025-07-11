"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Gift, Bell, Sparkles } from "lucide-react"
import { useState } from "react"

const benefits = [
  {
    icon: Gift,
    title: "Alertes bonnes affaires",
    description: "Soyez notifiée des meilleures offres et articles à prix réduits"
  },
  {
    icon: Bell,
    title: "Nouveaux articles",
    description: "Recevez les alertes pour les nouvelles pièces dans vos catégories préférées"
  },
  {
    icon: Sparkles,
    title: "Conseils vente",
    description: "Découvrez nos astuces pour optimiser vos ventes et photos d'articles"
  }
]

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    setIsLoading(true)
    
    // Simulation d'un appel API
    setTimeout(() => {
      setIsSubscribed(true)
      setIsLoading(false)
      setEmail("")
    }, 1000)
  }

  if (isSubscribed) {
    return (
      <section className="py-16 lg:py-24 bg-gradient-to-br from-[#faf8f5] via-white to-[#f0f7f6]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="max-w-2xl mx-auto border-0 shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Merci pour votre inscription !
              </h3>
              <p className="text-gray-600">
                Vous recevrez bientôt les alertes sur les nouveaux articles et bonnes affaires.
              </p>
              <Button 
                onClick={() => setIsSubscribed(false)}
                variant="outline"
                className="mt-4"
              >
                S&apos;inscrire avec un autre email
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-[#faf8f5] via-white to-[#f0f7f6]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-boudoir-ocre-200 rounded-full px-4 py-2 mb-4">
              <Mail className="w-4 h-4 text-boudoir-ocre-500" />
              <span className="text-sm font-medium text-boudoir-ocre-700">
                Newsletter
              </span>
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Restez connectée à la communauté
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#a67c3a] to-[#9bc5c0]">
                Le Boudoir du BouBou
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Inscrivez-vous à notre newsletter pour être informée des nouveaux articles, 
              bonnes affaires et conseils pour optimiser vos ventes.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Benefits */}
            <div className="space-y-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#f5f0e8] to-[#e6f2f1] rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-boudoir-ocre-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-600">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Newsletter Form */}
            <Card className="border-0 shadow-2xl">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full"
                    />
                  </div>
                  
                  <Button 
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full bg-gradient-to-r from-[#a67c3a] to-[#9bc5c0] hover:from-[#8b5a2b] hover:to-[#7ba8a3] text-white py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Inscription en cours...
                      </div>
                    ) : (
                      "S&apos;inscrire à la newsletter"
                    )}
                  </Button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    En vous inscrivant, vous acceptez de recevoir nos emails marketing. 
                    Vous pouvez vous désinscrire à tout moment.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}