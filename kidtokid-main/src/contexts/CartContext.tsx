
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { IProduct, ICartItem } from "@/src/types"
import { toast } from "sonner"
import { getProductById } from "@/src/services/productService"
import { doc, setDoc, onSnapshot } from "firebase/firestore"
import { db } from "@/src/lib/firebase"
import { useAuth } from "@/src/contexts/AuthContext"
import { validateCartFromStorage } from "@/src/lib/validators"

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
  const { user } = useAuth()
  
  const [items, setItems] = useState<ICartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('k2k-cart')
      return validateCartFromStorage(saved)
    }
    return []
  })

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem('k2k-cart', JSON.stringify(items))
  }, [items])

  // Sync cart to Firestore for authenticated users (fire-and-forget with error catching)
  useEffect(() => {
    if (!user || !user.uid) return
    
    const syncToFirebase = async () => {
      try {
        const cartRef = doc(db, 'carts', user.uid)
        const cartData = {
          items: items.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            // Store product snapshot for quick access
            product: {
              id: item.product.id,
              title: item.product.title,
              price: item.product.price,
              condition: item.product.condition,
            }
          })),
          lastUpdated: new Date().toISOString(),
        }
        
        await setDoc(cartRef, cartData, { merge: true })
        console.debug('[Cart] Synced to Firestore')
      } catch (error) {
        // Fail silently - localStorage is primary fallback
        console.warn('[Cart] Failed to sync to Firestore:', error)
      }
    }
    
    // Debounce: only sync if no changes for 2 seconds
    const timeoutId = setTimeout(() => {
      syncToFirebase()
    }, 2000)
    
    return () => clearTimeout(timeoutId)
  }, [items, user])

  // Load cart from Firestore on user login (merge with localStorage)
  useEffect(() => {
    if (!user || !user.uid) return
    
    let unsubscribe: (() => void) | undefined
    
    const setupListener = async () => {
      try {
        const cartRef = doc(db, 'carts', user.uid)
        unsubscribe = onSnapshot(
          cartRef,
          (snapshot) => {
            if (!snapshot.exists()) {
              console.debug('[Cart] No cart found in Firestore')
              return
            }
            
            const data = snapshot.data() as { items?: unknown[] } | undefined
            if (!data?.items) return
            
            // Only update if Firestore has a more recent version
            const localCart = items
            const remoteItems = data.items as Array<{
              productId: string
              quantity: number
              product?: Record<string, unknown>
            }>
            
            // Merge: keep local additions but update quantities from Firestore
            const mergedItems = localCart.map(item => {
              const remoteItem = remoteItems.find(r => r.productId === item.product.id)
              return remoteItem ? { ...item, quantity: remoteItem.quantity } : item
            })
            
            // Add items that are in Firestore but not locally
            const localProductIds = new Set(localCart.map(item => item.product.id))
            for (const remoteItem of remoteItems) {
              if (!localProductIds.has(remoteItem.productId) && remoteItem.product) {
                const productData = remoteItem.product as Record<string, unknown>
                // Validate product has required fields before adding
                if (
                  typeof productData.id === 'string' &&
                  typeof productData.title === 'string' &&
                  typeof productData.price === 'number' &&
                  productData.price > 0
                ) {
                  const product = productData as unknown as IProduct
                  mergedItems.push({
                    product,
                    quantity: remoteItem.quantity,
                  })
                }
              }
            }
            
            setItems(mergedItems)
            console.debug('[Cart] Loaded from Firestore and merged with local')
          },
          (error) => {
            // Fail silently on listener setup error
            console.warn('[Cart] Failed to setup Firestore listener:', error)
          }
        )
      } catch (error) {
        console.warn('[Cart] Failed to setup cart sync:', error)
      }
    }
    
    setupListener()
    
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [user])

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
    throw new Error("useCart deve ser usado dentro de um CartProvider")
  }
  return context
}

