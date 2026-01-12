import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Header } from "@/src/components/layout/Header"
import { Footer } from "@/src/components/Footer"
import { ProductCard } from "@/src/components/product/ProductCard"
import { searchProducts } from "@/src/services/productService"
import { useCart } from "@/src/contexts/CartContext"
import type { IProduct } from "@/src/types"

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get("q") || ""
  const { addToCart } = useCart()
  const [results, setResults] = useState<IProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function doSearch() {
      if (!query.trim()) {
        setResults([])
        setIsLoading(false)
        return
      }
      
      setIsLoading(true)
      try {
        const products = await searchProducts(query)
        setResults(products)
      } catch (error) {
        console.error("Erro na pesquisa:", error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }
    doSearch()
  }, [query])

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="mb-1 sm:mb-2 text-xl sm:text-2xl md:text-3xl font-bold text-k2k-pink">Resultados da Pesquisa</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {isLoading ? "A pesquisar..." : `${results.length} resultados para "${query}"`}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-k2k-pink border-t-transparent" />
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))}
          </div>
        ) : (
          <div className="py-12 sm:py-16 text-center">
            <p className="text-base sm:text-lg text-muted-foreground">Nenhum produto encontrado para "{query}"</p>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
              Tente usar palavras-chave diferentes ou navegar pelas categorias
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
