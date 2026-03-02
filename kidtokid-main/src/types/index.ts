export type ProductCondition = "novo" | "como-novo" | "bom" | "usado"

export const conditionLabels: Record<string, string> = {
  novo: "Novo",
  "como-novo": "Como Novo",
  bom: "Bom Estado",
  usado: "Usado",
  // Fallback for legacy English values
  new: "Novo",
  good: "Bom Estado",
  used: "Usado",
}

export function getConditionLabel(condition: string): string {
  return conditionLabels[condition] || condition
}

export interface IProduct {
  id: string
  title: string
  brand: string
  price: number
  originalPrice?: number
  size: string
  condition: ProductCondition
  images: string[]
  category: string
  subcategory?: string
  gender?: "menina" | "menino" | "unissexo"
  color?: string
  season?: string
  stock: number
  isReserved: boolean
  description?: string
  sku?: string
  rating?: number
  reviewCount?: number
  createdAt: Date
  updatedAt?: Date
}

export interface ICategory {
  id: string
  name: string
  icon: string
  color: string
  image?: string
}

export interface ICartItem {
  product: IProduct
  quantity: number
}

export interface IUser {
  id: string
  email: string
  displayName?: string
  photoURL?: string
  createdAt: Date
}

export interface IFilter {
  gender?: string[]
  size?: string[]
  brand?: string[]
  condition?: ProductCondition[]
  priceRange?: {
    min: number
    max: number
  }
  category?: string[]
}

