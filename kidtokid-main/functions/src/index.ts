import * as functions from "firebase-functions";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";
import Stripe from "stripe";

admin.initializeApp();

const db = admin.firestore();

// Stripe instance — configure via .env file in functions/ directory
const getStripe = (): Stripe => {
  const secret = process.env.STRIPE_SECRET;
  if (!secret) throw new Error("Stripe secret key not configured. Add STRIPE_SECRET to functions/.env");
  return new Stripe(secret);
};

// Admin email list — keep in sync with firestore.rules
const ADMIN_EMAILS = [
  "info@kidtokid.pt",
  "mahdisharifi4561@gmail.com",
];

// ======================================
// 🔐 AUTO-SET ADMIN CUSTOM CLAIMS + WELCOME EMAIL
// ======================================
// Automatically sets admin custom claims when an admin-listed user signs up
// Also sends a welcome email to every new user
export const onUserCreated = functions.region("europe-west1").auth.user().onCreate(async (user) => {
  // 1) Admin claims
  if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    try {
      await admin.auth().setCustomUserClaims(user.uid, { admin: true });
      await db.collection("users").doc(user.uid).set({ role: "admin" }, { merge: true });
      functions.logger.info(`Auto-set admin claims for ${user.email}`);
    } catch (error) {
      functions.logger.error(`Failed to set admin claims for ${user.email}:`, error);
    }
  }

  // 2) Welcome email for every new user
  if (user.email) {
    try {
      const transporter = getTransporter();
      const storeName = "Kid to Kid Braga";
      const displayName = user.displayName || user.email.split("@")[0];

      await transporter.sendMail({
        from: `"${storeName}" <${process.env.EMAIL_USER || "noreply@kidtokid.pt"}>`,
        to: user.email,
        subject: `Bem-vindo à ${storeName}! 🎉`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <div style="background: linear-gradient(135deg, #4A90B8, #7BC7A0); padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Bem-vindo, ${escapeHtml(displayName)}!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">${storeName}</p>
            </div>

            <div style="padding: 32px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Olá, <strong>${escapeHtml(displayName)}</strong>! 👋
              </p>
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                A tua conta na <strong>${storeName}</strong> foi criada com sucesso!
                Estamos muito felizes por te receber na nossa comunidade de moda infantil sustentável.
              </p>

              <div style="background: #f8f9fa; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="color: #4A90B8; margin: 0 0 16px; font-size: 16px;">O que podes fazer agora:</h3>
                <ul style="color: #555; font-size: 15px; line-height: 2; padding-left: 20px; margin: 0;">
                  <li>🛍️ <strong>Explorar</strong> centenas de artigos infantis de qualidade</li>
                  <li>❤️ <strong>Guardar favoritos</strong> para comprar mais tarde</li>
                  <li>🏷️ <strong>Aproveitar promoções</strong> exclusivas</li>
                  <li>⭐ <strong>Avaliar produtos</strong> e ajudar outros pais</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 32px 0;">
                <a href="https://kidtokid.pt"
                   style="display: inline-block; background: #4A90B8; color: #fff; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px;">
                  Começar a Explorar
                </a>
              </div>

              <p style="color: #999; font-size: 12px; text-align: center; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px;">
                Recebeste este email porque criaste uma conta na ${storeName}.<br/>
                ${storeName} — Rua do Raio, 4700-922 Braga
              </p>
            </div>
          </div>
        `,
      });

      functions.logger.info(`Welcome email sent to ${user.email}`);
    } catch (error) {
      functions.logger.error(`Failed to send welcome email to ${user.email}:`, error);
    }
  }
});

// Callable function: Admin can set custom claims for known admin emails
// This is useful when the admin already exists but never had claims set
export const setAdminClaims = functions.region("europe-west1").https.onCall(
  async (_data: unknown, context) => {
    if (!context.auth || !context.auth.token.email) {
      throw new functions.https.HttpsError("unauthenticated", "Login required");
    }

    const email = context.auth.token.email.toLowerCase();
    if (!ADMIN_EMAILS.includes(email)) {
      throw new functions.https.HttpsError("permission-denied", "Not an admin email");
    }

    // Check if already has admin claim
    if (context.auth.token.admin === true) {
      return { alreadyAdmin: true };
    }

    // Set the custom claim
    await admin.auth().setCustomUserClaims(context.auth.uid, {
      admin: true,
    });
    await db.collection("users").doc(context.auth.uid).set({ role: "admin" }, { merge: true });
    functions.logger.info(`Admin claims set for ${email} via setAdminClaims`);

    return { success: true, message: "Admin claims set. Please re-login." };
  }
);

// HTML-encode user input to prevent XSS in email templates
function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ======================================
// 🎫 VALIDATE COUPON CODE (for checkout preview)
// ======================================
// Allows authenticated users to validate a coupon without reading the coupons collection directly
export const validateCouponCode = functions.region("europe-west1").https.onCall(
  async (data: { code: string; orderTotal: number }, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Login necessário");
    }

    const code = (data.code || "").toUpperCase().trim();
    const orderTotal = data.orderTotal || 0;

    if (!code) {
      return { valid: false, error: "Introduz um código de cupão" };
    }

    const couponsSnap = await db
      .collection("coupons")
      .where("code", "==", code)
      .limit(1)
      .get();

    if (couponsSnap.empty) {
      return { valid: false, error: "Cupão não encontrado" };
    }

    const coupon = couponsSnap.docs[0].data();
    const now = new Date();
    const validFrom = coupon.validFrom?.toDate() || new Date(0);
    const validUntil = coupon.validUntil?.toDate() || new Date(0);

    if (coupon.isActive === false) {
      return { valid: false, error: "Este cupão está desativado" };
    }
    if (now < validFrom) {
      return { valid: false, error: "Este cupão ainda não é válido" };
    }
    if (now > validUntil) {
      return { valid: false, error: "Este cupão já expirou" };
    }
    if (coupon.maxUses > 0 && (coupon.usedCount || 0) >= coupon.maxUses) {
      return { valid: false, error: "Este cupão já atingiu o limite de utilizações" };
    }
    if (coupon.minOrderValue && orderTotal < coupon.minOrderValue) {
      return { valid: false, error: `Encomenda mínima de €${coupon.minOrderValue.toFixed(2)} para usar este cupão` };
    }

    // Per-user usage check
    const userId = context.auth.uid;
    const userOrdersSnap = await db
      .collection("orders")
      .where("userId", "==", userId)
      .where("couponCode", "==", code)
      .limit(1)
      .get();
    if (!userOrdersSnap.empty) {
      return { valid: false, error: "Já usaste este cupão numa encomenda anterior" };
    }

    const discount = coupon.discountType === "percentage"
      ? Math.round((orderTotal * coupon.discountValue) / 100 * 100) / 100
      : Math.min(coupon.discountValue, orderTotal);

    // Return only minimal info — don't expose raw coupon document
    return {
      valid: true,
      discount,
      coupon: {
        id: couponsSnap.docs[0].id,
        code: coupon.code,
        description: coupon.description || "",
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
    };
  }
);

// Configure your email transport
// Set these in functions/.env: EMAIL_USER, EMAIL_PASS, ADMIN_EMAIL
const getTransporter = () => {
  const user = process.env.EMAIL_USER || "";
  const pass = process.env.EMAIL_PASS || "";
  if (!user || !pass) {
    functions.logger.warn("Email credentials not configured. Set EMAIL_USER and EMAIL_PASS in functions/.env");
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
};

const getAdminEmail = (): string => {
  return process.env.ADMIN_EMAIL || "admin@kidtokid.pt";
};

// ======================================
// � CUSTOM PASSWORD RESET EMAIL
// ======================================
// Sends password reset email through our SMTP (Gmail) instead of Firebase's noreply
export const customPasswordReset = functions.region("europe-west1").https.onCall(
  async (data: { email: string; continueUrl?: string }, context) => {
    // Must be authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "É necessário estar autenticado.");
    }

    const email = (data.email || "").trim().toLowerCase();
    if (!email) {
      throw new functions.https.HttpsError("invalid-argument", "Email é obrigatório.");
    }

    // Security: Only allow resetting own password
    if (context.auth.token.email?.toLowerCase() !== email) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Só pode alterar a sua própria password."
      );
    }

    try {
      // Verify user exists
      await admin.auth().getUserByEmail(email);

      // Generate the reset link using Firebase Admin
      // Works for both password-only and Google accounts (allows adding a password)
      const continueUrl = data.continueUrl || "https://kidtokid-4d642.web.app/entrar";
      const resetLink = await admin.auth().generatePasswordResetLink(email, {
        url: continueUrl,
        handleCodeInApp: false,
      });

      // Send via our SMTP
      const transporter = getTransporter();
      await transporter.sendMail({
        from: `"Kid to Kid" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Alterar Password — Kid to Kid",
        html: `
          <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #4A90B8; font-size: 24px; margin: 0;">🔑 Alterar Password</h1>
              <p style="color: #888; font-size: 14px;">Recebemos o seu pedido de alteração de password</p>
            </div>

            <div style="background: #F8F9FA; border-radius: 16px; padding: 20px; margin-bottom: 16px;">
              <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0;">
                Olá! Clique no botão abaixo para criar uma nova password para a sua conta 
                <strong>${escapeHtml(email)}</strong>.
              </p>
            </div>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetLink}"
                 style="display: inline-block; background: #4A90B8; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">
                Alterar Password
              </a>
            </div>

            <div style="background: #FFF8E1; border-radius: 16px; padding: 16px; margin-bottom: 16px; border-left: 4px solid #FFB300;">
              <p style="color: #555; font-size: 13px; margin: 0;">
                ⚠️ Se não pediu esta alteração, pode ignorar este email. A sua conta permanece segura.
              </p>
            </div>

            <p style="text-align: center; color: #aaa; font-size: 12px; margin-top: 24px;">
              Kid to Kid Braga — Rua do Raio, 9 — info@kidtokid.pt
            </p>
          </div>
        `,
      });

      functions.logger.info(`Custom password reset email sent to ${email}`);
      return { success: true };
    } catch (error: unknown) {
      if (error instanceof functions.https.HttpsError) throw error;

      const err = error as { code?: string; message?: string; stack?: string };

      // Handle Firebase Auth errors
      if (err.code === "auth/user-not-found") {
        // Don't reveal if user exists
        return { success: true };
      }

      functions.logger.error("Password reset email failed:", {
        code: err.code,
        message: err.message,
        stack: err.stack,
      });
      throw new functions.https.HttpsError(
        "internal",
        "Erro ao enviar email de recuperação. Tente novamente."
      );
    }
  }
);

