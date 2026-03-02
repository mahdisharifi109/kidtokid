import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/src/contexts/AuthContext"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

/**
 * Componente que protege rotas que requerem autenticação.
 * Redireciona para a página de login se o utilizador não estiver autenticado.
 */
export function ProtectedRoute({ children, redirectTo = "/entrar" }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-k2k-blue mx-auto" />
          <p className="mt-2 text-sm text-gray-500">A verificar autenticação...</p>
        </div>
      </div>
    )
  }

  // Redirecionar para login se não autenticado
  if (!isAuthenticated) {
    // Guardar a localização atual para redirecionar depois do login
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
