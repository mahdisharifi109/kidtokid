import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  type DocumentData,
} from "firebase/firestore"
import { db } from "@/src/lib/firebase"
import type { ICategory } from "@/src/types"
import { CATEGORIES } from "@/src/data/productsData"

const CATEGORIES_COLLECTION = "categories"

// Converter Firestore document para ICategory
function convertToCategory(doc: DocumentData): ICategory {
  const data = doc.data()
  return {
    id: data.id || doc.id,
    name: data.name,
    icon: data.icon,
    color: data.color,
    image: data.image,
  }
}

// Buscar todas as categorias do Firebase
export async function getAllCategories(): Promise<ICategory[]> {
  try {
    const categoriesRef = collection(db, CATEGORIES_COLLECTION)
    const q = query(categoriesRef, orderBy("name"))
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      // Se não houver categorias no Firebase, usar as locais
      return CATEGORIES
    }
    
    return snapshot.docs.map(convertToCategory)
  } catch (error) {
    console.error("Erro ao buscar categorias:", error)
    // Fallback para categorias locais
    return CATEGORIES
  }
}

// Buscar categoria por ID
export async function getCategoryById(id: string): Promise<ICategory | null> {
  // Primeiro tentar encontrar nas categorias locais
  const localCategory = CATEGORIES.find((c) => c.id === id)
  if (localCategory) return localCategory

  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return convertToCategory(docSnap)
    }
    return null
  } catch (error) {
    console.error("Erro ao buscar categoria:", error)
    return null
  }
}

// Buscar categoria por slug/id (para navegação)
export function getCategoryBySlug(slug: string): ICategory | undefined {
  return CATEGORIES.find((c) => c.id === slug)
}

// Exportar categorias locais para uso imediato
export { CATEGORIES }
