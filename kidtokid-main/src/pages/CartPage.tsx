import { Link, useNavigate } from "react-router-dom"
import { Header } from "@/src/components/layout/Header"
import { Footer } from "@/src/components/Footer"
import { Button } from "@/components/ui/button"
import { Trash2, Plus, Minus, ArrowRight, Heart } from "lucide-react"
import { useCart } from "@/src/contexts/CartContext"
import { useFavorites } from "@/src/contexts/FavoritesContext"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { IProduct } from "@/src/types"
import { getConditionLabel } from "@/src/types"
import { useState, useEffect } from "react"
import { usePageTitle } from "@/src/hooks/usePageTitle"
import { getStoreSettings, defaultSettings, type StoreSettings } from "@/src/services/settingsService"

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart()
  const { addToFavorites, isFavorite } = useFavorites()
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(defaultSettings)
  const navigate = useNavigate()
  usePageTitle("Carrinho")

  useEffect(() => {
    getStoreSettings().then(setStoreSettings)
  }, [])

  const freeShippingThreshold = storeSettings.freeShippingThreshold
  const shippingCost = totalPrice >= freeShippingThreshold ? 0 : storeSettings.standardShippingCost
  const protectionFee = storeSettings.protectionFee ?? 0.50
  const progressToFreeShipping = Math.min((totalPrice / freeShippingThreshold) * 100, 100)
  const savings = items.reduce((sum, item) => {
    const original = item.product.originalPrice || item.product.price
    return sum + (original - item.product.price) * item.quantity
  }, 0)

  const handleRemove = (productId: string, title: string) => {
    setRemovingId(productId)
    setTimeout(() => {
      removeFromCart(productId)
      setRemovingId(null)
      toast.success("Produto removido", { description: title })
    }, 300)
  }

  const handleMoveToFavorites = (productId: string, product: IProduct) => {
    if (addToFavorites(product)) {
      setRemovingId(productId)
      setTimeout(() => {
        removeFromCart(productId)
        setRemovingId(null)
        toast.success("Guardado para depois", {
          description: "O produto foi movido para os favoritos",
          action: {
            label: "Ver Favoritos",
            onClick: () => navigate("/favoritos")
          }
        })
      }, 300)
    }
  }

  const handleClearCart = () => {
    if (window.confirm("Tens a certeza que queres esvaziar o carrinho?")) {
      clearCart()
      toast.success("Carrinho esvaziado")
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
          <p className="text-5xl mb-4">🛒</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">O teu carrinho está vazio</h1>
          <p className="text-gray-500 mb-8 max-w-md">
            Explora as nossas novidades e encontra peças únicas para os teus pequenos!
          </p>
          <Link to="/">
            <Button className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-sm font-medium">
              Começar a comprar
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

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Carrinho <span className="text-gray-400 font-normal text-base ml-1">({items.length})</span>
          </h1>
          <Link to="/" className="text-sm text-blue-600 hover:underline">
            Continuar a comprar
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Items */}
          <div className="lg:col-span-2 space-y-0">
            {/* Free shipping bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5 text-sm">
                <span className="text-gray-600">
                  {totalPrice >= freeShippingThreshold
                    ? "✓ Portes grátis"
                    : `Faltam €${(freeShippingThreshold - totalPrice).toFixed(2)} para portes grátis`}
                </span>
                <span className="text-gray-400 text-xs">{Math.round(progressToFreeShipping)}%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-1000 ease-out rounded-full"
                  style={{ width: `${progressToFreeShipping}%` }}
                />
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-200">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className={cn(
                    "p-4 transition-all duration-300",
                    removingId === item.product.id && "opacity-0 scale-95"
                  )}
                >
                  <div className="flex gap-4">
                    {/* Image */}
                    <Link to={`/produto/${item.product.id}`} className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-50">
                      <img
                        src={item.product.images[0] || "/placeholder.svg"}
                        alt={item.product.title}
                        className="h-full w-full object-cover"
                      />
                    </Link>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <p className="text-xs text-gray-400 uppercase tracking-wide">{item.product.brand}</p>
                          <Link to={`/produto/${item.product.id}`}>
                            <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate hover:text-blue-600 transition-colors">
                              {item.product.title}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            <span>{item.product.size}</span>
                            <span>·</span>
                            <span>{getConditionLabel(item.product.condition)}</span>
                          </div>
                        </div>
                        <p className="font-semibold text-gray-900 whitespace-nowrap">€{(item.product.price * item.quantity).toFixed(2)}</p>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-gray-200 rounded h-8">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="px-2.5 h-full flex items-center hover:bg-gray-50 text-gray-500 disabled:opacity-30 transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-7 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.product.stock <= item.quantity}
                            className="px-2.5 h-full flex items-center hover:bg-gray-50 text-gray-500 disabled:opacity-30 transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          {!isFavorite(item.product.id) && (
                            <button
                              className="p-1.5 text-gray-400 hover:text-pink-500 transition-colors"
                              onClick={() => handleMoveToFavorites(item.product.id, item.product)}
                              title="Guardar para depois"
                            >
                              <Heart className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                            onClick={() => handleRemove(item.product.id, item.product.title)}
                            title="Remover"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-2">
              <button onClick={handleClearCart} className="text-xs text-gray-400 hover:text-red-500 transition-colors py-1">
                Esvaziar carrinho
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-24">
            <div className="border border-gray-200 rounded-lg p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Resumo</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.length} artigos)</span>
                  <span>€{totalPrice.toFixed(2)}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Poupança</span>
                    <span>-€{savings.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Envio (est.)</span>
                  {shippingCost === 0 ? (
                    <span className="text-green-600 font-medium">Grátis</span>
                  ) : (
                    <span>€{shippingCost.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Proteção do comprador</span>
                  <span>€{protectionFee.toFixed(2)}</span>
                </div>

                {totalPrice < freeShippingThreshold && (
                  <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded text-center">
                    + €{(freeShippingThreshold - totalPrice).toFixed(2)} para envio grátis
                  </p>
                )}

                <div className="border-t pt-3 mt-3 flex justify-between items-end">
                  <span className="font-semibold text-gray-900">Total</span>
                  <div className="text-right">
                    <span className="block font-bold text-xl text-gray-900">€{(totalPrice + shippingCost + protectionFee).toFixed(2)}</span>
                    <span className="text-xs text-gray-400">IVA incluído</span>
                  </div>
                </div>
              </div>

              <Link to="/checkout" className="block mt-5">
                <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-medium">
                  Finalizar Compra
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              <p className="text-xs text-center text-gray-400 mt-3">
                Pagamento seguro · Devolução até 14 dias
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

