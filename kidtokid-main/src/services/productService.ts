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
    title: data.title || '',
    brand: data.brand || '',
    price: data.price || 0,
    originalPrice: data.originalPrice,
    size: data.size || '',
    condition: (data.condition || 'bom') as ProductCondition,
    images: data.images || [],
    category: data.category || '',
    subcategory: data.subcategory,
    gender: data.gender,
    color: data.color,
    season: data.season,
    stock: data.stock ?? 1,
    isReserved: data.isReserved || false,
    description: data.description,
    sku: data.sku,
    rating: data.rating,
    reviewCount: data.reviewCount,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate(),
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

// Buscar produtos por categoria (exclui vendidos — apenas para páginas públicas)
export async function getProductsByCategory(category: string): Promise<IProduct[]> {
  const productsRef = collection(db, PRODUCTS_COLLECTION)
  const q = query(
    productsRef,
    where("category", "==", category),
    orderBy("createdAt", "desc")
  )
  const snapshot = await getDocs(q)
  // Filtragem de stock feita no cliente (evita índice composto)
  return snapshot.docs.map(convertToProduct).filter(p => p.stock > 0)
}

// Buscar produtos com filtros
export async function getProductsWithFilters(filters: IFilter): Promise<IProduct[]> {
  const productsRef = collection(db, PRODUCTS_COLLECTION)
  const constraints: QueryConstraint[] = []

  // Firestore só permite UM filtro "in" por query.
  // Aplicamos o filtro de categoria no Firestore (mais seletivo)
  // e os restantes (gender, condition, size, brand) no cliente.
  if (filters.category && filters.category.length > 0) {
    constraints.push(where("category", "in", filters.category))
  }

  constraints.push(orderBy("createdAt", "desc"))

  const q = query(productsRef, ...constraints)
  const snapshot = await getDocs(q)
  
  let products = snapshot.docs.map(convertToProduct)

  // Filtros aplicados no cliente (limitação do Firestore: apenas 1 "in" por query)
  if (filters.gender && filters.gender.length > 0) {
    products = products.filter((p) => p.gender && filters.gender!.includes(p.gender))
  }

  if (filters.condition && filters.condition.length > 0) {
    products = products.filter((p) => filters.condition!.includes(p.condition))
  }

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

  // Excluir produtos vendidos (stock === 0) das listagens públicas
  products = products.filter(p => p.stock > 0)

  return products
}

// Buscar produtos com paginação (exclui vendidos para páginas públicas)
export async function getProductsPaginated(
  pageSize: number = 20,
  lastDoc?: DocumentData,
  category?: string
): Promise<{ products: IProduct[]; lastDoc: DocumentData | null; hasMore: boolean }> {
  const productsRef = collection(db, PRODUCTS_COLLECTION)
  const constraints: QueryConstraint[] = []

  if (category) {
    constraints.push(where("category", "==", category))
  }

  // Ordenar por data (sem filtro stock no Firestore — filtramos no cliente)
  constraints.push(orderBy("createdAt", "desc"))

  if (lastDoc) {
    constraints.push(startAfter(lastDoc))
  }

  // Buscar mais do que o necessário para compensar filtro de stock no cliente
  constraints.push(limit(pageSize * 3))

  const q = query(productsRef, ...constraints)
  const snapshot = await getDocs(q)
  // Filtrar stock no cliente
  const allProducts = snapshot.docs.map(convertToProduct).filter(p => p.stock > 0)
  const products = allProducts.slice(0, pageSize)
  const newLastDoc = snapshot.docs[snapshot.docs.length - 1] || null

  return { products, lastDoc: newLastDoc, hasMore: allProducts.length >= pageSize }
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
  updateData.updatedAt = Timestamp.now()
  
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

// Pesquisar produtos por texto (com filtros e ordenação opcionais)
export async function searchProducts(
  searchTerm: string,
  filters?: IFilter,
  sortBy: string = "relevance"
): Promise<IProduct[]> {
  // Firestore não suporta pesquisa de texto completa nativamente
  // Esta implementação carrega produtos com filtros de Firestore quando possível
  // e depois aplica pesquisa textual e filtros adicionais no cliente
  const productsRef = collection(db, PRODUCTS_COLLECTION)
  const constraints: QueryConstraint[] = []

  // Aplicar filtros Firestore nativos quando possível
  if (filters?.category && filters.category.length > 0) {
    constraints.push(where("category", "in", filters.category))
  } else if (filters?.gender && filters.gender.length > 0) {
    constraints.push(where("gender", "in", filters.gender))
  }

  constraints.push(orderBy("createdAt", "desc"))
  constraints.push(limit(500)) // Cap to prevent loading entire collection

  const q = query(productsRef, ...constraints)
  const snapshot = await getDocs(q)
  let products = snapshot.docs.map(convertToProduct)

  // Pesquisa textual
  if (searchTerm.trim()) {
    const terms = searchTerm.toLowerCase().split(/\s+/).filter(Boolean)
    products = products.filter((product) => {
      const searchableText = [
        product.title,
        product.brand,
        product.description || "",
        product.category,
        product.subcategory || "",
        product.color || "",
      ]
        .join(" ")
        .toLowerCase()

      return terms.every((term) => searchableText.includes(term))
    })
  }

  // Filtros aplicados no cliente
  if (filters?.condition && filters.condition.length > 0) {
    products = products.filter((p) => filters.condition!.includes(p.condition))
  }

  if (filters?.size && filters.size.length > 0) {
    products = products.filter((p) => filters.size!.includes(p.size))
  }

  if (filters?.brand && filters.brand.length > 0) {
    products = products.filter((p) =>
      filters.brand!.some((b) => p.brand.toLowerCase() === b.toLowerCase())
    )
  }

  if (filters?.priceRange) {
    products = products.filter(
      (p) => p.price >= filters.priceRange!.min && p.price <= filters.priceRange!.max
    )
  }

  // Se os filtros de gender não foram usados como Firestore query, aplicar no cliente
  if (
    filters?.gender &&
    filters.gender.length > 0 &&
    filters?.category &&
    filters.category.length > 0
  ) {
    products = products.filter((p) => p.gender && filters.gender!.includes(p.gender))
  }

  // Também aplicar gender no cliente se não havia filtro de categoria
  // (gender já foi aplicado no Firestore nesse caso, exceto se nenhum filtro foi aplicado)
  // Este caso é coberto porque se category está vazio, gender vai para o Firestore via 'in' query

  // Ordenação
  switch (sortBy) {
    case "price-asc":
      products.sort((a, b) => a.price - b.price)
      break
    case "price-desc":
      products.sort((a, b) => b.price - a.price)
      break
    case "newest":
      products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      break
    case "relevance":
    default:
      // Para relevância, produtos cujo título contém o termo ficam primeiro
      if (searchTerm.trim()) {
        const lower = searchTerm.toLowerCase()
        products.sort((a, b) => {
          const aTitle = a.title.toLowerCase().includes(lower) ? 0 : 1
          const bTitle = b.title.toLowerCase().includes(lower) ? 0 : 1
          return aTitle - bTitle
        })
      }
      break
  }

  // Excluir produtos vendidos (stock === 0) das pesquisas públicas
  products = products.filter(p => p.stock > 0)

  return products
}

