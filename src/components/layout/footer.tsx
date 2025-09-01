import Link from 'next/link'
import Image from 'next/image'
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface FooterProps {
  className?: string
}

const footerNavigation = {
  boutique: [
    { name: "Nouveaux articles", href: "/catalogue?sortBy=newest" },
    { name: "Mariage", href: "/catalogue?categoryId=mariage" },
    { name: "Traditionnel", href: "/catalogue?categoryId=traditionnel" },
    { name: "Soirée", href: "/catalogue?categoryId=soiree" },
  ],
  aide: [
    { name: "Comment ça marche", href: "/how-it-works" },
    { name: "Vendre un article", href: "/seller/vendre" },
    { name: "FAQ", href: "/faq" },
    { name: "Contact", href: "/contact" },
  ],
  entreprise: [
    { name: "À propos", href: "/about" },
    { name: "Notre mission", href: "/mission" },
    { name: "Communauté", href: "/community" },
    { name: "Blog", href: "/blog" },
  ],
  legal: [
    { name: "Mentions légales", href: "/legal" },
    { name: "Politique de confidentialité", href: "/privacy" },
    { name: "CGV", href: "/terms" },
    { name: "Cookies", href: "/cookies" },
  ],
}

const socialLinks = [
  {
    name: "Instagram",
    href: "#",
    icon: Instagram,
  },
  {
    name: "Facebook",
    href: "#",
    icon: Facebook,
  },
]

export function Footer({ className }: FooterProps) {
  return (
    <footer className={`bg-boudoir-beige-100 border-t border-border ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter */}
        <div className="py-12 border-b border-border">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Restez informée des nouveaux articles
            </h3>
            <p className="text-muted-foreground mb-6">
              Inscrivez-vous à notre newsletter et recevez les alertes sur les nouveaux articles et bonnes affaires de la communauté.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" suppressHydrationWarning>
              <Input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1"
              />
              <Button className="bg-gradient-to-r from-[#a67c3a] to-[#8b5a2b] hover:from-[#8b5a2b] hover:to-[#6d4422] text-white shadow-lg hover:shadow-xl transition-all duration-300">
                S&apos;inscrire
              </Button>
            </div>
          </div>
        </div>

        {/* Main footer content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center mb-4">
                <Image
                  src="/boudoir_logo-white.svg"
                  alt="Le Boudoir du BouBou"
                  width={374}
                  height={96}
                  className="h-24 w-auto"
                />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                La première plateforme sénégalaise de vente de vêtements entre particuliers.
              </p>
              <div className="flex space-x-3">
                {socialLinks.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-muted-foreground hover:text-boudoir-ocre-500 transition-colors duration-200"
                    >
                      <span className="sr-only">{item.name}</span>
                      <Icon className="h-5 w-5" />
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Navigation sections */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                    Catégories
                  </h3>
                  <ul className="space-y-3">
                    {footerNavigation.boutique.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                    Aide
                  </h3>
                  <ul className="space-y-3">
                    {footerNavigation.aide.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                    Entreprise
                  </h3>
                  <ul className="space-y-3">
                    {footerNavigation.entreprise.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Contact info */}
            <div className="lg:col-span-1">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                Contact
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                  <span>Paris, France</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Phone className="h-5 w-5" />
                  <span>+221 77 444 56 78</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <Mail className="h-5 w-5 flex-shrink-0" />
                  <span className="break-all">contact@leboudoirduboubou.fr</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="py-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Le Boudoir du BouBou. Tous droits réservés.
            </div>
            <div className="flex space-x-6">
              {footerNavigation.legal.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer