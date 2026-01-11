import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  type DocumentData,
} from "firebase/firestore"
import { db } from "@/src/lib/firebase"
import type { IProduct, ICartItem } from "@/src/types"

// Tipos para encomendas
export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"

export interface IOrderItem {
  productId: string
  title: string
  price: number
  quantity: number
  size: string
  image: string
}

export interface IOrder {
  id: string
  userId: string
  items: IOrderItem[]
  totalPrice: number
  status: OrderStatus
  shippingAddress: {
    name: string
    address: string
    city: string
    postalCode: string
    phone: string
  }
  createdAt: Date
  updatedAt: Date
}

const ORDERS_COLLECTION = "orders"

// Converter documento Firestore para IOrder
function convertToOrder(doc: DocumentData): IOrder {
  const data = doc.data()
  return {
    id: doc.id,
    userId: data.userId,
    items: data.items,
    totalPrice: data.totalPrice,
    status: data.status as OrderStatus,
    shippingAddress: data.shippingAddress,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  }
}

// Criar nova encomenda
export async function createOrder(
  userId: string,
  cartItems: ICartItem[],
  shippingAddress: IOrder["shippingAddress"]
): Promise<string> {
  const ordersRef = collection(db, ORDERS_COLLECTION)

  const orderItems: IOrderItem[] = cartItems.map((item) => ({
    productId: item.product.id,
    title: item.product.title,
    price: item.product.price,
    quantity: item.quantity,
    size: item.product.size,
    image: item.product.images[0] || "",
  }))

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  const orderData = {
    userId,
    items: orderItems,
    totalPrice,
    status: "pending" as OrderStatus,
    shippingAddress,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }

  const docRef = await addDoc(ordersRef, orderData)
  return docRef.id
}

// Buscar encomenda por ID
export async function getOrderById(orderId: string): Promise<IOrder | null> {
  const docRef = doc(db, ORDERS_COLLECTION, orderId)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return convertToOrder(docSnap)
  }
  return null
}

// Buscar encomendas do utilizador
export async function getUserOrders(userId: string): Promise<IOrder[]> {
  const ordersRef = collection(db, ORDERS_COLLECTION)
  const q = query(
    ordersRef,
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(convertToOrder)
}

// Atualizar estado da encomenda
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<void> {
  const docRef = doc(db, ORDERS_COLLECTION, orderId)
  await updateDoc(docRef, {
    status,
    updatedAt: Timestamp.now(),
  })
}

// Cancelar encomenda
export async function cancelOrder(orderId: string): Promise<void> {
  await updateOrderStatus(orderId, "cancelled")
}
