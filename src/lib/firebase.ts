import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"

// Configuração do Firebase - Kid to Kid
const firebaseConfig = {
  apiKey: "AIzaSyCVLRYk2rY_rdEIDwK1e-3q5HQO7JWv_xo",
  authDomain: "kidtokid-4d642.firebaseapp.com",
  projectId: "kidtokid-4d642",
  storageBucket: "kidtokid-4d642.firebasestorage.app",
  messagingSenderId: "760562672452",
  appId: "1:760562672452:web:59fb48154428a340aa2d11",
  measurementId: "G-GC27W9RBF5"
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)

// Inicializar serviços
export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)

export default app
