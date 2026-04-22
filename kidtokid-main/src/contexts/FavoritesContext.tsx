

/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { IProduct } from "@/src/types"
import { useAuth } from "@/src/contexts/AuthContext"
import { toast } from "sonner"
import {
  getUserFavorites,
  addFavoriteToFirestore,
  removeFavoriteFromFirestore,
  clearFavoritesFromFirestore,
} from "@/src/services/favoritesService"

interface FavoritesContextType {
  favorites: IProduct[]
  addToFavorites: (product: IProduct) => boolean
  removeFromFavorites: (productId: string) => void
  isFavorite: (productId: string) => boolean
  toggleFavorite: (product: IProduct) => boolean
  clearFavorites: () => void
  favoritesCount: number
  requiresAuth: boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<IProduct[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const { isAuthenticated, user } = useAuth()

  // Load favorites from Firestore on mount (per user)
  useEffect(() => {
    if (isAuthenticated && user) {
      getUserFavorites(user.uid)
        .then((firestoreFavorites) => {
          setFavorites(firestoreFavorites)
        })
        .catch((e) => {
          console.error("Failed to load favorites from Firestore", e)
          // Fallback: try localStorage
          const stored = localStorage.getItem(`k2k-favorites-${user.uid}`)
          if (stored) {
            try {
              setFavorites(JSON.parse(stored))
            } catch {
              // ignore
            }
          }
        })
        .finally(() => setIsLoaded(true))
    } else {
      // Intentional: clear favorites when user signs out
      Promise.resolve().then(() => {
        setFavorites([])
        setIsLoaded(true)
      })
    }
  }, [isAuthenticated, user])

  // Save favorites to localStorage as cache whenever they change
  useEffect(() => {
    if (isLoaded && isAuthenticated && user) {
      localStorage.setItem(`k2k-favorites-${user.uid}`, JSON.stringify(favorites))
    }
  }, [favorites, isLoaded, isAuthenticated, user])

  const addToFavorites = (product: IProduct): boolean => {
    if (!isAuthenticated || !user) {
      toast.error("Precisa de iniciar sessão", {
        description: "Faça login ou crie uma conta para adicionar aos favoritos.",
      })
      return false
    }

    setFavorites((current) => {
      if (current.some((p) => p.id === product.id)) {
        return current
      }
      return [...current, product]
    })

    // Sync to Firestore (fire-and-forget)
    addFavoriteToFirestore(user.uid, product).catch((e) =>
      console.error("Failed to sync favorite to Firestore", e)
    )

    return true
  }

  const removeFromFavorites = (productId: string) => {
    setFavorites((current) => current.filter((p) => p.id !== productId))

    // Sync to Firestore
    if (user) {
      removeFavoriteFromFirestore(user.uid, productId).catch((e) =>
        console.error("Failed to remove favorite from Firestore", e)
      )
    }
  }

  const isFavorite = (productId: string) => {
    return favorites.some((p) => p.id === productId)
  }

  const toggleFavorite = (product: IProduct): boolean => {
    if (!isAuthenticated) {
      toast.error("Precisa de iniciar sessão", {
        description: "Faça login ou crie uma conta para adicionar aos favoritos.",
      })
      return false
    }

    if (isFavorite(product.id)) {
      removeFromFavorites(product.id)
    } else {
      addToFavorites(product)
    }
    return true
  }

  const clearFavorites = () => {
    setFavorites([])
    if (isAuthenticated && user) {
      localStorage.removeItem(`k2k-favorites-${user.uid}`)
      clearFavoritesFromFirestore(user.uid).catch((e) =>
        console.error("Failed to clear favorites from Firestore", e)
      )
    }
  }

  const favoritesCount = favorites.length

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        toggleFavorite,
        clearFavorites,
        favoritesCount,
        requiresAuth: !isAuthenticated,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error("useFavorites deve ser usado dentro de um FavoritesProvider")
  }
  return context
}

