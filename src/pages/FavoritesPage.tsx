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

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center gap-3">
          <Heart className="h-8 w-8 fill-k2k-pink text-k2k-pink" />
          <h1 className="text-3xl font-bold">Os Meus Favoritos</h1>
        </div>

        {favorites.length > 0 ? (
          <>
            <p className="mb-6 text-muted-foreground">{favorites.length} produtos nos favoritos</p>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {favorites.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
              ))}
            </div>
          </>
        ) : (
          <div className="py-16 text-center">
            <Heart className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="mb-2 text-xl font-semibold">Ainda não tem favoritos</h2>
            <p className="mb-6 text-muted-foreground">
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
