import { Header } from "@/src/components/layout/Header"
import { Footer } from "@/src/components/Footer"
import { ProductCard } from "@/src/components/product/ProductCard"
import { useFavorites } from "@/src/contexts/FavoritesContext"
import { useCart } from "@/src/contexts/CartContext"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { Link } from "react-router-dom"

export default function FavoritesPage() {
  const { favorites } = useFavorites()
  const { addToCart } = useCart()

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="mb-4 sm:mb-6 md:mb-8 flex items-center gap-2 sm:gap-3">
          <Heart className="h-6 w-6 sm:h-8 sm:w-8 fill-k2k-pink text-k2k-pink" />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-k2k-pink">Os Meus Favoritos</h1>
        </div>

        {favorites.length > 0 ? (
          <>
            <p className="mb-4 sm:mb-6 text-sm sm:text-base text-muted-foreground">{favorites.length} produtos nos favoritos</p>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {favorites.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
              ))}
            </div>
          </>
        ) : (
          <div className="py-12 sm:py-16 text-center">
            <Heart className="mx-auto mb-3 sm:mb-4 h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground" />
            <h2 className="mb-2 text-lg sm:text-xl font-semibold">Ainda não tem favoritos</h2>
            <p className="mb-4 sm:mb-6 text-sm sm:text-base text-muted-foreground px-4">
              Adicione produtos aos favoritos para os encontrar facilmente mais tarde
            </p>
            <Link to="/">
              <Button className="bg-k2k-pink hover:bg-k2k-pink/90">Explorar Produtos</Button>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
