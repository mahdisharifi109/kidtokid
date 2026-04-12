import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense, useEffect, useState } from 'react'
import { Loader2, Wrench } from 'lucide-react'
import { getStoreSettings } from './services/settingsService'
import { useAuth } from './contexts/AuthContext'

// Auth Route Guards
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AdminRoute } from './components/auth/AdminRoute'

// Lazy loading para melhor performance
const HomePage = lazy(() => import('./pages/HomePage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const CategoryPage = lazy(() => import('./pages/CategoryPage'))
const ProductPage = lazy(() => import('./pages/ProductPage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const AdminSeedPage = lazy(() => import('./pages/AdminSeedPage'))
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'))
const HelpPage = lazy(() => import('./pages/HelpPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const AccountPage = lazy(() => import('./pages/AccountPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))

// Admin Pages
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'))
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'))
const AdminProductFormPage = lazy(() => import('./pages/admin/AdminProductFormPage'))
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'))
const AdminClientsPage = lazy(() => import('./pages/admin/AdminClientsPage'))
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'))
const AdminCouponsPage = lazy(() => import('./pages/admin/AdminCouponsPage'))
const AdminContactsPage = lazy(() => import('./pages/admin/AdminContactsPage'))
const AdminReviewsPage = lazy(() => import('./pages/admin/AdminReviewsPage'))
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage'))
const AdminNewsletterPage = lazy(() => import('./pages/admin/AdminNewsletterPage'))

// Loading component
function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  )
}

function App() {
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  const { isAdmin } = useAuth()

  // Load store settings (maintenance mode + SEO)
  useEffect(() => {
    getStoreSettings().then((settings) => {
      setMaintenanceMode(settings.maintenanceMode)
      // Apply SEO meta tags from admin settings
      if (settings.seoTitle) {
        document.title = settings.seoTitle
      }
      const metaDesc = document.querySelector('meta[name="description"]')
      if (metaDesc && settings.seoDescription) {
        metaDesc.setAttribute('content', settings.seoDescription)
      } else if (settings.seoDescription) {
        const meta = document.createElement('meta')
        meta.name = 'description'
        meta.content = settings.seoDescription
        document.head.appendChild(meta)
      }
      setSettingsLoaded(true)
    }).catch(() => setSettingsLoaded(true))
  }, [])

  // Maintenance mode — block non-admin users
  if (settingsLoaded && maintenanceMode && !isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 text-center">
        <Wrench className="h-16 w-16 text-blue-600 mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">Em Manutenção</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          Estamos a melhorar a loja para ti. Volta em breve!
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-4">Kid to Kid Braga</p>
      </div>
    )
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/sobre" element={<AboutPage />} />
        <Route path="/categoria/:slug" element={<CategoryPage />} />
        <Route path="/produto/:id" element={<ProductPage />} />
        <Route path="/pesquisa" element={<SearchPage />} />
        <Route path="/entrar" element={<LoginPage />} />
        <Route path="/registar" element={<RegisterPage />} />
        <Route path="/politica-de-privacidade" element={<PrivacyPolicyPage />} />
        <Route path="/ajuda" element={<HelpPage />} />
        <Route path="/termos-e-condicoes" element={<TermsPage />} />
        <Route path="/carrinho" element={<CartPage />} />
        <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />
        <Route path="/contacto" element={<ContactPage />} />

        {/* Rotas Protegidas - Requerem autenticação */}
        <Route path="/minha-conta" element={
          <ProtectedRoute>
            <AccountPage />
          </ProtectedRoute>
        } />
        <Route path="/favoritos" element={
          <ProtectedRoute>
            <FavoritesPage />
          </ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        } />
        <Route path="/sucesso" element={
          <ProtectedRoute>
            <OrderSuccessPage />
          </ProtectedRoute>
        } />

        {/* Rotas Admin - Requerem permissões de administrador */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        } />
        <Route path="/admin/seed" element={
          <AdminRoute>
            <AdminSeedPage />
          </AdminRoute>
        } />
        <Route path="/admin/produtos" element={
          <AdminRoute>
            <AdminProductsPage />
          </AdminRoute>
        } />
        <Route path="/admin/produtos/novo" element={
          <AdminRoute>
            <AdminProductFormPage />
          </AdminRoute>
        } />
        <Route path="/admin/produtos/:id" element={
          <AdminRoute>
            <AdminProductFormPage />
          </AdminRoute>
        } />
        <Route path="/admin/encomendas" element={
          <AdminRoute>
            <AdminOrdersPage />
          </AdminRoute>
        } />
        <Route path="/admin/clientes" element={
          <AdminRoute>
            <AdminClientsPage />
          </AdminRoute>
        } />
        <Route path="/admin/definicoes" element={
          <AdminRoute>
            <AdminSettingsPage />
          </AdminRoute>
        } />
        <Route path="/admin/cupoes" element={
          <AdminRoute>
            <AdminCouponsPage />
          </AdminRoute>
        } />
        <Route path="/admin/mensagens" element={
          <AdminRoute>
            <AdminContactsPage />
          </AdminRoute>
        } />
        <Route path="/admin/avaliacoes" element={
          <AdminRoute>
            <AdminReviewsPage />
          </AdminRoute>
        } />
        <Route path="/admin/analytics" element={
          <AdminRoute>
            <AdminAnalyticsPage />
          </AdminRoute>
        } />
        <Route path="/admin/newsletter" element={
          <AdminRoute>
            <AdminNewsletterPage />
          </AdminRoute>
        } />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

export default App

