import { Link } from "react-router-dom"
import { Header } from "@/src/components/layout/Header"
import { Footer } from "@/src/components/Footer"
import { Button } from "@/components/ui/button"
import { Home, Search } from "lucide-react"

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="mb-6 relative">
          <span className="text-8xl md:text-9xl font-bold text-gray-200 dark:text-gray-800 select-none">404</span>
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl">🙈</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          Ups! Esta página brincou às escondidas
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
          Parece que esta página não existe ou foi movida. Mas não te preocupes — há muita coisa gira para descobrir!
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
