import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "firebase/auth"
import { getFunctions, httpsCallable } from "firebase/functions"
import {
  onAuthChange,
  loginWithEmail,
  loginWithGoogle,
  registerWithEmail,
  logout as firebaseLogout,
  resetPassword,
  getUserData,
  onUserDataChange,
  updateUserData,
  uploadProfilePhoto,
  removeProfilePhoto,
  getAuthErrorMessage,
  checkIsAdmin,
  ADMIN_EMAILS,
  type UserData,
  type Address,
} from "@/src/services/authService"

interface AuthContextType {
  user: User | null
  userData: UserData | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  loginGoogle: () => Promise<{ success: boolean; error?: string }>
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
  updateProfile: (data: {
    firstName?: string
    lastName?: string
    phone?: string
    newsletter?: boolean
    addresses?: Address[]
  }) => Promise<{ success: boolean; error?: string }>
  uploadPhoto: (file: File) => Promise<{ success: boolean; url?: string; error?: string }>
  removePhoto: () => Promise<{ success: boolean; error?: string }>
  refreshUserData: () => Promise<void>
  forceTokenRefresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    let unsubUserData: (() => void) | null = null

    const unsubscribe = onAuthChange(async (firebaseUser) => {
      // Clean up previous user data listener
      if (unsubUserData) {
        unsubUserData()
        unsubUserData = null
      }

      setUser(firebaseUser)

      if (firebaseUser) {
        // Set up real-time listener for user profile data
        unsubUserData = onUserDataChange(firebaseUser.uid, (data) => {
          setUserData(data)
        })

        // Verificar se é admin
        try {
          const adminStatus = await checkIsAdmin(firebaseUser)
          setIsAdmin(adminStatus)

          // Se é admin via email list mas sem custom claims, auto-set claims
          if (adminStatus && firebaseUser.email && ADMIN_EMAILS.includes(firebaseUser.email.toLowerCase())) {
            const idToken = await firebaseUser.getIdTokenResult()
            if (idToken.claims.admin !== true) {
              try {
                const functions = getFunctions(undefined, 'europe-west1')
                const setAdminClaims = httpsCallable(functions, 'setAdminClaims')
                await setAdminClaims({})
                // Force token refresh to pick up new claims
                await firebaseUser.getIdToken(true)
              } catch (e) {
                console.warn("Could not auto-set admin claims via Cloud Function:", e)
                // Even without Cloud Functions, force a token refresh
                // so Firestore rules can read request.auth.token.email
                try {
                  await firebaseUser.getIdToken(true)
                } catch (refreshErr) {
                  console.warn("Token refresh failed:", refreshErr)
                }
              }
            }
          }
        } catch (error) {
          console.error("Erro ao carregar dados do utilizador:", error)
          setIsAdmin(false)
        }
      } else {
        setUserData(null)
        setIsAdmin(false)
      }

      setIsLoading(false)
    })

    return () => {
      unsubscribe()
      if (unsubUserData) {
        unsubUserData()
      }
    }
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
      console.error("Password reset error:", errorCode, error)
      return { success: false, error: getAuthErrorMessage(errorCode) }
    }
  }

  const updateProfileData = async (data: {
    firstName?: string
    lastName?: string
    phone?: string
    newsletter?: boolean
    addresses?: Address[]
  }) => {
    if (!user) {
      return { success: false, error: "Utilizador não autenticado" }
    }

    try {
      await updateUserData(user.uid, data)
      // Recarregar dados do utilizador
      const newData = await getUserData(user.uid)
      setUserData(newData)
      return { success: true }
    } catch (error: unknown) {
      console.error("Erro ao atualizar perfil:", error)
      return { success: false, error: "Erro ao atualizar os dados. Tenta novamente." }
    }
  }

  const refreshUserData = async () => {
    if (!user) return
    try {
      const data = await getUserData(user.uid)
      setUserData(data)
    } catch (error) {
      console.error("Erro ao recarregar dados:", error)
    }
  }

  const uploadUserPhoto = async (file: File) => {
    if (!user) {
      return { success: false, error: "Utilizador não autenticado" }
    }
    try {
      const url = await uploadProfilePhoto(user.uid, file)
      const data = await getUserData(user.uid)
      setUserData(data)
      return { success: true, url }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro ao carregar foto"
      return { success: false, error: msg }
    }
  }

  const removeUserPhoto = async () => {
    if (!user) {
      return { success: false, error: "Utilizador não autenticado" }
    }
    try {
      await removeProfilePhoto(user.uid)
      const data = await getUserData(user.uid)
      setUserData(data)
      return { success: true }
    } catch {
      return { success: false, error: "Erro ao remover foto" }
    }
  }

  const forceTokenRefresh = async () => {
    if (!user) return
    try {
      await user.getIdToken(true)
    } catch (error) {
      console.error("Erro ao forçar refresh do token:", error)
    }
  }

  const value: AuthContextType = {
    user,
    userData,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    login,
    loginGoogle,
    register,
    logout,
    sendPasswordReset,
    updateProfile: updateProfileData,
    uploadPhoto: uploadUserPhoto,
    removePhoto: removeUserPhoto,
    refreshUserData,
    forceTokenRefresh,
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