// ======================================
// �🔒 SECURE ORDER CREATION
// ======================================
// Validates prices server-side & decrements stock atomically

interface OrderItemInput {
  productId: string;
  quantity: number;
}

interface CreateOrderData {
  items: OrderItemInput[];
  shippingAddress: {
    name: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  shippingMethod: "delivery" | "express" | "pickup";
  paymentMethod: "card" | "shop";
  customerNotes?: string;
  couponCode?: string;
}

export const createSecureOrder = functions.region("europe-west1").https.onCall(
  async (data: CreateOrderData, context) => {
    // 1. Auth check
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "É necessário estar autenticado para criar uma encomenda."
      );
    }

    const userId = context.auth.uid;
    const userEmail = context.auth.token.email || "";

    // 2. Validate input
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "A encomenda deve ter pelo menos um artigo."
      );
    }

    if (data.items.length > 20) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Máximo de 20 artigos por encomenda."
      );
    }

    if (!data.shippingAddress || !data.shippingAddress.name || !data.shippingAddress.email) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Morada de envio incompleta."
      );
    }

    // Validate customer notes length
    if (data.customerNotes && data.customerNotes.length > 500) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Notas do cliente demasiado longas (máx. 500 caracteres)."
      );
    }

    // Validate phone format
    const cleanPhone = (data.shippingAddress.phone || "").replace(/\s/g, "");
    if (!/^(9[1236]\d{7}|2\d{8})$/.test(cleanPhone)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Número de telemóvel inválido."
      );
    }

    // 3. Rate limiting: max 5 orders per hour per user
    const oneHourAgo = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() - 60 * 60 * 1000)
    );
    const recentOrders = await db
      .collection("orders")
      .where("userId", "==", userId)
      .where("createdAt", ">", oneHourAgo)
      .get();

    if (recentOrders.size >= 5) {
      throw new functions.https.HttpsError(
        "resource-exhausted",
        "Demasiadas encomendas. Aguarde um pouco antes de tentar novamente."
      );
    }

    // 4. Load store settings for shipping costs
    const settingsDoc = await db.doc("settings/store").get();
    const settings = settingsDoc.exists ? settingsDoc.data() : {};
    const freeShippingThreshold = settings?.freeShippingThreshold ?? 50;
    const standardShippingCost = settings?.standardShippingCost ?? 4.50;
    const expressShippingCost = settings?.expressShippingCost ?? 7.50;
    const protectionFee = settings?.protectionFee ?? 0.50;

    // 4b. Validate coupon if provided
    let couponDiscount = 0;
    let couponRef: admin.firestore.DocumentReference | null = null;
    if (data.couponCode) {
      const couponsSnap = await db
        .collection("coupons")
        .where("code", "==", data.couponCode.toUpperCase().trim())
        .limit(1)
        .get();

      if (!couponsSnap.empty) {
        const couponDoc = couponsSnap.docs[0];
        const coupon = couponDoc.data();
        const now = new Date();
        const validFrom = coupon.validFrom?.toDate() || new Date(0);
        const validUntil = coupon.validUntil?.toDate() || new Date(0);
        const isActive = coupon.isActive !== false;
        const withinDates = now >= validFrom && now <= validUntil;
        const withinUsage = coupon.maxUses === 0 || (coupon.usedCount || 0) < coupon.maxUses;

        if (isActive && withinDates && withinUsage) {
          // Per-user usage check — prevent same user from using coupon multiple times
          const userCouponOrders = await db
            .collection("orders")
            .where("userId", "==", userId)
            .where("couponCode", "==", data.couponCode.toUpperCase().trim())
            .limit(1)
            .get();
          if (!userCouponOrders.empty) {
            throw new functions.https.HttpsError(
              "failed-precondition",
              "Já usaste este cupão numa encomenda anterior."
            );
          }
          couponRef = couponDoc.ref;
          // Discount will be calculated after subtotal is known
        }
      }
    }

    // 5. Validate products & decrement stock atomically
    try {
      // Deduplicate items by productId — merge quantities to prevent stock bypass
      const itemMap = new Map<string, number>();
      for (const item of data.items) {
        if (!item.productId || typeof item.quantity !== "number" || item.quantity < 1 || !Number.isInteger(item.quantity)) {
          throw new functions.https.HttpsError(
            "invalid-argument",
            "Artigo inválido na encomenda (quantidade deve ser um número inteiro positivo)."
          );
        }
        itemMap.set(item.productId, (itemMap.get(item.productId) || 0) + item.quantity);
      }
      const deduplicatedItems = Array.from(itemMap.entries()).map(([productId, quantity]) => ({ productId, quantity }));

      const result = await db.runTransaction(async (transaction) => {
        const orderItems: any[] = [];
        let subtotal = 0;
        const lowStockItems: { title: string; remaining: number; productId: string }[] = [];

        // ===== ALL READS FIRST (Firestore v7+ requirement) =====

        // Read all products (deduplicated — one read per unique productId)
        const productDocs: admin.firestore.DocumentSnapshot[] = [];
        for (const item of deduplicatedItems) {
          const productRef = db.doc(`products/${item.productId}`);
          const productDoc = await transaction.get(productRef);
          productDocs.push(productDoc);
        }

        // Read coupon if applicable (must happen before any writes)
        let couponData: admin.firestore.DocumentData | null = null;
        if (couponRef) {
          const couponSnap = await transaction.get(couponRef);
          if (couponSnap.exists) {
            couponData = couponSnap.data()!;
          }
        }

        // ===== ALL WRITES BELOW =====

        // Validate & build items (using deduplicated list)
        for (let i = 0; i < deduplicatedItems.length; i++) {
          const item = deduplicatedItems[i];
          const productDoc = productDocs[i];

          if (!productDoc.exists) {
            throw new functions.https.HttpsError(
              "not-found",
              `Produto "${item.productId}" não encontrado.`
            );
          }

          const product = productDoc.data()!;

          if ((product.stock || 0) < item.quantity) {
            throw new functions.https.HttpsError(
              "failed-precondition",
              `"${product.title}" não tem stock suficiente (disponível: ${product.stock || 0}).`
            );
          }

          const price = product.price;
          if (typeof price !== "number" || price <= 0) {
            throw new functions.https.HttpsError(
              "internal",
              `Preço inválido para "${product.title}".`
            );
          }

          subtotal += price * item.quantity;

          orderItems.push({
            productId: item.productId,
            title: product.title || "",
            brand: product.brand || "",
            size: product.size || "",
            price: price,
            quantity: item.quantity,
            image: (product.images && product.images[0]) || "/placeholder.svg",
          });

          // Decrement stock
          transaction.update(productDoc.ref, {
            stock: admin.firestore.FieldValue.increment(-item.quantity),
          });

          // Track low stock items
          const remainingStock = (product.stock || 0) - item.quantity;
          if (remainingStock <= 3 && remainingStock >= 0) {
            lowStockItems.push({
              title: product.title || "",
              remaining: remainingStock,
              productId: item.productId,
            });
          }
        }

        // Calculate totals server-side
        const shippingCost =
          data.shippingMethod === "pickup"
            ? 0
            : subtotal >= freeShippingThreshold
            ? 0
            : data.shippingMethod === "express"
            ? expressShippingCost
            : standardShippingCost;

        // Apply coupon discount using pre-read data
        if (couponRef && couponData) {
          if (couponData.discountType === "percentage") {
            couponDiscount = Math.round((subtotal * couponData.discountValue) / 100 * 100) / 100;
          } else {
            couponDiscount = Math.min(couponData.discountValue, subtotal);
          }
          if (couponData.minOrderValue && subtotal < couponData.minOrderValue) {
            couponDiscount = 0; // doesn't meet minimum
          } else {
            // Increment coupon usage
            transaction.update(couponRef, {
              usedCount: admin.firestore.FieldValue.increment(1),
            });
          }
        }

        const total = Math.max(0, subtotal - couponDiscount) + shippingCost + protectionFee;

        // Generate order number
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        const random = Math.random().toString(36).substring(2, 9).toUpperCase();
        const orderNumber = `K2K-${year}${month}${day}-${random}`;

        // Create order document
        const orderRef = db.collection("orders").doc();
        transaction.set(orderRef, {
          orderNumber,
          userId,
          userEmail,
          items: orderItems,
          subtotal,
          shippingCost,
          protectionFee,
          discount: couponDiscount,
          couponCode: couponDiscount > 0 ? (data.couponCode || "").toUpperCase().trim() : null,
          total,
          shippingMethod: data.shippingMethod,
          shippingAddress: {
            name: data.shippingAddress.name.trim().substring(0, 200),
            email: data.shippingAddress.email.trim().substring(0, 200),
            phone: cleanPhone,
            street: data.shippingAddress.street.trim().substring(0, 300),
            city: data.shippingAddress.city.trim().substring(0, 100),
            postalCode: data.shippingAddress.postalCode.trim().substring(0, 10),
            country: "Portugal",
          },
          paymentMethod: data.paymentMethod,
          paymentStatus: "pending",
          paymentReference: null,
          status: "pending",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          customerNotes: data.customerNotes
            ? data.customerNotes.trim().substring(0, 500)
            : null,
          internalNotes: null,
          trackingNumber: null,
          trackingUrl: null,
        });

        return { orderId: orderRef.id, orderNumber, total, subtotal, shippingCost, lowStockItems };
      });

      functions.logger.info(`Order ${result.orderNumber} created by ${userEmail}`);

      // Send low stock alert email if any products are running low
      if (result.lowStockItems && result.lowStockItems.length > 0) {
        try {
          const transporter = getTransporter();
          const adminEmail = getAdminEmail();

          const stockList = result.lowStockItems
            .map(
              (item: { title: string; remaining: number }) =>
                `• ${escapeHtml(item.title)} — ${item.remaining === 0 ? "⚠️ ESGOTADO" : `${item.remaining} restante${item.remaining !== 1 ? "s" : ""}`}`
            )
            .join("<br/>");

          await transporter.sendMail({
            from: `"Kid to Kid" <${process.env.EMAIL_USER}>`,
            to: adminEmail,
            subject: `⚠️ Stock Baixo — ${result.lowStockItems.length} produto${result.lowStockItems.length !== 1 ? "s" : ""}`,
            html: `
              <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
                <div style="text-align: center; margin-bottom: 24px;">
                  <h1 style="color: #E8927C; font-size: 22px; margin: 0;">⚠️ Alerta de Stock Baixo</h1>
                  <p style="color: #888; font-size: 14px;">Após encomenda #${escapeHtml(result.orderNumber)}</p>
                </div>
                <div style="background: #FFF8F6; border: 1px solid #FECDD3; border-radius: 16px; padding: 20px; margin-bottom: 16px;">
                  <h3 style="margin: 0 0 12px; color: #333;">Produtos com stock baixo:</h3>
                  <p style="margin: 0; color: #555; line-height: 1.8;">${stockList}</p>
                </div>
                <div style="text-align: center; margin-top: 24px;">
                  <a href="https://kidtokid-4d642.web.app/admin/produtos" 
                     style="display: inline-block; background: #E8927C; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 500;">
                    Gerir Produtos
                  </a>
                </div>
              </div>
            `,
          });
          functions.logger.info(`Low stock alert sent for ${result.lowStockItems.length} products`);
        } catch (emailError) {
          functions.logger.error("Failed to send low stock email:", emailError);
        }
      }

      return result;
    } catch (error: any) {
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      functions.logger.error("Order creation failed:", error?.message || error);
      throw new functions.https.HttpsError(
        "internal",
        "Erro ao criar encomenda. Tente novamente."
      );
    }
  }
);

