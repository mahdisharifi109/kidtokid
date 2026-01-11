import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  type User,
} from "firebase/auth"
import { doc, setDoc, getDoc, Timestamp } from "firebase/firestore"
import { auth, db } from "@/src/lib/firebase"
import type { IUser } from "@/src/types"

const USERS_COLLECTION = "users"

// Converter Firebase User para IUser
async function convertToIUser(firebaseUser: User): Promise<IUser> {
  const userDoc = await getDoc(doc(db, USERS_COLLECTION, firebaseUser.uid))
  const userData = userDoc.data()

  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || "",
    displayName: firebaseUser.displayName || userData?.displayName,
    photoURL: firebaseUser.photoURL || userData?.photoURL,
    createdAt: userData?.createdAt?.toDate() || new Date(),
  }
}

// Criar documento do utilizador no Firestore
async function createUserDocument(user: User): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, user.uid)
  const userDoc = await getDoc(userRef)

  if (!userDoc.exists()) {
    await setDoc(userRef, {
      email: user.email,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      createdAt: Timestamp.now(),
    })
  }
}

// Registar novo utilizador
export async function signUp(
  email: string,
  password: string,
  displayName?: string
): Promise<IUser> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  
  if (displayName) {
    await updateProfile(userCredential.user, { displayName })
  }
  
  await createUserDocument(userCredential.user)
  return convertToIUser(userCredential.user)
}

// Iniciar sessão com email e password
export async function signIn(email: string, password: string): Promise<IUser> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return convertToIUser(userCredential.user)
}

// Iniciar sessão com Google
export async function signInWithGoogle(): Promise<IUser> {
  const provider = new GoogleAuthProvider()
  const userCredential = await signInWithPopup(auth, provider)
  await createUserDocument(userCredential.user)
  return convertToIUser(userCredential.user)
}

// Terminar sessão
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth)
}

// Recuperar password
export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email)
}

// Obter utilizador atual
export function getCurrentUser(): User | null {
  return auth.currentUser
}

// Observar alterações de autenticação
export function onAuthChange(callback: (user: IUser | null) => void): () => void {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const user = await convertToIUser(firebaseUser)
      callback(user)
    } else {
      callback(null)
    }
  })
}

// Atualizar perfil do utilizador
export async function updateUserProfile(
  displayName?: string,
  photoURL?: string
): Promise<void> {
  const user = auth.currentUser
  if (!user) throw new Error("Utilizador não autenticado")

  const updates: { displayName?: string; photoURL?: string } = {}
  if (displayName) updates.displayName = displayName
  if (photoURL) updates.photoURL = photoURL

  await updateProfile(user, updates)

  // Atualizar também no Firestore
  const userRef = doc(db, USERS_COLLECTION, user.uid)
  await setDoc(userRef, updates, { merge: true })
}
