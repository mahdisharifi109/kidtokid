import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "firebase/auth"
import {
  onAuthChange,
  loginWithEmail,
  loginWithGoogle,
  loginWithFacebook,
  registerWithEmail,
  logout as firebaseLogout,
  resetPassword,
  getUserData,
  getAuthErrorMessage,
  type UserData,
} from "@/src/services/authService"

interface AuthContextType {
  user: User | null
  userData: UserData | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  loginGoogle: () => Promise<{ success: boolean; error?: string }>
  loginFacebook: () => Promise<{ success: boolean; error?: string }>
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone?: string,
    newsletter?: boolean
  ) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser)
      
      if (firebaseUser) {
        // Carregar dados adicionais do utilizador
        try {
          const data = await getUserData(firebaseUser.uid)
          setUserData(data)
        } catch (error) {
          console.error("Erro ao carregar dados do utilizador:", error)
        }
      } else {
        setUserData(null)
      }
      
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      await loginWithEmail(email, password)
      return { success: true }
    } catch (error: unknown) {
      const errorCode = (error as { code?: string }).code || ""
      return { success: false, error: getAuthErrorMessage(errorCode) }
    }
  }

  const loginGoogle = async () => {
    try {
      await loginWithGoogle()
      return { success: true }
    } catch (error: unknown) {
      const errorCode = (error as { code?: string }).code || ""
      return { success: false, error: getAuthErrorMessage(errorCode) }
    }
  }

  const loginFacebook = async () => {
    try {
      await loginWithFacebook()
      return { success: true }
    } catch (error: unknown) {
      const errorCode = (error as { code?: string }).code || ""
      return { success: false, error: getAuthErrorMessage(errorCode) }
    }
  }

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone?: string,
    newsletter?: boolean
  ) => {
    try {
      await registerWithEmail(email, password, firstName, lastName, phone, newsletter)
      return { success: true }
    } catch (error: unknown) {
      const errorCode = (error as { code?: string }).code || ""
      return { success: false, error: getAuthErrorMessage(errorCode) }
    }
  }

  const logout = async () => {
    try {
      await firebaseLogout()
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  const sendPasswordReset = async (email: string) => {
    try {
      await resetPassword(email)
      return { success: true }
    } catch (error: unknown) {
      const errorCode = (error as { code?: string }).code || ""
      return { success: false, error: getAuthErrorMessage(errorCode) }
    }
  }

  const value: AuthContextType = {
    user,
    userData,
    isLoading,
    isAuthenticated: !!user,
    login,
    loginGoogle,
    loginFacebook,
    register,
    logout,
    sendPasswordReset,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}