// Trigger: New order created
export const onNewOrder = functions.region("europe-west1").firestore
  .document("orders/{orderId}")
  .onCreate(async (snap: functions.firestore.QueryDocumentSnapshot, context: functions.EventContext) => {
    const order = snap.data();
    const orderId = context.params.orderId;

    try {
      const transporter = getTransporter();
      const adminEmail = getAdminEmail();

      const itemsList = (order.items || [])
        .map(
          (item: any) =>
            `\u2022 ${escapeHtml(item.title)} (x${item.quantity}) \u2014 \u20AC${item.price?.toFixed(2)}`
        )
        .join("\n");

      const mailOptions = {
        from: `"Kid to Kid" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: `Nova Encomenda #${orderId.slice(0, 8).toUpperCase()}`,
        html: `
          <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #4A90B8; font-size: 24px; margin: 0;">Nova Encomenda</h1>
              <p style="color: #888; font-size: 14px;">Recebida em ${new Date().toLocaleString("pt-PT")}</p>
            </div>
            
            <div style="background: #F8F9FA; border-radius: 16px; padding: 20px; margin-bottom: 16px;">
              <h3 style="margin: 0 0 8px; color: #333;">Detalhes</h3>
              <p style="margin: 4px 0; color: #555;"><strong>ID:</strong> ${escapeHtml(orderId)}</p>
              <p style="margin: 4px 0; color: #555;"><strong>Cliente:</strong> ${escapeHtml(order.customerName || order.userEmail || "N/A")}</p>
              <p style="margin: 4px 0; color: #555;"><strong>Email:</strong> ${escapeHtml(order.userEmail || "N/A")}</p>
              <p style="margin: 4px 0; color: #555;"><strong>Total:</strong> €${order.total?.toFixed(2) || "0.00"}</p>
            </div>

            <div style="background: #F8F9FA; border-radius: 16px; padding: 20px;">
              <h3 style="margin: 0 0 8px; color: #333;">Produtos</h3>
              <pre style="margin: 0; font-family: inherit; white-space: pre-wrap; color: #555;">${itemsList || "Sem itens"}</pre>
            </div>

            <div style="text-align: center; margin-top: 24px;">
              <a href="https://kidtokid-4d642.web.app/admin" 
                 style="display: inline-block; background: #4A90B8; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 500;">
                Ver no Painel Admin
              </a>
            </div>

            <p style="text-align: center; color: #aaa; font-size: 12px; margin-top: 24px;">
              Kid to Kid — Notificação automática
            </p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      functions.logger.info(`Admin email sent for order ${orderId}`);

      // ─── Email de confirmação para o cliente ──────────────────────
      const customerEmail = order.shippingAddress?.email || order.userEmail;
      if (customerEmail) {
        const paymentInstructions: Record<string, string> = {
          card: "O pagamento com cartão será processado automaticamente via Stripe.",
          shop: "Efetue o pagamento quando levantar a encomenda na nossa loja.",
        };

        const customerItemsList = (order.items || [])
          .map(
            (item: any) =>
              `<tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #333;">${escapeHtml(item.title)}</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: center; color: #555;">x${item.quantity}</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right; color: #333;">€${item.price?.toFixed(2)}</td>
              </tr>`
          )
          .join("");

        const customerMailOptions = {
          from: `"Kid to Kid" <${process.env.EMAIL_USER}>`,
          to: customerEmail,
          subject: `Confirmação de Encomenda #${orderId.slice(0, 8).toUpperCase()} — Kid to Kid`,
          html: `
            <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #4A90B8; font-size: 24px; margin: 0;">Obrigado pela sua encomenda! 🎉</h1>
                <p style="color: #888; font-size: 14px;">Recebemos a sua encomenda com sucesso</p>
              </div>

              <div style="background: #F8F9FA; border-radius: 16px; padding: 20px; margin-bottom: 16px;">
                <h3 style="margin: 0 0 12px; color: #333;">Resumo da Encomenda</h3>
                <p style="margin: 4px 0; color: #555;"><strong>Nº:</strong> #${orderId.slice(0, 8).toUpperCase()}</p>
                <p style="margin: 4px 0; color: #555;"><strong>Data:</strong> ${new Date().toLocaleString("pt-PT")}</p>
                <p style="margin: 4px 0; color: #555;"><strong>Método de envio:</strong> ${order.shippingMethod === "pickup" ? "Recolha na Loja" : order.shippingMethod === "express" ? "Envio Expresso (1-2 dias)" : "Envio Standard (3-5 dias)"}</p>
                <p style="margin: 4px 0; color: #555;"><strong>Pagamento:</strong> ${order.paymentMethod?.toUpperCase() || "N/A"}</p>
              </div>

              <div style="background: #F8F9FA; border-radius: 16px; padding: 20px; margin-bottom: 16px;">
                <h3 style="margin: 0 0 12px; color: #333;">Produtos</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr>
                      <th style="text-align: left; padding: 8px 0; border-bottom: 2px solid #ddd; color: #555; font-size: 13px;">Produto</th>
                      <th style="text-align: center; padding: 8px 0; border-bottom: 2px solid #ddd; color: #555; font-size: 13px;">Qtd</th>
                      <th style="text-align: right; padding: 8px 0; border-bottom: 2px solid #ddd; color: #555; font-size: 13px;">Preço</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${customerItemsList || "<tr><td colspan='3'>Sem itens</td></tr>"}
                  </tbody>
                </table>
                ${order.discount ? `<p style="margin: 12px 0 4px; color: #16a34a;"><strong>Desconto:</strong> -€${order.discount.toFixed(2)}</p>` : ""}
                <p style="margin: 12px 0 4px; font-size: 18px; color: #333;"><strong>Total: €${order.total?.toFixed(2) || "0.00"}</strong></p>
              </div>

              <div style="background: #FFF8E1; border-radius: 16px; padding: 20px; margin-bottom: 16px; border-left: 4px solid #FFB300;">
                <h3 style="margin: 0 0 8px; color: #333;">💳 Instruções de Pagamento</h3>
                <p style="color: #555; margin: 0;">${paymentInstructions[order.paymentMethod] || "Entraremos em contacto consigo com instruções de pagamento."}</p>
              </div>

              <div style="text-align: center; margin-top: 24px;">
                <a href="https://kidtokid-4d642.web.app/minha-conta"
                   style="display: inline-block; background: #4A90B8; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 500;">
                  Ver as minhas encomendas
                </a>
              </div>

              <p style="text-align: center; color: #aaa; font-size: 12px; margin-top: 24px;">
                Kid to Kid Braga — Rua do Raio, 9 — info@kidtokid.pt
              </p>
            </div>
          `,
        };

        await transporter.sendMail(customerMailOptions);
        functions.logger.info(`Customer confirmation email sent to ${customerEmail} for order ${orderId}`);
      }
    } catch (error) {
      functions.logger.error("Failed to send order email:", error);
    }
  });

