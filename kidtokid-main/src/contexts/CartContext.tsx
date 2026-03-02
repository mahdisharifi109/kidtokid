
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { IProduct, ICartItem } from "@/src/types"
import { toast } from "sonner"
import { getProductById } from "@/src/services/productService"

interface CartContextType {
  items: ICartItem[]
  addToCart: (product: IProduct) => boolean
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  requiresAuth: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ICartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('k2k-cart')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) {
            return parsed
          }
        } catch (e) {
          console.error('Failed to parse cart from localStorage', e)
        }
      }
    }
    return []
  })

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem('k2k-cart', JSON.stringify(items))
  }, [items])

  // Validate cart items on load — remove unavailable/out-of-stock products
  useEffect(() => {
    let cancelled = false
    async function validateCart() {
      if (items.length === 0) return
      const removedTitles: string[] = []

      const validItems = await Promise.all(
        items.map(async (item) => {
          try {
            const product = await getProductById(item.product.id)
            if (!product || product.stock <= 0) {
              removedTitles.push(item.product.title)
              return null
            }
            // Update product data with latest from Firestore
            return { ...item, product }
          } catch {
            return item // Keep on error — don't remove if network fails
          }
        })
      )

      if (cancelled) return

      const filtered = validItems.filter(Boolean) as ICartItem[]
      if (removedTitles.length > 0) {
        setItems(filtered)
        toast.info(
          removedTitles.length === 1
            ? `"${removedTitles[0]}" foi removido do carrinho (indisponível)`
            : `${removedTitles.length} artigos removidos do carrinho (indisponíveis)`
        )
      }
    }
    validateCart()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only on mount

  const addToCart = useCallback((product: IProduct): boolean => {
    let added = false
    setItems((currentItems) => {
      // Check against the latest state inside the setter to avoid stale closure
      const exists = currentItems.some((item) => item.product.id === product.id)
      if (exists) {
        return currentItems // No change
      }
      added = true
      return [...currentItems, { product, quantity: 1 }]
    })
    return added
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.product.id !== productId))
  }, [])

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId)
        return
      }

      setItems((currentItems) =>
        currentItems.map((item) => (item.product.id === productId ? { ...item, quantity } : item)),
      )
    },
    [removeFromCart],
  )

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        requiresAuth: false,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

