import { HeroSection } from "@/components/sections/hero-section"
import { FeaturedCategories } from "@/components/sections/featured-categories"
import { FeaturedProducts } from "@/components/sections/featured-products"
import { AboutSection } from "@/components/sections/about-section"
import { NewsletterSection } from "@/components/sections/newsletter-section"

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturedCategories />
      <FeaturedProducts />
      <AboutSection />
      <NewsletterSection />
    </div>
  )
}
