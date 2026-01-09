import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { Header } from "@/src/components/layout/Header"
import { Footer } from "@/src/components/Footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Check } from "lucide-react"
import { useCart } from "@/src/contexts/CartContext"
import { generateMockProducts } from "@/src/lib/mockData"
import { ProductCard } from "@/src/components/product/ProductCard"

export default function ProductPage() {
  const { id = "" } = useParams<{ id: string }>()
  const { addToCart } = useCart()
  const [selectedImage, setSelectedImage] = useState(0)

  // Mock: Get product by ID (in real app, fetch from API)
  const allProducts = generateMockProducts("menina", 100)
  const product = allProducts.find((p) => p.id === id) || allProducts[0]
  const relatedProducts = allProducts.slice(0, 4)

  const isSoldOut = product.stock === 0

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-k2k-pink">
            Início
          </Link>
          <span className="mx-2">/</span>
          <Link to={`/categoria/${product.category}`} className="hover:text-k2k-pink">
            {product.category}
          </Link>
          <span className="mx-2">/</span>
          <span>{product.title}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Product Images */}
          <div>
            <div className="mb-4 aspect-square overflow-hidden rounded-lg bg-k2k-gray">
              <img
                src={product.images[selectedImage] || "/placeholder.svg?height=600&width=600&query=kids clothing"}
                alt={product.title}
                className="h-full w-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square overflow-hidden rounded-lg border-2 ${
                      selectedImage === idx ? "border-k2k-pink" : "border-transparent"
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
            <Badge className="mb-2 bg-k2k-blue">{product.category}</Badge>
            <h1 className="mb-2 text-3xl font-bold">{product.title}</h1>
            <p className="mb-4 text-lg text-muted-foreground">{product.brand}</p>

            <div className="mb-6 flex items-center gap-4">
              <span className="text-3xl font-bold text-k2k-pink">€{product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-xl text-muted-foreground line-through">€{product.originalPrice.toFixed(2)}</span>
              )}
            </div>

            <Card className="mb-6 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tamanho</p>
                  <p className="font-medium">{product.size}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <p className="font-medium capitalize">
                    {product.condition === "new" ? "Novo" : product.condition === "good" ? "Bom" : "Usado"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Género</p>
                  <p className="font-medium capitalize">{product.gender || "Unisex"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Stock</p>
                  <p className="font-medium">{isSoldOut ? "Esgotado" : "Disponível"}</p>
                </div>
              </div>
            </Card>

            <Button
              size="lg"
              className="mb-4 w-full bg-k2k-pink text-white hover:bg-k2k-pink/90"
              disabled={isSoldOut}
              onClick={() => addToCart(product)}
            >
              {isSoldOut ? (
                "Esgotado"
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Adicionar ao Carrinho
                </>
              )}
            </Button>

            <div className="mb-6 space-y-2 rounded-lg bg-k2k-gray p-4">
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-600" />
                <span>Portes grátis acima de €60</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-600" />
                <span>Artigo de segunda mão verificado</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-600" />
                <span>Pagamento seguro</span>
              </div>
            </div>

            <div>
              <h2 className="mb-2 font-semibold">Descrição</h2>
              <p className="text-sm text-muted-foreground">
                {product.description || "Artigo de segunda mão em excelente estado. Perfeito para crianças ativas!"}
              </p>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-bold">Produtos Relacionados</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
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
