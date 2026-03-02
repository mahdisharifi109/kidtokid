import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore"
import { db } from "@/src/lib/firebase"
import type { IProduct } from "@/src/types"

const FAVORITES_COLLECTION = "favorites"

export interface FavoriteDoc {
  userId: string
  productId: string
  product: IProduct
  createdAt: Date
}

/**
 * Obter todos os favoritos de um utilizador do Firestore
 */
export async function getUserFavorites(userId: string): Promise<IProduct[]> {
  const favRef = collection(db, FAVORITES_COLLECTION)
  const q = query(favRef, where("userId", "==", userId))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      ...data.product,
      createdAt: data.product.createdAt?.toDate?.() || new Date(),
      updatedAt: data.product.updatedAt?.toDate?.(),
    } as IProduct
  })
}

/**
 * Adicionar produto aos favoritos no Firestore
 */
export async function addFavoriteToFirestore(
  userId: string,
  product: IProduct
): Promise<void> {
  const docId = `${userId}_${product.id}`
  await setDoc(doc(db, FAVORITES_COLLECTION, docId), {
    userId,
    productId: product.id,
    product: {
      ...product,
      // Converter Dates para timestamps compatíveis
      createdAt: product.createdAt,
      updatedAt: product.updatedAt || null,
    },
    createdAt: new Date(),
  })
}

/**
 * Remover produto dos favoritos no Firestore
 */
export async function removeFavoriteFromFirestore(
  userId: string,
  productId: string
): Promise<void> {
  const docId = `${userId}_${productId}`
  await deleteDoc(doc(db, FAVORITES_COLLECTION, docId))
}

/**
 * Limpar todos os favoritos de um utilizador
 */
export async function clearFavoritesFromFirestore(
  userId: string
): Promise<void> {
  const favRef = collection(db, FAVORITES_COLLECTION)
  const q = query(favRef, where("userId", "==", userId))
  const snapshot = await getDocs(q)

  const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref))
  await Promise.all(deletePromises)
}
