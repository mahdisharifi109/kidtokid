import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  type User,
} from "firebase/auth"
import { doc, setDoc, getDoc, serverTimestamp, onSnapshot, Timestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { auth, db, storage } from "@/src/lib/firebase"

// Providers para login social
const googleProvider = new GoogleAuthProvider()

// Interface para dados do utilizador
export interface UserData {
  uid: string
  email: string | null
  displayName: string | null
  firstName?: string
  lastName?: string
  phone?: string
  photoURL: string | null
  createdAt?: Date
  newsletter?: boolean
  role?: string
  addresses?: Address[]
}

// Criar conta com email e password
export const registerWithEmail = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  phone?: string,
  newsletter?: boolean
): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const user = userCredential.user

  // Atualizar o perfil com o nome
  await updateProfile(user, {
    displayName: `${firstName} ${lastName}`,
  })

  // Guardar dados adicionais no Firestore
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email: user.email,
    firstName,
    lastName,
    displayName: `${firstName} ${lastName}`,
    phone: phone || null,
    photoURL: null,
    newsletter: newsletter || false,
    createdAt: serverTimestamp(),
  })

  // Se aceitou newsletter, subscrever na coleção newsletter
  // Isto dispara a Cloud Function onNewsletterSubscribe que envia email de boas-vindas
  if (newsletter && user.email) {
    try {
      await setDoc(doc(db, "newsletter", user.email), {
        email: user.email,
        subscribedAt: Timestamp.now(),
        active: true,
      })
    } catch (err) {
      // Não bloquear registo se a subscrição falhar (pode já existir)
      console.warn("Newsletter subscription during register failed:", err)
    }
  }

  return user
}

// Login com email e password
export const loginWithEmail = async (email: string, password: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return userCredential.user
}

// Login com Google
export const loginWithGoogle = async (): Promise<User> => {
  const result = await signInWithPopup(auth, googleProvider)
  const user = result.user

  // Verificar se é um novo utilizador e guardar no Firestore
  const userDoc = await getDoc(doc(db, "users", user.uid))
  if (!userDoc.exists()) {
    const nameParts = user.displayName?.split(" ") || ["", ""]
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      firstName: nameParts[0],
      lastName: nameParts.slice(1).join(" "),
      displayName: user.displayName,
      phone: user.phoneNumber,
      photoURL: user.photoURL,
      newsletter: false,
      createdAt: serverTimestamp(),
    })
  }

  return user
}

// Logout
export const logout = async (): Promise<void> => {
  await signOut(auth)
}

// Recuperar password (via Cloud Function que usa SMTP do Gmail, com fallback para Firebase nativo)
export const resetPassword = async (email: string): Promise<void> => {
  try {
    const { getFunctions, httpsCallable } = await import("firebase/functions")
    const functions = getFunctions(undefined, 'europe-west1')
    const sendReset = httpsCallable(functions, 'customPasswordReset')
    const result = await sendReset({
      email,
      continueUrl: window.location.origin + '/entrar',
    })
    const data = result.data as { success?: boolean }
    if (!data.success) {
      throw new Error("Falha ao enviar email")
    }
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string }
    // Google-only accounts — show specific message
    if (err?.code === 'functions/failed-precondition') {
      throw { code: 'auth/google-only-account', message: err.message }
    }
    // For any other Cloud Function error, fallback to Firebase native reset
    console.warn("Cloud Function password reset failed, using Firebase native:", err?.code, err?.message)
    const actionCodeSettings = {
      url: window.location.origin + '/entrar',
      handleCodeInApp: false,
    }
    await sendPasswordResetEmail(auth, email, actionCodeSettings)
  }
}

// Recuperar password (para utilizadores não autenticados — usa Firebase nativo)
export const resetPasswordUnauthenticated = async (email: string): Promise<void> => {
  const actionCodeSettings = {
    url: window.location.origin + '/entrar',
    handleCodeInApp: false,
  }
  await sendPasswordResetEmail(auth, email, actionCodeSettings)
}

// Obter dados do utilizador do Firestore
export const getUserData = async (uid: string): Promise<UserData | null> => {
  const userDoc = await getDoc(doc(db, "users", uid))
  if (userDoc.exists()) {
    return userDoc.data() as UserData
  }
  return null
}

