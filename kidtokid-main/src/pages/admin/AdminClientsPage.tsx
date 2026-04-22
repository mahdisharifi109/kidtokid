import { useEffect, useState, useMemo, useCallback } from "react"
import { AdminLayout } from "@/src/components/admin/AdminLayout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Search,
    Users,
    Mail,
    Phone,
    Calendar,
    ShoppingBag,
    RefreshCw,
    Loader2,
    UserCheck,
    Eye
} from "lucide-react"
import {
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    startAfter,
    DocumentSnapshot,
    where,
    getCountFromServer
} from "firebase/firestore"
import { db } from "@/src/lib/firebase"
import { toast } from "sonner"

interface Client {
    id: string
    email: string
    firstName: string
    lastName: string
    displayName: string
    phone: string | null
    role?: string
    newsletter: boolean
    createdAt: Date
    orderCount?: number
}

interface ClientOrder {
    id: string
    orderNumber: string
    total: number
    status: string
    createdAt: Date
    itemCount: number
}

export default function AdminClientsPage() {
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null)
    const [hasMore, setHasMore] = useState(true)
    const [totalClients, setTotalClients] = useState(0)
    const [selectedClient, setSelectedClient] = useState<Client | null>(null)
    const [clientOrders, setClientOrders] = useState<ClientOrder[]>([])
    const [loadingOrders, setLoadingOrders] = useState(false)

    const CLIENTS_PER_PAGE = 20

    const loadTotalCount = useCallback(async () => {
        try {
            const snapshot = await getCountFromServer(collection(db, "users"))
            setTotalClients(snapshot.data().count)
        } catch (error) {
            console.error("Ups! Problema ao contar clientes:", error)
        }
    }, [])

    const loadClients = useCallback(async (loadMore = false, afterDoc: DocumentSnapshot | null = null) => {
        if (!loadMore) {
            setLoading(true)
            setLastDoc(null)
        }

        try {
            let q = query(
                collection(db, "users"),
                orderBy("createdAt", "desc"),
                limit(CLIENTS_PER_PAGE)
            )

            if (loadMore && afterDoc) {
                q = query(
                    collection(db, "users"),
                    orderBy("createdAt", "desc"),
                    startAfter(afterDoc),
                    limit(CLIENTS_PER_PAGE)
                )
            }

            const snapshot = await getDocs(q)
            const clientsData = snapshot.docs.map(d => {
                const data = d.data()
                return {
                    id: d.id,
                    email: data.email || "",
                    firstName: data.firstName || "",
                    lastName: data.lastName || "",
                    displayName: data.displayName || `${data.firstName || ""} ${data.lastName || ""}`.trim() || "Sem nome",
                    phone: data.phone || null,
                    role: data.role,
                    newsletter: data.newsletter || false,
                    createdAt: data.createdAt?.toDate?.() || (data.createdAt ? new Date(data.createdAt) : new Date()),
                } as Client
            })

            if (loadMore) {
                setClients(prev => [...prev, ...clientsData])
            } else {
                setClients(clientsData)
            }

            setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null)
            setHasMore(snapshot.docs.length === CLIENTS_PER_PAGE)
        } catch (error) {
            console.error("Ups! Problema ao carregar clientes:", error)
            toast.error("Ups! Problema ao carregar clientes")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        // Carregar clientes e contagem em paralelo
        Promise.all([loadClients(), loadTotalCount()])
    }, [loadClients, loadTotalCount])

    const loadClientOrders = async (client: Client) => {
        setSelectedClient(client)
        setLoadingOrders(true)
        try {
            const q = query(
                collection(db, "orders"),
                where("userId", "==", client.id),
                orderBy("createdAt", "desc"),
                limit(10)
            )
            const snapshot = await getDocs(q)
            const orders = snapshot.docs.map(d => {
                const data = d.data()
                return {
                    id: d.id,
                    orderNumber: data.orderNumber || "",
                    total: data.total || 0,
                    status: data.status || "pending",
                    createdAt: data.createdAt?.toDate?.() || new Date(),
                    itemCount: data.items?.length || 0,
                }
            })
            setClientOrders(orders)
        } catch (error) {
            console.error("Ups! Problema ao carregar encomendas do cliente:", error)
            setClientOrders([])
        } finally {
            setLoadingOrders(false)
        }
    }

    const filteredClients = useMemo(() => clients.filter(client => {
        if (!searchQuery) return true
        const search = searchQuery.toLowerCase()
        return (
            client.email?.toLowerCase().includes(search) ||
            client.firstName?.toLowerCase().includes(search) ||
            client.lastName?.toLowerCase().includes(search) ||
            client.displayName?.toLowerCase().includes(search) ||
            client.phone?.toLowerCase().includes(search)
        )
    }), [clients, searchQuery])

    const formatDate = useCallback((timestamp: Date | { toDate: () => Date } | number | string | null | undefined) => {
        if (!timestamp) return "-"
        let date: Date
        if (timestamp instanceof Date) {
            date = timestamp
        } else if (typeof timestamp === 'object' && 'toDate' in timestamp) {
            date = timestamp.toDate()
        } else if (typeof timestamp === "number") {
            date = new Date(timestamp)
        } else {
            date = new Date(timestamp)
        }
        if (isNaN(date.getTime())) return "-"
        return date.toLocaleDateString("pt-PT", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        })
    }, [])

    const formatPrice = useCallback((price: number) => {
        return new Intl.NumberFormat("pt-PT", {
            style: "currency",
            currency: "EUR"
        }).format(price)
    }, [])

    const getStatusLabel = useCallback((status: string) => {
        const labels: Record<string, { label: string; color: string }> = {
            pending: { label: "Pendente", color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700" },
            paid: { label: "Pago", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700" },
            processing: { label: "Em Preparação", color: "bg-purple-100 text-purple-700" },
            shipped: { label: "Enviada", color: "bg-indigo-100 text-indigo-700" },
            delivered: { label: "Entregue", color: "bg-green-100 dark:bg-green-900/30 text-green-700" },
            cancelled: { label: "Cancelada", color: "bg-red-100 dark:bg-red-900/30 text-red-700" },
        }
        const config = labels[status] || { label: status, color: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300" }
        return (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.color}`}>
                {config.label}
            </span>
        )
    }, [])

    return (
        <AdminLayout
            title="Clientes"
            subtitle={`${totalClients} clientes registados`}
        >
            {/* Filters */}
            <Card className="p-5 mb-6 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                            placeholder="Pesquisar por nome, email ou telefone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 rounded-lg border-gray-200 dark:border-gray-700"
                        />
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => loadClients()}
                        disabled={loading}
                        className="rounded-lg border-gray-200 dark:border-gray-700"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                        Atualizar
                    </Button>
                </div>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <Card className="p-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total de Clientes</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalClients}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <Mail className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Subscritores Newsletter</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {clients.filter(c => c.newsletter).length}
                            </p>
                        </div>
                    </div>
                </Card>
                <Card className="p-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
                            <UserCheck className="h-5 w-5 text-violet-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Administradores</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {clients.filter(c => c.role === "admin").length}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Clients Table */}
            <Card className="overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-800">
                            <tr>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cliente</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Telefone</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data de Registo</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo</th>
                                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading && clients.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-14 text-center">
                                        <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                                            <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">A carregar clientes...</p>
                                    </td>
                                </tr>
                            ) : filteredClients.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-14 text-center">
                                        <div className="w-14 h-14 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                                            <Users className="h-6 w-6 text-gray-300" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Nenhum cliente encontrado</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredClients.map(client => (
                                    <tr key={client.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-sm font-medium text-blue-700">
                                                    {client.firstName?.charAt(0)?.toUpperCase() || client.email?.charAt(0)?.toUpperCase() || "?"}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                                        {client.displayName}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{client.email}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{client.phone || "-"}</p>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                                                {formatDate(client.createdAt)}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            {client.role === "admin" ? (
                                                <Badge className="bg-purple-100 text-purple-700 text-xs">Admin</Badge>
                                            ) : client.newsletter ? (
                                                <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 text-xs">Newsletter</Badge>
                                            ) : (
                                                <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs">Cliente</Badge>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => loadClientOrders(client)}
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
                {hasMore && clients.length > 0 && (
                    <div className="p-4 border-t border-gray-100 dark:border-gray-800 text-center">
                        <Button
                            variant="outline"
                            onClick={() => loadClients(true, lastDoc)}
                            disabled={loading}
                        >
                            Carregar mais clientes
                        </Button>
                    </div>
                )}
            </Card>

            {/* Client Detail Modal */}
            {selectedClient && (
                <div
                    className="fixed inset-0 bg-black/30  z-50 flex items-center justify-center p-4"
                    onClick={() => { setSelectedClient(null); setClientOrders([]) }}
                >
                    <Card
                        className="w-full max-w-lg max-h-[80vh] overflow-y-auto border-0 shadow-lg rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xl font-semibold text-blue-700">
                                    {selectedClient.firstName?.charAt(0)?.toUpperCase() || selectedClient.email?.charAt(0)?.toUpperCase() || "?"}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                        {selectedClient.displayName}
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedClient.email}</p>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                    <span className="text-gray-700 dark:text-gray-300">{selectedClient.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                    <span className="text-gray-700 dark:text-gray-300">{selectedClient.phone || "Não indicado"}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                    <span className="text-gray-700 dark:text-gray-300">Registado em {formatDate(selectedClient.createdAt)}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                    <span className="text-gray-700 dark:text-gray-300">
                                        Newsletter: {selectedClient.newsletter ? "Sim" : "Não"}
                                    </span>
                                </div>
                            </div>

                            {/* Orders */}
                            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                    <ShoppingBag className="h-4 w-4" />
                                    Encomendas ({clientOrders.length})
                                </h3>

                                {loadingOrders ? (
                                    <div className="text-center py-6">
                                        <Loader2 className="h-5 w-5 animate-spin mx-auto text-gray-400 dark:text-gray-500" />
                                    </div>
                                ) : clientOrders.length === 0 ? (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
                                        Este cliente ainda não fez encomendas
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {clientOrders.map(order => (
                                            <div
                                                key={order.id}
                                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                            >
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        #{order.orderNumber}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {formatDate(order.createdAt)} • {order.itemCount} artigo{order.itemCount !== 1 ? "s" : ""}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    {getStatusLabel(order.status)}
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1">
                                                        {formatPrice(order.total)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end mt-6">
                                <Button variant="outline" onClick={() => { setSelectedClient(null); setClientOrders([]) }} className="rounded-lg">
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
