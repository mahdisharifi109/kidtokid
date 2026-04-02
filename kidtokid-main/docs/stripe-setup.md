# Stripe Integration Guide (Kid to Kid)

Este guia cobre a integração Stripe no projeto atual (Firebase + Cloud Functions + Checkout Session).

## 1. Pré-requisitos

- Conta Stripe com acesso ao Dashboard
- Firebase project configurado
- Firebase CLI autenticado
- Node.js 20+ no projeto de functions

## 2. Variáveis de ambiente

Preencher `/.env.local` (frontend):

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_APP_BASE_URL=http://localhost:5173
```

Preencher `/functions/.env` (backend):

```env
STRIPE_SECRET=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
EMAIL_USER=...
EMAIL_PASS=...
ADMIN_EMAIL=info@kidtokid.pt
NODE_ENV=development
```

Notas:
- Nunca expor `STRIPE_SECRET` no frontend.
- `STRIPE_WEBHOOK_SECRET` vem do endpoint de webhook no Stripe Dashboard ou Stripe CLI.

## 3. Arquitetura atual

- Criação de encomenda: Cloud Function `createSecureOrder`
- Criação de checkout Stripe: Cloud Function `createStripeCheckoutSession`
- Redirecionamento frontend: `src/services/paymentService.ts`
- Confirmação de pagamento: webhook `stripeWebhook`

## 4. Configurar webhook Stripe

Criar endpoint no Stripe Dashboard para a função `stripeWebhook`.

Eventos mínimos:
- `checkout.session.completed`

Eventos adicionais recomendados:
- `checkout.session.async_payment_failed`
- `payment_intent.payment_failed`
- `charge.refunded`

Copiar o signing secret (`whsec_...`) para `STRIPE_WEBHOOK_SECRET`.

## 5. Testes locais com Stripe CLI

Em terminal separado:

```bash
stripe login
stripe listen --forward-to http://127.0.0.1:5001/<FIREBASE_PROJECT>/europe-west1/stripeWebhook
```

A Stripe CLI vai mostrar um `whsec_...`; usar esse valor no `/functions/.env`.

Disparar evento de teste:

```bash
stripe trigger checkout.session.completed
```

## 6. Checklist de validação

- Utilizador autenticado consegue criar encomenda
- Função `createStripeCheckoutSession` devolve URL válida
- Frontend redireciona para página Stripe
- Evento `checkout.session.completed` marca encomenda como `paymentStatus: paid`
- Reenvio do mesmo evento não duplica processamento (idempotência por `event.id`)
- Eventos de falha/refund atualizam estado da encomenda

## 7. Deploy

Deploy functions:

```bash
cd functions
npm run build
firebase deploy --only functions
```

Deploy hosting:

```bash
firebase deploy --only hosting
```

## 8. Troubleshooting rápido

- Erro "Webhook secret not configured": falta `STRIPE_WEBHOOK_SECRET` em `/functions/.env`.
- Erro de assinatura inválida: endpoint/secret errado ou payload alterado.
- Sessão criada sem redirect: verificar retorno da `session.url` e configuração de `successUrl/cancelUrl`.
- Ordem não atualiza para paid: confirmar evento recebido no webhook e `metadata.orderId`.

## 9. Próxima evolução (opcional)

Se quiser formulário de cartão embutido na checkout page, criar fase 2 com Payment Intents + Payment Element.
Manter Checkout Session como fallback até estabilizar métricas de sucesso/falha.
