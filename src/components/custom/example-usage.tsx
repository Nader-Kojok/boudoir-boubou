import * as React from "react"
import { 
  ProductCard, 
  CategoryCard, 
  UserAvatar, 
  PriceDisplay, 
  ConditionBadge, 
  ImageGallery 
} from "./index"

// Exemple d'utilisation des composants personnalisés
export function ComponentExamples() {
  const [favorites, setFavorites] = React.useState<string[]>([])
  const [cart, setCart] = React.useState<string[]>([])

  const handleFavoriteToggle = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    )
  }

  const handleAddToCart = (id: string) => {
    setCart(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const sampleImages = [
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400",
    "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400"
  ]

  return (
    <div className="p-8 space-y-12">
      <h1 className="text-3xl font-bold mb-8">Composants Personnalisés - Exemples</h1>
      
      {/* ProductCard Examples */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">ProductCard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProductCard
            id="product-1"
            title="Robe élégante vintage"
            description="Magnifique robe des années 60 en parfait état"
            price={89.99}
            originalPrice={129.99}
            condition="EXCELLENT"
            images={sampleImages}
            category="Robes"
            isFavorite={favorites.includes("product-1")}
            isInCart={cart.includes("product-1")}
            onFavoriteToggle={handleFavoriteToggle}
            onAddToCart={handleAddToCart}
            onClick={(id) => console.log("Clicked product:", id)}
          />
          
          <ProductCard
            id="product-2"
            title="Sac à main cuir"
            description="Sac en cuir véritable, quelques marques d'usage"
            price={45.00}
            condition="GOOD"
            images={[sampleImages[0]]}
            category="Accessoires"
            isFavorite={favorites.includes("product-2")}
            isInCart={cart.includes("product-2")}
            onFavoriteToggle={handleFavoriteToggle}
            onAddToCart={handleAddToCart}
          />
        </div>
      </section>

      {/* CategoryCard Examples */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">CategoryCard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <CategoryCard
            id="cat-1"
            name="Robes"
            description="Collection de robes vintage et modernes"
            image={sampleImages[0]}
            productCount={24}
            onClick={(id) => console.log("Clicked category:", id)}
          />
          
          <CategoryCard
            id="cat-2"
            name="Accessoires"
            description="Sacs, bijoux et accessoires"
            image={sampleImages[1]}
            productCount={156}
            isActive
          />
        </div>
      </section>

      {/* UserAvatar Examples */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">UserAvatar</h2>
        <div className="flex items-center gap-4 flex-wrap">
          <UserAvatar
            name="Marie Dupont"
            email="marie@example.com"
            src={"https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100"}
            size="sm"
            showStatus
            isOnline
          />
          
          <UserAvatar
            name="Jean Martin"
            role="admin"
            size="md"
            showBadge
            showStatus
            isOnline={false}
          />
          
          <UserAvatar
            name="Sophie Bernard"
            role="premium"
            size="lg"
            showBadge
            showStatus
            isOnline
          />
          
          <UserAvatar
            email="moderator@example.com"
            role="moderator"
            size="xl"
            showBadge
          />
        </div>
      </section>

      {/* PriceDisplay Examples */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">PriceDisplay</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-8">
            <PriceDisplay price={29.99} size="sm" />
            <PriceDisplay price={89.99} originalPrice={129.99} size="md" />
            <PriceDisplay price={199.99} originalPrice={299.99} size="lg" discountFormat="amount" />
          </div>
        </div>
      </section>

      {/* ConditionBadge Examples */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">ConditionBadge</h2>
        <div className="flex items-center gap-4 flex-wrap">
          <ConditionBadge condition="EXCELLENT" size="sm" />
            <ConditionBadge condition="GOOD" size="md" />
            <ConditionBadge condition="FAIR" size="lg" />
            <ConditionBadge condition="EXCELLENT" showIcon={false} />
        </div>
      </section>

      {/* ImageGallery Examples */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">ImageGallery</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium mb-2">Galerie simple</h3>
            <ImageGallery
              images={[sampleImages[0]]}
              alt="Image unique"
              className="aspect-square max-w-sm"
              showExpandButton
            />
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Galerie avec miniatures</h3>
            <ImageGallery
              images={sampleImages}
              alt="Galerie d'images"
              className="aspect-square max-w-sm"
              showThumbnails
              showExpandButton
              onImageClick={(index) => console.log("Image clicked:", index)}
              onExpand={(images, index) => console.log("Expand gallery:", images, index)}
            />
          </div>
        </div>
      </section>
    </div>
  )
}

export default ComponentExamples