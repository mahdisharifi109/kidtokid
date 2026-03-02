import { Link } from "react-router-dom"
import { Header } from "@/src/components/layout/Header"
import { Footer } from "@/src/components/Footer"
import { Button } from "@/components/ui/button"
import { Home, Search } from "lucide-react"

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="mb-6">
          <span className="text-8xl font-bold text-gray-200">404</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          Página não encontrada
        </h1>
        <p className="text-gray-500 mb-8 max-w-md">
          A página que procuras não existe ou foi movida. Experimenta voltar à página inicial ou pesquisar o que precisas.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Home className="h-4 w-4" />
              Voltar ao Início
            </Button>
          </Link>
          <Link to="/pesquisa">
            <Button variant="outline" className="gap-2">
              <Search className="h-4 w-4" />
              Pesquisar
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
