import { Header } from "@/src/components/layout/Header"
import { Footer } from "@/src/components/Footer"
import { ProductCard } from "@/src/components/product/ProductCard"
import { useFavorites } from "@/src/contexts/FavoritesContext"
import { useCart } from "@/src/contexts/CartContext"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { useState } from "react"
import { usePageTitle } from "@/src/hooks/usePageTitle"
import { cn } from "@/lib/utils"

export default function FavoritesPage() {
  const { favorites, clearFavorites } = useFavorites()
  const { addToCart, items: cartItems } = useCart()
  const [sortBy, setSortBy] = useState<'date' | 'price-asc' | 'price-desc'>('date')
  const [removingId] = useState<string | null>(null)
  usePageTitle("Favoritos")

  const sortedFavorites = sortBy === 'date'
    ? [...favorites].reverse()
    : [...favorites].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price
      return b.price - a.price
    })

  const totalValue = favorites.reduce((sum, p) => sum + p.price, 0)
  const availableProducts = favorites.filter(p => p.stock > 0)
  const isInCart = (productId: string) => cartItems.some(item => item.product.id === productId)

  const handleAddAllToCart = () => {
    let added = 0
    availableProducts.forEach(product => {
      if (!isInCart(product.id)) {
        addToCart(product)
        added++
      }
    })
    if (added > 0) {
      toast.success(`${added} produtos adicionados ao carrinho!`)
    } else {
      toast.info("Todos os produtos já estão no carrinho")
    }
  }

  const handleClearAll = () => {
    if (window.confirm("Tens a certeza que queres remover todos os favoritos?")) {
      clearFavorites()
      toast.success("Favoritos limpos")
    }
  }

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
          <Heart className="h-12 w-12 text-gray-300 mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Sem favoritos</h1>
          <p className="text-gray-500 mb-6 max-w-sm text-sm">
            Guarda artigos que gostas clicando no coração.
          </p>
          <Link to="/">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Explorar produtos
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Os Meus Favoritos</h1>
            <p className="text-sm text-gray-500 mt-1">
              {favorites.length} artigos · €{totalValue.toFixed(2)} total
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleClearAll} className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
              <Trash2 className="h-4 w-4" />
              Limpar
            </Button>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-600">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white"
            >
              <option value="date">Mais recentes</option>
              <option value="price-asc">Preço: menor</option>
              <option value="price-desc">Preço: maior</option>
            </select>
            <span className="hidden sm:inline text-gray-400">
              {availableProducts.length} disponíveis
            </span>
          </div>
          <Button
            onClick={handleAddAllToCart}
            disabled={availableProducts.length === 0}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Adicionar todos ao carrinho
          </Button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {sortedFavorites.map((product) => (
            <div
              key={product.id}
              className={cn(
                "transition-all duration-300",
                removingId === product.id && "opacity-0 scale-90",
              )}
            >
              <div className="relative">
                <ProductCard product={product} onAddToCart={addToCart} />
                {isInCart(product.id) && (
                  <div className="absolute top-12 right-1.5 sm:right-2 z-10">
                    <div className="bg-green-600 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                      <ShoppingCart className="h-3 w-3 inline" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 text-center">
          <Link to="/carrinho">
            <Button variant="outline" className="text-sm">
              Ver carrinho ({cartItems.length})
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}

