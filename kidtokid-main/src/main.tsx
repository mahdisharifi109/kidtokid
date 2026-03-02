import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import '@/styles/globals.css'
import { AuthProvider } from '@/src/contexts/AuthContext'
import { CartProvider } from '@/src/contexts/CartContext'
import { FavoritesProvider } from '@/src/contexts/FavoritesContext'
import { ThemeProvider } from '@/src/contexts/ThemeContext'
import { AdminThemeProvider } from '@/src/contexts/AdminThemeContext'
import { Toaster } from '@/components/ui/sonner'
import { ErrorBoundary } from '@/src/components/ErrorBoundary'
import { ScrollToTop } from '@/src/components/ScrollToTop'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <ThemeProvider>
          <AdminThemeProvider>
            <AuthProvider>
              <CartProvider>
                <FavoritesProvider>
                  <App />
                  <Toaster position="top-center" richColors />
                </FavoritesProvider>
              </CartProvider>
            </AuthProvider>
          </AdminThemeProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)

