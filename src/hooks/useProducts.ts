import { useState, useEffect, useCallback } from "react"
import type { IProduct, IFilter } from "@/src/types"
import {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getProductsWithFilters,
  searchProducts,
} from "@/src/services/productService"

// Hook para buscar todos os produtos
export function useProducts() {
  const [products, setProducts] = useState<IProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAllProducts()
      setProducts(data)
    } catch (err) {
      setError("Erro ao carregar produtos")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return { products, loading, error, refetch: fetchProducts }
}

// Hook para buscar um produto por ID
export function useProduct(id: string | undefined) {
  const [product, setProduct] = useState<IProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getProductById(id)
        setProduct(data)
      } catch (err) {
        setError("Erro ao carregar produto")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  return { product, loading, error }
}

// Hook para buscar produtos por categoria
export function useProductsByCategory(category: string | undefined) {
  const [products, setProducts] = useState<IProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!category) {
      setLoading(false)
      return
    }

    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getProductsByCategory(category)
        setProducts(data)
      } catch (err) {
        setError("Erro ao carregar produtos")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [category])

  return { products, loading, error }
}

// Hook para buscar produtos com filtros
export function useFilteredProducts(filters: IFilter) {
  const [products, setProducts] = useState<IProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getProductsWithFilters(filters)
      setProducts(data)
    } catch (err) {
      setError("Erro ao carregar produtos")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return { products, loading, error, refetch: fetchProducts }
}

// Hook para pesquisa de produtos
export function useProductSearch(searchTerm: string) {
  const [products, setProducts] = useState<IProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setProducts([])
      return
    }

    const search = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await searchProducts(searchTerm)
        setProducts(data)
      } catch (err) {
        setError("Erro na pesquisa")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    // Debounce de 300ms
    const timeoutId = setTimeout(search, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  return { products, loading, error }
}
