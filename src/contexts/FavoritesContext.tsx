

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { IProduct } from "@/src/types"
import { useAuth } from "@/src/contexts/AuthContext"
import { toast } from "sonner"

interface FavoritesContextType {
  favorites: IProduct[]
  addToFavorites: (product: IProduct) => boolean
  removeFromFavorites: (productId: string) => void
  isFavorite: (productId: string) => boolean
  toggleFavorite: (product: IProduct) => boolean
  requiresAuth: boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<IProduct[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const { isAuthenticated, user } = useAuth()

  // Load favorites from localStorage on mount (per user)
  useEffect(() => {
    if (isAuthenticated && user) {
      const stored = localStorage.getItem(`k2k-favorites-${user.uid}`)
      if (stored) {
        try {
          setFavorites(JSON.parse(stored))
        } catch (e) {
          console.error("Failed to load favorites", e)
        }
      } else {
        setFavorites([])
      }
    } else {
      setFavorites([])
    }
    setIsLoaded(true)
  }, [isAuthenticated, user])

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (isLoaded && isAuthenticated && user) {
      localStorage.setItem(`k2k-favorites-${user.uid}`, JSON.stringify(favorites))
    }
  }, [favorites, isLoaded, isAuthenticated, user])

  const addToFavorites = (product: IProduct): boolean => {
    if (!isAuthenticated) {
      toast.error("Precisa de iniciar sessão", {
        description: "Faça login ou crie uma conta para adicionar aos favoritos.",
        action: {
          label: "Entrar",
          onClick: () => window.location.href = "/entrar"
        }
      })
      return false
    }

    setFavorites((current) => {
      if (current.some((p) => p.id === product.id)) {
        return current
      }
      return [...current, product]
    })
    return true
  }

  const removeFromFavorites = (productId: string) => {
    setFavorites((current) => current.filter((p) => p.id !== productId))
  }

  const isFavorite = (productId: string) => {
    return favorites.some((p) => p.id === productId)
  }

  const toggleFavorite = (product: IProduct): boolean => {
    if (!isAuthenticated) {
      toast.error("Precisa de iniciar sessão", {
        description: "Faça login ou crie uma conta para adicionar aos favoritos.",
        action: {
          label: "Entrar",
          onClick: () => window.location.href = "/entrar"
        }
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

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        toggleFavorite,
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
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}

