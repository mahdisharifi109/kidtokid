import { useState, useMemo, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Header } from "@/src/components/layout/Header"
import { Footer } from "@/src/components/Footer"
import { ProductCard } from "@/src/components/product/ProductCard"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter } from "lucide-react"
import { getProductsByCategory, getAllProducts } from "@/src/services/productService"
import { useCart } from "@/src/contexts/CartContext"
import type { ProductCondition, IProduct } from "@/src/types"

const categoryNames: Record<string, string> = {
  brinquedos: "Brinquedos",
  babygrows: "Babygrows",
  menina: "Roupa Menina",
  menino: "Roupa Menino",
  bebe: "Bebé",
  calcado: "Calçado",
  maternidade: "Maternidade",
  puericultura: "Puericultura",
  equipamentos: "Equipamentos",
  agasalhos: "Agasalhos",
  praia: "Praia",
  carnaval: "Carnaval / Halloween",
}

export default function CategoryPage() {
  const { slug = "" } = useParams<{ slug: string }>()
  const { addToCart } = useCart()
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState("newest")
  const [products, setProducts] = useState<IProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filters
  const [selectedConditions, setSelectedConditions] = useState<ProductCondition[]>([])
  const [priceRange, setPriceRange] = useState([0, 100])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])

  // Carregar produtos do Firebase
  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true)
      try {
        let fetchedProducts: IProduct[]
        if (slug) {
          fetchedProducts = await getProductsByCategory(slug)
        } else {
          fetchedProducts = await getAllProducts()
        }
        setProducts(fetchedProducts)
      } catch (error) {
        console.error("Erro ao carregar produtos:", error)
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }
    loadProducts()
  }, [slug])

  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    // Filter by condition
    if (selectedConditions.length > 0) {
      filtered = filtered.filter((p) => selectedConditions.includes(p.condition))
    }

    // Filter by price
    filtered = filtered.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])

    // Filter by size
    if (selectedSizes.length > 0) {
      filtered = filtered.filter((p) => selectedSizes.includes(p.size))
    }

    // Sort
    if (sortBy === "price-asc") {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-desc") {
      filtered.sort((a, b) => b.price - a.price)
    } else if (sortBy === "newest") {
      filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    }

    return filtered
  }, [products, selectedConditions, priceRange, selectedSizes, sortBy])

  const toggleCondition = (condition: ProductCondition) => {
    setSelectedConditions((prev) =>
      prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition],
    )
  }

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]))
  }

  const clearFilters = () => {
    setSelectedConditions([])
    setPriceRange([0, 50])
    setSelectedSizes([])
  }

  const availableSizes = [
    "0-3M",
    "3-6M",
    "6-9M",
    "9-12M",
    "12-18M",
    "18-24M",
    "2-3A",
    "3-4A",
    "4-5A",
    "5-6A",
    "6-7A",
    "7-8A",
    "8-9A",
    "9-10A",
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        {/* Breadcrumb */}
        <div className="mb-4 sm:mb-6 text-xs sm:text-sm text-muted-foreground">
          <Link to="/" className="hover:text-k2k-blue">
            Início
          </Link>
          <span className="mx-1 sm:mx-2">/</span>
          <span>{categoryNames[slug]}</span>
        </div>

        {/* Header */}
        <div className="mb-4 sm:mb-6 flex items-center justify-between gap-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-k2k-blue">{categoryNames[slug]}</h1>
          <Button variant="outline" className="md:hidden bg-transparent text-xs sm:text-sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Filtros
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          {/* Sidebar Filters */}
          <aside className={`w-full md:w-64 shrink-0 ${showFilters ? "block" : "hidden md:block"}`}>
            <div className="sticky top-24 space-y-4 md:space-y-6 rounded-lg border bg-white p-4 md:p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Filtros</h2>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Limpar
                </Button>
              </div>

              {/* Condition Filter */}
              <div>
                <h3 className="mb-3 text-sm font-medium">Estado</h3>
                <div className="space-y-2">
                  {(["new", "good", "used"] as const).map((condition) => (
                    <div key={condition} className="flex items-center space-x-2">
                      <Checkbox
                        id={condition}
                        checked={selectedConditions.includes(condition)}
                        onCheckedChange={() => toggleCondition(condition)}
                      />
                      <Label htmlFor={condition} className="text-sm capitalize">
                        {condition === "new" ? "Novo" : condition === "good" ? "Bom" : "Usado"}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <h3 className="mb-3 text-sm font-medium">Preço</h3>
                <div className="space-y-4">
                  <Slider value={priceRange} onValueChange={setPriceRange} max={50} step={1} className="w-full" />
                  <div className="flex items-center justify-between text-sm">
                    <span>€{priceRange[0]}</span>
                    <span>€{priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Size Filter */}
              <div>
                <h3 className="mb-3 text-sm font-medium">Tamanho</h3>
                <div className="grid grid-cols-3 gap-2">
                  {availableSizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSizes.includes(size) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleSize(size)}
                      className={selectedSizes.includes(size) ? "bg-k2k-blue" : ""}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            {/* Sort and Results Count */}
            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <p className="text-xs sm:text-sm text-muted-foreground">{filteredProducts.length} produtos encontrados</p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-45 text-xs sm:text-sm h-9 sm:h-10">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mais recentes</SelectItem>
                  <SelectItem value="price-asc">Preço: Menor - Maior</SelectItem>
                  <SelectItem value="price-desc">Preço: Maior - Menor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Products */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-k2k-blue border-t-transparent" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                ))}
              </div>
            )}

            {!isLoading && filteredProducts.length === 0 && (
              <div className="py-8 sm:py-12 text-center">
                <p className="text-sm sm:text-base text-muted-foreground">Nenhum produto encontrado.</p>
                <Button onClick={clearFilters} className="mt-3 sm:mt-4">
                  Limpar Filtros
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

