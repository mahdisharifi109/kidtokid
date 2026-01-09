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
        className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-2 shadow-md transition-all hover:scale-110"
        aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      >
        <Heart className={cn("h-4 w-4", favorite && "fill-k2k-pink text-k2k-pink")} />
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
              <span className="rounded bg-white px-4 py-2 text-sm font-bold">Vendido</span>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        {/* Brand */}
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{product.brand}</p>

        {/* Title */}
        <Link to={`/produto/${product.id}`}>
          <h3 className="mt-1 line-clamp-2 text-sm font-medium hover:text-k2k-pink">{product.title}</h3>
        </Link>

        {/* Size & Condition */}
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{product.size}</span>
          <span>•</span>
          <span className="capitalize">{product.condition}</span>
        </div>

        {/* Price */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-lg font-bold text-k2k-pink">€{product.price.toFixed(2)}</span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">€{product.originalPrice?.toFixed(2)}</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full bg-k2k-pink text-white transition-all hover:bg-k2k-pink/90 hover:scale-105"
          disabled={isSoldOut}
          onClick={handleAddToCart}
        >
          {isSoldOut ? (
            "Esgotado"
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Adicionar ao Carrinho
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