// Listener em tempo real para dados do utilizador
export const onUserDataChange = (
  uid: string,
  callback: (data: UserData | null) => void
): (() => void) => {
  return onSnapshot(
    doc(db, "users", uid),
    (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as UserData)
      } else {
        callback(null)
      }
    },
    (error) => {
      console.error("Erro no listener de userData:", error)
      callback(null)
    }
  )
}

// Listener para mudanças no estado de autenticação
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback)
}

// Atualizar dados do utilizador no Firestore
export const updateUserData = async (
  uid: string,
  data: Partial<{
    firstName: string
    lastName: string
    phone: string
    newsletter: boolean
    addresses: Address[]
    photoURL: string | null
  }>
): Promise<void> => {
  const userRef = doc(db, "users", uid)

  // Atualizar displayName se firstName ou lastName mudarem
  const updateData: Record<string, unknown> = { ...data }
  if (data.firstName !== undefined || data.lastName !== undefined) {
    const userDoc = await getDoc(userRef)
    if (userDoc.exists()) {
      const currentData = userDoc.data()
      const firstName = data.firstName ?? currentData.firstName ?? ""
      const lastName = data.lastName ?? currentData.lastName ?? ""
      updateData.displayName = `${firstName} ${lastName}`.trim()
    }
  }

  await setDoc(userRef, updateData, { merge: true })

  // Atualizar também o perfil do Firebase Auth
  if (auth.currentUser) {
    const authUpdate: { displayName?: string; photoURL?: string | null } = {}
    if (updateData.displayName) {
      authUpdate.displayName = updateData.displayName as string
    }
    if (data.photoURL !== undefined) {
      authUpdate.photoURL = data.photoURL
    }
    if (Object.keys(authUpdate).length > 0) {
      await updateProfile(auth.currentUser, authUpdate)
    }
  }
}

// Upload de foto de perfil
export const uploadProfilePhoto = async (uid: string, file: File): Promise<string> => {
  // Validar ficheiro
  if (!file.type.startsWith("image/")) {
    throw new Error("O ficheiro deve ser uma imagem")
  }
  if (file.size > 2 * 1024 * 1024) {
    throw new Error("A imagem deve ter no máximo 2MB")
  }

  const ext = file.name.split(".").pop() || "jpg"
  const storageRef = ref(storage, `users/${uid}/avatar/profile.${ext}`)

  await uploadBytes(storageRef, file)
  const downloadURL = await getDownloadURL(storageRef)

  // Atualizar no Firestore e Auth
  await updateUserData(uid, { photoURL: downloadURL })

  return downloadURL
}

// Remover foto de perfil
export const removeProfilePhoto = async (uid: string): Promise<void> => {
  try {
    // Tentar apagar da storage (pode falhar se não existir)
    const extensions = ["jpg", "jpeg", "png", "webp"]
    for (const ext of extensions) {
      try {
        const storageRef = ref(storage, `users/${uid}/avatar/profile.${ext}`)
        await deleteObject(storageRef)
      } catch {
        // Ignorar se não existir
      }
    }
  } catch {
    // Ignorar erros de storage
  }

  // Limpar URL no Firestore e Auth
  await updateUserData(uid, { photoURL: null })
}

// Interface para moradas
export interface Address {
  id: string
  name: string
  street: string
  city: string
  postalCode: string
  country: string
  phone?: string
  isDefault: boolean
}

// Traduzir erros do Firebase para português
export const getAuthErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    "auth/email-already-in-use": "Este email já está registado. Tente fazer login.",
    "auth/invalid-email": "O email introduzido não é válido.",
    "auth/operation-not-allowed": "Operação não permitida.",
    "auth/weak-password": "A password é demasiado fraca. Use pelo menos 6 caracteres.",
    "auth/user-disabled": "Esta conta foi desativada.",
    "auth/user-not-found": "Não existe nenhuma conta com este email.",
    "auth/wrong-password": "Password incorreta.",
    "auth/invalid-credential": "Email ou password incorretos.",
    "auth/too-many-requests": "Demasiadas tentativas. Tente novamente mais tarde.",
    "auth/network-request-failed": "Erro de rede. Verifica a tua ligação à internet.",
    "auth/popup-closed-by-user": "O popup foi fechado antes de completar o login.",
    "auth/cancelled-popup-request": "Operação cancelada.",
    "auth/account-exists-with-different-credential": "Já existe uma conta com este email mas com outro método de login.",
    "auth/rate-limited": "Demasiadas tentativas. Aguarda alguns minutos.",
    "auth/google-only-account": "A tua conta usa Google para login. Não é possível alterar a password por aqui.",
  }

  return errorMessages[errorCode] || "Ocorreu um erro. Tente novamente."
}

