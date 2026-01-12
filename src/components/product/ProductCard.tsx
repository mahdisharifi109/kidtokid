import type React from "react"

import { ShoppingCart, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import type { IProduct } from "@/src/types"
import { Link } from "react-router-dom"
import { useFavorites } from "@/src/contexts/FavoritesContext"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: IProduct
  onAddToCart?: (product: IProduct) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const isSoldOut = product.stock === 0
  const hasDiscount = product.originalPrice && product.originalPrice > product.price
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorite = isFavorite(product.id)

  const handleAddToCart = () => {
    onAddToCart?.(product)
    toast.success("Adicionado ao carrinho!", {
      description: product.title,
    })
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(product)
    toast.success(favorite ? "Removido dos favoritos" : "Adicionado aos favoritos", {
      description: product.title,
    })
  }

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Favorite Button */}
      <button
        onClick={handleToggleFavorite}
        className="absolute right-1.5 top-1.5 sm:right-2 sm:top-2 z-10 rounded-full bg-white/90 p-1.5 sm:p-2 shadow-md transition-all hover:scale-110"
        aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      >
        <Heart className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", favorite && "fill-k2k-blue text-k2k-blue")} />
      </button>

      {/* Image */}
      <Link to={`/produto/${product.id}`}>
        <div className="aspect-square overflow-hidden bg-k2k-gray">
          <img
            src={product.images[0] || "/placeholder.svg?height=300&width=300&query=kids clothing"}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {isSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="rounded bg-white px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold">Vendido</span>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-2 sm:p-3 md:p-4">
        {/* Brand */}
        <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide truncate">{product.brand}</p>

        {/* Title */}
        <Link to={`/produto/${product.id}`}>
          <h3 className="mt-0.5 sm:mt-1 line-clamp-2 text-xs sm:text-sm font-medium hover:text-k2k-blue min-h-[2.5em]">{product.title}</h3>
        </Link>

        {/* Size & Condition */}
        <div className="mt-1 sm:mt-2 flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
          <span>{product.size}</span>
          <span>•</span>
          <span className="capitalize">{product.condition === "new" ? "Novo" : product.condition === "good" ? "Bom" : "Usado"}</span>
        </div>

        {/* Price */}
        <div className="mt-2 sm:mt-3 flex items-center gap-1 sm:gap-2 flex-wrap">
          <span className="text-sm sm:text-base md:text-lg font-bold text-k2k-blue">€{product.price.toFixed(2)}</span>
          {hasDiscount && (
            <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground line-through">€{product.originalPrice?.toFixed(2)}</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-2 sm:p-3 md:p-4 pt-0">
        <Button
          className="w-full bg-k2k-blue text-white transition-all hover:bg-k2k-blue/90 hover:scale-105 text-xs sm:text-sm h-8 sm:h-9 md:h-10"
          disabled={isSoldOut}
          onClick={handleAddToCart}
        >
          {isSoldOut ? (
            "Esgotado"
          ) : (
            <>
              <ShoppingCart className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Adicionar</span>
              <span className="xs:hidden">✓</span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

