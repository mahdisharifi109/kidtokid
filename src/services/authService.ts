import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  type User,
} from "firebase/auth"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/src/lib/firebase"

// Providers para login social
const googleProvider = new GoogleAuthProvider()
const facebookProvider = new FacebookAuthProvider()

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
  try {
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

    return user
  } catch (error) {
    throw error
  }
}

// Login com email e password
export const loginWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    throw error
  }
}

// Login com Google
export const loginWithGoogle = async (): Promise<User> => {
  try {
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
  } catch (error) {
    throw error
  }
}

// Login com Facebook
export const loginWithFacebook = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, facebookProvider)
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
  } catch (error) {
    throw error
  }
}

// Logout
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth)
  } catch (error) {
    throw error
  }
}

// Recuperar password
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error) {
    throw error
  }
}

// Obter dados do utilizador do Firestore
export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid))
    if (userDoc.exists()) {
      return userDoc.data() as UserData
    }
    return null
  } catch (error) {
    throw error
  }
}

// Listener para mudanças no estado de autenticação
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback)
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
    "auth/network-request-failed": "Erro de rede. Verifique a sua ligação à internet.",
    "auth/popup-closed-by-user": "O popup foi fechado antes de completar o login.",
    "auth/cancelled-popup-request": "Operação cancelada.",
    "auth/account-exists-with-different-credential": "Já existe uma conta com este email mas com outro método de login.",
  }

  return errorMessages[errorCode] || "Ocorreu um erro. Tente novamente."
}

