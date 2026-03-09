/**
 * Serviço de Pagamentos — Kid to Kid
 *
 * Integração com Stripe Checkout para pagamentos com cartão.
 * A sessão Stripe é criada via Cloud Function (createStripeCheckoutSession)
 * para manter as chaves seguras no servidor.
 */

import { getFunctions, httpsCallable } from "firebase/functions"

// ─── Tipos ────────────────────────────────────────────────────────────

export interface StripeCheckoutResult {
  sessionId: string
  url: string | null
}

// ─── API principal ───────────────────────────────────────────────────

/**
 * Cria uma sessão Stripe Checkout para uma encomenda existente
 * e redireciona o utilizador para a página de pagamento do Stripe.
 */
export async function initiateStripePayment(
  orderId: string,
  orderNumber: string
): Promise<void> {
  const functions = getFunctions(undefined, "europe-west1")
  const createSession = httpsCallable<
    { orderId: string; successUrl: string; cancelUrl: string },
    StripeCheckoutResult
  >(functions, "createStripeCheckoutSession")

  const baseUrl = window.location.origin
  const result = await createSession({
    orderId,
    successUrl: `${baseUrl}/sucesso?order=${orderNumber}&session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${baseUrl}/checkout?cancelled=true`,
  })

  const { sessionId, url } = result.data

  // Prefer Stripe's hosted URL (redirect) — always available from Checkout Sessions
  if (url) {
    window.location.href = url
    return
  }

  // Fallback: if for some reason URL is missing, throw a clear error
  // The session was created but we can't redirect. The order still exists.
  throw new Error(
    `Sessão Stripe criada (${sessionId}) mas URL de checkout indisponível. ` +
    "Verifica a configuração do Stripe."
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────

/**
 * Confirma o pagamento (atualiza o estado da encomenda).
 * REMOVED: Direct Firestore write bypassed Stripe verification.
 * Payments are now only confirmed via:
 * 1. Stripe webhook (stripeWebhook Cloud Function)
 * 2. Admin action through Cloud Functions
 * 
 * @deprecated Use Stripe webhook or admin Cloud Function instead
 */
export async function confirmPayment(_orderId: string): Promise<void> {
  throw new Error(
    "confirmPayment removido por segurança. Os pagamentos são confirmados automaticamente pelo Stripe webhook."
  )
}

/**
 * Texto explicativo para o método de pagamento.
 */
export function getPaymentInstructions(method: string): string {
  switch (method) {
    case "card":
    case "stripe":
      return "O pagamento será processado de forma segura pelo Stripe. Os dados do cartão são encriptados e nunca são armazenados nos nossos servidores."
    case "shop":
      return "A encomenda fica reservada por 48 horas. Efetua o pagamento quando levantares na loja."
    default:
      return ""
  }
}
