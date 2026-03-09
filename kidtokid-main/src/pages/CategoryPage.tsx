import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { usePageTitle } from "@/src/hooks/usePageTitle"
import { useParams, Link, useSearchParams } from "react-router-dom"
import { Header } from "@/src/components/layout/Header"
import { Footer } from "@/src/components/Footer"
import { ProductCard } from "@/src/components/product/ProductCard"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, SlidersHorizontal, X } from "lucide-react"
import { getProductsPaginated } from "@/src/services/productService"
import { useCart } from "@/src/contexts/CartContext"
import type { ProductCondition, IProduct } from "@/src/types"
import { resolveCategoryName, resolveSlug, SIZES, CATALOGUE } from "@/src/constants/categories"
import type { DocumentData } from "firebase/firestore"

const PAGE_SIZE = 20

const CONDITIONS = [
  { value: "novo", label: "Novo" },
  { value: "como-novo", label: "Como Novo" },
  { value: "bom", label: "Bom Estado" },
  { value: "usado", label: "Usado" },
] as const

export default function CategoryPage() {
  const { slug = "" } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const { addToCart } = useCart()
  const subFilter = searchParams.get("sub") || ""
  const itemFilter = searchParams.get("item") || ""
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState("newest")
  const [products, setProducts] = useState<IProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const lastDocRef = useRef<DocumentData | null>(null)

  const [selectedConditions, setSelectedConditions] = useState<ProductCondition[]>([])
  const [priceRange, setPriceRange] = useState([0, 200])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])

  const resolvedSlug = resolveSlug(slug)

  const loadProducts = useCallback(async (reset: boolean = false) => {
    if (reset) {
      setIsLoading(true)
      lastDocRef.current = null
    } else {
      setIsLoadingMore(true)
    }

    try {
      const result = await getProductsPaginated(
        PAGE_SIZE,
        reset ? undefined : (lastDocRef.current ?? undefined),
        resolvedSlug || undefined
      )

      if (reset) {
        setProducts(result.products)
      } else {
        setProducts(prev => [...prev, ...result.products])
      }
      lastDocRef.current = result.lastDoc
      setHasMore(result.hasMore)
    } catch (error) {
      console.error("Erro ao carregar produtos:", error)
      if (reset) setProducts([])
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [resolvedSlug])

  useEffect(() => {
    loadProducts(true)
  }, [loadProducts])

  const availableBrands = useMemo(() => {
    const brands = new Set<string>()
    products.forEach(p => { if (p.brand) brands.add(p.brand) })
    return Array.from(brands).sort()
  }, [products])

  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    // Filter by subcategory from URL query param (?sub=tops-tshirts)
    if (subFilter) {
      filtered = filtered.filter((p) => p.subcategory === subFilter)
    }

    // Filter by item name from URL query param (?item=T-shirts)
    if (itemFilter) {
      const normalizedItem = itemFilter.toLowerCase()
      filtered = filtered.filter((p) => 
        p.title?.toLowerCase().includes(normalizedItem) ||
        p.subcategory === subFilter
      )
    }

    if (selectedConditions.length > 0) {
      filtered = filtered.filter((p) => selectedConditions.includes(p.condition))
    }

    filtered = filtered.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])

    if (selectedSizes.length > 0) {
      filtered = filtered.filter((p) => selectedSizes.includes(p.size))
    }

    if (selectedBrands.length > 0) {
      filtered = filtered.filter((p) => selectedBrands.includes(p.brand))
    }

    if (sortBy === "price-asc") {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-desc") {
      filtered.sort((a, b) => b.price - a.price)
    } else if (sortBy === "newest") {
      filtered.sort((a, b) => (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0))
    }

    return filtered
  }, [products, subFilter, itemFilter, selectedConditions, priceRange, selectedSizes, selectedBrands, sortBy])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (selectedConditions.length > 0) count++
    if (selectedSizes.length > 0) count++
    if (selectedBrands.length > 0) count++
    if (priceRange[0] !== 0 || priceRange[1] !== 200) count++
    return count
  }, [selectedConditions, selectedSizes, selectedBrands, priceRange])

  const toggleCondition = (condition: ProductCondition) => {
    setSelectedConditions((prev) =>
      prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition],
    )
  }

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]))
  }

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) => (prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]))
  }

  const clearFilters = () => {
    setSelectedConditions([])
    setPriceRange([0, 200])
    setSelectedSizes([])
    setSelectedBrands([])
  }

  const categoryName = resolveCategoryName(slug)
  usePageTitle(categoryName)

  if (!categoryName) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <p className="text-4xl mb-3">📦</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Categoria não encontrada</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">A categoria que procuras não existe.</p>
          <Link to="/" className="text-sm text-blue-600 hover:underline">
            Voltar ao Início
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Header />

      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* Breadcrumb */}
        <div className="mb-4 text-xs text-gray-400 dark:text-gray-500">
          <Link to="/" className="hover:text-blue-600">Início</Link>
          <span className="mx-1.5">/</span>
          <span className="text-gray-600 dark:text-gray-400">{categoryName}</span>
        </div>

        {/* Header: title + mobile filter toggle */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{categoryName}</h1>
          <button
            className="md:hidden flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filtros
            {activeFilterCount > 0 && (
              <span className="bg-blue-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Active filter pills */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {selectedConditions.map(c => {
              const cond = CONDITIONS.find(co => co.value === c)
              return (
                <button key={c} onClick={() => toggleCondition(c)}
                  className="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full px-2.5 py-1 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  {cond?.label || c}
                  <X className="h-3 w-3" />
                </button>
              )
            })}
            {selectedSizes.map(s => (
              <button key={s} onClick={() => toggleSize(s)}
                className="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full px-2.5 py-1 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                {s}
                <X className="h-3 w-3" />
              </button>
            ))}
            {selectedBrands.map(b => (
              <button key={b} onClick={() => toggleBrand(b)}
                className="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full px-2.5 py-1 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                {b}
                <X className="h-3 w-3" />
              </button>
            ))}
            {(priceRange[0] !== 0 || priceRange[1] !== 200) && (
              <button onClick={() => setPriceRange([0, 200])}
                className="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full px-2.5 py-1 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                €{priceRange[0]}–€{priceRange[1]}
                <X className="h-3 w-3" />
              </button>
            )}
            <button onClick={clearFilters} className="text-xs text-blue-600 hover:underline ml-1">
              Limpar tudo
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Filters */}
          <aside className={`w-full md:w-56 shrink-0 ${showFilters ? "block" : "hidden md:block"}`}>
            <div className="sticky top-24 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Filtros</h2>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600">
                    Limpar
                  </button>
                )}
              </div>

              {/* Subcategories */}
              {CATALOGUE[resolvedSlug] && (
                <div>
                  <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Subcategorias</h3>
                  <div className="space-y-0.5">
                    {CATALOGUE[resolvedSlug].subcategorias.map((sub) => (
                      <Link
                        key={sub.id}
                        to={`/categoria/${resolvedSlug}?sub=${sub.id}`}
                        className="block text-sm px-2 py-1.5 rounded text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-700 transition-colors"
                      >
                        {sub.nome}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Condition */}
              <div>
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Estado</h3>
                <div className="flex flex-wrap gap-1.5">
                  {CONDITIONS.map((cond) => (
                    <button
                      key={cond.value}
                      onClick={() => toggleCondition(cond.value as ProductCondition)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${selectedConditions.includes(cond.value as ProductCondition)
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30 text-blue-700"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                        }`}
                    >
                      {cond.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Preço</h3>
                <Slider value={priceRange} onValueChange={setPriceRange} max={200} step={1} className="w-full" />
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <span>€{priceRange[0]}</span>
                  <span>€{priceRange[1]}</span>
                </div>
              </div>

              {/* Size */}
              <div>
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Tamanho</h3>
                <div className="flex flex-wrap gap-1.5">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`text-xs px-2 py-1 rounded border transition-colors ${selectedSizes.includes(size)
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30 text-blue-700 font-medium"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand */}
              {availableBrands.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Marca</h3>
                  <div className="max-h-44 overflow-y-auto space-y-0.5">
                    {availableBrands.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => toggleBrand(brand)}
                        className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${selectedBrands.includes(brand)
                          ? "bg-blue-50 dark:bg-blue-950/30 text-blue-700 font-medium"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                          }`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            {/* Sort and count bar */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <p className="text-sm text-gray-400 dark:text-gray-500">{filteredProducts.length} produtos</p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 text-sm h-9">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mais recentes</SelectItem>
                  <SelectItem value="price-asc">Preço ↑</SelectItem>
                  <SelectItem value="price-desc">Preço ↓</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <p className="text-sm text-gray-400 dark:text-gray-500">A carregar...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <p className="text-4xl mb-3">📦</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">Nenhum produto encontrado</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Tenta ajustar os filtros</p>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="mt-4 text-sm text-blue-600 hover:underline">
                    Limpar filtros
                  </button>
                )}
              </div>
            )}

            {/* Load More */}
            {!isLoading && hasMore && (
              <div className="mt-8 text-center">
                <Button
                  variant="outline"
                  onClick={() => loadProducts(false)}
                  disabled={isLoadingMore}
                  className="px-8"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      A carregar...
                    </>
                  ) : (
                    "Carregar mais"
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

