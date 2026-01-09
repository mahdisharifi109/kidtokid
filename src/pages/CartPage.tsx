import { Header } from "@/src/components/layout/Header"
import { Footer } from "@/src/components/Footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trash2, Plus, Minus } from "lucide-react"
import { useCart } from "@/src/contexts/CartContext"
import { toast } from "sonner"
import { Link } from "react-router-dom"

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart()

  const handleRemove = (productId: string, title: string) => {
    removeFromCart(productId)
    toast.success("Removido do carrinho", { description: title })
  }

  const handleClearCart = () => {
    clearCart()
    toast.success("Carrinho limpo")
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="mb-4 text-3xl font-bold">Carrinho Vazio</h1>
          <p className="mb-8 text-muted-foreground">Ainda não adicionou produtos ao carrinho.</p>
          <Link to="/">
            <Button className="bg-k2k-pink hover:bg-k2k-pink/90">Continuar a Comprar</Button>
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">Carrinho de Compras</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.product.id} className="p-4 transition-shadow hover:shadow-md">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-k2k-gray">
                      <img
                        src={item.product.images[0] || "/placeholder.svg"}
                        alt={item.product.title}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <h3 className="font-medium">{item.product.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.product.brand}</p>
                        <p className="text-sm text-muted-foreground">
                          Tamanho: {item.product.size} • Estado:{" "}
                          {item.product.condition === "new"
                            ? "Novo"
                            : item.product.condition === "good"
                              ? "Bom"
                              : "Usado"}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.product.stock <= item.quantity}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="font-bold text-k2k-pink">
                            €{(item.product.price * item.quantity).toFixed(2)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemove(item.product.id, item.product.title)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Button variant="outline" className="mt-4 bg-transparent" onClick={handleClearCart}>
              Limpar Carrinho
            </Button>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24 p-6">
              <h2 className="mb-4 text-xl font-semibold">Resumo do Pedido</h2>

              <div className="space-y-3 border-b pb-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>€{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Portes</span>
                  <span>{totalPrice >= 60 ? "Grátis" : "€3.99"}</span>
                </div>
              </div>

              <div className="my-4 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-k2k-pink">
                  €{(totalPrice + (totalPrice >= 60 ? 0 : 3.99)).toFixed(2)}
                </span>
              </div>

              <Button className="w-full bg-k2k-pink hover:bg-k2k-pink/90">Finalizar Compra</Button>

              <div className="mt-4 rounded-lg bg-k2k-gray p-4 text-center text-sm">
                {totalPrice >= 60 ? (
                  <p className="font-medium text-green-600">Portes grátis aplicados!</p>
                ) : (
                  <p>
                    Faltam <span className="font-bold">€{(60 - totalPrice).toFixed(2)}</span> para portes grátis
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
