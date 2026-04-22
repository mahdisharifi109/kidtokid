import { useEffect, useState, useMemo, useCallback } from "react"
import { Link } from "react-router-dom"
import { AdminLayout } from "@/src/components/admin/AdminLayout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
    Package, 
    ShoppingCart, 
    Euro,
    ArrowRight,
    Clock,
    CheckCircle2,
    Truck,
    AlertCircle,
    RefreshCw,
    TrendingUp,
    ExternalLink
} from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { collection, getDocs, query, orderBy, limit, getCountFromServer } from "firebase/firestore"
import { db } from "@/src/lib/firebase"
import type { Order } from "@/src/services/orderService"

interface DashboardStats {
    totalProducts: number
    totalOrders: number
    pendingOrders: number
    totalRevenue: number
    todayOrders: number
    recentOrders: Order[]
    allOrders: Order[]
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats>({
        totalProducts: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0,
        todayOrders: 0,
        recentOrders: [],
        allOrders: []
    })
    const [loading, setLoading] = useState(true)

    const loadDashboardStats = useCallback(async () => {
        setLoading(true)
        try {
            // Executar todas as queries em paralelo para máxima velocidade
            const [productsCountSnapshot, ordersCountSnapshot, ordersSnapshot] = await Promise.all([
                getCountFromServer(collection(db, "products")),
                getCountFromServer(collection(db, "orders")),
                getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(100)))
            ])

            const totalProducts = productsCountSnapshot.data().count
            const totalOrdersCount = ordersCountSnapshot.data().count
            
            const orders = ordersSnapshot.docs.map(d => {
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
                    shippingMethod: data.shippingMethod || 'delivery',
                    shippingAddress: data.shippingAddress || {},
                    paymentMethod: data.paymentMethod || 'card',
                    paymentStatus: data.paymentStatus || 'pending',
                    status: data.status || 'pending',
                    createdAt: data.createdAt?.toDate?.() || new Date(),
                    updatedAt: data.updatedAt?.toDate?.() || new Date(),
                    customerNotes: data.customerNotes,
                } as Order
            })

            const totalOrders = totalOrdersCount
            const pendingOrders = orders.filter(o => 
                o.status === "pending" || o.status === "paid" || o.status === "processing"
            ).length

            const totalRevenue = orders
                .filter(o => o.status !== "cancelled")
                .reduce((sum, o) => sum + (o.total || 0), 0)

            // Encomendas de hoje
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const todayOrders = orders.filter(o => 
                o.createdAt >= today
            ).length

            // Últimas 5 encomendas
            const recentOrders = orders.slice(0, 5)

