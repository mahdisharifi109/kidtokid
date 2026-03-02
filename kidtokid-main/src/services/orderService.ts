import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  type DocumentData,
} from "firebase/firestore"
import { db, auth } from "@/src/lib/firebase"

// Types

export type OrderStatus = 
  | "pending"           // Aguarda pagamento
  | "paid"              // Pago - aguarda preparação
  | "processing"        // Em preparação
  | "ready_pickup"      // Pronto para levantamento
  | "shipped"           // Enviado
  | "delivered"         // Entregue
  | "cancelled"         // Cancelado
  | "refunded"          // Reembolsado

export type PaymentMethod = 
  | "card"              // Cartão via Stripe
  | "shop"              // Pagar na loja

export type ShippingMethod = 
  | "delivery"          // Envio ao domicílio
  | "pickup"            // Levantamento em loja

export interface OrderItem {
  productId: string
  title: string
  brand: string
  size: string
  price: number
  quantity: number
  image: string
}

export interface ShippingAddress {
  name: string
  phone: string
  email: string
  street: string
  city: string
  postalCode: string
  country: string
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  userEmail: string
  
  // Items
  items: OrderItem[]
  
  // Preços
  subtotal: number
  shippingCost: number
  discount: number
  total: number
  
  // Cupão aplicado
  couponCode?: string
  
  // Envio
  shippingMethod: ShippingMethod
  shippingAddress: ShippingAddress
  
  // Pagamento
  paymentMethod: PaymentMethod
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  paymentReference?: string // Referência MB, etc.
  
  // Estado
  status: OrderStatus
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  paidAt?: Date
  shippedAt?: Date
  deliveredAt?: Date
  
  // Notas
  customerNotes?: string
  internalNotes?: string
  
  // Tracking
  trackingNumber?: string
  trackingUrl?: string
}

// Helper functions

// Converter documento Firestore para Order
function convertToOrder(doc: DocumentData): Order {
  const data = doc.data()
  return {
    id: doc.id,
    orderNumber: data.orderNumber,
    userId: data.userId,
    userEmail: data.userEmail,
    items: data.items,
    subtotal: data.subtotal,
    shippingCost: data.shippingCost,
    discount: data.discount || 0,
    total: data.total,
    couponCode: data.couponCode,
    shippingMethod: data.shippingMethod,
    shippingAddress: data.shippingAddress,
    paymentMethod: data.paymentMethod,
    paymentStatus: data.paymentStatus,
    paymentReference: data.paymentReference,
    status: data.status,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    paidAt: data.paidAt?.toDate(),
    shippedAt: data.shippedAt?.toDate(),
    deliveredAt: data.deliveredAt?.toDate(),
    customerNotes: data.customerNotes,
    internalNotes: data.internalNotes,
    trackingNumber: data.trackingNumber,
    trackingUrl: data.trackingUrl,
  }
}

// Get user orders

export async function getUserOrders(): Promise<Order[]> {
  const user = auth.currentUser
  
  if (!user) {
    throw new Error("É necessário estar autenticado")
  }

  const ordersRef = collection(db, "orders")
  const q = query(
    ordersRef,
    where("userId", "==", user.uid),
    orderBy("createdAt", "desc")
  )
  
  const snapshot = await getDocs(q)
  return snapshot.docs.map(convertToOrder)
}

// Get order by ID

export async function getOrderById(orderId: string): Promise<Order | null> {
  const user = auth.currentUser
  
  if (!user) {
    throw new Error("É necessário estar autenticado")
  }

  const docRef = doc(db, "orders", orderId)
  const docSnap = await getDoc(docRef)
  
  if (!docSnap.exists()) {
    return null
  }

  const order = convertToOrder(docSnap)
  
  // Verificar se a encomenda pertence ao utilizador
  if (order.userId !== user.uid) {
    throw new Error("Não tem permissão para ver esta encomenda")
  }

  return order
}

// Get order by number

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  const user = auth.currentUser
  
  if (!user) {
    throw new Error("É necessário estar autenticado")
  }

  const ordersRef = collection(db, "orders")
  const q = query(ordersRef, where("orderNumber", "==", orderNumber))
  
  const snapshot = await getDocs(q)
  
  if (snapshot.empty) {
    return null
  }

  const order = convertToOrder(snapshot.docs[0])
  
  // Verificar se a encomenda pertence ao utilizador
  if (order.userId !== user.uid) {
    throw new Error("Não tem permissão para ver esta encomenda")
  }

  return order
}

// Cancel order

export async function cancelOrder(orderId: string): Promise<void> {
  const user = auth.currentUser
  
  if (!user) {
    throw new Error("É necessário estar autenticado")
  }

  const docRef = doc(db, "orders", orderId)
  const docSnap = await getDoc(docRef)
  
  if (!docSnap.exists()) {
    throw new Error("Encomenda não encontrada")
  }

  const order = convertToOrder(docSnap)
  
  // Verificar permissão
  if (order.userId !== user.uid) {
    throw new Error("Não tem permissão para cancelar esta encomenda")
  }

  // Verificar se pode ser cancelada (apenas pendentes — pagas necessitam reembolso via admin)
  if (order.status !== "pending") {
    throw new Error(
      order.status === "paid"
        ? "Encomendas pagas só podem ser canceladas pelo suporte. Contacte-nos."
        : "Esta encomenda já não pode ser cancelada"
    )
  }

  await updateDoc(docRef, {
    status: "cancelled",
    updatedAt: serverTimestamp(),
  })
}

// Status translation

export function getOrderStatusText(status: OrderStatus): string {
  const statusMap: Record<OrderStatus, string> = {
    pending: "Aguarda pagamento",
    paid: "Pago",
    processing: "Em preparação",
    ready_pickup: "Pronto para levantamento",
    shipped: "Enviado",
    delivered: "Entregue",
    cancelled: "Cancelado",
    refunded: "Reembolsado",
  }
  return statusMap[status]
}

export function getOrderStatusColor(status: OrderStatus): string {
  const colorMap: Record<OrderStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-blue-100 text-blue-800",
    processing: "bg-purple-100 text-purple-800",
    ready_pickup: "bg-cyan-100 text-cyan-800",
    shipped: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-gray-100 text-gray-800",
    refunded: "bg-red-100 text-red-800",
  }
  return colorMap[status]
}

export function getPaymentMethodText(method: PaymentMethod): string {
  const methodMap: Record<PaymentMethod, string> = {
    card: "Cartão (Stripe)",
    shop: "Pagamento na Loja",
  }
  return methodMap[method] || method
}