// Admin verification

// Lista de emails de administradores — lida de variável de ambiente para evitar
// expor endereços pessoais no código fonte. Defina VITE_ADMIN_EMAILS no .env
// como uma lista separada por vírgulas (ex: "info@kidtokid.pt,outro@exemplo.pt").
// Em produção, a abordagem mais segura é usar apenas Firebase custom claims (Método 1).
const _envAdminEmails = import.meta.env.VITE_ADMIN_EMAILS
export const ADMIN_EMAILS: string[] = _envAdminEmails
  ? _envAdminEmails
      .split(",")
      .map((e: string) => e.trim().toLowerCase())
      .filter((e: string) => e.includes("@") && e.includes("."))
  : []

// Verificar se o utilizador é admin
// SECURITY: Only trust Firebase Auth custom claims and the environment-configured
// email list. Never check Firestore documents — users can write to their own profile.
export const checkIsAdmin = async (user: User): Promise<boolean> => {
  if (!user || !user.email) return false
  
  try {
    // Método 1: Verificar custom claims do Firebase (mais seguro)
    const idTokenResult = await user.getIdTokenResult()
    if (idTokenResult.claims.admin === true) {
      return true
    }
    
    // Método 2: Verificar na lista de emails (fallback via variável de ambiente)
    if (ADMIN_EMAILS.length > 0 && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      return true
    }
    
    return false
  } catch (error) {
    console.error("Erro ao verificar admin:", error)
    return false
  }
}

// Client-side rate limiting

interface LoginAttempt {
  count: number
  firstAttempt: number
  blockedUntil: number | null
}

const loginAttempts = new Map<string, LoginAttempt>()

const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutos
const BLOCK_DURATION_MS = 30 * 60 * 1000 // 30 minutos de bloqueio

export const checkRateLimit = (email: string): { allowed: boolean; waitTime?: number } => {
  const now = Date.now()
  const key = email.toLowerCase().trim()
  const attempt = loginAttempts.get(key)
  
  if (!attempt) {
    loginAttempts.set(key, { count: 1, firstAttempt: now, blockedUntil: null })
    return { allowed: true }
  }
  
  // Verificar se está bloqueado
  if (attempt.blockedUntil && now < attempt.blockedUntil) {
    const waitTime = Math.ceil((attempt.blockedUntil - now) / 1000 / 60)
    return { allowed: false, waitTime }
  }
  
  // Reset se passou a janela de tempo
  if (now - attempt.firstAttempt > WINDOW_MS) {
    loginAttempts.set(key, { count: 1, firstAttempt: now, blockedUntil: null })
    return { allowed: true }
  }
  
  // Incrementar contador
  attempt.count++
  
  // Bloquear se excedeu tentativas
  if (attempt.count > MAX_ATTEMPTS) {
    attempt.blockedUntil = now + BLOCK_DURATION_MS
    loginAttempts.set(key, attempt)
    return { allowed: false, waitTime: Math.ceil(BLOCK_DURATION_MS / 1000 / 60) }
  }
  
  loginAttempts.set(key, attempt)
  return { allowed: true }
}

export const resetRateLimit = (email: string): void => {
  loginAttempts.delete(email.toLowerCase().trim())
}

// Login seguro com rate limiting
export const secureLogin = async (
  email: string, 
  password: string
): Promise<{ user?: User; error?: string; blocked?: boolean; waitTime?: number }> => {
  // Verificar rate limit
  const rateCheck = checkRateLimit(email)
  if (!rateCheck.allowed) {
    return { 
      error: `Demasiadas tentativas. Aguarda ${rateCheck.waitTime} minutos.`,
      blocked: true,
      waitTime: rateCheck.waitTime
    }
  }
  
  try {
    const user = await loginWithEmail(email, password)
    // Login bem sucedido - limpar tentativas
    resetRateLimit(email)
    return { user }
  } catch (error: unknown) {
    const errorCode = (error as { code?: string }).code || ""
    return { error: getAuthErrorMessage(errorCode) }
  }
}

