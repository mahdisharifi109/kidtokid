import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Header } from "@/src/components/layout/Header"
import { Footer } from "@/src/components/Footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/src/contexts/AuthContext"

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, loginGoogle, isAuthenticated, isLoading: authLoading } = useAuth()
  
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    acceptNewsletter: false,
  })

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate("/")
    }
  }, [isAuthenticated, authLoading, navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("As passwords não coincidem")
      return
    }

    if (formData.password.length < 6) {
      toast.error("A password deve ter pelo menos 6 caracteres")
      return
    }

    if (!formData.acceptTerms) {
      toast.error("Aceite os termos para continuar")
      return
    }

    setIsLoading(true)

    const result = await register(
      formData.email,
      formData.password,
      formData.firstName,
      formData.lastName,
      formData.phone,
      formData.acceptNewsletter
    )

    setIsLoading(false)

    if (result.success) {
      toast.success("Conta criada com sucesso!")
      navigate("/")
    } else {
      toast.error(result.error || "Não foi possível criar a conta")
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    const result = await loginGoogle()
    setIsLoading(false)
    
    if (result.success) {
      toast.success("Bem-vindo!")
      navigate("/")
    } else {
      toast.error(result.error || "Não foi possível registar com Google")
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-md">
          
          {/* Logo */}
          <div className="text-center mb-8">
            <img src="/logo.png" alt="Kid to Kid" className="h-12 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Criar conta</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Faz parte da família Kid to Kid</p>
          </div>

          {/* Formulário */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Nome */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName" className="text-sm text-gray-700 dark:text-gray-300">
                    Nome
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="João"
                    className="mt-1.5"
                    autoComplete="given-name"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm text-gray-700 dark:text-gray-300">
                    Apelido
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Silva"
                    className="mt-1.5"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-sm text-gray-700 dark:text-gray-300">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="o-seu-email@exemplo.com"
                  className="mt-1.5"
                  autoComplete="email"
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              {/* Telemóvel */}
              <div>
                <Label htmlFor="phone" className="text-sm text-gray-700 dark:text-gray-300">
                  Telemóvel <span className="text-gray-400 dark:text-gray-500 text-xs">(opcional)</span>
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="912 345 678"
                  className="mt-1.5"
                  autoComplete="tel"
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password" className="text-sm text-gray-700 dark:text-gray-300">
                  Password
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    className="pr-10"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                    aria-label={showPassword ? "Esconder password" : "Mostrar password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirmar Password */}
              <div>
                <Label htmlFor="confirmPassword" className="text-sm text-gray-700 dark:text-gray-300">
                  Confirmar password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirmar password"
                  className="mt-1.5"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">As passwords não coincidem</p>
                )}
              </div>

              {/* Termos */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="acceptTerms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, acceptTerms: checked as boolean }))
                    }
                    disabled={isLoading}
                    className="mt-0.5"
                  />
                  <Label htmlFor="acceptTerms" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer leading-tight">
                    Aceito os{" "}
                    <Link to="/termos-e-condicoes" className="text-blue-600 hover:underline">
                      Termos
                    </Link>{" "}
                    e{" "}
                    <Link to="/politica-de-privacidade" className="text-blue-600 hover:underline">
                      Política de Privacidade
                    </Link>
                  </Label>
                </div>
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="acceptNewsletter"
                    checked={formData.acceptNewsletter}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, acceptNewsletter: checked as boolean }))
                    }
                    disabled={isLoading}
                    className="mt-0.5"
                  />
                  <Label htmlFor="acceptNewsletter" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer leading-tight">
                    Quero receber novidades e promoções
                  </Label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2"
                disabled={isLoading}
              >
                {isLoading ? "A criar conta..." : "Criar conta"}
              </Button>
            </form>

            {/* Separador */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white dark:bg-gray-900 px-3 text-xs text-gray-500 dark:text-gray-400">ou</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm text-gray-700 dark:text-gray-300">Continuar com Google</span>
              </button>
            </div>
          </div>

          {/* Link entrar */}
          <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
            Já tem conta?{" "}
            <Link to="/entrar" className="text-blue-600 font-medium hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}

