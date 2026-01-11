export type ProductCondition = "new" | "good" | "used"

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
  gender?: "menina" | "menino" | "unisex"
  color?: string
  season?: string
  stock: number
  isReserved: boolean
  description?: string
  createdAt: Date
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
