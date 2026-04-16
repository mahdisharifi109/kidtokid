import type React from "react"
import { useState } from "react"

import { ShoppingCart, Heart, ImageOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import type { IProduct } from "@/src/types"
import { getConditionLabel } from "@/src/types"
import { Link, useNavigate } from "react-router-dom"
import { useFavorites } from "@/src/contexts/FavoritesContext"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { OptimizedImage } from "@/src/components/OptimizedImage"

interface ProductCardProps {
  product: IProduct
  onAddToCart?: (product: IProduct) => boolean
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const isSoldOut = product.stock === 0
  const hasDiscount = product.originalPrice && product.originalPrice > product.price
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorite = isFavorite(product.id)
  const [imgError, setImgError] = useState(false)
  const navigate = useNavigate()

  const handleAddToCart = () => {
    if (!onAddToCart) return
    const added = onAddToCart(product)
    if (added === true) {
      toast.success("Adicionado ao carrinho!", {
        description: product.title,
        action: {
          label: "Ver Carrinho",
          onClick: () => navigate("/carrinho")
        }
      })
    } else {
      toast.info("Este artigo já está no carrinho", {
        description: product.title
      })
    }
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(product)
    toast.success(favorite ? "Removido dos favoritos" : "Adicionado aos favoritos ♡", {
      description: product.title
    })
  }

  return (
    <Card className="group relative overflow-hidden rounded-2xl border-0 bg-white dark:bg-gray-900 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <button
        onClick={handleToggleFavorite}
        className={cn(
          "absolute right-2.5 top-2.5 z-10 rounded-full p-2 shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-110 active:scale-95",
          favorite ? "bg-pink-50/90 dark:bg-pink-950/60 hover:bg-pink-100" : "bg-white/80 dark:bg-gray-800/80 hover:bg-white"
        )}
        aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-all duration-300",
            favorite && "fill-pink-400 text-pink-400 animate-[heartbeat_0.3s_ease-in-out]"
          )}
        />
      </button>

      <Link to={`/produto/${product.id}`}>
        <div className="aspect-square overflow-hidden rounded-t-2xl bg-gray-50 dark:bg-gray-800 relative">
          {imgError ? (
            <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <ImageOff className="h-10 w-10 text-gray-300 dark:text-gray-600" />
            </div>
          ) : (
            <OptimizedImage
              src={(product.images && product.images[0]) || product.imageUrl || "/placeholder.svg?height=300&width=300"}
              alt={product.title}
              onError={() => setImgError(true)}
              className="h-full w-full"
              imgClassName="transition-transform duration-500 ease-out group-hover:scale-105"
            />
          )}
          {isSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
              <span className="rounded-full bg-white px-4 py-1.5 text-xs font-medium tracking-wide">Vendido</span>
            </div>
          )}
          {hasDiscount && !isSoldOut && (
            <div className="absolute top-2.5 left-2.5 z-10">
              <span className="inline-flex items-center rounded-full bg-red-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
                -{Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}%
              </span>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-3 sm:p-4">
        <p className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider truncate">{product.brand}</p>

        <Link to={`/produto/${product.id}`}>
          <h3 className="mt-1 line-clamp-2 text-sm font-medium text-gray-800 dark:text-gray-100 hover:text-k2k-blue transition-colors leading-snug min-h-[2.5em]">{product.title}</h3>
        </Link>

        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-gray-400 dark:text-gray-500">
          <span>{product.size}</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span>{getConditionLabel(product.condition)}</span>
        </div>

        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-base sm:text-lg font-semibold text-k2k-blue">{product.price.toFixed(2)}€</span>
          {hasDiscount && (
            <span className="text-xs text-gray-300 dark:text-gray-600 line-through">{product.originalPrice?.toFixed(2)}€</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-3 sm:p-4 pt-0">
        <Button
          className="w-full rounded-xl bg-k2k-blue text-white transition-all hover:bg-k2k-blue/90 active:scale-[0.98] text-sm h-10"
          disabled={isSoldOut}
          onClick={handleAddToCart}
        >
          {isSoldOut ? (
            "Esgotado"
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Adicionar
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border-0 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
      <div className="aspect-square skeleton" />
      <div className="p-3 sm:p-4 space-y-2.5">
        <div className="h-3 w-16 skeleton rounded" />
        <div className="h-4 w-full skeleton rounded" />
        <div className="h-3 w-24 skeleton rounded" />
        <div className="h-5 w-20 skeleton rounded mt-3" />
      </div>
      <div className="p-3 sm:p-4 pt-0">
        <div className="h-10 w-full skeleton rounded-xl" />
      </div>
    </div>
  )
}

