import { useState, useEffect, useCallback } from "react"
import { AdminLayout } from "@/src/components/admin/AdminLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Mail,
  Users,
  Send,
  Trash2,
  Loader2,
  Megaphone,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShoppingBag,
} from "lucide-react"
import { toast } from "sonner"
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
  where,
  writeBatch,
} from "firebase/firestore"
import { db } from "@/src/lib/firebase"
import { sendPromoNewsletterWithTimeout } from "@/src/lib/cloudFunctions"
import { sendNewsletterNotification, resetPromosLog } from "@/src/services/notificationService"
import type { IProduct } from "@/src/types"

interface Subscriber {
  email: string
  subscribedAt: Date | null
  active: boolean
}

interface PromoLog {
  id: string
  subject: string
  headline: string
  sent: number
  failed: number
  total: number
  sentByEmail: string
  sentAt: Date | null
  productsCount: number
}

interface DiscountProduct {
  id: string
  title: string
  price: number
  originalPrice: number
  discount: number
  images: string[]
  selected: boolean
}

import { AdminNewsletterSender } from "@/src/components/admin/AdminNewsletterSender"

export default function AdminNewsletterPage() {
  // Subscribers
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loadingSubscribers, setLoadingSubscribers] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  // Promo form
  const [subject, setSubject] = useState("")
  const [headline, setHeadline] = useState("")
  const [message, setMessage] = useState("")
  const [ctaText, setCtaText] = useState("Ver Promoções")
  const [ctaUrl, setCtaUrl] = useState("https://kidtokid.pt")
  const [sending, setSending] = useState(false)

  // Discount products (above 50%)
  const [discountProducts, setDiscountProducts] = useState<DiscountProduct[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [minDiscount, setMinDiscount] = useState(30)

  // Promo history
  const [promoLogs, setPromoLogs] = useState<PromoLog[]>([])
  const [loadingLogs, setLoadingLogs] = useState(true)

  // Tab
  const [activeTab, setActiveTab] = useState<"compose" | "inapp" | "subscribers" | "history">("compose")

  // Load subscribers
  const loadSubscribers = useCallback(async () => {
    setLoadingSubscribers(true)
    try {
      // 1. Sincronizar utilizadores que têm newsletter=true (caso existam utilizadores antigos não sincronizados)
      try {
        const usersSnap = await getDocs(query(collection(db, "users"), where("newsletter", "==", true)))
        const existingNewsletterSnap = await getDocs(collection(db, "newsletter"))
        const existingEmails = new Set(existingNewsletterSnap.docs.map(d => d.id.toLowerCase()))
        
        const batch = writeBatch(db)
        let addedCount = 0
        
        for (const userDoc of usersSnap.docs) {
          const userData = userDoc.data()
          if (userData.email && !existingEmails.has(userData.email.toLowerCase())) {
            batch.set(doc(db, "newsletter", userData.email), {
              email: userData.email,
              subscribedAt: userData.createdAt || new Date(),
              active: true,
            }, { merge: true })
            addedCount++
          }
        }
        
        if (addedCount > 0) {
          await batch.commit()
          // console.log(`Sincronizados ${addedCount} utilizadores para a coleção de newsletter`)
        }
      } catch (syncError) {
        console.error("Failed to sync users to newsletter collection:", syncError)
      }

      // 2. Carregar a lista atualizada
      const snap = await getDocs(collection(db, "newsletter"))
      const subs: Subscriber[] = snap.docs.map((d) => {
        const data = d.data()
        return {
          email: data.email || d.id,
          subscribedAt: data.subscribedAt?.toDate?.() || null,
          active: data.active !== false,
        }
      })
      subs.sort((a, b) => {
        if (a.subscribedAt && b.subscribedAt) return b.subscribedAt.getTime() - a.subscribedAt.getTime()
        return 0
      })
      setSubscribers(subs)
    } catch (error) {
      console.error("Failed to load subscribers:", error)
      toast.error("Ups! Problema ao carregar subscritores")
    } finally {
      setLoadingSubscribers(false)
    }
  }, [])

  // Load promo history
  const loadPromoLogs = useCallback(async () => {
    setLoadingLogs(true)
    try {
      const q = query(collection(db, "promos_log"), orderBy("sentAt", "desc"), limit(20))
      const snap = await getDocs(q)
      const logs: PromoLog[] = snap.docs.map((d) => {
        const data = d.data()
        return {
          id: d.id,
          subject: data.subject || "",
          headline: data.headline || "",
          sent: data.sent || 0,
          failed: data.failed || 0,
          total: data.total || data.totalSubscribers || 0,
          sentByEmail: data.sentByEmail || "",
          sentAt: data.sentAt?.toDate?.() || null,
          productsCount: data.productsCount || 0,
        }
      })
      setPromoLogs(logs)
    } catch (error) {
      console.error("Failed to load promo logs:", error)
    } finally {
      setLoadingLogs(false)
    }
  }, [])

  // Load discount products
  const loadDiscountProducts = useCallback(async () => {
    setLoadingProducts(true)
    try {
      const q = query(
        collection(db, "products"),
        where("stock", ">", 0),
        limit(100)
      )
      const snap = await getDocs(q)
      const products: DiscountProduct[] = []

      snap.docs.forEach((d) => {
        const data = d.data() as IProduct
        if (data.originalPrice && data.originalPrice > data.price) {
          const discount = Math.round(((data.originalPrice - data.price) / data.originalPrice) * 100)
          if (discount >= minDiscount) {
            products.push({
              id: d.id,
              title: data.title,
              price: data.price,
              originalPrice: data.originalPrice,
              discount,
              images: data.images || [],
              selected: discount >= 50, // Auto-select 50%+ discounts
            })
          }
        }
      })

      products.sort((a, b) => b.discount - a.discount)
      setDiscountProducts(products)
    } catch (error) {
      console.error("Failed to load products:", error)
      toast.error("Ups! Problema ao carregar produtos")
    } finally {
      setLoadingProducts(false)
    }
  }, [minDiscount])

  useEffect(() => {
    loadSubscribers()
    loadPromoLogs()
  }, [loadSubscribers, loadPromoLogs])

  // Delete subscriber
  const handleDeleteSubscriber = async (email: string) => {
    if (!confirm(`Remover ${email} da newsletter?`)) return
    try {
      await deleteDoc(doc(db, "newsletter", email))
      setSubscribers((prev) => prev.filter((s) => s.email !== email))
      toast.success("Subscritor removido")
    } catch (error) {
      console.error("Error deleting subscriber:", error)
      toast.error("Ups! Problema ao remover subscritor")
    }
  }

  // Toggle product selection
  const toggleProduct = (id: string) => {
    setDiscountProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p))
    )
  }

  // Send promo email
  const handleSendPromo = async () => {
    if (!subject.trim() || !headline.trim() || !message.trim()) {
      toast.error("Preenche o assunto, título e mensagem")
      return
    }

    const activeCount = subscribers.filter((s) => s.active).length
    if (activeCount === 0) {
      toast.error("Não há subscritores ativos")
      return
    }

    const selectedProducts = discountProducts
      .filter((p) => p.selected)
      .map((p) => ({
        name: p.title,
        originalPrice: p.originalPrice,
        promoPrice: p.price,
        imageUrl: (p.images && p.images[0]) || "",
        link: `https://kidtokid.pt/produto/${p.id}`,
      }))

    if (
      !confirm(
        `Enviar email promocional para ${activeCount} subscritor${activeCount > 1 ? "es" : ""}?\n\nAssunto: ${subject}\n${selectedProducts.length > 0 ? `Produtos: ${selectedProducts.length}` : "Sem produtos em destaque"}`
      )
    ) {
      return
    }

    setSending(true)
    try {
      const promoData = {
        subject,
        headline,
        message,
        products: selectedProducts.length > 0 ? selectedProducts : undefined,
        ctaText: ctaText || undefined,
        ctaUrl: ctaUrl || undefined,
      }
      
      const result = await sendPromoNewsletterWithTimeout(promoData, 60_000)
      const data = result.data as { success: boolean; sent: number; failed: number; total: number }

      if (data.success) {
        // Também enviar notificação in-app para utilizadores com newsletter ativa
        try {
          const inAppResult = await sendNewsletterNotification(
            headline,
            message.substring(0, 200),
            ctaUrl || undefined
          )
          toast.success(
            `Email enviado: ${data.sent}/${data.total} entregues · Notificação in-app: ${inAppResult.count} utilizadores`
          )
        } catch (inAppError) {
          console.warn("In-app notification failed (email was sent):", inAppError)
          toast.success(`Email enviado com sucesso! ${data.sent}/${data.total} entregues`)
          toast.warning("A notificação in-app não foi enviada. Usa a tab 'In-App' para enviar manualmente.")
        }

        // Reset form
        setSubject("")
        setHeadline("")
        setMessage("")
        setDiscountProducts((prev) => prev.map((p) => ({ ...p, selected: false })))
        // Refresh logs
        loadPromoLogs()
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      console.error("Failed to send promo:", error)
      toast.error(err.message || "Ups! Problema ao enviar email promocional")
    } finally {
      setSending(false)
    }
  }

  const filteredSubscribers = subscribers.filter((s) =>
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activeSubscribers = subscribers.filter((s) => s.active).length

  // Reset newsletter
  const [resetting, setResetting] = useState(false)
  const handleReset = async () => {
    if (!confirm("Tens a certeza que queres apagar o histórico de promoções?\n\nA base de dados de subscritores continuará intacta. Esta ação é irreversível!")) return
    setResetting(true)
    try {
      const deletedLogs = await resetPromosLog()
      toast.success(`Reset completo! ${deletedLogs} registos de histórico de promos apagados.`)
      loadPromoLogs()
    } catch (error) {
      console.error("Reset failed:", error)
      toast.error("Ups! Problema ao limpar histórico")
    } finally {
      setResetting(false)
    }
  }

  return (
    <AdminLayout title="Newsletter" subtitle="Gerir subscritores e enviar promoções">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg border p-4 flex items-center gap-3">
            <Users className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Subscritores</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{subscribers.length}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ativos</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{activeSubscribers}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border p-4 flex items-center gap-3">
            <Megaphone className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Promoções Enviadas</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{promoLogs.length}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border p-4 flex items-center justify-center">
            <button
              onClick={handleReset}
              disabled={resetting || promoLogs.length === 0}
              className="text-xs text-red-500 hover:text-red-600 disabled:text-gray-300 disabled:cursor-not-allowed font-medium flex items-center gap-1.5 transition-colors"
            >
              {resetting ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> A limpar...</>
              ) : (
                <><Trash2 className="h-3.5 w-3.5" /> Limpar Histórico</>
              )}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("compose")}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "compose"
                  ? "border-k2k-blue text-k2k-blue bg-blue-50/50"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <Send className="h-4 w-4 inline-block mr-1.5 -mt-0.5" />
              Enviar Promoção
            </button>
            <button
              onClick={() => setActiveTab("subscribers")}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "subscribers"
                  ? "border-k2k-blue text-k2k-blue bg-blue-50/50"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <Users className="h-4 w-4 inline-block mr-1.5 -mt-0.5" />
              Subscritores ({subscribers.length})
            </button>
            <button
              onClick={() => setActiveTab("inapp")}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "inapp"
                  ? "border-k2k-blue text-k2k-blue bg-blue-50/50"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <Megaphone className="h-4 w-4 inline-block mr-1.5 -mt-0.5" />
              In-App
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "history"
                  ? "border-k2k-blue text-k2k-blue bg-blue-50/50"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <Clock className="h-4 w-4 inline-block mr-1.5 -mt-0.5" />
              Histórico ({promoLogs.length})
            </button>
          </div>

          <div className="p-6">
            {activeTab === "inapp" && (
                <AdminNewsletterSender />
            )}

            {/* ===================== COMPOSE TAB ===================== */}
            {activeTab === "compose" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Enviar Email Promocional
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Compõe um email e envia para todos os {activeSubscribers} subscritores ativos
                  </p>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="subject">Assunto do Email *</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ex: Promoções de até 60% — Só esta semana!"
                    disabled={sending}
                  />
                </div>

                {/* Headline */}
                <div className="space-y-2">
                  <Label htmlFor="headline">Título Principal *</Label>
                  <Input
                    id="headline"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="Ex: Super Promoções de Inverno!"
                    disabled={sending}
                  />
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem *</Label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ex: Olá! Temos novidades incríveis para ti. Aproveita os nossos descontos especiais em roupa infantil de qualidade..."
                    className="w-full min-h-30 rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-k2k-blue/50 resize-y"
                    disabled={sending}
                  />
                </div>

                {/* CTA */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ctaText">Texto do Botão</Label>
                    <Input
                      id="ctaText"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      placeholder="Ver Promoções"
                      disabled={sending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ctaUrl">Link do Botão</Label>
                    <Input
                      id="ctaUrl"
                      value={ctaUrl}
                      onChange={(e) => setCtaUrl(e.target.value)}
                      placeholder="https://kidtokid.pt"
                      disabled={sending}
                    />
                  </div>
                </div>

                <Separator />

                {/* Products Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        <ShoppingBag className="h-4 w-4 inline-block mr-1 -mt-0.5" />
                        Produtos em Destaque (opcional)
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Seleciona produtos com desconto para incluir no email
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="minDiscount" className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        Desconto mín:
                      </Label>
                      <Input
                        id="minDiscount"
                        type="number"
                        min={10}
                        max={90}
                        value={minDiscount}
                        onChange={(e) => setMinDiscount(Number(e.target.value))}
                        className="w-16 h-8 text-xs"
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400">%</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={loadDiscountProducts}
                        disabled={loadingProducts}
                        className="h-8"
                      >
                        {loadingProducts ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Search className="h-3 w-3" />
                        )}
                        <span className="ml-1">Procurar</span>
                      </Button>
                    </div>
                  </div>

                  {discountProducts.length > 0 ? (
                    <div className="max-h-60 overflow-y-auto border rounded-lg divide-y">
                      {discountProducts.map((p) => (
                        <label
                          key={p.id}
                          className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                        >
                          <Checkbox
                            checked={p.selected}
                            onCheckedChange={() => toggleProduct(p.id)}
                          />
                          {(p.images && p.images[0]) && (
                            <img
                              src={p.images[0]}
                              alt={p.title}
                              className="w-10 h-10 rounded object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{p.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              <span className="line-through">{p.originalPrice.toFixed(2)}€</span>
                              <span className="ml-1 text-red-600 font-semibold">{p.price.toFixed(2)}€</span>
                            </p>
                          </div>
                          <Badge variant="destructive" className="text-xs shrink-0">
                            -{p.discount}%
                          </Badge>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-sm text-gray-400 dark:text-gray-500 border rounded-lg">
                      {loadingProducts ? (
                        <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                      ) : (
                        <>Clica em &quot;Procurar&quot; para carregar produtos com desconto</>
                      )}
                    </div>
                  )}

                  {discountProducts.filter((p) => p.selected).length > 0 && (
                    <p className="text-xs text-green-600 mt-2">
                      {discountProducts.filter((p) => p.selected).length} produto(s) selecionado(s) para incluir no email
                    </p>
                  )}
                </div>

                <Separator />

                {/* Send Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={handleSendPromo}
                    disabled={sending || !subject.trim() || !headline.trim() || !message.trim()}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        A enviar...
                      </>
                    ) : (
                      <>
                        <Megaphone className="h-4 w-4 mr-2" />
                        Enviar para {activeSubscribers} Subscritores
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* ===================== SUBSCRIBERS TAB ===================== */}
            {activeTab === "subscribers" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Pesquisar por email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={loadSubscribers} disabled={loadingSubscribers}>
                    <RefreshCw className={`h-4 w-4 mr-1 ${loadingSubscribers ? "animate-spin" : ""}`} />
                    Atualizar
                  </Button>
                </div>

                {loadingSubscribers ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : filteredSubscribers.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Mail className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Nenhum subscritor encontrado</p>
                  </div>
                ) : (
                  <div className="border rounded-lg divide-y max-h-125 overflow-y-auto">
                    {filteredSubscribers.map((sub) => (
                      <div key={sub.email} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                            <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{sub.email}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              {sub.subscribedAt
                                ? `Subscrito em ${sub.subscribedAt.toLocaleDateString("pt-PT")}`
                                : "Data desconhecida"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={sub.active ? "default" : "secondary"}
                            className={`text-xs ${sub.active ? "bg-green-100 dark:bg-green-900/30 text-green-700" : ""}`}
                          >
                            {sub.active ? "Ativo" : "Inativo"}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSubscriber(sub.email)}
                            className="text-gray-400 dark:text-gray-500 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ===================== HISTORY TAB ===================== */}
            {activeTab === "history" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Últimas promoções enviadas</p>
                  <Button variant="outline" size="sm" onClick={loadPromoLogs} disabled={loadingLogs}>
                    <RefreshCw className={`h-4 w-4 mr-1 ${loadingLogs ? "animate-spin" : ""}`} />
                    Atualizar
                  </Button>
                </div>

                {loadingLogs ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : promoLogs.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Megaphone className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Nenhuma promoção enviada ainda</p>
                  </div>
                ) : (
                  <div className="border rounded-lg divide-y">
                    {promoLogs.map((log) => (
                      <div key={log.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{log.subject}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{log.headline}</p>
                          </div>
                          <div className="text-right shrink-0 ml-4">
                            <div className="flex items-center gap-1 text-xs">
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                              <span className="text-green-600 font-medium">{log.sent}</span>
                              {log.failed > 0 && (
                                <>
                                  <span className="text-gray-300 mx-1">|</span>
                                  <AlertCircle className="h-3 w-3 text-red-400" />
                                  <span className="text-red-500">{log.failed}</span>
                                </>
                              )}
                              <span className="text-gray-400 dark:text-gray-500">/ {log.total}</span>
                            </div>
                            {log.productsCount > 0 && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                {log.productsCount} produto(s)
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {log.sentAt ? log.sentAt.toLocaleString("pt-PT") : "—"}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">por {log.sentByEmail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
