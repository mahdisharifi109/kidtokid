

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { IProduct } from "@/src/types"

interface FavoritesContextType {
  favorites: IProduct[]
  addToFavorites: (product: IProduct) => void
  removeFromFavorites: (productId: string) => void
  isFavorite: (productId: string) => boolean
  toggleFavorite: (product: IProduct) => void
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<IProduct[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load favorites from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("k2k-favorites")
    if (stored) {
      try {
        setFavorites(JSON.parse(stored))
      } catch (e) {
        console.error("Failed to load favorites", e)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("k2k-favorites", JSON.stringify(favorites))
    }
  }, [favorites, isLoaded])

  const addToFavorites = (product: IProduct) => {
    setFavorites((current) => {
      if (current.some((p) => p.id === product.id)) {
        return current
      }
      return [...current, product]
    })
  }

  const removeFromFavorites = (productId: string) => {
    setFavorites((current) => current.filter((p) => p.id !== productId))
  }

  const isFavorite = (productId: string) => {
    return favorites.some((p) => p.id === productId)
  }

  const toggleFavorite = (product: IProduct) => {
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id)
    } else {
      addToFavorites(product)
    }
  }

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        toggleFavorite,
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
