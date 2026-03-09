import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  increment,
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
// NOTE: Coupon reads are now admin-only in Firestore rules.
// For non-admin checkout validation, we call a Cloud Function.
// The server-side createSecureOrder also validates coupons atomically.

export async function validateCoupon(
  code: string,
  orderTotal: number
): Promise<CouponValidation> {
  if (!code || !code.trim()) {
    return { valid: false, error: "Introduz um código de cupão" }
  }

  try {
    const { getFunctions, httpsCallable } = await import("firebase/functions")
    const functions = getFunctions(undefined, "europe-west1")
    const validateFn = httpsCallable<
      { code: string; orderTotal: number },
      CouponValidation
    >(functions, "validateCouponCode")
    const result = await validateFn({ code: code.toUpperCase().trim(), orderTotal })
    return result.data
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string }
    console.error("Coupon validation error:", err)
    return { valid: false, error: "Erro ao validar cupão. Tente novamente." }
  }
}

/**
 * Incrementar o contador de uso do cupão (chamar após encomenda bem sucedida)
 * Uses atomic increment to prevent race conditions with concurrent orders.
 */
export async function incrementCouponUsage(couponId: string): Promise<void> {
  const docRef = doc(db, COUPONS_COLLECTION, couponId)
  await updateDoc(docRef, { usedCount: increment(1) })
}
