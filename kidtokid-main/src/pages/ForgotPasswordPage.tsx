import { useState } from "react"
import { Link } from "react-router-dom"
import { Header } from "@/src/components/layout/Header"
import { Footer } from "@/src/components/Footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { resetPasswordUnauthenticated, getAuthErrorMessage } from "@/src/services/authService"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error("Introduz o teu email")
      return
    }

    setIsLoading(true)
    try {
      await resetPasswordUnauthenticated(email)
      setSent(true)
      toast.success("Email enviado com sucesso!")
    } catch (error: unknown) {
      const errorCode = (error as { code?: string }).code || ""
      toast.error(getAuthErrorMessage(errorCode) || "Não foi possível enviar o email")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <img src="/logo.png" alt="Kid to Kid" className="h-12 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Recuperar Password</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Introduz o email associado à tua conta
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border p-6">
            {sent ? (
              <div className="text-center py-4">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Email enviado!</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Verifica a tua caixa de entrada (e spam) para o email de recuperação de password enviado para <strong>{email}</strong>.
                </p>
                <Link to="/entrar">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Voltar ao Login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm text-gray-700 dark:text-gray-300">
                    Email
                  </Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="o-seu-email@exemplo.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "A enviar..." : "Enviar email de recuperação"}
                </Button>
              </form>
            )}
          </div>

          <Link
            to="/entrar"
            className="flex items-center justify-center gap-2 mt-6 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao login
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