// ======================================
// 💳 STRIPE — CREATE CHECKOUT SESSION
// ======================================
// Creates a Stripe Checkout Session for an existing order
export const createStripeCheckoutSession = functions.region("europe-west1").https.onCall(
  async (data: { orderId: string; successUrl: string; cancelUrl: string }, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "É necessário estar autenticado.");
    }

    const { orderId, successUrl, cancelUrl } = data;
    if (!orderId || !successUrl || !cancelUrl) {
      throw new functions.https.HttpsError("invalid-argument", "Dados em falta (orderId, successUrl, cancelUrl).");
    }

    // Fetch the order
    const orderDoc = await db.collection("orders").doc(orderId).get();
    if (!orderDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Encomenda não encontrada.");
    }

    const order = orderDoc.data()!;
    if (order.userId !== context.auth.uid) {
      throw new functions.https.HttpsError("permission-denied", "Não tens permissão para esta encomenda.");
    }

    if (order.paymentStatus === "paid") {
      throw new functions.https.HttpsError("failed-precondition", "Esta encomenda já foi paga.");
    }

    const stripe = getStripe();

    // Build line items from the order
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = (order.items || []).map((item: any) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.title,
          ...(item.brand ? { description: `${item.brand} • Tam. ${item.size || "N/A"}` } : {}),
          ...(item.image && item.image !== '/placeholder.svg' ? { images: [item.image] } : {}),
        },
        unit_amount: Math.round(item.price * 100), // Stripe uses cents
      },
      quantity: item.quantity || 1,
    }));

    // Add shipping cost as a line item if applicable
    if (order.shippingCost && order.shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: { name: "Envio (CTT Expresso)" },
          unit_amount: Math.round(order.shippingCost * 100),
        },
        quantity: 1,
      });
    }

    // Add protection fee
    if (order.protectionFee && order.protectionFee > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: { name: "Proteção do comprador" },
          unit_amount: Math.round(order.protectionFee * 100),
        },
        quantity: 1,
      });
    }

    // Build discount coupon if relevant
    const discounts: Stripe.Checkout.SessionCreateParams.Discount[] = [];
    if (order.discount && order.discount > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: Math.round(order.discount * 100),
        currency: "eur",
        duration: "once",
        name: order.couponCode || "Desconto",
      });
      discounts.push({ coupon: coupon.id });
    }

    // Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      ...(discounts.length > 0 ? { discounts } : {}),
      metadata: {
        orderId: orderDoc.id,
        orderNumber: order.orderNumber,
        userId: context.auth.uid,
      },
      customer_email: order.shippingAddress?.email || order.userEmail,
      success_url: successUrl,
      cancel_url: cancelUrl,
      locale: "pt",
    });

    // Save session ID on the order for reference
    await db.collection("orders").doc(orderId).update({
      stripeSessionId: session.id,
      paymentReference: `STRIPE: ${session.id}`,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    functions.logger.info(`Stripe session ${session.id} created for order ${orderId}`);

    return { sessionId: session.id, url: session.url };
  }
);

