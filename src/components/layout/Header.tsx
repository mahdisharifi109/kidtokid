import type React from "react"
import { Search, ShoppingCart, User, Heart, ChevronDown, ChevronRight, Menu, X, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/src/contexts/CartContext"
import { useFavorites } from "@/src/contexts/FavoritesContext"
import { useAuth } from "@/src/contexts/AuthContext"
import { useState, useRef, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { toast } from "sonner"

// Catálogo estruturado estilo Vinted
const catalogo = {
  menina: {
    id: "menina",
    nome: "Menina",
    subcategorias: [
      { id: "vestidos", nome: "Vestidos", items: ["Vestidos de festa", "Vestidos casual", "Vestidos de verão"] },
      { id: "tops", nome: "Tops e T-shirts", items: ["T-shirts", "Blusas", "Tops"] },
      { id: "calcas", nome: "Calças e Leggings", items: ["Calças de ganga", "Leggings", "Calças de fato de treino"] },
      { id: "casacos", nome: "Casacos", items: ["Casacos de inverno", "Blusões", "Cardigans"] },
      { id: "saias", nome: "Saias e Calções", items: ["Saias", "Calções", "Saias-calção"] },
    ]
  },
  menino: {
    id: "menino",
    nome: "Menino",
    subcategorias: [
      { id: "tshirts", nome: "T-shirts e Polos", items: ["T-shirts", "Polos", "Camisolas"] },
      { id: "calcas", nome: "Calças", items: ["Calças de ganga", "Calças de treino", "Chinos"] },
      { id: "casacos", nome: "Casacos", items: ["Casacos", "Blusões", "Impermeáveis"] },
      { id: "calcoes", nome: "Calções", items: ["Calções de praia", "Calções desportivos", "Bermudas"] },
      { id: "camisas", nome: "Camisas", items: ["Camisas", "Camisas de flanela"] },
    ]
  },
  bebe: {
    id: "bebe",
    nome: "Bebé",
    subcategorias: [
      { id: "babygrows", nome: "Babygrows", items: ["Babygrows lisos", "Babygrows estampados", "Bodies"] },
      { id: "conjuntos", nome: "Conjuntos", items: ["Conjuntos de 2 peças", "Conjuntos de 3 peças"] },
      { id: "pijamas", nome: "Pijamas", items: ["Pijamas de inverno", "Pijamas de verão"] },
      { id: "agasalhos", nome: "Agasalhos", items: ["Casacos", "Gorros", "Luvas"] },
    ]
  },
  calcado: {
    id: "calcado",
    nome: "Calçado",
    subcategorias: [
      { id: "tenis", nome: "Ténis", items: ["Ténis desportivos", "Sapatilhas casual"] },
      { id: "botas", nome: "Botas", items: ["Botas de inverno", "Botas de chuva", "Botins"] },
      { id: "sandalias", nome: "Sandálias", items: ["Sandálias", "Chinelos", "Crocs"] },
      { id: "sapatos", nome: "Sapatos", items: ["Sapatos de cerimónia", "Mocassins"] },
    ]
  },
  brinquedos: {
    id: "brinquedos",
    nome: "Brinquedos",
    subcategorias: [
      { id: "peluches", nome: "Peluches", items: ["Peluches pequenos", "Peluches grandes"] },
      { id: "jogos", nome: "Jogos", items: ["Jogos de tabuleiro", "Puzzles", "Jogos educativos"] },
      { id: "bonecas", nome: "Bonecas", items: ["Bonecas", "Acessórios de bonecas"] },
      { id: "carros", nome: "Carros e Veículos", items: ["Carros", "Comboios", "Aviões"] },
    ]
  },
  equipamentos: {
    id: "equipamentos",
    nome: "Equipamentos",
    subcategorias: [
      { id: "carrinhos", nome: "Carrinhos", items: ["Carrinhos de passeio", "Carrinhos duo", "Acessórios"] },
      { id: "cadeiras", nome: "Cadeiras Auto", items: ["Grupo 0", "Grupo 1", "Grupo 2/3"] },
      { id: "camas", nome: "Camas e Berços", items: ["Berços", "Camas de grades", "Alcofa"] },
      { id: "alimentacao", nome: "Alimentação", items: ["Cadeiras de refeição", "Biberões", "Esterilizadores"] },
    ]
  },
  maternidade: {
    id: "maternidade",
    nome: "Maternidade",
    subcategorias: [
      { id: "roupa", nome: "Roupa Grávida", items: ["Calças", "Vestidos", "Tops"] },
      { id: "amamentacao", nome: "Amamentação", items: ["Soutiens", "Almofadas", "Bombas"] },
    ]
  },
}

const tamanhos = ["0-3M", "3-6M", "6-12M", "12-18M", "18-24M", "2-3A", "3-4A", "4-5A", "5-6A", "6-8A", "8-10A", "10-12A"]

export function Header() {
  const { totalItems } = useCart()
  const { favorites } = useFavorites()
  const { user, isAuthenticated, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [isCatalogueOpen, setIsCatalogueOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const catalogueRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    setIsUserMenuOpen(false)
    toast.success("Sessão terminada", {
      description: "Até breve!",
    })
    navigate("/")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/pesquisa?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  // Fechar menus ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (catalogueRef.current && !catalogueRef.current.contains(event.target as Node)) {
        setIsCatalogueOpen(false)
        setActiveCategory(null)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Fechar com ESC
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCatalogueOpen(false)
        setActiveCategory(null)
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [])

  const activeCategoryData = activeCategory ? catalogo[activeCategory as keyof typeof catalogo] : null

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      {/* Top Bar */}
      <div className="hidden border-b bg-gray-50 md:block">
        <div className="container mx-auto flex items-center justify-end px-4 py-1.5 text-xs text-gray-600">
          <div className="flex items-center gap-4">
            <Link to="/ajuda" className="hover:text-k2k-blue">Ajuda</Link>
            <span className="text-gray-300">|</span>
            <Link to="/sobre" className="hover:text-k2k-blue">Sobre nós</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto flex h-14 items-center gap-4 px-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Kid to Kid" className="h-8 md:h-10" />
        </Link>

        {/* Catalogue Dropdown - Desktop */}
        <div className="relative hidden md:block" ref={catalogueRef}>
          <Button
            variant="outline"
            className="flex items-center gap-2 border-gray-300 bg-gray-50 hover:bg-gray-100"
            onClick={() => {
              setIsCatalogueOpen(!isCatalogueOpen)
              if (!isCatalogueOpen && !activeCategory) {
                setActiveCategory("menina")
              }
            }}
          >
            <span>Catálogo</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isCatalogueOpen ? "rotate-180" : ""}`} />
          </Button>

          {/* Mega Menu */}
          {isCatalogueOpen && (
            <div className="absolute left-0 top-full mt-1 flex w-175 rounded-lg border bg-white shadow-xl">
              {/* Categories List */}
              <div className="w-56 border-r bg-gray-50">
                {Object.values(catalogo).map((cat) => (
                  <div
                    key={cat.id}
                    className={`flex cursor-pointer items-center gap-3 border-l-[3px] px-4 py-3 transition-colors ${
                      activeCategory === cat.id
                        ? "border-l-k2k-blue bg-white"
                        : "border-l-transparent hover:bg-white"
                    }`}
                    onMouseEnter={() => setActiveCategory(cat.id)}
                    onClick={() => {
                      navigate(`/categoria/${cat.id}`)
                      setIsCatalogueOpen(false)
                    }}
                  >
                    <span className="flex-1 text-sm font-medium">{cat.nome}</span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>

              {/* Subcategories Panel */}
              <div className="flex-1 p-5">
                {activeCategoryData && (
                  <>
                    <h3 className="mb-4 text-lg font-semibold">{activeCategoryData.nome}</h3>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                      {activeCategoryData.subcategorias.map((sub) => (
                        <div key={sub.id}>
                          <Link
                            to={`/categoria/${activeCategoryData.id}?sub=${sub.id}`}
                            className="mb-2 block text-sm font-semibold text-gray-900 hover:text-k2k-blue"
                            onClick={() => setIsCatalogueOpen(false)}
                          >
                            {sub.nome}
                          </Link>
                          <ul className="space-y-1">
                            {sub.items.map((item) => (
                              <li key={item}>
                                <Link
                                  to={`/categoria/${activeCategoryData.id}?sub=${sub.id}&item=${encodeURIComponent(item)}`}
                                  className="text-sm text-gray-600 hover:text-k2k-blue"
                                  onClick={() => setIsCatalogueOpen(false)}
                                >
                                  {item}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {/* Size Shortcuts */}
                    <div className="mt-6 flex flex-wrap items-center gap-2 border-t pt-4">
                      <span className="text-xs text-gray-500">Tamanhos:</span>
                      {tamanhos.slice(0, 8).map((tam) => (
                        <Link
                          key={tam}
                          to={`/categoria/${activeCategoryData.id}?size=${tam}`}
                          className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 hover:bg-k2k-blue hover:text-white"
                          onClick={() => setIsCatalogueOpen(false)}
                        >
                          {tam}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="hidden flex-1 md:block">
          <form onSubmit={handleSearch} className="relative max-w-lg">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Pesquisar artigos, marcas, categorias..."
              className="w-full border-gray-300 bg-gray-50 pl-10 focus:bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Right Actions */}
        <div className="ml-auto flex items-center gap-1">
          {/* User Menu */}
          <div className="relative hidden md:block" ref={userMenuRef}>
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  aria-label="Menu do utilizador"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Foto de perfil"
                      className="h-7 w-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-k2k-blue text-xs font-bold text-white">
                      {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                </Button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border bg-white py-2 shadow-xl">
                    <div className="border-b px-4 py-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user?.displayName || "Utilizador"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/minha-conta"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Minha Conta
                    </Link>
                    <Link
                      to="/encomendas"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      As Minhas Encomendas
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Terminar Sessão
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link to="/entrar">
                <Button variant="ghost" size="icon" aria-label="Entrar">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}
          </div>

          <Link to="/favoritos">
            <Button variant="ghost" size="icon" className="relative" aria-label="Favoritos">
              <Heart className="h-5 w-5" />
              {favorites.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-k2k-blue text-[10px] text-white">
                  {favorites.length}
                </span>
              )}
            </Button>
          </Link>

          <Link to="/carrinho">
            <Button variant="ghost" size="icon" className="relative" aria-label="Carrinho">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-k2k-blue text-[10px] text-white">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="border-t px-4 py-2 md:hidden">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Pesquisar..."
            className="w-full pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      {/* Category Quick Links - Desktop */}
      <nav className="hidden border-t md:block">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-6 py-2">
            {Object.values(catalogo).map((cat) => (
              <Link
                key={cat.id}
                to={`/categoria/${cat.id}`}
                className="flex items-center gap-1.5 whitespace-nowrap text-sm font-medium text-gray-700 hover:text-k2k-blue transition-colors"
              >
                <span>{cat.nome}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Mobile Menu */}
      <div
        className={`fixed left-0 top-0 z-50 h-full w-80 max-w-[85%] transform bg-white transition-transform duration-300 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b p-4">
          <span className="text-lg font-bold text-k2k-blue">Kid to Kid</span>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="overflow-y-auto p-4">
          <p className="mb-3 text-xs font-semibold uppercase text-gray-500">Categorias</p>
          <div className="space-y-1">
            {Object.values(catalogo).map((cat) => (
              <Link
                key={cat.id}
                to={`/categoria/${cat.id}`}
                className="flex items-center gap-3 rounded-lg p-3 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="font-medium">{cat.nome}</span>
              </Link>
            ))}
          </div>

          <hr className="my-4" />

          <div className="space-y-1">
            {isAuthenticated ? (
              <>
                {/* Informações do utilizador logado */}
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 mb-2">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Foto de perfil"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-k2k-blue text-sm font-bold text-white">
                      {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {user?.displayName || "Utilizador"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                </div>
                <Link
                  to="/minha-conta"
                  className="flex items-center gap-3 rounded-lg p-3 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">Minha Conta</span>
                </Link>
                <Link
                  to="/encomendas"
                  className="flex items-center gap-3 rounded-lg p-3 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className="font-medium">As Minhas Encomendas</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setIsMobileMenuOpen(false)
                  }}
                  className="flex w-full items-center gap-3 rounded-lg p-3 text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Terminar Sessão</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/entrar"
                  className="flex items-center gap-3 rounded-lg p-3 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">Entrar</span>
                </Link>
                <Link
                  to="/registar"
                  className="flex items-center gap-3 rounded-lg p-3 hover:bg-gray-100 text-k2k-blue"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="font-medium">Criar Conta</span>
                </Link>
              </>
            )}
            <Link
              to="/sobre"
              className="block rounded-lg p-3 hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sobre nós
            </Link>
            <Link
              to="/ajuda"
              className="block rounded-lg p-3 hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Ajuda
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

