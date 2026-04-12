/**
 * Centralized validation functions and type guards
 * Usado em CartContext, formulários, e serviços
 */

import type { ICartItem } from "@/src/types"

// Type guard para verificar se um objeto é um erro Firebase com code e message
export interface FirebaseError {
  code?: string
  message?: string
}

/**
 * Type guard: Verificar se um objeto desconhecido é um FirebaseError
 */
export function isFirebaseError(error: unknown): error is FirebaseError {
  if (error === null || error === undefined) return false
  const obj = error as Record<string, unknown>
  return typeof obj.code === "string" || typeof obj.message === "string"
}

/**
 * Validar estrutura de um item do carrinho
 */
export function validateCartItem(item: unknown): item is ICartItem {
  if (!item || typeof item !== "object") return false

  const cartItem = item as Record<string, unknown>

  // Validar que tem product object
  if (!cartItem.product || typeof cartItem.product !== "object") return false
  const product = cartItem.product as Record<string, unknown>

  // Verificar campos obrigatórios do product
  if (
    typeof product.id !== "string" ||
    typeof product.title !== "string" ||
    typeof product.price !== "number" ||
    product.price < 0
  ) {
    return false
  }

  // Validar quantity é número positivo
  if (typeof cartItem.quantity !== "number" || cartItem.quantity < 1 || !Number.isInteger(cartItem.quantity)) {
    return false
  }

  return true
}

/**
 * Validar e parsear carrinho do localStorage
 * Retorna array válido ou [] se dados inválidos
 */
export function validateCartFromStorage(saved: string | null): ICartItem[] {
  if (!saved) return []

  try {
    const parsed = JSON.parse(saved)

    // Validar que é array
    if (!Array.isArray(parsed)) {
      console.warn("[CartValidator] localStorage cart is not an array, resetting to empty")
      return []
    }

    // Validar cada item
    const validItems = parsed.filter((item) => {
      const isValid = validateCartItem(item)
      if (!isValid) {
        console.warn("[CartValidator] Invalid cart item found, removing:", item)
      }
      return isValid
    })

    // Se alguns itens foram inválidos, logar warning
    if (validItems.length < parsed.length) {
      console.warn(
        `[CartValidator] Removed ${parsed.length - validItems.length} invalid items from cart (${parsed.length} → ${validItems.length})`
      )
    }

    return validItems
  } catch (error) {
    console.error("[CartValidator] Failed to parse cart from localStorage, resetting to empty:", error)
    return []
  }
}

/**
 * Validar email (regex simples)
 */
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Validar telefone português (9XXXXXXXX ou 2XXXXXXXX)
 */
export function validatePhone(phone: string): boolean {
  return /^(9[1236]\d{7}|2\d{8})$/.test(phone)
}

/**
 * Validar código postal português (XXXX-XXX)
 */
export function validatePostalCode(code: string): boolean {
  return /^\d{4}-\d{3}$/.test(code)
}
