/**
 * Cloud Functions wrapper with timeout and error handling
 * Centralizes all httpsCallable calls with configurable timeout
 */

import { getFunctions, httpsCallable, HttpsCallableResult } from "firebase/functions"

// Default timeout: 30 seconds
const DEFAULT_TIMEOUT_MS = 30_000

/**
 * Call a Cloud Function with timeout protection
 * @param functionName - Name of the Cloud Function to call
 * @param data - Data to pass to the function
 * @param timeoutMs - Timeout in milliseconds (default: 30s)
 * @throws Error if timeout or function call fails
 */
export async function callCloudFunction<T = unknown>(
  functionName: string,
  data?: unknown,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<HttpsCallableResult<T>> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Cloud Function "${functionName}" timeout after ${timeoutMs}ms`))
    }, timeoutMs)

    try {
      const functions = getFunctions(undefined, "europe-west1")
      const fn = httpsCallable<typeof data, T>(functions, functionName)

      fn(data)
        .then((result) => {
          clearTimeout(timeoutId)
          resolve(result)
        })
        .catch((error) => {
          clearTimeout(timeoutId)
          reject(error)
        })
    } catch (error) {
      clearTimeout(timeoutId)
      reject(error)
    }
  })
}

/**
 * Convenience wrapper for setAdminClaims
 */
export async function setAdminClaimsWithTimeout(timeoutMs?: number) {
  return callCloudFunction("setAdminClaims", {}, timeoutMs)
}

/**
 * Convenience wrapper for createSecureOrder
 */
export async function createSecureOrderWithTimeout(
  orderData: Record<string, unknown>,
  timeoutMs?: number
) {
  return callCloudFunction<{ orderId: string; orderNumber: string; total: number }>(
    "createSecureOrder",
    orderData,
    timeoutMs
  )
}

/**
 * Convenience wrapper for sendPromoNewsletter
 */
export async function sendPromoNewsletterWithTimeout(
  promoData: Record<string, unknown>,
  timeoutMs?: number
) {
  return callCloudFunction<{ success: boolean; sent: number; failed: number; total: number }>(
    "sendPromoNewsletter",
    promoData,
    timeoutMs
  )
}

/**
 * Convenience wrapper for customPasswordReset
 */
export async function customPasswordResetWithTimeout(
  resetData: Record<string, unknown>,
  timeoutMs?: number
) {
  return callCloudFunction<{ success?: boolean }>("customPasswordReset", resetData, timeoutMs)
}
