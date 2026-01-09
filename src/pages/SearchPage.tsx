import { useSearchParams } from "react-router-dom"
import { Header } from "@/src/components/layout/Header"
import { Footer } from "@/src/components/Footer"
import { ProductCard } from "@/src/components/product/ProductCard"
import { generateMockProducts } from "@/src/lib/mockData"
import { searchProducts } from "@/src/lib/searchUtils"
import { useCart } from "@/src/contexts/CartContext"

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get("q") || ""
  const { addToCart } = useCart()

  // Generate products from all categories
  const allProducts = [
    ...generateMockProducts("brinquedos", 30),
    ...generateMockProducts("menina", 30),
    ...generateMockProducts("menino", 30),
    ...generateMockProducts("calcado", 20),
  ]

  const results = searchProducts(allProducts, query)

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold">Resultados da Pesquisa</h1>
          <p className="text-muted-foreground">
            {results.length} resultados para "{query}"
          </p>
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="text-lg text-muted-foreground">Nenhum produto encontrado para "{query}"</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Tente usar palavras-chave diferentes ou navegar pelas categorias
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
