import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { IUser } from "@/src/types"
import {
  signIn,
  signUp,
  signOut,
  signInWithGoogle,
  onAuthChange,
  resetPassword,
} from "@/src/services/authService"

interface AuthContextType {
  user: IUser | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName?: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)
      const user = await signIn(email, password)
      setUser(user)
    } catch (err: any) {
      setError(getErrorMessage(err.code))
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, displayName?: string) => {
    try {
      setError(null)
      setLoading(true)
      const user = await signUp(email, password, displayName)
      setUser(user)
    } catch (err: any) {
      setError(getErrorMessage(err.code))
      throw err
    } finally {
      setLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    try {
      setError(null)
      setLoading(true)
      const user = await signInWithGoogle()
      setUser(user)
    } catch (err: any) {
      setError(getErrorMessage(err.code))
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setError(null)
      await signOut()
      setUser(null)
    } catch (err: any) {
      setError(getErrorMessage(err.code))
      throw err
    }
  }

  const forgotPassword = async (email: string) => {
    try {
      setError(null)
      await resetPassword(email)
    } catch (err: any) {
      setError(getErrorMessage(err.code))
      throw err
    }
  }

  const clearError = () => setError(null)

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        loginWithGoogle,
        logout,
        forgotPassword,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Mensagens de erro em português
function getErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    "auth/email-already-in-use": "Este email já está registado.",
    "auth/invalid-email": "O email introduzido não é válido.",
    "auth/operation-not-allowed": "Operação não permitida.",
    "auth/weak-password": "A password deve ter pelo menos 6 caracteres.",
    "auth/user-disabled": "Esta conta foi desativada.",
    "auth/user-not-found": "Não existe uma conta com este email.",
    "auth/wrong-password": "Password incorreta.",
    "auth/invalid-credential": "Credenciais inválidas.",
    "auth/too-many-requests": "Demasiadas tentativas. Tente novamente mais tarde.",
    "auth/popup-closed-by-user": "A janela de login foi fechada.",
    "auth/network-request-failed": "Erro de ligação. Verifique a sua internet.",
  }

  return errorMessages[errorCode] || "Ocorreu um erro. Tente novamente."
}
