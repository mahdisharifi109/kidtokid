import type React from "react"
import { Search, ShoppingCart, User, Heart, ChevronDown, ChevronRight, Menu, X, LogOut, Shield, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/src/contexts/CartContext"
import { useFavorites } from "@/src/contexts/FavoritesContext"
import { useAuth } from "@/src/contexts/AuthContext"
import { UserAvatar } from "@/src/components/UserAvatar"
import { useState, useRef, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { toast } from "sonner"
import { CATALOGUE, SIZES } from "@/src/constants/categories"
import { NotificationBell } from "@/src/components/NotificationBell"

const catalogo = CATALOGUE
const tamanhos = SIZES

export function Header() {
  const { totalItems } = useCart()
  const { favorites } = useFavorites()
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [isCatalogueOpen, setIsCatalogueOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [hoveredQuickCat, setHoveredQuickCat] = useState<string | null>(null)
  const [expandedMobileCat, setExpandedMobileCat] = useState<string | null>(null)
  const quickCatTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
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
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      {/* Top Bar */}
      <div className="hidden border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 md:block">
        <div className="container mx-auto flex items-center justify-end px-4 py-1.5 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <Link to="/ajuda" className="hover:text-blue-600">Ajuda</Link>
            <span className="text-gray-300">|</span>
            <Link to="/sobre" className="hover:text-blue-600">Sobre nós</Link>
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
            className="flex items-center gap-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200"
            onClick={() => {
              setIsCatalogueOpen(!isCatalogueOpen)
              if (!isCatalogueOpen && !activeCategory) {
                setActiveCategory("roupa")
              }
            }}
          >
            <span>Catálogo</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isCatalogueOpen ? "rotate-180" : ""}`} />
          </Button>

          {/* Mega Menu */}
          {isCatalogueOpen && (
            <div className="absolute left-0 top-full z-60 mt-1 flex w-175 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
              {/* Categories List */}
              <div className="w-56 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                {Object.values(catalogo).map((cat) => (
                  <div
                    key={cat.id}
                    role="button"
                    tabIndex={0}
                    className={`flex cursor-pointer items-center gap-3 border-l-[3px] px-4 py-3 transition-colors ${activeCategory === cat.id
                      ? "border-l-blue-600 bg-white dark:bg-gray-800"
                      : "border-l-transparent hover:bg-white dark:hover:bg-gray-800"
                      }`}
                    onMouseEnter={() => setActiveCategory(cat.id)}
                    onFocus={() => setActiveCategory(cat.id)}
                    onClick={() => {
                      navigate(`/categoria/${cat.id}`)
                      setIsCatalogueOpen(false)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        navigate(`/categoria/${cat.id}`)
                        setIsCatalogueOpen(false)
                      }
                    }}
                  >
                    <span className="flex-1 text-sm font-medium dark:text-gray-200">{cat.nome}</span>
                    <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </div>
                ))}
              </div>

              {/* Subcategories Panel */}
              <div className="flex-1 p-5">
                {activeCategoryData && (
                  <>
                    <h3 className="mb-4 text-lg font-semibold dark:text-gray-100">{activeCategoryData.nome}</h3>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                      {activeCategoryData.subcategorias.map((sub) => (
                        <div key={sub.id}>
                          <Link
                            to={`/categoria/${activeCategoryData.id}?sub=${sub.id}`}
                            className="mb-2 block text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
                            onClick={() => setIsCatalogueOpen(false)}
                          >
                            {sub.nome}
                          </Link>
                          <ul className="space-y-1">
                            {sub.items.map((item) => (
                              <li key={item}>
                                <Link
                                  to={`/categoria/${activeCategoryData.id}?sub=${sub.id}&item=${encodeURIComponent(item)}`}
                                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
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
                    <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Tamanhos:</span>
                      {tamanhos.slice(0, 8).map((tam) => (
                        <Link
                          key={tam}
                          to={`/categoria/${activeCategoryData.id}?size=${tam}`}
                          className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-xs text-gray-700 dark:text-gray-300 hover:bg-blue-600 hover:text-white"
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
              className="w-full border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 pl-10 focus:bg-white dark:focus:bg-gray-900"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Right Actions */}
        <div className="ml-auto flex items-center gap-1">
          <NotificationBell isAdmin={isAdmin} />

          <Link to="/minha-conta?tab=favoritos">
            <Button variant="ghost" size="icon" className="relative" aria-label="Favoritos">
              <Heart className="h-5 w-5" />
              {favorites.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">
                  {favorites.length}
                </span>
              )}
            </Button>
          </Link>

          <Link to="/carrinho">
            <Button variant="ghost" size="icon" className="relative" aria-label="Carrinho">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>

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
                  <UserAvatar
                    src={user?.photoURL}
                    alt="Foto de perfil"
                    fallbackInitials={user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                    size="sm"
                  />
                </Button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full z-60 mt-2 w-56 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 shadow-lg">
                    <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {user?.displayName || "Utilizador"}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/minha-conta"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Minha Conta
                    </Link>
                    <Link
                      to="/minha-conta?tab=encomendas"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Package className="h-4 w-4" />
                      As Minhas Encomendas
                    </Link>
                    {isAdmin && (
                      <>
                        <div className="mx-4 my-1 h-px bg-gray-100 dark:bg-gray-700" />
                        <Link
                          to="/admin"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50/50 dark:hover:bg-blue-900/30 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Shield className="h-4 w-4" />
                          Painel Admin
                        </Link>
                      </>
                    )}
                    <div className="mx-4 my-1 h-px bg-gray-100 dark:bg-gray-700" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/30 transition-colors"
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

      {/* Category Quick Links - Desktop with Subcategory Dropdowns */}
      <nav className={`hidden border-t border-gray-200 dark:border-gray-700 md:block ${isCatalogueOpen ? "invisible" : ""}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-1 py-2">
            {Object.values(catalogo).map((cat) => (
              <div
                key={cat.id}
                className="relative"
                onMouseEnter={() => {
                  if (quickCatTimeoutRef.current) clearTimeout(quickCatTimeoutRef.current)
                  setHoveredQuickCat(cat.id)
                }}
                onMouseLeave={() => {
                  quickCatTimeoutRef.current = setTimeout(() => setHoveredQuickCat(null), 150)
                }}
              >
                <Link
                  to={`/categoria/${cat.id}`}
                  className="flex items-center gap-1 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <span>{cat.nome}</span>
                  <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform ${hoveredQuickCat === cat.id ? "rotate-180" : ""}`} />
                </Link>

                {/* Subcategory Dropdown */}
                {hoveredQuickCat === cat.id && cat.subcategorias.length > 0 && (
                  <div className="absolute left-0 top-full z-50 mt-0 min-w-56 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 shadow-xl">
                    <div className="px-3 pb-2 mb-1 border-b border-gray-100 dark:border-gray-700">
                      <Link
                        to={`/categoria/${cat.id}`}
                        className="text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
                        onClick={() => setHoveredQuickCat(null)}
                      >
                        Ver tudo em {cat.nome}
                      </Link>
                    </div>
                    {cat.subcategorias.map((sub) => (
                      <Link
                        key={sub.id}
                        to={`/categoria/${cat.id}?sub=${sub.id}`}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                        onClick={() => setHoveredQuickCat(null)}
                      >
                        <ChevronRight className="h-3 w-3 text-gray-300 dark:text-gray-500" />
                        {sub.nome}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
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
        className={`fixed left-0 top-0 z-50 h-full w-80 max-w-[85%] transform bg-white dark:bg-gray-900 transition-transform duration-300 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between border-b dark:border-gray-700 p-4">
          <span className="text-lg font-bold text-blue-600">Kid to Kid</span>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} aria-label="Fechar menu">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="overflow-y-auto p-4">
          <p className="mb-3 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Categorias</p>
          <div className="space-y-1">
            {Object.values(catalogo).map((cat) => (
              <div key={cat.id}>
                <div className="flex items-center">
                  <Link
                    to={`/categoria/${cat.id}`}
                    className="flex-1 flex items-center gap-3 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="font-medium dark:text-gray-100">{cat.nome}</span>
                  </Link>
                  {cat.subcategorias.length > 0 && (
                    <button
                      onClick={() => setExpandedMobileCat(expandedMobileCat === cat.id ? null : cat.id)}
                      className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      aria-label={`Expandir ${cat.nome}`}
                    >
                      <ChevronDown className={`h-4 w-4 transition-transform ${expandedMobileCat === cat.id ? "rotate-180" : ""}`} />
                    </button>
                  )}
                </div>
                {/* Mobile Subcategories */}
                {expandedMobileCat === cat.id && (
                  <div className="ml-6 mb-2 space-y-0.5 border-l-2 border-blue-100 dark:border-blue-900 pl-3">
                    {cat.subcategorias.map((sub) => (
                      <Link
                        key={sub.id}
                        to={`/categoria/${cat.id}?sub=${sub.id}`}
                        className="block rounded px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {sub.nome}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <hr className="my-4 dark:border-gray-700" />

          <div className="space-y-1">
            {isAuthenticated ? (
              <>
                {/* Informações do utilizador logado */}
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-gray-800 p-3 mb-2">
                  <UserAvatar
                    src={user?.photoURL}
                    alt="Foto de perfil"
                    fallbackInitials={user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {user?.displayName || "Utilizador"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                </div>
                <Link
                  to="/minha-conta"
                  className="flex items-center gap-3 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-100 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">Minha Conta</span>
                </Link>
                <Link
                  to="/minha-conta?tab=encomendas"
                  className="flex items-center gap-3 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-100 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className="font-medium">As Minhas Encomendas</span>
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-3 rounded-lg p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Shield className="h-5 w-5" />
                    <span className="font-medium">Painel Admin</span>
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout()
                    setIsMobileMenuOpen(false)
                  }}
                  className="flex w-full items-center gap-3 rounded-lg p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Terminar Sessão</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/entrar"
                  className="flex items-center gap-3 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-100 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">Entrar</span>
                </Link>
                <Link
                  to="/registar"
                  className="flex items-center gap-3 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-600 dark:text-blue-400 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="font-medium">Criar Conta</span>
                </Link>
              </>
            )}
            <Link
              to="/sobre"
              className="block rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sobre nós
            </Link>
            <Link
              to="/ajuda"
              className="block rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-100 transition-colors"
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

