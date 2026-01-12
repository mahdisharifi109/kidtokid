import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Loader2 } from 'lucide-react'

// Lazy loading para melhor performance
const HomePage = lazy(() => import('./pages/HomePage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const CategoryPage = lazy(() => import('./pages/CategoryPage'))
const ProductPage = lazy(() => import('./pages/ProductPage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const AdminSeedPage = lazy(() => import('./pages/AdminSeedPage'))

// Loading component
function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-k2k-pink" />
    </div>
  )
}

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/carrinho" element={<CartPage />} />
        <Route path="/favoritos" element={<FavoritesPage />} />
        <Route path="/sobre" element={<AboutPage />} />
        <Route path="/categoria/:slug" element={<CategoryPage />} />
        <Route path="/produto/:id" element={<ProductPage />} />
        <Route path="/pesquisa" element={<SearchPage />} />
        <Route path="/entrar" element={<LoginPage />} />
        <Route path="/registar" element={<RegisterPage />} />
        <Route path="/admin/seed" element={<AdminSeedPage />} />
      </Routes>
    </Suspense>
  )
}

export default App