            setStats({
                totalProducts,
                totalOrders,
                pendingOrders,
                totalRevenue,
                todayOrders,
                recentOrders,
                allOrders: orders
            })
        } catch (error) {
            console.error("Ups! Problema ao carregar estatísticas:", error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadDashboardStats()
    }, [loadDashboardStats])

    const getStatusBadge = useCallback((status: string) => {
        const statusConfig: Record<string, { color: string; icon: React.ComponentType<{ className?: string }>; label: string }> = {
            pending: { color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700", icon: Clock, label: "Pendente" },
            paid: { color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700", icon: CheckCircle2, label: "Pago" },
            processing: { color: "bg-purple-100 dark:bg-purple-900/30 text-purple-700", icon: Package, label: "Em Preparação" },
            ready_pickup: { color: "bg-orange-100 dark:bg-orange-900/30 text-orange-700", icon: Package, label: "Pronto Levantamento" },
            shipped: { color: "bg-indigo-100 text-indigo-700", icon: Truck, label: "Enviada" },
            delivered: { color: "bg-green-100 dark:bg-green-900/30 text-green-700", icon: CheckCircle2, label: "Entregue" },
            cancelled: { color: "bg-red-100 dark:bg-red-900/30 text-red-700", icon: AlertCircle, label: "Cancelada" },
            refunded: { color: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300", icon: AlertCircle, label: "Reembolsada" }
        }
        const config = statusConfig[status] || statusConfig.pending
        const Icon = config.icon
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                <Icon className="h-3 w-3" />
                {config.label}
            </span>
        )
    }, [])

    const statCards = useMemo(() => [
        {
            title: "Produtos",
            value: stats.totalProducts,
            icon: Package,
            href: "/admin/produtos",
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            title: "Encomendas",
            value: stats.totalOrders,
            icon: ShoppingCart,
            href: "/admin/encomendas",
            color: "text-violet-600",
            bg: "bg-violet-50",
        },
        {
            title: "Pendentes",
            value: stats.pendingOrders,
            icon: Clock,
            href: "/admin/encomendas?status=pending",
            color: "text-amber-600",
            bg: "bg-amber-50",
        },
        {
            title: "Faturado",
            value: `€${stats.totalRevenue.toFixed(2)}`,
            icon: Euro,
            href: "/admin/encomendas",
            color: "text-emerald-600",
            bg: "bg-emerald-50",
        }
    ], [stats.totalProducts, stats.totalOrders, stats.pendingOrders, stats.totalRevenue])
    const revenueChartData = useMemo(() => {
        const days = 30
        const now = new Date()
        const dailyMap = new Map<string, number>()

        // Initialize all days with 0
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(now)
            d.setDate(d.getDate() - i)
            const key = d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" })
            dailyMap.set(key, 0)
        }

        // Aggregate revenue from all loaded orders
        const cutoff = new Date(now)
        cutoff.setDate(cutoff.getDate() - days)

        stats.allOrders.forEach(order => {
            if (order.status === "cancelled" || order.status === "refunded") return
            const orderDate = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt)
            if (orderDate < cutoff) return
            const key = orderDate.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" })
            if (dailyMap.has(key)) {
                dailyMap.set(key, (dailyMap.get(key) || 0) + (order.total || 0))
            }
        })

        return Array.from(dailyMap.entries()).map(([date, receita]) => ({
            date,
            receita: Math.round(receita * 100) / 100,
        }))
    }, [stats.allOrders])

    return (
        <AdminLayout 
            title="Painel de Controlo" 
            subtitle={`${stats.pendingOrders} encomenda${stats.pendingOrders !== 1 ? 's' : ''} pendente${stats.pendingOrders !== 1 ? 's' : ''}`}
        >
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {statCards.map((stat, index) => (
                    <Link to={stat.href} key={index}>
                        <Card className="p-4 hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                                    <stat.icon className={`h-4.5 w-4.5 ${stat.color}`} />
                                </div>
                            </div>
                            {loading ? (
                                <div className="h-8 w-20 bg-gray-100 dark:bg-gray-800 animate-pulse rounded" />
                            ) : (
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.title}</p>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Revenue Chart */}
            <Card className="p-5 mb-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="font-semibold text-gray-900 dark:text-gray-100">Receita — 30 dias</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Evolução das vendas</p>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md flex items-center gap-1">
                        <TrendingUp className="h-3.5 w-3.5" />
                        €{stats.totalRevenue.toFixed(2)}
                    </span>
                </div>
                {loading ? (
                    <div className="h-56 bg-gray-50 dark:bg-gray-800 animate-pulse rounded-lg" />
                ) : (
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueChartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis 
                                    dataKey="date" 
                                    tick={{ fontSize: 11, fill: "#999" }}
                                    tickLine={false}
                                    axisLine={{ stroke: "#eee" }}
                                    interval="preserveStartEnd"
                                />
                                <YAxis 
                                    tick={{ fontSize: 11, fill: "#999" }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(v) => `€${v}`}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        borderRadius: 8, 
                                        border: "1px solid #e5e7eb", 
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                                        fontSize: 13,
                                        padding: "8px 12px" 
                                    }}
                                    formatter={(value: number) => [`€${value.toFixed(2)}`, "Receita"]}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="receita"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    fill="url(#revenueGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </Card>

            <div className="grid lg:grid-cols-3 gap-4">
                {/* Recent Orders */}
                <Card className="lg:col-span-2 p-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-gray-900 dark:text-gray-100">Últimas Encomendas</h2>
                        <div className="flex gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={loadDashboardStats}
                                disabled={loading}
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                            <Link to="/admin/encomendas">
                                <Button variant="ghost" size="sm" className="text-blue-600">
                                    Ver todas
                                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {loading ? (
                        <div className="space-y-2">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-14 bg-gray-50 dark:bg-gray-800 animate-pulse rounded-lg" />
                            ))}
                        </div>
                    ) : stats.recentOrders.length === 0 ? (
                        <div className="text-center py-10">
                            <ShoppingCart className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">Ainda sem encomendas</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {stats.recentOrders.map((order) => (
                                <Link 
                                    key={order.id}
                                    to="/admin/encomendas"
                                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                            <Package className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                #{order.orderNumber}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {order.shippingAddress?.name} · {order.items?.length || 0} artigo{(order.items?.length || 0) !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {getStatusBadge(order.status)}
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1">
                                            €{order.total?.toFixed(2)}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Quick Actions & Today */}
                <div className="space-y-4">
                    <Card className="p-5 border border-gray-200 dark:border-gray-700">
                        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Acesso Rápido</h2>
                        <div className="space-y-2">
                            <Link to="/admin/produtos/novo">
                                <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700 h-10">
                                    <Package className="h-4 w-4 mr-2" />
                                    Novo Produto
                                </Button>
                            </Link>
                            <Link to="/admin/encomendas?status=pending">
                                <Button variant="outline" className="w-full justify-start h-10">
                                    <Clock className="h-4 w-4 mr-2 text-amber-500" />
                                    Pendentes ({stats.pendingOrders})
                                </Button>
                            </Link>
                            <Link to="/">
                                <Button variant="outline" className="w-full justify-start h-10">
                                    <ExternalLink className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                                    Ver Loja
                                </Button>
                            </Link>
                        </div>
                    </Card>

                    {/* Today Stats */}
                    <Card className="p-5 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Hoje</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Encomendas</span>
                                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    {loading ? "—" : stats.todayOrders}
                                </span>
                            </div>
                            <div className="h-px bg-gray-100 dark:bg-gray-800" />
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Produtos</span>
                                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    {loading ? "—" : stats.totalProducts}
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    )
}
