"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#faf8f5] via-white to-[#f0f7f6]" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-boudoir-ocre-200 rounded-full opacity-20 animate-pulse" />
      <div className="absolute bottom-32 right-16 w-32 h-32 bg-boudoir-vert-eau-200 rounded-full opacity-20 animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-boudoir-ocre-300 rounded-full opacity-10 animate-bounce" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          
          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Vendez et achetez vos{" "}
            <span className="bg-gradient-to-r from-[#a67c3a] to-[#9bc5c0] bg-clip-text text-transparent font-extrabold inline-block">
              tenues
            </span>
            {" "}d&apos;exception
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            La première plateforme Sénégalaise dédiée à la vente de vêtements traditionnels et tradi-modernes de seconde mains.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              asChild 
              size="lg" 
              className="bg-gradient-to-r from-[#a67c3a] to-[#8b5a2b] hover:from-[#8b5a2b] hover:to-[#6d4422] text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <Link href="/catalogue">
                Explorer les articles
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              size="lg"
              className="border-2 border-boudoir-vert-eau-300 text-boudoir-vert-eau-700 hover:bg-boudoir-vert-eau-50 px-8 py-3 rounded-full transition-all duration-300"
            >
              <Link href="/register">
                Commencer à vendre
              </Link>
            </Button>
          </div>
          
          {/* Login CTA */}
          <div className="mt-6">
            <p className="text-sm text-gray-600">
              Déjà membre ?{" "}
              <Link 
                href="/login" 
                className="text-boudoir-ocre-600 hover:text-boudoir-ocre-700 font-medium underline underline-offset-2 transition-colors"
              >
                Connectez-vous
              </Link>
            </p>
          </div>
          
          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-boudoir-ocre-600">2000+</div>
              <div className="text-sm text-gray-600">Articles vendus</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-boudoir-vert-eau-600">500+</div>
              <div className="text-sm text-gray-600">Vendeuses actives</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-boudoir-ocre-600">48h</div>
              <div className="text-sm text-gray-600">Temps moyen de vente</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-300 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  )
}