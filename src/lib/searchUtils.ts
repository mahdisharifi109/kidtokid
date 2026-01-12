import type { IProduct } from "@/src/types"

export function searchProducts(products: IProduct[], query: string): IProduct[] {
  if (!query.trim()) {
    return products
  }

  const searchTerm = query.toLowerCase().trim()

  return products.filter((product) => {
    const titleMatch = product.title.toLowerCase().includes(searchTerm)
    const brandMatch = product.brand.toLowerCase().includes(searchTerm)
    const categoryMatch = product.category.toLowerCase().includes(searchTerm)
    const sizeMatch = product.size.toLowerCase().includes(searchTerm)

    return titleMatch || brandMatch || categoryMatch || sizeMatch
  })
}

