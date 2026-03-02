import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore"
import { db } from "@/src/lib/firebase"

// Types

export interface Coupon {
  id: string
  code: string
  description: string
  discountType: "percentage" | "fixed" // percentagem ou valor fixo
  discountValue: number // % ou € dependendo do tipo
  minOrderValue: number // valor mínimo da encomenda
  maxUses: number // máximo de utilizações (0 = ilimitado)
  usedCount: number // vezes já utilizado
  isActive: boolean
  validFrom: Date
  validUntil: Date
  createdAt: Date
}

export interface CouponValidation {
  valid: boolean
  coupon?: Coupon
  error?: string
  discount?: number // valor do desconto calculado
}

const COUPONS_COLLECTION = "coupons"

// ─── Admin: CRUD de cupões ────────────────────────────────────────────

export async function getAllCoupons(): Promise<Coupon[]> {
  const snapshot = await getDocs(collection(db, COUPONS_COLLECTION))
  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      code: data.code,
      description: data.description || "",
      discountType: data.discountType || "percentage",
      discountValue: data.discountValue || 0,
      minOrderValue: data.minOrderValue || 0,
      maxUses: data.maxUses || 0,
      usedCount: data.usedCount || 0,
      isActive: data.isActive ?? true,
      validFrom: data.validFrom?.toDate() || new Date(),
      validUntil: data.validUntil?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
    } as Coupon
  })
}

export async function createCoupon(
  coupon: Omit<Coupon, "id" | "usedCount" | "createdAt">
): Promise<string> {
  const docRef = doc(collection(db, COUPONS_COLLECTION))
  await setDoc(docRef, {
    ...coupon,
    code: coupon.code.toUpperCase().trim(),
    usedCount: 0,
    validFrom: Timestamp.fromDate(coupon.validFrom),
    validUntil: Timestamp.fromDate(coupon.validUntil),
    createdAt: Timestamp.now(),
  })
  return docRef.id
}

export async function updateCoupon(
  id: string,
  updates: Partial<Coupon>
): Promise<void> {
  const docRef = doc(db, COUPONS_COLLECTION, id)
  const updateData: Record<string, unknown> = { ...updates }

  if (updates.validFrom) {
    updateData.validFrom = Timestamp.fromDate(updates.validFrom)
  }
  if (updates.validUntil) {
    updateData.validUntil = Timestamp.fromDate(updates.validUntil)
  }

  // Remove campos que não devem ser enviados
  delete updateData.id
  delete updateData.createdAt

  await updateDoc(docRef, updateData)
}

export async function deleteCoupon(id: string): Promise<void> {
  await deleteDoc(doc(db, COUPONS_COLLECTION, id))
}

// ─── Validação de cupões (checkout) ───────────────────────────────────

export async function validateCoupon(
  code: string,
  orderTotal: number
): Promise<CouponValidation> {
  if (!code || !code.trim()) {
    return { valid: false, error: "Introduza um código de cupão" }
  }

  const normalizedCode = code.toUpperCase().trim()

  // Procurar cupão pelo código
  const q = query(
    collection(db, COUPONS_COLLECTION),
    where("code", "==", normalizedCode)
  )
  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    return { valid: false, error: "Cupão não encontrado" }
  }

  const docData = snapshot.docs[0].data()
  const coupon: Coupon = {
    id: snapshot.docs[0].id,
    code: docData.code,
    description: docData.description || "",
    discountType: docData.discountType,
    discountValue: docData.discountValue,
    minOrderValue: docData.minOrderValue || 0,
    maxUses: docData.maxUses || 0,
    usedCount: docData.usedCount || 0,
    isActive: docData.isActive ?? true,
    validFrom: docData.validFrom?.toDate() || new Date(),
    validUntil: docData.validUntil?.toDate() || new Date(),
    createdAt: docData.createdAt?.toDate() || new Date(),
  }

  // Verificar se está ativo
  if (!coupon.isActive) {
    return { valid: false, error: "Este cupão está desativado" }
  }

  // Verificar validade temporal
  const now = new Date()
  if (now < coupon.validFrom) {
    return { valid: false, error: "Este cupão ainda não é válido" }
  }
  if (now > coupon.validUntil) {
    return { valid: false, error: "Este cupão já expirou" }
  }

  // Verificar limite de utilizações
  if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: "Este cupão já atingiu o limite de utilizações" }
  }

  // Verificar valor mínimo
  if (orderTotal < coupon.minOrderValue) {
    return {
      valid: false,
      error: `Encomenda mínima de €${coupon.minOrderValue.toFixed(2)} para usar este cupão`,
    }
  }

  // Calcular desconto
  const discount = coupon.discountType === "percentage"
    ? (orderTotal * coupon.discountValue) / 100
    : Math.min(coupon.discountValue, orderTotal) // não desconta mais que o total

  return {
    valid: true,
    coupon,
    discount: Math.round(discount * 100) / 100,
  }
}

/**
 * Incrementar o contador de uso do cupão (chamar após encomenda bem sucedida)
 */
export async function incrementCouponUsage(couponId: string): Promise<void> {
  const docRef = doc(db, COUPONS_COLLECTION, couponId)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    const currentCount = docSnap.data().usedCount || 0
    await updateDoc(docRef, { usedCount: currentCount + 1 })
  }
}