async function findOrderIdByStripeSessionId(sessionId: string): Promise<string | null> {
  const snap = await db
    .collection("orders")
    .where("stripeSessionId", "==", sessionId)
    .limit(1)
    .get();

  if (snap.empty) return null;
  return snap.docs[0].id;
}

async function findOrderIdByPaymentIntentId(paymentIntentId: string): Promise<string | null> {
  const snap = await db
    .collection("orders")
    .where("stripePaymentIntentId", "==", paymentIntentId)
    .limit(1)
    .get();

  if (snap.empty) return null;
  return snap.docs[0].id;
}

async function reserveStripeWebhookEvent(event: Stripe.Event): Promise<boolean> {
  const eventRef = db.collection("stripe_webhook_events").doc(event.id);

  const shouldProcess = await db.runTransaction(async (tx) => {
    const existing = await tx.get(eventRef);
    if (existing.exists) return false;

    tx.set(eventRef, {
      eventId: event.id,
      type: event.type,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      livemode: event.livemode,
    });

    return true;
  });

  return shouldProcess;
}

async function markStripeWebhookEventDone(eventId: string): Promise<void> {
  await db.collection("stripe_webhook_events").doc(eventId).set(
    {
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

// ======================================
// 💳 STRIPE — WEBHOOK
// ======================================
// Handles Stripe webhooks to confirm payments
// Configure via functions/.env: STRIPE_WEBHOOK_SECRET=whsec_...
export const stripeWebhook = functions.region("europe-west1").https.onRequest(
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    if (webhookSecret) {
      const sig = req.headers["stripe-signature"] as string;
      try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
      } catch (err: any) {
        functions.logger.error("Webhook signature verification failed:", err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
      }
    } else {
      functions.logger.error("STRIPE_WEBHOOK_SECRET not configured — rejecting webhook.");
      res.status(500).send("Webhook secret not configured");
      return;
    }

    const processThisEvent = await reserveStripeWebhookEvent(event);
    if (!processThisEvent) {
      functions.logger.info(`Skipping duplicate Stripe webhook event ${event.id} (${event.type}).`);
      res.status(200).json({ received: true, duplicate: true });
      return;
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : undefined;

      let orderId = session.metadata?.orderId || null;
      if (!orderId) {
        orderId = await findOrderIdByStripeSessionId(session.id);
      }

      if (!orderId) {
        functions.logger.error(`No orderId found for checkout.session.completed (session=${session.id}).`);
        res.status(400).send("Missing orderId");
        return;
      }

      const orderRef = db.collection("orders").doc(orderId);
      const orderDoc = await orderRef.get();

      if (orderDoc.exists && orderDoc.data()?.paymentStatus !== "paid") {
        await orderRef.update({
          paymentStatus: "paid",
          status: "paid",
          stripePaymentIntentId: paymentIntentId || null,
          stripeLastWebhookEventId: event.id,
          paidAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        functions.logger.info(`Order ${orderId} marked as paid via Stripe webhook.`);
      }
    }

    if (event.type === "checkout.session.async_payment_failed") {
      const session = event.data.object as Stripe.Checkout.Session;

      let orderId = session.metadata?.orderId || null;
      if (!orderId) {
        orderId = await findOrderIdByStripeSessionId(session.id);
      }

      if (orderId) {
        await db.collection("orders").doc(orderId).update({
          paymentStatus: "failed",
          stripeLastWebhookEventId: event.id,
          paymentErrorMessage: "Pagamento assíncrono falhou no Stripe Checkout.",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        functions.logger.warn(`Order ${orderId} marked as payment failed (async).`);
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object as Stripe.PaymentIntent;
      const orderId = await findOrderIdByPaymentIntentId(intent.id);

      if (orderId) {
        await db.collection("orders").doc(orderId).update({
          paymentStatus: "failed",
          stripeLastWebhookEventId: event.id,
          paymentErrorCode: intent.last_payment_error?.code || null,
          paymentErrorMessage: intent.last_payment_error?.message || "Falha no pagamento.",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        functions.logger.warn(`Order ${orderId} marked as payment failed (intent=${intent.id}).`);
      }
    }

    if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : null;

      if (paymentIntentId) {
        const orderId = await findOrderIdByPaymentIntentId(paymentIntentId);

        if (orderId) {
          await db.collection("orders").doc(orderId).update({
            paymentStatus: "refunded",
            status: "refunded",
            stripeLastWebhookEventId: event.id,
            refundedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          functions.logger.info(`Order ${orderId} marked as refunded (charge=${charge.id}).`);
        }
      }
    }

    await markStripeWebhookEventDone(event.id);

    res.status(200).json({ received: true });
  }
);

// ======================================
// 📦 ORDER STATUS UPDATE — EMAIL TO CUSTOMER
// ======================================
// Sends an email to the customer when order status changes
export const onOrderUpdate = functions.region("europe-west1").firestore
  .document("orders/{orderId}")
  .onUpdate(async (change: functions.Change<functions.firestore.QueryDocumentSnapshot>, context: functions.EventContext) => {
    const before = change.before.data();
    const after = change.after.data();
    const orderId = context.params.orderId;

    // Only proceed if status actually changed
    if (before.status === after.status) return;

    const newStatus: string = after.status;

    // ── Restore stock when order is cancelled (idempotent) ──────────
    // Uses _stockRestored flag to prevent duplicate restores on Firestore trigger retries
    if (newStatus === "cancelled" && before.status !== "cancelled") {
      const alreadyRestored = after._stockRestored === true;
      if (!alreadyRestored) {
        try {
          const items = after.items || [];
          if (items.length > 0) {
            const stockBatch = db.batch();
            for (const item of items) {
              if (item.productId) {
                stockBatch.update(db.collection("products").doc(item.productId), {
                  stock: admin.firestore.FieldValue.increment(item.quantity || 1),
                });
              }
            }
            // Mark as restored to prevent duplicate processing
            stockBatch.update(change.after.ref, { _stockRestored: true });
            await stockBatch.commit();
            functions.logger.info(`Stock restored for cancelled order ${orderId} (${items.length} products)`);
          }
        } catch (stockError) {
          functions.logger.error(`Failed to restore stock for cancelled order ${orderId}:`, stockError);
        }
      } else {
        functions.logger.info(`Stock already restored for order ${orderId}, skipping (idempotent guard)`);
      }
    }

    const customerEmail = after.shippingAddress?.email || after.userEmail;

    if (!customerEmail) {
      functions.logger.warn(`No customer email for order ${orderId}, skipping status email.`);
      return;
    }

    // Define which statuses trigger an email
    const statusEmailConfig: Record<string, { subject: string; emoji: string; title: string; message: string; color: string }> = {
      paid: {
        subject: "Pagamento Confirmado",
        emoji: "✅",
        title: "Pagamento confirmado!",
        message: "O pagamento da sua encomenda foi confirmado com sucesso. Vamos começar a preparar os seus artigos.",
        color: "#16a34a",
      },
      processing: {
        subject: "Encomenda em Preparação",
        emoji: "📦",
        title: "A preparar a sua encomenda!",
        message: "Estamos a preparar os seus artigos com todo o cuidado. Receberá uma atualização quando estiver pronta.",
        color: "#7c3aed",
      },
      ready_pickup: {
        subject: "Encomenda Pronta para Levantamento",
        emoji: "🏪",
        title: "Pronta para levantar!",
        message: "A sua encomenda está pronta para levantamento na nossa loja. Pode passar a qualquer momento durante o horário de funcionamento.",
        color: "#ea580c",
      },
      shipped: {
        subject: "Encomenda Enviada",
        emoji: "🚚",
        title: "A sua encomenda foi enviada!",
        message: "A sua encomenda está a caminho! Receberá a entrega nos próximos dias úteis.",
        color: "#4338ca",
      },
      delivered: {
        subject: "Encomenda Entregue",
        emoji: "🎉",
        title: "Encomenda entregue!",
        message: "A sua encomenda foi entregue com sucesso. Esperamos que goste dos artigos!",
        color: "#16a34a",
      },
      cancelled: {
        subject: "Encomenda Cancelada",
        emoji: "❌",
        title: "Encomenda cancelada",
        message: "A sua encomenda foi cancelada. Se tiver dúvidas, não hesite em contactar-nos.",
        color: "#dc2626",
      },
      refunded: {
        subject: "Reembolso Processado",
        emoji: "💰",
        title: "Reembolso processado",
        message: "O reembolso da sua encomenda foi processado. O valor será devolvido ao método de pagamento original nos próximos dias.",
        color: "#6b7280",
      },
    };

    const config = statusEmailConfig[newStatus];
    if (!config) return; // Status doesn't trigger email (e.g. "pending")

    try {
      const transporter = getTransporter();
      const orderNumber = after.orderNumber || orderId.slice(0, 8).toUpperCase();

      // Build tracking info if available
      let trackingHtml = "";
      if (newStatus === "shipped" && after.trackingNumber) {
        const trackingLink = after.trackingUrl
          ? `<a href="${escapeHtml(after.trackingUrl)}" style="color: #4A90B8; text-decoration: underline;">Seguir encomenda</a>`
          : "";
        trackingHtml = `
          <div style="background: #EFF6FF; border-radius: 16px; padding: 20px; margin-bottom: 16px; border-left: 4px solid #3B82F6;">
            <h3 style="margin: 0 0 8px; color: #333;">📍 Informação de Tracking</h3>
            <p style="color: #555; margin: 4px 0;"><strong>Nº de tracking:</strong> ${escapeHtml(after.trackingNumber)}</p>
            ${trackingLink ? `<p style="color: #555; margin: 4px 0;">${trackingLink}</p>` : ""}
          </div>
        `;
      }

      // Build items table
      const itemsList = (after.items || [])
        .map(
          (item: any) =>
            `<tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #333;">${escapeHtml(item.title)}</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: center; color: #555;">x${item.quantity}</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right; color: #333;">€${item.price?.toFixed(2)}</td>
            </tr>`
        )
        .join("");

      const mailOptions = {
        from: `"Kid to Kid" <${process.env.EMAIL_USER}>`,
        to: customerEmail,
        subject: `${config.emoji} ${config.subject} — Encomenda #${orderNumber}`,
        html: `
          <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: ${config.color}; font-size: 24px; margin: 0;">${config.emoji} ${config.title}</h1>
              <p style="color: #888; font-size: 14px;">Encomenda #${escapeHtml(orderNumber)}</p>
            </div>

            <div style="background: #F8F9FA; border-radius: 16px; padding: 20px; margin-bottom: 16px;">
              <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0;">${config.message}</p>
            </div>

            ${trackingHtml}

            <div style="background: #F8F9FA; border-radius: 16px; padding: 20px; margin-bottom: 16px;">
              <h3 style="margin: 0 0 12px; color: #333;">Resumo da Encomenda</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr>
                    <th style="text-align: left; padding: 8px 0; border-bottom: 2px solid #ddd; color: #555; font-size: 13px;">Produto</th>
                    <th style="text-align: center; padding: 8px 0; border-bottom: 2px solid #ddd; color: #555; font-size: 13px;">Qtd</th>
                    <th style="text-align: right; padding: 8px 0; border-bottom: 2px solid #ddd; color: #555; font-size: 13px;">Preço</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList || "<tr><td colspan='3'>Sem itens</td></tr>"}
                </tbody>
              </table>
              <p style="margin: 12px 0 4px; font-size: 18px; color: #333;"><strong>Total: €${after.total?.toFixed(2) || "0.00"}</strong></p>
            </div>

            <div style="text-align: center; margin-top: 24px;">
              <a href="https://kidtokid-4d642.web.app/minha-conta"
                 style="display: inline-block; background: #4A90B8; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 500;">
                Ver as minhas encomendas
              </a>
            </div>

            <p style="text-align: center; color: #aaa; font-size: 12px; margin-top: 24px;">
              Kid to Kid Braga — Rua do Raio, 9 — info@kidtokid.pt
            </p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      functions.logger.info(`Status update email (${newStatus}) sent to ${customerEmail} for order ${orderId}`);

      // Also notify admin for important status changes
      if (["cancelled", "refunded"].includes(newStatus)) {
        const adminEmail = getAdminEmail();
        await transporter.sendMail({
          from: `"Kid to Kid" <${process.env.EMAIL_USER}>`,
          to: adminEmail,
          subject: `${config.emoji} Encomenda #${orderNumber} — ${config.subject}`,
          html: `
            <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
              <h1 style="color: ${config.color}; font-size: 22px;">${config.emoji} ${config.subject}</h1>
              <div style="background: #F8F9FA; border-radius: 16px; padding: 20px; margin: 16px 0;">
                <p style="margin: 4px 0; color: #555;"><strong>Encomenda:</strong> #${escapeHtml(orderNumber)}</p>
                <p style="margin: 4px 0; color: #555;"><strong>Cliente:</strong> ${escapeHtml(after.shippingAddress?.name || "N/A")}</p>
                <p style="margin: 4px 0; color: #555;"><strong>Email:</strong> ${escapeHtml(customerEmail)}</p>
                <p style="margin: 4px 0; color: #555;"><strong>Total:</strong> €${after.total?.toFixed(2) || "0.00"}</p>
                <p style="margin: 4px 0; color: #555;"><strong>Estado anterior:</strong> ${escapeHtml(before.status)}</p>
                <p style="margin: 4px 0; color: #555;"><strong>Novo estado:</strong> ${escapeHtml(newStatus)}</p>
              </div>
              <div style="text-align: center; margin-top: 24px;">
                <a href="https://kidtokid-4d642.web.app/admin/encomendas" 
                   style="display: inline-block; background: #4A90B8; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 500;">
                  Ver Encomendas
                </a>
              </div>
            </div>
          `,
        });
        functions.logger.info(`Admin notified of ${newStatus} for order ${orderId}`);
      }
    } catch (error) {
      functions.logger.error(`Failed to send status update email for order ${orderId}:`, error);
    }
  });

// Trigger: New contact form submission
export const onNewContact = functions.region("europe-west1").firestore
  .document("contacts/{contactId}")
  .onCreate(async (snap: functions.firestore.QueryDocumentSnapshot, context: functions.EventContext) => {
    const contact = snap.data();
    const contactId = context.params.contactId;

    try {
      const transporter = getTransporter();
      const adminEmail = getAdminEmail();

      const mailOptions = {
        from: `"Kid to Kid" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: `Nova Mensagem de Contacto — ${contact.subject || "Sem assunto"}`,
        html: `
          <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <h1 style="color: #4A90B8; font-size: 22px;">Nova Mensagem de Contacto</h1>
            
            <div style="background: #F8F9FA; border-radius: 16px; padding: 20px; margin: 16px 0;">
              <p style="margin: 4px 0; color: #555;"><strong>De:</strong> ${escapeHtml(contact.name || "An\u00f3nimo")}</p>
              <p style="margin: 4px 0; color: #555;"><strong>Email:</strong> ${escapeHtml(contact.email || "N/A")}</p>
              <p style="margin: 4px 0; color: #555;"><strong>Assunto:</strong> ${escapeHtml(contact.subject || "N/A")}</p>
            </div>

            <div style="background: #F8F9FA; border-radius: 16px; padding: 20px;">
              <h3 style="margin: 0 0 8px; color: #333;">Mensagem</h3>
              <p style="color: #555; line-height: 1.6;">${escapeHtml(contact.message || "Sem mensagem")}</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      functions.logger.info(`Contact email sent for ${contactId}`);
    } catch (error) {
      functions.logger.error("Failed to send contact email:", error);
    }
  });

// Trigger: New review notification
export const onNewReview = functions.region("europe-west1").firestore
  .document("reviews/{reviewId}")
  .onCreate(async (snap: functions.firestore.QueryDocumentSnapshot, context: functions.EventContext) => {
    const review = snap.data();
    const reviewId = context.params.reviewId;

    try {
      const transporter = getTransporter();
      const adminEmail = getAdminEmail();

      const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);

      const mailOptions = {
        from: `"Kid to Kid" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: `Nova Avaliação — ${stars} — ${review.title || "Sem título"}`,
        html: `
          <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <h1 style="color: #4A90B8; font-size: 22px;">Nova Avaliação de Produto</h1>
            
            <div style="background: #F8F9FA; border-radius: 16px; padding: 20px; margin: 16px 0;">
              <p style="font-size: 24px; margin: 0 0 8px; color: #F59E0B;">${stars}</p>
              <p style="margin: 4px 0; color: #555;"><strong>Por:</strong> ${escapeHtml(review.userName || "An\u00f3nimo")}</p>
              <p style="margin: 4px 0; color: #555;"><strong>Produto:</strong> ${escapeHtml(review.productId)}</p>
              <h3 style="margin: 12px 0 4px; color: #333;">${escapeHtml(review.title)}</h3>
              <p style="color: #555; line-height: 1.6;">${escapeHtml(review.comment)}</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      functions.logger.info(`Review notification sent for ${reviewId}`);
    } catch (error) {
      functions.logger.error("Failed to send review email:", error);
    }
  });

// ======================================
// 💳 AUTOMATIC STRIPE REFUND ON CANCELLATION
// ======================================
// When an admin (or the customer) cancels a paid order, automatically refund via Stripe
export const refundOrder = functions.region("europe-west1").https.onCall(
  async (data: { orderId: string }, context) => {
    // Auth check
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Login required");
    }

    const { orderId } = data;
    if (!orderId) {
      throw new functions.https.HttpsError("invalid-argument", "orderId is required");
    }

    const orderRef = db.collection("orders").doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Encomenda não encontrada");
    }

    const order = orderDoc.data()!;

    // Permission: must be order owner or admin
    const isOwner = order.userId === context.auth.uid;
    const isAdmin = context.auth.token.admin === true;
    if (!isOwner && !isAdmin) {
      throw new functions.https.HttpsError("permission-denied", "Sem permissão");
    }

    // Must have been paid via Stripe
    if (order.paymentStatus !== "paid" || order.paymentMethod !== "card") {
      throw new functions.https.HttpsError("failed-precondition", "Esta encomenda não pode ser reembolsada (não paga via Stripe)");
    }

    // Must have a Stripe payment intent
    const paymentIntentId = order.stripePaymentIntentId;
    if (!paymentIntentId) {
      throw new functions.https.HttpsError("failed-precondition", "Sem referência de pagamento Stripe");
    }

    // Don't refund twice
    if (order.paymentStatus === "refunded" || order.status === "refunded") {
      throw new functions.https.HttpsError("already-exists", "Encomenda já foi reembolsada");
    }

    // Don't refund a cancelled order (stock already restored by onOrderUpdate)
    if (order.status === "cancelled") {
      throw new functions.https.HttpsError("failed-precondition", "Encomenda já foi cancelada. Reembolsa manualmente no Stripe Dashboard.");
    }

    try {
      const stripe = getStripe();
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
      });

      // Update order
      await orderRef.update({
        status: "refunded",
        paymentStatus: "refunded",
        stripeRefundId: refund.id,
        refundedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Restore stock
      if (order.items && Array.isArray(order.items)) {
        const batch = db.batch();
        for (const item of order.items) {
          const productRef = db.collection("products").doc(item.productId);
          batch.update(productRef, {
            stock: admin.firestore.FieldValue.increment(item.quantity || 1),
          });
        }
        await batch.commit();
      }

      functions.logger.info(`Order ${orderId} refunded. Stripe refund: ${refund.id}`);
      return { success: true, refundId: refund.id };
    } catch (error: any) {
      functions.logger.error(`Refund failed for order ${orderId}:`, error);
      throw new functions.https.HttpsError("internal", "Erro ao processar reembolso. Contacte o suporte.");
    }
  }
);

// ======================================
// 📰 NEWSLETTER — Email de boas-vindas
// ======================================
export const onNewsletterSubscribe = functions
  .region("europe-west1")
  .firestore.document("newsletter/{emailId}")
  .onCreate(async (snap) => {
    const data = snap.data();
    const email = data?.email;
    if (!email) {
      functions.logger.warn("Newsletter doc created without email field");
      return;
    }

    try {
      const transporter = getTransporter();
      const storeName = "Kid to Kid Braga";

      await transporter.sendMail({
        from: `"${storeName}" <${process.env.EMAIL_USER || "noreply@kidtokid.pt"}>`,
        to: email,
        subject: `Bem-vindo à Newsletter ${storeName}! 🎉`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <div style="background: linear-gradient(135deg, #4A90B8, #7BC7A0); padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Bem-vindo à Newsletter!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">${storeName}</p>
            </div>

            <div style="padding: 32px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Olá! 👋
              </p>
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Obrigado por te subscreveres à nossa newsletter. A partir de agora vais receber:
              </p>
              <ul style="color: #555; font-size: 15px; line-height: 1.8; padding-left: 20px;">
                <li>🏷️ <strong>Promoções exclusivas</strong> antes de todos</li>
                <li>👶 <strong>Novos artigos</strong> acabados de chegar</li>
                <li>📢 <strong>Eventos e novidades</strong> da loja</li>
                <li>💡 <strong>Dicas</strong> sobre moda infantil sustentável</li>
              </ul>

              <div style="text-align: center; margin: 32px 0;">
                <a href="https://kidtokid.pt" 
                   style="display: inline-block; background: #4A90B8; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px;">
                  Visitar a Loja
                </a>
              </div>

              <p style="color: #999; font-size: 12px; text-align: center; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px;">
                Recebeste este email porque te subscreveste à newsletter de ${storeName}.<br/>
                Se não foste tu, podes ignorar este email.
              </p>
            </div>
          </div>
        `,
      });

      functions.logger.info(`Newsletter welcome email sent to ${email}`);
    } catch (error) {
      functions.logger.error(`Failed to send newsletter welcome email to ${email}:`, error);
    }
  });

// ======================================
// 📢 NEWSLETTER — Enviar email promocional para subscritores
// ======================================
interface PromoProduct {
  name: string;
  originalPrice: number;
  promoPrice: number;
  imageUrl?: string;
  link?: string;
}

interface SendPromoData {
  subject: string;
  headline: string;
  message: string;
  products?: PromoProduct[];
  ctaText?: string;
  ctaUrl?: string;
}

export const sendPromoNewsletter = functions
  .region("europe-west1")
  .https.onCall(async (data: SendPromoData, context) => {
    // Only admins can send promotional emails
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Login necessário");
    }
    const email = context.auth.token.email?.toLowerCase() || "";
    const isAdmin = context.auth.token.admin === true || ADMIN_EMAILS.includes(email);
    if (!isAdmin) {
      throw new functions.https.HttpsError("permission-denied", "Apenas admins podem enviar promoções");
    }

    // Validate input
    if (!data.subject || !data.headline || !data.message) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "subject, headline e message são obrigatórios"
      );
    }

    // Fetch all active newsletter subscribers
    const subscribersSnap = await db.collection("newsletter").where("active", "==", true).get();
    if (subscribersSnap.empty) {
      return { success: true, sent: 0, message: "Nenhum subscritor ativo" };
    }

    const subscribers = subscribersSnap.docs.map((d) => d.data().email as string).filter(Boolean);

    if (subscribers.length === 0) {
      return { success: true, sent: 0, message: "Nenhum subscritor ativo" };
    }

    const storeName = "Kid to Kid Braga";
    const transporter = getTransporter();

    // Build products HTML if provided
    let productsHtml = "";
    if (data.products && data.products.length > 0) {
      const productCards = data.products.map((p) => {
        const discount = p.originalPrice > 0
          ? Math.round(((p.originalPrice - p.promoPrice) / p.originalPrice) * 100)
          : 0;
        return `
          <div style="display: inline-block; width: 48%; vertical-align: top; margin: 1%; background: #fff; border: 1px solid #eee; border-radius: 8px; overflow: hidden; text-align: center;">
            ${p.imageUrl ? `<img src="${escapeHtml(p.imageUrl)}" alt="${escapeHtml(p.name)}" style="width: 100%; height: 150px; object-fit: cover;" />` : ""}
            <div style="padding: 12px;">
              <p style="margin: 0; font-weight: bold; color: #333; font-size: 14px;">${escapeHtml(p.name)}</p>
              <p style="margin: 6px 0;">
                <span style="color: #999; text-decoration: line-through; font-size: 13px;">${p.originalPrice.toFixed(2)}€</span>
                <span style="color: #e53e3e; font-weight: bold; font-size: 16px; margin-left: 8px;">${p.promoPrice.toFixed(2)}€</span>
              </p>
              ${discount > 0 ? `<span style="display: inline-block; background: #e53e3e; color: #fff; font-size: 11px; padding: 2px 8px; border-radius: 12px; font-weight: bold;">-${discount}%</span>` : ""}
              ${p.link ? `<div style="margin-top: 8px;"><a href="${escapeHtml(p.link)}" style="color: #4A90B8; font-size: 13px; text-decoration: none; font-weight: bold;">Ver Produto →</a></div>` : ""}
            </div>
          </div>
        `;
      }).join("");

      productsHtml = `
        <div style="margin: 24px 0;">
          <h3 style="color: #333; font-size: 18px; text-align: center; margin-bottom: 16px;">🏷️ Produtos em Destaque</h3>
          <div style="text-align: center;">
            ${productCards}
          </div>
        </div>
      `;
    }

    const ctaText = data.ctaText || "Visitar a Loja";
    const ctaUrl = data.ctaUrl || "https://kidtokid.pt";

    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #e53e3e, #f56565); padding: 32px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${escapeHtml(data.headline)}</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">${storeName}</p>
        </div>

        <div style="padding: 32px;">
          <p style="color: #333; font-size: 16px; line-height: 1.6; white-space: pre-line;">
            ${escapeHtml(data.message)}
          </p>

          ${productsHtml}

          <div style="text-align: center; margin: 32px 0;">
            <a href="${escapeHtml(ctaUrl)}"
               style="display: inline-block; background: #e53e3e; color: #fff; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px;">
              ${escapeHtml(ctaText)}
            </a>
          </div>

          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px;">
            Recebeste este email porque subscreveste a newsletter de ${storeName}.<br/>
            ${storeName} — Rua do Raio, 4700-922 Braga
          </p>
        </div>
      </div>
    `;

    // Send in batches of 10 to avoid rate limits
    let sent = 0;
    let failed = 0;
    const batchSize = 10;

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map((subscriberEmail) =>
          transporter.sendMail({
            from: `"${storeName}" <${process.env.EMAIL_USER || "noreply@kidtokid.pt"}>`,
            to: subscriberEmail,
            subject: data.subject,
            html: htmlTemplate,
          })
        )
      );

      results.forEach((r) => {
        if (r.status === "fulfilled") sent++;
        else failed++;
      });
    }

    // Log the promo send in Firestore for tracking
    await db.collection("promos_log").add({
      subject: data.subject,
      headline: data.headline,
      message: data.message,
      productsCount: data.products?.length || 0,
      totalSubscribers: subscribers.length,
      sent,
      failed,
      sentBy: context.auth.uid,
      sentByEmail: context.auth.token.email || "",
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    functions.logger.info(`Promo newsletter sent: ${sent} ok, ${failed} failed out of ${subscribers.length}`);

    return {
      success: true,
      sent,
      failed,
      total: subscribers.length,
    };
  });

// ======================================
// 🧹 REMOVE PURCHASED PRODUCT & IMAGE
// ======================================
/**
 * Trigger (v2): Quando um pedido (order) é inserido ou atualizado.
 * Ação: Se o status mudar para "paid" ou "confirmed", remove o produto do catálogo
 * e exclui a imagem física associada do Cloud Storage para economizar espaço.
 */
export const removePurchasedProductAndImage = onDocumentWritten(
  { document: "orders/{orderId}", region: "europe-west1" },
  async (event) => {
    // Apenas projeta se o documento existe após a alteração
    const afterSnap = event.data?.after;
    if (!afterSnap || !afterSnap.exists) return;

    const orderData = afterSnap.data();
    if (!orderData) return;
    
    // Verifica se a encomenda foi efetivamente paga/confirmada
    if (orderData.status !== "paid" && orderData.status !== "confirmed") {
      return;
    }

    const items = orderData.items || [];
    if (items.length === 0) return;

    // Acessa o bucket default configurado para o app
    const bucket = admin.storage().bucket();
    const firestoreDb = admin.firestore();

    for (const item of items) {
      const productId = item.productId;
      if (!productId) continue;

      const productRef = firestoreDb.collection("products").doc(productId);

      try {
        // Usa transação para deleção atômica no banco de dados
        const productData = await firestoreDb.runTransaction(async (transaction) => {
          const doc = await transaction.get(productRef);
          if (!doc.exists) {
            return null; // Já processado ou deletado
          }
          const data = doc.data();
          
          transaction.delete(productRef);
          return data;
        });

        if (!productData) {
          functions.logger.info(`Produto ${productId} não encontrado ou já removido.`);
          continue; 
        }

        // Extração de caminhos das imagens
        const imagePaths: string[] = [];
        if (productData.images && Array.isArray(productData.images)) {
          for (const url of productData.images) {
            const path = extractStoragePath(url);
            if (path) imagePaths.push(path);
          }
        } else if (productData.imageUrl) {
          const path = extractStoragePath(productData.imageUrl);
          if (path) imagePaths.push(path);
        }

        // 3. Deleta do Storage os arquivos físicos de forma segura
        const deletePromises = imagePaths.map(async (filePath) => {
          try {
            const file = bucket.file(filePath);
            const [exists] = await file.exists();
            if (exists) {
              await file.delete();
              functions.logger.info(`✅ Imagem removida do Storage: ${filePath}`);
            }
          } catch (storageError) {
            functions.logger.error(`❌ Erro ao deletar imagem ${filePath}:`, storageError);
          }
        });

        await Promise.all(deletePromises);
        functions.logger.info(`✅ Produto ${productId} purgado com sucesso do catálogo e Storage.`);

      } catch (error) {
        functions.logger.error(`❌ Erro crítico ao purgar produto ${productId}:`, error);
      }
    }
  }
);

/**
 * Função utilitária para extrair o caminho do arquivo no Storage a partir de uma URL HTTP.
 */
function extractStoragePath(urlOrPath: string): string {
  if (!urlOrPath) return "";
  if (urlOrPath.startsWith("gs://")) {
    return urlOrPath.split("/").slice(3).join("/");
  }
  if (!urlOrPath.startsWith("http")) return urlOrPath; 

  try {
    const urlObj = new URL(urlOrPath);
    // Extrai o caminho e reverte formatação %2F para "/"
    const pathRegex = /\/o\/(.+?)\?/;
    const match = urlObj.pathname.match(pathRegex) || urlOrPath.match(pathRegex);
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
    return "";
  } catch (e) {
    functions.logger.warn(`Falha ao formatar URL da imagem: ${urlOrPath}`);
    return "";
  }
}



