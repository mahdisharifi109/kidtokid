/**
 * FICHEIRO: firebase.ts
 * PAP (Prova de Aptidão Profissional) - Kid to Kid
 * 
 * FUNÇÃO DESTE FICHEIRO:
 * O elo de ligação entre a nossa Aplicação Web e a nossa "Cloud" (Firebase da Google).
 * Faz a inicialização/arranque e exporta a "Base de Dados", "Autenticação" e o "Disco" (Storage - imagens).
 * 
 * CONCEITOS IMPORTANTES A EXPLICAR NA DEFESA:
 * 1. Variáveis de Ambiente (.env): As chaves da API não estão "chumbadas" (hardcoded) aqui em texto simples,
 *    por razões de segurança. O "import.meta.env" serve para garantir que as chaves só são injetadas em tempo de Build (Vite)
 *    ou lidas em segurança localmente via ficheiro .env.local (o qual nunca vai para o GitHub).
 * 2. Segurança Client-Side: Embora vejamos "apiKey" aqui a ser exposta ao lado do Cliente, isso é normal 
 *    na arquitetura web moderna (SPA). O "policiamento" verdadeiro ocorre DENTRO do Servidor (Firestore Rules).
 * 3. Exportações (export): As variáveis `db`, `auth` e `storage` são "Singletons". 
 *    É iniciada apenas uma única instância da base de dados que é reutilizada em todo o projeto, poupando memória do PC do cliente.
 */

import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"

// Configuração do Firebase - Carregada via variáveis de ambiente (.env.local)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

// Validar que as variáveis de ambiente estão definidas
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error(
    "Firebase config em falta! Verifique o ficheiro .env.local com as variáveis VITE_FIREBASE_*"
  )
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)

// Inicializar serviços
export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)

export default app

