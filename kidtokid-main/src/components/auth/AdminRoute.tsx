import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/src/contexts/AuthContext"
import { Loader2, ShieldX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface AdminRouteProps {
  children: React.ReactNode
}

/**
 * Componente que protege rotas administrativas.
 * Apenas utilizadores com permissões de admin podem aceder.
 * 
 * Segurança em múltiplas camadas:
 * 1. Verificação de autenticação
 * 2. Verificação de custom claims do Firebase
 * 3. Verificação de email na lista de admins
 * 4. Verificação de role no Firestore
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()
  const location = useLocation()

  // Mostrar loading enquanto verifica autenticação e permissões
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-k2k-blue mx-auto" />
          <p className="mt-3 text-sm text-gray-500">A verificar permissões...</p>
        </div>
      </div>
    )
  }

  // Redirecionar para login se não autenticado
  if (!isAuthenticated) {
    return <Navigate to="/entrar" state={{ from: location }} replace />
  }

  // Mostrar página de acesso negado se não for admin
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldX className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Acesso Negado
          </h1>
          <p className="text-gray-600 mb-6">
            Não tens permissões para aceder a esta área. 
            Esta secção é reservada para administradores.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => window.history.back()}
              variant="outline"
              className="w-full"
            >
              Voltar
            </Button>
            <Button 
              onClick={() => window.location.href = "/"}
              className="w-full bg-k2k-blue hover:bg-k2k-blue/90"
            >
              Ir para a Página Inicial
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Utilizador é admin - permitir acesso
  return <>{children}</>
}

export default AdminRoute
