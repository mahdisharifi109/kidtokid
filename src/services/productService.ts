import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  type DocumentData,
  type QueryConstraint,
} from "firebase/firestore"
import { db } from "@/src/lib/firebase"
import type { IProduct, IFilter, ProductCondition } from "@/src/types"

const PRODUCTS_COLLECTION = "products"

// Converter Firestore document para IProduct
function convertToProduct(doc: DocumentData): IProduct {
  const data = doc.data()
  return {
    id: doc.id,
    title: data.title,
    brand: data.brand,
    price: data.price,
    originalPrice: data.originalPrice,
    size: data.size,
    condition: data.condition as ProductCondition,
    images: data.images || [],
    category: data.category,
    subcategory: data.subcategory,
    gender: data.gender,
    color: data.color,
    season: data.season,
    stock: data.stock,
    isReserved: data.isReserved || false,
    description: data.description,
    createdAt: data.createdAt?.toDate() || new Date(),
  }
}

// Converter IProduct para dados do Firestore
function convertToFirestore(product: Omit<IProduct, "id">) {
  return {
    ...product,
    createdAt: Timestamp.fromDate(product.createdAt || new Date()),
  }
}

// Buscar todos os produtos
export async function getAllProducts(): Promise<IProduct[]> {
  const productsRef = collection(db, PRODUCTS_COLLECTION)
  const q = query(productsRef, orderBy("createdAt", "desc"))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(convertToProduct)
}

// Buscar produto por ID
export async function getProductById(id: string): Promise<IProduct | null> {
  const docRef = doc(db, PRODUCTS_COLLECTION, id)
  const docSnap = await getDoc(docRef)
  
  if (docSnap.exists()) {
    return convertToProduct(docSnap)
  }
  return null
}

// Buscar produtos por categoria
export async function getProductsByCategory(category: string): Promise<IProduct[]> {
  const productsRef = collection(db, PRODUCTS_COLLECTION)
  const q = query(
    productsRef,
    where("category", "==", category),
    orderBy("createdAt", "desc")
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(convertToProduct)
}

// Buscar produtos com filtros
export async function getProductsWithFilters(filters: IFilter): Promise<IProduct[]> {
  const productsRef = collection(db, PRODUCTS_COLLECTION)
  const constraints: QueryConstraint[] = []

  // Aplicar filtros
  if (filters.category && filters.category.length > 0) {
    constraints.push(where("category", "in", filters.category))
  }

  if (filters.gender && filters.gender.length > 0) {
    constraints.push(where("gender", "in", filters.gender))
  }

  if (filters.condition && filters.condition.length > 0) {
    constraints.push(where("condition", "in", filters.condition))
  }

  constraints.push(orderBy("createdAt", "desc"))

  const q = query(productsRef, ...constraints)
  const snapshot = await getDocs(q)
  
  let products = snapshot.docs.map(convertToProduct)

  // Filtros que precisam ser aplicados no cliente (Firestore limitações)
  if (filters.size && filters.size.length > 0) {
    products = products.filter((p) => filters.size!.includes(p.size))
  }

  if (filters.brand && filters.brand.length > 0) {
    products = products.filter((p) => filters.brand!.includes(p.brand))
  }

  if (filters.priceRange) {
    products = products.filter(
      (p) => p.price >= filters.priceRange!.min && p.price <= filters.priceRange!.max
    )
  }

  return products
}

// Buscar produtos com paginação
export async function getProductsPaginated(
  pageSize: number = 20,
  lastDoc?: DocumentData
): Promise<{ products: IProduct[]; lastDoc: DocumentData | null }> {
  const productsRef = collection(db, PRODUCTS_COLLECTION)
  
  let q
  if (lastDoc) {
    q = query(
      productsRef,
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(pageSize)
    )
  } else {
    q = query(productsRef, orderBy("createdAt", "desc"), limit(pageSize))
  }

  const snapshot = await getDocs(q)
  const products = snapshot.docs.map(convertToProduct)
  const newLastDoc = snapshot.docs[snapshot.docs.length - 1] || null

  return { products, lastDoc: newLastDoc }
}

// Adicionar novo produto
export async function addProduct(product: Omit<IProduct, "id">): Promise<string> {
  const productsRef = collection(db, PRODUCTS_COLLECTION)
  const docRef = await addDoc(productsRef, convertToFirestore(product))
  return docRef.id
}

// Atualizar produto
export async function updateProduct(id: string, updates: Partial<IProduct>): Promise<void> {
  const docRef = doc(db, PRODUCTS_COLLECTION, id)
  
  // Converter data se necessário
  const updateData: Record<string, unknown> = { ...updates }
  if (updates.createdAt) {
    updateData.createdAt = Timestamp.fromDate(updates.createdAt)
  }
  
  await updateDoc(docRef, updateData)
}

// Eliminar produto
export async function deleteProduct(id: string): Promise<void> {
  const docRef = doc(db, PRODUCTS_COLLECTION, id)
  await deleteDoc(docRef)
}

// Reservar produto
export async function reserveProduct(id: string): Promise<void> {
  await updateProduct(id, { isReserved: true })
}

// Cancelar reserva
export async function cancelReservation(id: string): Promise<void> {
  await updateProduct(id, { isReserved: false })
}

// Pesquisar produtos por texto
export async function searchProducts(searchTerm: string): Promise<IProduct[]> {
  // Firestore não suporta pesquisa de texto completa nativamente
  // Esta é uma implementação básica - para pesquisa avançada, considere usar Algolia ou Typesense
  const allProducts = await getAllProducts()
  const lowerSearchTerm = searchTerm.toLowerCase()
  
  return allProducts.filter(
    (product) =>
      product.title.toLowerCase().includes(lowerSearchTerm) ||
      product.brand.toLowerCase().includes(lowerSearchTerm) ||
      product.description?.toLowerCase().includes(lowerSearchTerm) ||
      product.category.toLowerCase().includes(lowerSearchTerm)
  )
}

