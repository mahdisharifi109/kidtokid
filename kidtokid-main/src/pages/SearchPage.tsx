import { useState, useEffect, useMemo, useCallback } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { Header } from "@/src/components/layout/Header"
import { Footer } from "@/src/components/Footer"
import { ProductCard } from "@/src/components/product/ProductCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, X, Loader2, SlidersHorizontal } from "lucide-react"
import { searchProducts } from "@/src/services/productService"
import { useCart } from "@/src/contexts/CartContext"
import type { IProduct, IFilter, ProductCondition } from "@/src/types"
import { CATEGORIES, SIZES, CONDITIONS, GENDERS } from "@/src/constants/categories"
import { usePageTitle } from "@/src/hooks/usePageTitle"

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  const { addToCart } = useCart()
  usePageTitle(initialQuery ? `Pesquisa: ${initialQuery}` : "Pesquisa")

  const [inputValue, setInputValue] = useState(initialQuery)
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<IProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState("relevance")

  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedConditions, setSelectedConditions] = useState<ProductCondition[]>([])
  const [selectedGenders, setSelectedGenders] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 200])

  const filters: IFilter = useMemo(
    () => ({
      category: selectedCategories.length > 0 ? selectedCategories : undefined,
      condition: selectedConditions.length > 0 ? selectedConditions : undefined,
      gender: selectedGenders.length > 0 ? selectedGenders : undefined,
      size: selectedSizes.length > 0 ? selectedSizes : undefined,
      priceRange:
        priceRange[0] !== 0 || priceRange[1] !== 200
          ? { min: priceRange[0], max: priceRange[1] }
          : undefined,
    }),
    [selectedCategories, selectedConditions, selectedGenders, selectedSizes, priceRange]
  )

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (selectedCategories.length > 0) count++
    if (selectedConditions.length > 0) count++
    if (selectedGenders.length > 0) count++
    if (selectedSizes.length > 0) count++
    if (priceRange[0] !== 0 || priceRange[1] !== 200) count++
    return count
  }, [selectedCategories, selectedConditions, selectedGenders, selectedSizes, priceRange])

  const doSearch = useCallback(async () => {
    if (!query.trim() && activeFilterCount === 0) {
      setResults([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const products = await searchProducts(query, filters, sortBy)
      setResults(products)
    } catch (error) {
      console.error("Erro na pesquisa:", error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [query, filters, sortBy, activeFilterCount])

  useEffect(() => {
    const timer = setTimeout(() => {
      doSearch()
    }, 300)
    return () => clearTimeout(timer)
  }, [doSearch])

  useEffect(() => {
    setInputValue(initialQuery)
    setQuery(initialQuery)
  }, [initialQuery])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = inputValue.trim()
    setQuery(trimmed)
    if (trimmed) {
      setSearchParams({ q: trimmed })
    } else {
      setSearchParams({})
    }
  }

  const clearSearch = () => {
    setInputValue("")
    setQuery("")
    setSearchParams({})
  }

  const toggleCategory = (slug: string) =>
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    )

  const toggleCondition = (condition: ProductCondition) =>
    setSelectedConditions((prev) =>
      prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition]
    )

  const toggleGender = (gender: string) =>
    setSelectedGenders((prev) =>
      prev.includes(gender) ? prev.filter((g) => g !== gender) : [...prev, gender]
    )

  const toggleSize = (size: string) =>
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    )

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedConditions([])
    setSelectedGenders([])
    setSelectedSizes([])
    setPriceRange([0, 200])
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* Breadcrumb */}
        <div className="mb-4 text-xs text-gray-400">
          <Link to="/" className="hover:text-blue-600">Início</Link>
          <span className="mx-1.5">/</span>
          <span className="text-gray-600">Pesquisa</span>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Pesquisar produtos, marcas, categorias..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="pl-10 pr-10"
            />
            {inputValue && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            Pesquisar
          </Button>
        </form>

        {/* Toolbar: title + filter toggle + sort */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
              {query ? `"${query}"` : "Todos os Produtos"}
            </h1>
            <span className="text-sm text-gray-400 shrink-0">
              {isLoading ? "..." : `${results.length}`}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              className="md:hidden flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
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
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 text-sm h-9">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevância</SelectItem>
                <SelectItem value="newest">Mais recentes</SelectItem>
                <SelectItem value="price-asc">Preço ↑</SelectItem>
                <SelectItem value="price-desc">Preço ↓</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active filter pills */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {selectedCategories.map(slug => {
              const cat = CATEGORIES.find(c => c.slug === slug)
              return (
                <button key={slug} onClick={() => toggleCategory(slug)}
                  className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 rounded-full px-2.5 py-1 hover:bg-gray-200 transition-colors">
                  {cat?.label || slug}
                  <X className="h-3 w-3" />
                </button>
              )
            })}
            {selectedConditions.map(c => {
              const cond = CONDITIONS.find(co => co.value === c)
              return (
                <button key={c} onClick={() => toggleCondition(c)}
                  className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 rounded-full px-2.5 py-1 hover:bg-gray-200 transition-colors">
                  {cond?.label || c}
                  <X className="h-3 w-3" />
                </button>
              )
            })}
            {selectedGenders.map(g => {
              const gen = GENDERS.find(ge => ge.value === g)
              return (
                <button key={g} onClick={() => toggleGender(g)}
                  className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 rounded-full px-2.5 py-1 hover:bg-gray-200 transition-colors">
                  {gen?.label || g}
                  <X className="h-3 w-3" />
                </button>
              )
            })}
            {selectedSizes.map(s => (
              <button key={s} onClick={() => toggleSize(s)}
                className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 rounded-full px-2.5 py-1 hover:bg-gray-200 transition-colors">
                {s}
                <X className="h-3 w-3" />
              </button>
            ))}
            {(priceRange[0] !== 0 || priceRange[1] !== 200) && (
              <button onClick={() => setPriceRange([0, 200])}
                className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 rounded-full px-2.5 py-1 hover:bg-gray-200 transition-colors">
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
                <h2 className="text-sm font-semibold text-gray-900">Filtros</h2>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-gray-600">
                    Limpar
                  </button>
                )}
              </div>

              {/* Category */}
              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Categoria</h3>
                <div className="max-h-44 overflow-y-auto space-y-0.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => toggleCategory(cat.slug)}
                      className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${selectedCategories.includes(cat.slug)
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition */}
              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Estado</h3>
                <div className="flex flex-wrap gap-1.5">
                  {CONDITIONS.map((cond) => (
                    <button
                      key={cond.value}
                      onClick={() => toggleCondition(cond.value as ProductCondition)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${selectedConditions.includes(cond.value as ProductCondition)
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                    >
                      {cond.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender */}
              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Género</h3>
                <div className="flex flex-wrap gap-1.5">
                  {GENDERS.map((g) => (
                    <button
                      key={g.value}
                      onClick={() => toggleGender(g.value)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${selectedGenders.includes(g.value)
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Preço</h3>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={200}
                  step={1}
                  className="w-full"
                />
                <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                  <span>€{priceRange[0]}</span>
                  <span>€{priceRange[1]}</span>
                </div>
              </div>

              {/* Size */}
              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Tamanho</h3>
                <div className="flex flex-wrap gap-1.5">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`text-xs px-2 py-1 rounded border transition-colors ${selectedSizes.includes(size)
                          ? "border-blue-600 bg-blue-50 text-blue-700 font-medium"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Results Grid */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <p className="text-sm text-gray-400">A procurar...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {results.map((product) => (
                  <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <p className="text-4xl mb-3">🔍</p>
                <p className="font-medium text-gray-900">
                  {query
                    ? `Sem resultados para "${query}"`
                    : "Pesquisa por produtos, marcas ou categorias"}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {query
                    ? "Tenta palavras diferentes ou ajusta os filtros"
                    : "Usa a barra de pesquisa ou os filtros à esquerda"}
                </p>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="mt-4 text-sm text-blue-600 hover:underline">
                    Limpar filtros
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

