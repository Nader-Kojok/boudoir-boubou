"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, ShoppingBag, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuthButton } from "@/components/auth/auth-button"

interface HeaderProps {
  className?: string
}

const navigation = [
  { name: "Accueil", href: "/" },
  { name: "Explorer", href: "/catalogue" },
  { name: "Catégories", href: "/categories" },
  { name: "Vendre", href: "/seller/vendre" },
  { name: "Comment ça marche", href: "/how-it-works" },
]

export function Header({ className }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className={`bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#a67c3a] to-[#9bc5c0]" />
              <span className="text-xl font-bold text-foreground">
                Le Boudoir du Boubou
              </span>
            </Link>
          </div>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 hover:scale-105"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="relative">
              <Heart className="h-5 w-5" />
              <span className="sr-only">Favoris</span>
            </Button>
            <Button variant="ghost" size="sm" className="relative">
              <ShoppingBag className="h-5 w-5" />
              <span className="sr-only">Mes achats</span>
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-boudoir-ocre-500 text-xs text-white flex items-center justify-center">
                0
              </span>
            </Button>
            <AuthButton />
          </div>

          {/* Menu mobile button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="relative"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
              <span className="sr-only">Menu</span>
            </Button>
          </div>
        </div>

        {/* Navigation mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden animate-slide-up">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t border-border pt-4 pb-3">
                <div className="flex items-center px-3 space-x-3">
                  <Button variant="ghost" size="sm" className="flex-1 justify-start">
                    <Heart className="h-5 w-5 mr-2" />
                    Favoris
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1 justify-start relative">
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Mes achats
                    <span className="ml-auto h-5 w-5 rounded-full bg-boudoir-ocre-500 text-xs text-white flex items-center justify-center">
                      0
                    </span>
                  </Button>
                </div>
                <div className="mt-3 px-3">
                  <AuthButton />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header