import { useState, useEffect } from "react"
import { Header } from "@/src/components/layout/Header"
import { ProductCard } from "@/src/components/product/ProductCard"
import { HeroSlider } from "@/src/components/HeroSlider"
import { CategoryGrid } from "@/src/components/CategoryGrid"
import { Footer } from "@/src/components/Footer"
import type { IProduct } from "@/src/types"
import { useCart } from "@/src/contexts/CartContext"
import { getAllProducts } from "@/src/services/productService"

export default function HomePage() {
  const { addToCart } = useCart()
  const [products, setProducts] = useState<IProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadProducts() {
      try {
        const allProducts = await getAllProducts()
        // Mostrar os 10 mais recentes
        setProducts(allProducts.slice(0, 10))
      } catch (error) {
        console.error("Erro ao carregar produtos:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadProducts()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        {/* Hero Slider */}
        <HeroSlider />

        {/* Category Grid */}
        <CategoryGrid />

        {/* Shipping Info */}
        <section className="mb-6 md:mb-8 rounded-lg bg-k2k-gray p-4 sm:p-6 text-center">
          <p className="text-xs sm:text-sm font-medium">Portes Grátis em compras superiores a €60,00 para Portugal Continental.</p>
          <p className="text-xs sm:text-sm text-muted-foreground">3,99€ em compras superiores a 39,99€</p>
        </section>

        {/* Products Section */}
        <section>
          <h2 className="mb-4 sm:mb-6 text-lg sm:text-xl md:text-2xl font-bold text-center text-k2k-pink">Produtos em Destaque</h2>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-k2k-pink border-t-transparent" />
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>Ainda não há produtos disponíveis.</p>
              <p className="text-sm mt-2">Os produtos serão adicionados em breve!</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
