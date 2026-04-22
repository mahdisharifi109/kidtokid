import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  writeBatch,
  getDocs,
} from "firebase/firestore"
import { db } from "@/src/lib/firebase"

export interface AdminNotification {
  id: string
  type: "new_order" | "low_stock" | "new_review" | "new_contact" | "new_subscriber" | "newsletter"
  title: string
  message: string
  read: boolean
  createdAt: Date
  link?: string
  actionLink?: string
  data?: Record<string, unknown>
}

export interface UserNotification {
  id: string
  type: "newsletter" | "order_update" | "promo"
  title: string
  message: string
  read: boolean
  createdAt: Date
  link?: string
  actionLink?: string
}

/**
 * Listen for user notifications in real-time
 * Returns an unsubscribe function
 */
export function subscribeToUserNotifications(
  userId: string,
  callback: (notifications: UserNotification[]) => void
): () => void {
  const notifsRef = collection(db, "users", userId, "notifications")
  const notifsQuery = query(notifsRef, orderBy("createdAt", "desc"), limit(20))

  return onSnapshot(
    notifsQuery,
    (snapshot) => {
      const notifs = snapshot.docs.map((docSnap) => {
        const data = docSnap.data()
        const createdAt = data.createdAt?.toDate?.() || new Date()
        return {
          id: docSnap.id,
          type: data.type || "newsletter",
          title: data.title || "",
          message: data.message || "",
          read: data.read === true,
          createdAt,
          link: data.link,
          actionLink: data.actionLink,
        } as UserNotification
      })
      callback(notifs)
    },
    (error) => {
      console.error("Error listening to user notifications:", error)
    }
  )
}

/**
 * Mark a user notification as read
 */
export async function markUserNotificationRead(userId: string, notificationId: string): Promise<void> {
  if (!userId || !notificationId) return

  try {
    await updateDoc(doc(db, "users", userId, "notifications", notificationId), {
      read: true,
    })
  } catch (error) {
    console.error("Failed to mark user notification read:", error)
  }
}

/**
 * Mark all user notifications as read
 */
export async function markAllUserNotificationsRead(userId: string, notifications: UserNotification[]): Promise<void> {
  const unread = notifications.filter((n) => !n.read)
  if (unread.length === 0 || !userId) return

  const batch = writeBatch(db)

  for (const notification of unread) {
    batch.update(doc(db, "users", userId, "notifications", notification.id), { read: true })
  }

  try {
    await batch.commit()
  } catch (error) {
    console.error("Failed to mark all user notifications read:", error)
  }
}

/**
 * Envia uma newsletter (notificação in-app) para todos os utilizadores
 * que aderiram à newsletter (newsletter === true).
 */
export async function sendNewsletterNotification(title: string, message: string, actionLink?: string) {
  try {
    const usersRef = collection(db, "users")
    // Filtra utilizadores com newsletter ativada
    const q = query(usersRef, where("newsletter", "==", true))
    const querySnapshot = await getDocs(q)

    const allDocs = querySnapshot.docs
    let totalCount = 0

    // Firestore writeBatch tem limite de 500 operações — dividir em chunks
    const BATCH_LIMIT = 450 // Margem de segurança
    for (let i = 0; i < allDocs.length; i += BATCH_LIMIT) {
      const chunk = allDocs.slice(i, i + BATCH_LIMIT)
      const batch = writeBatch(db)

      chunk.forEach((userDoc) => {
        const notificationsRef = doc(collection(db, "users", userDoc.id, "notifications"))
        batch.set(notificationsRef, {
          type: "newsletter",
          title,
          message,
          actionLink: actionLink || null,
          read: false,
          createdAt: Timestamp.now(),
        })
        totalCount++
      })

      await batch.commit()
    }
    
    return { success: true, count: totalCount }
  } catch (error) {
    console.error("Ups! Problema ao enviar newsletter:", error)
    throw error
  }
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
    new_subscriber: [],
  }

  const emitAll = () => {
    const all = [
      ...notifsByType.new_order,
      ...notifsByType.new_review,
      ...notifsByType.new_contact,
      ...notifsByType.new_subscriber,
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

  // Listen for new newsletter subscribers
  const subscribersQuery = query(
    collection(db, "newsletter"),
    where("subscribedAt", ">", oneDayAgo),
    orderBy("subscribedAt", "desc"),
    limit(20)
  )

  const unsubSubscribers = onSnapshot(
    subscribersQuery,
    (snapshot) => {
      notifsByType.new_subscriber = snapshot.docs.map((docSnap) => {
        const data = docSnap.data()
        const createdAt = data.subscribedAt?.toDate?.() || new Date()
        return {
          id: `subscriber_${docSnap.id}`,
          type: "new_subscriber" as const,
          title: "Nova subscrição",
          message: `${data.email || docSnap.id} subscreveu a newsletter.`,
          read: data._adminRead === true,
          createdAt,
          link: "/admin/newsletter",
        }
      })
      emitAll()
    },
    (error) => {
      console.error("Error listening to newsletter subscribers:", error)
    }
  )

  return () => {
    unsubOrders()
    unsubReviews()
    unsubContacts()
    unsubSubscribers()
  }
}


/**
 * Mark a notification as read by updating the source document
 */
export async function markNotificationRead(notification: AdminNotification): Promise<void> {
  const type = notification.id.split("_")[0]
  const docId = notification.id.substring(type.length + 1)
  if (!docId) return

  const collectionName =
    type === "order" ? "orders" :
    type === "review" ? "reviews" :
    type === "contact" ? "contacts" :
    type === "subscriber" ? "newsletter" : null

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
    const type = notification.id.split("_")[0]
    const docId = notification.id.substring(type.length + 1)
    if (!docId) continue

    const collectionName =
      type === "order" ? "orders" :
      type === "review" ? "reviews" :
      type === "contact" ? "contacts" :
      type === "subscriber" ? "newsletter" : null

    if (!collectionName) continue

    batch.update(doc(db, collectionName, docId), { _adminRead: true })
  }

  try {
    await batch.commit()
  } catch (error) {
    console.error("Failed to mark all read:", error)
  }
}

/**
 * Reset: apagar todos os subscritores da coleção newsletter
 */
export async function resetNewsletterCollection(): Promise<number> {
  const snap = await getDocs(collection(db, "newsletter"))
  if (snap.empty) return 0

  const BATCH_LIMIT = 450
  const docs = snap.docs
  let deleted = 0

  for (let i = 0; i < docs.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db)
    const chunk = docs.slice(i, i + BATCH_LIMIT)
    chunk.forEach((d) => batch.delete(d.ref))
    await batch.commit()
    deleted += chunk.length
  }

  return deleted
}

/**
 * Reset: apagar todo o histórico de promos enviadas
 */
export async function resetPromosLog(): Promise<number> {
  const snap = await getDocs(collection(db, "promos_log"))
  if (snap.empty) return 0

  const BATCH_LIMIT = 450
  const docs = snap.docs
  let deleted = 0

  for (let i = 0; i < docs.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db)
    const chunk = docs.slice(i, i + BATCH_LIMIT)
    chunk.forEach((d) => batch.delete(d.ref))
    await batch.commit()
    deleted += chunk.length
  }

  return deleted
}

/**
 * Apagar uma notificação de utilizador
 */
export async function deleteUserNotification(userId: string, notificationId: string): Promise<void> {
  if (!userId || !notificationId) return
  try {
    await deleteDoc(doc(db, "users", userId, "notifications", notificationId))
  } catch (error) {
    console.error("Failed to delete user notification:", error)
  }
}
