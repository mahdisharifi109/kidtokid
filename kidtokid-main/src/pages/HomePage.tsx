import { useState, useEffect, useCallback } from "react"
import { Header } from "@/src/components/layout/Header"
import { ProductCard, ProductCardSkeleton } from "@/src/components/product/ProductCard"
import { HeroSlider } from "@/src/components/HeroSlider"
import { CategoryGrid } from "@/src/components/CategoryGrid"
import { Footer } from "@/src/components/Footer"
import type { IProduct } from "@/src/types"
import { useCart } from "@/src/contexts/CartContext"
import { getProductsPaginated } from "@/src/services/productService"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import type { DocumentData } from "firebase/firestore"

const PAGE_SIZE = 20

export default function HomePage() {
  const { addToCart } = useCart()
  const [products, setProducts] = useState<IProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [lastDoc, setLastDoc] = useState<DocumentData | null>(null)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    async function loadProducts() {
      try {
        const result = await getProductsPaginated(PAGE_SIZE)
        setProducts(result.products)
        setLastDoc(result.lastDoc)
        setHasMore(result.products.length === PAGE_SIZE)
      } catch (error) {
        console.error("Erro ao carregar produtos:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadProducts()
  }, [])

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || !lastDoc) return
    setIsLoadingMore(true)
    try {
      const result = await getProductsPaginated(PAGE_SIZE, lastDoc)
      setProducts((prev) => [...prev, ...result.products])
      setLastDoc(result.lastDoc)
      setHasMore(result.products.length === PAGE_SIZE)
    } catch (error) {
      console.error("Erro ao carregar mais produtos:", error)
    } finally {
      setIsLoadingMore(false)
    }
  }, [hasMore, isLoadingMore, lastDoc])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />

      <main className="container mx-auto px-4 sm:px-5 py-6 sm:py-8 md:py-10 page-enter">
        <h1 className="sr-only">Kid to Kid Braga | Roupa de Criança</h1>
        <HeroSlider />
        <CategoryGrid />

        <section>
          <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">
            <div className="h-px flex-1 max-w-16 bg-linear-to-r from-transparent to-gray-200 dark:to-gray-700" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-center tracking-tight text-gray-800 dark:text-gray-100">Produtos em Destaque</h2>
            <div className="h-px flex-1 max-w-16 bg-linear-to-l from-transparent to-gray-200 dark:to-gray-700" />
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {products.map((product) => (
                  <div key={product.id} className="stagger-item">
                    <ProductCard product={product} onAddToCart={addToCart} />
                  </div>
                ))}
              </div>
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    className="px-8"
                  >
                    {isLoadingMore ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> A carregar...</>
                    ) : (
                      "Ver mais produtos"
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 text-gray-400 dark:text-gray-500">
              <p className="text-base">De momento não temos novidades por aqui</p>
              <p className="text-sm mt-2">Estamos a preparar peças especiais — volta em breve!</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}

