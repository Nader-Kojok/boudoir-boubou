"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Shield, Truck, Award } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const values = [
  {
    icon: Heart,
    title: "Communauté",
    description: "Une plateforme bienveillante où chaque vendeuse peut partager ses plus belles pièces avec confiance."
  },
  {
    icon: Shield,
    title: "Sécurité",
    description: "Transactions sécurisées et système de notation pour des échanges en toute confiance."
  },
  {
    icon: Truck,
    title: "Simplicité",
    description: "Vendre et acheter n'a jamais été aussi simple grâce à notre interface intuitive."
  },
  {
    icon: Award,
    title: "Authenticité",
    description: "Des vêtements uniques avec une histoire, portés avec amour par des femmes sénégalaises."
  }
]

export function AboutSection() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="order-2 lg:order-1">
            <div className="mb-6">
              <span className="text-boudoir-ocre-600 font-medium text-sm uppercase tracking-wide">
                Notre Mission
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2 mb-4">
                Le Boudoir du BouBou
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Créée pour les femmes sénégalaises qui souhaitent donner une seconde vie 
                à leurs plus belles tenues, notre plateforme connecte vendeuses et acheteuses 
                dans un esprit de partage et de durabilité.
              </p>
            </div>
            
            <div className="mb-8">
              <p className="text-gray-600 leading-relaxed mb-4">
                Que ce soit une robe de mariée portée une seule fois, un boubou 
                traditionnel brodé à la main, ou une tenue de soirée exceptionnelle, 
                chaque pièce a sa propre histoire et mérite de continuer à briller.
              </p>
              
              <p className="text-gray-600 leading-relaxed">
                Notre plateforme permet aux femmes de monétiser leur garde-robe 
                tout en offrant à d&apos;autres l&apos;opportunité d&apos;acquérir des pièces 
                uniques à prix accessible.
              </p>
            </div>
            
            <Button 
              asChild 
              size="lg"
              className="bg-gradient-to-r from-[#a67c3a] to-[#8b5a2b] hover:from-[#8b5a2b] hover:to-[#6d4422] text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href="/how-it-works">
                Comment ça marche
              </Link>
            </Button>
          </div>
          
          {/* Image */}
          <div className="order-1 lg:order-2">
            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                <Image 
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=750&fit=crop&crop=center"
                  alt="Boutique Le Boudoir du Boubou"
                  className="w-full h-full object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-boudoir-vert-eau-200 rounded-full opacity-60" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-boudoir-ocre-200 rounded-full opacity-40" />
            </div>
          </div>
        </div>
        
        {/* Values */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Pourquoi nous choisir
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Les avantages qui font de notre plateforme le choix idéal pour vos achats et ventes.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#f5f0e8] to-[#e6f2f1] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-boudoir-ocre-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {value.title}
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}