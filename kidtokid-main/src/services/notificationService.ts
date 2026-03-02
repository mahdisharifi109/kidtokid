import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
  doc,
  updateDoc,
  Timestamp,
  writeBatch,
} from "firebase/firestore"
import { db } from "@/src/lib/firebase"

export interface AdminNotification {
  id: string
  type: "new_order" | "low_stock" | "new_review" | "new_contact"
  title: string
  message: string
  read: boolean
  createdAt: Date
  link?: string
  data?: Record<string, unknown>
}

/**
 * Listen for recent unread orders to generate admin notifications in real-time
 * Returns an unsubscribe function
 */
export function subscribeToAdminNotifications(
  callback: (notifications: AdminNotification[]) => void
): () => void {
  // Store notifications by type to avoid race conditions between listeners
  const notifsByType: Record<string, AdminNotification[]> = {
    new_order: [],
    new_review: [],
    new_contact: [],
  }

  const emitAll = () => {
    const all = [
      ...notifsByType.new_order,
      ...notifsByType.new_review,
      ...notifsByType.new_contact,
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    callback(all)
  }

  // Listen for new orders (last 24 hours)
  const oneDayAgo = Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000))

  const ordersQuery = query(
    collection(db, "orders"),
    where("createdAt", ">", oneDayAgo),
    orderBy("createdAt", "desc"),
    limit(20)
  )

  const unsubOrders = onSnapshot(
    ordersQuery,
    (snapshot) => {
      notifsByType.new_order = snapshot.docs.map((docSnap) => {
        const data = docSnap.data()
        const createdAt = data.createdAt?.toDate?.() || new Date()
        return {
          id: `order_${docSnap.id}`,
          type: "new_order" as const,
          title: "Nova encomenda",
          message: `#${data.orderNumber || docSnap.id.slice(0, 8)} — €${(data.total || 0).toFixed(2)}`,
          read: data._adminRead === true,
          createdAt,
          link: "/admin/encomendas",
          data: {
            orderId: docSnap.id,
            orderNumber: data.orderNumber,
            total: data.total,
            status: data.status,
            customerName: data.shippingAddress?.name,
          },
        }
      })
      emitAll()
    },
    (error) => {
      console.error("Error listening to orders:", error)
    }
  )

  // Listen for recent reviews
  const reviewsQuery = query(
    collection(db, "reviews"),
    where("createdAt", ">", oneDayAgo),
    orderBy("createdAt", "desc"),
    limit(10)
  )

  const unsubReviews = onSnapshot(
    reviewsQuery,
    (snapshot) => {
      notifsByType.new_review = snapshot.docs.map((docSnap) => {
        const data = docSnap.data()
        const createdAt = data.createdAt?.toDate?.() || new Date()
        const stars = "★".repeat(data.rating || 0)
        return {
          id: `review_${docSnap.id}`,
          type: "new_review" as const,
          title: "Nova avaliação",
          message: `${stars} — ${data.userName || "Anónimo"}`,
          read: data._adminRead === true,
          createdAt,
          link: `/produto/${data.productId}`,
        }
      })
      emitAll()
    },
    (error) => {
      console.error("Error listening to reviews:", error)
    }
  )

  // Listen for recent contacts
  const contactsQuery = query(
    collection(db, "contacts"),
    where("createdAt", ">", oneDayAgo),
    orderBy("createdAt", "desc"),
    limit(10)
  )

  const unsubContacts = onSnapshot(
    contactsQuery,
    (snapshot) => {
      notifsByType.new_contact = snapshot.docs.map((docSnap) => {
        const data = docSnap.data()
        const createdAt = data.createdAt?.toDate?.() || new Date()
        return {
          id: `contact_${docSnap.id}`,
          type: "new_contact" as const,
          title: "Nova mensagem",
          message: `${data.name || "Anónimo"} — ${data.subject || "Sem assunto"}`,
          read: data._adminRead === true,
          createdAt,
          link: "/admin/mensagens",
        }
      })
      emitAll()
    },
    (error) => {
      console.error("Error listening to contacts:", error)
    }
  )

  return () => {
    unsubOrders()
    unsubReviews()
    unsubContacts()
  }
}

/**
 * Mark a notification as read by updating the source document
 */
export async function markNotificationRead(notification: AdminNotification): Promise<void> {
  const [type, docId] = notification.id.split("_", 2)
  if (!docId) return

  const collectionName =
    type === "order" ? "orders" :
    type === "review" ? "reviews" :
    type === "contact" ? "contacts" : null

  if (!collectionName) return

  try {
    await updateDoc(doc(db, collectionName, docId), {
      _adminRead: true,
    })
  } catch (error) {
    console.error("Failed to mark notification read:", error)
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead(notifications: AdminNotification[]): Promise<void> {
  const unread = notifications.filter((n) => !n.read)
  if (unread.length === 0) return

  const batch = writeBatch(db)

  for (const notification of unread) {
    const [type, docId] = notification.id.split("_", 2)
    if (!docId) continue

    const collectionName =
      type === "order" ? "orders" :
      type === "review" ? "reviews" :
      type === "contact" ? "contacts" : null

    if (!collectionName) continue

    batch.update(doc(db, collectionName, docId), { _adminRead: true })
  }

  try {
    await batch.commit()
  } catch (error) {
    console.error("Failed to mark all read:", error)
  }
}
