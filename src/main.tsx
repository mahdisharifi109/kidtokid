import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import '@/styles/globals.css'
import { CartProvider } from '@/src/contexts/CartContext'
import { FavoritesProvider } from '@/src/contexts/FavoritesContext'
import { Toaster } from '@/components/ui/sonner'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider>
        <FavoritesProvider>
          <App />
          <Toaster position="top-center" richColors />
        </FavoritesProvider>
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
