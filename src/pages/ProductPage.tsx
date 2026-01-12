import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Header } from "@/src/components/layout/Header"
import { Footer } from "@/src/components/Footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Check } from "lucide-react"
import { useCart } from "@/src/contexts/CartContext"
import { getProductById, getProductsByCategory } from "@/src/services/productService"
import { ProductCard } from "@/src/components/product/ProductCard"
import type { IProduct } from "@/src/types"

export default function ProductPage() {
  const { id = "" } = useParams<{ id: string }>()
  const { addToCart } = useCart()
  const [selectedImage, setSelectedImage] = useState(0)
  const [product, setProduct] = useState<IProduct | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<IProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadProduct() {
      setIsLoading(true)
      try {
        const fetchedProduct = await getProductById(id)
        setProduct(fetchedProduct)
        
        // Carregar produtos relacionados da mesma categoria
        if (fetchedProduct) {
          const related = await getProductsByCategory(fetchedProduct.category)
          // Excluir o produto atual e limitar a 4
          setRelatedProducts(related.filter(p => p.id !== id).slice(0, 4))
        }
      } catch (error) {
        console.error("Erro ao carregar produto:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadProduct()
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-k2k-blue border-t-transparent" />
        </div>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
          <p className="text-gray-500 mb-6">O produto que procura não existe ou foi removido.</p>
          <Link to="/">
            <Button>Voltar à página inicial</Button>
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const isSoldOut = product.stock === 0

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        {/* Breadcrumb */}
        <div className="mb-4 sm:mb-6 text-xs sm:text-sm text-muted-foreground overflow-x-auto whitespace-nowrap scrollbar-hide">
          <Link to="/" className="hover:text-k2k-blue">
            Início
          </Link>
          <span className="mx-1 sm:mx-2">/</span>
          <Link to={`/categoria/${product.category}`} className="hover:text-k2k-blue capitalize">
            {product.category}
          </Link>
          <span className="mx-1 sm:mx-2">/</span>
          <span className="text-muted-foreground/70">{product.title}</span>
        </div>

        <div className="grid gap-4 sm:gap-6 md:gap-8 lg:grid-cols-2">
          {/* Product Images */}
          <div>
            <div className="mb-2 sm:mb-4 aspect-square overflow-hidden rounded-lg bg-k2k-gray">
              <img
                src={product.images[selectedImage] || "/placeholder.svg?height=600&width=600&query=kids clothing"}
                alt={product.title}
                className="h-full w-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square overflow-hidden rounded-md sm:rounded-lg border-2 ${
                      selectedImage === idx ? "border-k2k-blue" : "border-transparent"
                    }`}
                  >
                    <img
                      src={img || "/placeholder.svg"}
                      alt={`${product.title} ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <Badge className="mb-2 bg-k2k-blue text-xs sm:text-sm">{product.category}</Badge>
            <h1 className="mb-2 text-xl sm:text-2xl md:text-3xl font-bold">{product.title}</h1>
            <p className="mb-3 sm:mb-4 text-base sm:text-lg text-muted-foreground">{product.brand}</p>

            <div className="mb-4 sm:mb-6 flex items-center gap-2 sm:gap-4 flex-wrap">
              <span className="text-2xl sm:text-3xl font-bold text-k2k-blue">€{product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-base sm:text-xl text-muted-foreground line-through">€{product.originalPrice.toFixed(2)}</span>
              )}
            </div>

            <Card className="mb-4 sm:mb-6 p-3 sm:p-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Tamanho</p>
                  <p className="font-medium text-sm sm:text-base">{product.size}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Estado</p>
                  <p className="font-medium text-sm sm:text-base capitalize">
                    {product.condition === "new" ? "Novo" : product.condition === "good" ? "Bom" : "Usado"}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Género</p>
                  <p className="font-medium text-sm sm:text-base capitalize">{product.gender || "Unisex"}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Stock</p>
                  <p className="font-medium text-sm sm:text-base">{isSoldOut ? "Esgotado" : "Disponível"}</p>
                </div>
              </div>
            </Card>

            <Button
              size="lg"
              className="mb-3 sm:mb-4 w-full bg-k2k-blue text-white hover:bg-k2k-blue/90 text-sm sm:text-base h-11 sm:h-12"
              disabled={isSoldOut}
              onClick={() => addToCart(product)}
            >
              {isSoldOut ? (
                "Esgotado"
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Adicionar ao Carrinho
                </>
              )}
            </Button>

            <div className="mb-4 sm:mb-6 space-y-2 rounded-lg bg-k2k-gray p-3 sm:p-4">
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 shrink-0" />
                <span>Portes grátis acima de €60</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 shrink-0" />
                <span>Artigo de segunda mão verificado</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 shrink-0" />
                <span>Pagamento seguro</span>
              </div>
            </div>

            <div>
              <h2 className="mb-2 font-semibold text-sm sm:text-base">Descrição</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {product.description || "Artigo de segunda mão em excelente estado. Perfeito para crianças ativas!"}
              </p>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <section className="mt-8 sm:mt-12 md:mt-16">
          <h2 className="mb-4 sm:mb-6 text-lg sm:text-xl md:text-2xl font-bold text-k2k-blue">Produtos Relacionados</h2>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={addToCart} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

