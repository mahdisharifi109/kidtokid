import { useEffect, useState, useMemo, useCallback } from "react"
import { AdminLayout } from "@/src/components/admin/AdminLayout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Search,
    Eye,
    Truck,
    Package,
    CheckCircle2,
    XCircle,
    Clock,
    CreditCard,
    RefreshCw,
    Loader2
} from "lucide-react"
import { 
    collection, 
    query, 
    orderBy, 
    limit, 
    getDocs,
    doc,
    updateDoc,
    where,
    Timestamp,
    startAfter,
    DocumentSnapshot
} from "firebase/firestore"
import { db } from "@/src/lib/firebase"
import { toast } from "sonner"
import type { Order, OrderStatus } from "@/src/services/orderService"
import { getOrderStatusText } from "@/src/services/orderService"

const statusConfig: Record<OrderStatus, { 
    label: string
    color: string
    bgColor: string
    icon: React.ReactNode 
}> = {
    pending: { 
        label: "Pendente", 
        color: "text-yellow-700", 
        bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
        icon: <Clock className="h-3.5 w-3.5" />
    },
    paid: { 
        label: "Pago", 
        color: "text-blue-700", 
        bgColor: "bg-blue-100 dark:bg-blue-900/30",
        icon: <CheckCircle2 className="h-3.5 w-3.5" />
    },
    processing: { 
        label: "Em Preparação", 
        color: "text-purple-700", 
        bgColor: "bg-purple-100",
        icon: <Package className="h-3.5 w-3.5" />
    },
    ready_pickup: { 
        label: "Pronto p/ Levantamento", 
        color: "text-orange-700", 
        bgColor: "bg-orange-100",
        icon: <Package className="h-3.5 w-3.5" />
    },
    shipped: { 
        label: "Enviada", 
        color: "text-indigo-700", 
        bgColor: "bg-indigo-100",
        icon: <Truck className="h-3.5 w-3.5" />
    },
    delivered: { 
        label: "Entregue", 
        color: "text-green-700", 
        bgColor: "bg-green-100 dark:bg-green-900/30",
        icon: <CheckCircle2 className="h-3.5 w-3.5" />
    },
    cancelled: { 
        label: "Cancelada", 
        color: "text-red-700", 
        bgColor: "bg-red-100 dark:bg-red-900/30",
        icon: <XCircle className="h-3.5 w-3.5" />
    },
    refunded: { 
        label: "Reembolsada", 
        color: "text-gray-700 dark:text-gray-300", 
        bgColor: "bg-gray-100 dark:bg-gray-800",
        icon: <CreditCard className="h-3.5 w-3.5" />
    }
}

