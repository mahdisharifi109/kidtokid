/**
 * FICHEIRO: paymentService.ts
 * FUNÇÃO: Serviço de pagamentos — inicia sessões Stripe Checkout via Cloud Function.
 * PROBLEMA: Nenhum. O antigo confirmPayment (que escrevia diretamente no Firestore) foi removido e agora
 *           lança erro se chamado. Pagamentos só são confirmados pelo webhook Stripe server-side.
 * PRIORIDADE: CRÍTICA (integração Stripe)
 *
 * ARQUITETURA DE SEGURANÇA:
 * - As chaves Stripe (secret key) NUNCA estão no frontend
 * - A sessão Stripe é criada via Cloud Function "createStripeCheckoutSession" (server-side)
 * - O frontend apenas recebe o URL de redirect e redireciona o browser
 * - Confirmação de pagamento: APENAS via webhook Stripe → Cloud Function "stripeWebhook"
 * - confirmPayment() está @deprecated e lança erro — prevenção contra uso acidental
 *
 * FLUXO:
 * 1. Frontend chama initiateStripePayment(orderId, orderNumber)
 * 2. Cloud Function cria sessão Stripe com line items do pedido
 * 3. Frontend redireciona para session.url (Stripe Checkout hosted page)
 * 4. Após pagamento: Stripe envia webhook → Cloud Function marca order como "paid"
 * 5. Se abandonar: sessão expira (30 min) → webhook marca order como "cancelled"
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
    // Block execution so React Router doesn't interrupt the transition
    return new Promise(() => {})
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