const statusOptions: OrderStatus[] = [
    "pending",
    "paid", 
    "processing",
    "ready_pickup",
    "shipped",
    "delivered",
    "cancelled",
    "refunded"
]

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null)
    const [hasMore, setHasMore] = useState(true)
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

    const ORDERS_PER_PAGE = 20

    // Valid status transitions — prevents illogical jumps
    const validTransitions = useMemo<Record<OrderStatus, OrderStatus[]>>(() => ({
        pending: ["paid", "processing", "cancelled"],
        paid: ["processing", "cancelled", "refunded"],
        processing: ["ready_pickup", "shipped", "cancelled"],
        ready_pickup: ["delivered", "cancelled"],
        shipped: ["delivered", "cancelled"],
        delivered: ["refunded"],
        cancelled: ["pending"],  // Allow reopening
        refunded: [],            // Terminal state
    }), [])

    const getAvailableStatuses = useCallback((currentStatus: OrderStatus): OrderStatus[] => {
        const allowed = validTransitions[currentStatus] || []
        return [currentStatus, ...allowed]
    }, [validTransitions])

    const loadOrders = useCallback(async (loadMore = false, afterDoc: DocumentSnapshot | null = null) => {
        if (!loadMore) {
            setLoading(true)
            setLastDoc(null)
        }

        try {
            let q = query(
                collection(db, "orders"),
                orderBy("createdAt", "desc"),
                limit(ORDERS_PER_PAGE)
            )

            if (statusFilter !== "all") {
                q = query(
                    collection(db, "orders"),
                    where("status", "==", statusFilter),
                    orderBy("createdAt", "desc"),
                    limit(ORDERS_PER_PAGE)
                )
            }

            if (loadMore && afterDoc) {
                if (statusFilter !== "all") {
                    q = query(
                        collection(db, "orders"),
                        where("status", "==", statusFilter),
                        orderBy("createdAt", "desc"),
                        startAfter(afterDoc),
                        limit(ORDERS_PER_PAGE)
                    )
                } else {
                    q = query(
                        collection(db, "orders"),
                        orderBy("createdAt", "desc"),
                        startAfter(afterDoc),
                        limit(ORDERS_PER_PAGE)
                    )
                }
            }

            const snapshot = await getDocs(q)
            const ordersData = snapshot.docs.map(d => {
                const data = d.data()
                return {
                    id: d.id,
                    orderNumber: data.orderNumber || '',
                    userId: data.userId || '',
                    userEmail: data.userEmail || '',
                    items: data.items || [],
                    subtotal: data.subtotal || 0,
                    shippingCost: data.shippingCost || 0,
                    discount: data.discount || 0,
                    total: data.total || 0,
                    couponCode: data.couponCode,
                    shippingMethod: data.shippingMethod || 'delivery',
                    shippingAddress: data.shippingAddress || {},
                    paymentMethod: data.paymentMethod || 'card',
                    paymentStatus: data.paymentStatus || 'pending',
                    paymentReference: data.paymentReference,
                    status: data.status || 'pending',
                    createdAt: data.createdAt?.toDate?.() || (data.createdAt ? new Date(data.createdAt) : new Date()),
                    updatedAt: data.updatedAt?.toDate?.() || new Date(),
                    paidAt: data.paidAt?.toDate?.(),
                    shippedAt: data.shippedAt?.toDate?.(),
                    deliveredAt: data.deliveredAt?.toDate?.(),
                    customerNotes: data.customerNotes,
                    internalNotes: data.internalNotes,
                    trackingNumber: data.trackingNumber,
                    trackingUrl: data.trackingUrl,
                } as Order
            })

            if (loadMore) {
                setOrders(prev => [...prev, ...ordersData])
            } else {
                setOrders(ordersData)
            }

            setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null)
            setHasMore(snapshot.docs.length === ORDERS_PER_PAGE)
        } catch (error: unknown) {
            console.error("Ups! Problema ao carregar encomendas:", error)
            const errorCode = (error as { code?: string })?.code || ""
            if (errorCode === "permission-denied" || errorCode === "PERMISSION_DENIED") {
                toast.error("Sem permissão para ver encomendas. Faz logout e login novamente.")
            } else if (errorCode === "failed-precondition") {
                toast.error("Índice do Firestore em falta. Verifica a consola Firebase.")
            } else {
                toast.error("Ups! Problema ao carregar encomendas. Tenta novamente.")
            }
        } finally {
            setLoading(false)
        }
    }, [statusFilter])

    useEffect(() => {
        loadOrders()
    }, [loadOrders])

    const updateOrderStatus = useCallback(async (orderId: string, newStatus: OrderStatus) => {
        setUpdatingOrderId(orderId)
        try {
            await updateDoc(doc(db, "orders", orderId), {
                status: newStatus,
                updatedAt: Timestamp.now()
            })
            
            setOrders(prev => prev.map(order => 
                order.id === orderId 
                    ? { ...order, status: newStatus }
                    : order
            ))
            
            toast.success(`Estado atualizado para "${getOrderStatusText(newStatus)}"`)
        } catch (error) {
            console.error("Ups! Problema ao atualizar estado:", error)
            toast.error("Ups! Problema ao atualizar estado")
        } finally {
            setUpdatingOrderId(null)
        }
    }, [])

    const filteredOrders = useMemo(() => orders.filter(order => {
        if (!searchQuery) return true
        const search = searchQuery.toLowerCase()
        return (
            order.orderNumber?.toLowerCase().includes(search) ||
            order.shippingAddress?.name?.toLowerCase().includes(search) ||
            order.shippingAddress?.email?.toLowerCase().includes(search)
        )
    }), [orders, searchQuery])

    const formatDate = useCallback((timestamp: Date | { toDate: () => Date } | number | string | null | undefined) => {
        if (!timestamp) return "-"
        let date: Date
        if (timestamp instanceof Date) {
            date = timestamp
        } else if (typeof timestamp === 'object' && 'toDate' in timestamp) {
            date = timestamp.toDate()
        } else if (typeof timestamp === 'number') {
            date = new Date(timestamp)
        } else {
            date = new Date(timestamp)
        }
        if (isNaN(date.getTime())) return "-"
        return date.toLocaleDateString("pt-PT", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })
    }, [])

    const formatPrice = useCallback((price: number) => {
        return new Intl.NumberFormat("pt-PT", {
            style: "currency",
            currency: "EUR"
        }).format(price)
    }, [])

    return (
        <AdminLayout 
            title="Encomendas" 
            subtitle={`${orders.length} encomendas encontradas`}
        >
            {/* Filters */}
            <Card className="p-5 mb-6 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                            placeholder="Pesquisar por nº encomenda, nome ou email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 rounded-lg border-gray-200 dark:border-gray-700"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 text-sm min-w-45 bg-white dark:bg-gray-900 focus:border-blue-300"
                    >
                        <option value="all">Todos os estados</option>
                        {statusOptions.map(status => (
                            <option key={status} value={status}>
                                {statusConfig[status].label}
                            </option>
                        ))}
                    </select>
                    <Button 
                        variant="outline" 
                        onClick={() => loadOrders()}
                        disabled={loading}
                        className="rounded-lg border-gray-200 dark:border-gray-700"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Atualizar
                    </Button>
                </div>
            </Card>

            {/* Orders Table */}
            <Card className="overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-800">
                            <tr>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Encomenda</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cliente</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-14 text-center">
                                        <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                                            <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">A carregar encomendas...</p>
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-14 text-center">
                                        <div className="w-14 h-14 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                                            <Package className="h-6 w-6 text-gray-300" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Nenhuma encomenda encontrada</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Tenta ajustar os filtros</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="py-3 px-4">
                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                                #{order.orderNumber}
                                            </span>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {order.items?.length || 0} {order.items?.length === 1 ? 'artigo' : 'artigos'}
                                            </p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-sm text-gray-900 dark:text-gray-100">{order.shippingAddress?.name || "-"}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{order.shippingAddress?.email || "-"}</p>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                                            {formatDate(order.createdAt)}
                                        </td>
                                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                                            {formatPrice(order.total || 0)}
                                        </td>
                                        <td className="py-3 px-4">
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateOrderStatus(order.id!, e.target.value as OrderStatus)}
                                                disabled={updatingOrderId === order.id}
                                                className={`
                                                    text-xs font-medium px-2 py-1 rounded-full border-0
                                                    ${statusConfig[order.status]?.bgColor || 'bg-gray-100 dark:bg-gray-800'}
                                                    ${statusConfig[order.status]?.color || 'text-gray-700 dark:text-gray-300'}
                                                `}
                                            >
                                                {getAvailableStatuses(order.status).map(status => (
                                                    <option key={status} value={status}>
                                                        {statusConfig[status].label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setSelectedOrder(order)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {hasMore && orders.length > 0 && (
                    <div className="p-4 border-t border-gray-50 text-center">
                        <Button
                            variant="outline"
                            onClick={() => loadOrders(true, lastDoc)}
                            disabled={loading}
                            className="rounded-lg border-gray-200 dark:border-gray-700 hover:bg-blue-50"
                        >
                            Carregar mais encomendas
                        </Button>
                    </div>
                )}
            </Card>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div 
                    className="fixed inset-0 bg-black/30  z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedOrder(null)}
                >
                    <Card 
                        className="w-full max-w-2xl max-h-[80vh] overflow-y-auto border-0 shadow-lg rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                        Encomenda #{selectedOrder.orderNumber}
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {formatDate(selectedOrder.createdAt)}
                                    </p>
                                </div>
                                <Badge className={`${statusConfig[selectedOrder.status]?.bgColor} ${statusConfig[selectedOrder.status]?.color}`}>
                                    {statusConfig[selectedOrder.status]?.label}
                                </Badge>
                            </div>

                            {/* Customer Info */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Cliente</h3>
                                <div className="bg-gray-50/80 dark:bg-gray-800/80 rounded-lg p-4 text-sm border border-gray-100 dark:border-gray-800">
                                    <p className="font-medium">{selectedOrder.shippingAddress?.name}</p>
                                    <p className="text-gray-600 dark:text-gray-400">{selectedOrder.shippingAddress?.email}</p>
                                    <p className="text-gray-600 dark:text-gray-400">{selectedOrder.shippingAddress?.phone}</p>
                                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                                        {selectedOrder.shippingAddress?.street}<br />
                                        {selectedOrder.shippingAddress?.postalCode} {selectedOrder.shippingAddress?.city}
                                    </p>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Artigos</h3>
                                <div className="space-y-3">
                                    {selectedOrder.items?.map((item, index) => (
                                        <div key={index} className="flex items-center gap-3 bg-gray-50/70 dark:bg-gray-800/70 rounded-lg p-3 border border-gray-100 dark:border-gray-800">
                                            <img 
                                                src={item.image || "/placeholder.svg"} 
                                                alt={item.title}
                                                className="w-14 h-14 object-cover rounded-lg"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 dark:text-gray-100">{item.title}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {item.size && `Tam: ${item.size}`} • Qtd: {item.quantity}
                                                </p>
                                            </div>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                {formatPrice(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Totals */}
                            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                                    <span>{formatPrice(selectedOrder.subtotal || 0)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Envio</span>
                                    <span>{formatPrice(selectedOrder.shippingCost || 0)}</span>
                                </div>
                                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-100 dark:border-gray-800">
                                    <span>Total</span>
                                    <span className="text-k2k-blue">{formatPrice(selectedOrder.total || 0)}</span>
                                </div>
                            </div>

                            {/* Notes */}
                            {selectedOrder.customerNotes && (
                                <div className="mt-4 bg-amber-50/70 rounded-lg p-4 border border-amber-100">
                                    <h4 className="font-medium text-amber-800 mb-1">Notas do cliente</h4>
                                    <p className="text-sm text-yellow-700">{selectedOrder.customerNotes}</p>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-6">
                                <Button variant="outline" onClick={() => setSelectedOrder(null)} className="rounded-lg">
                                    Fechar
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </AdminLayout>
    )
}
