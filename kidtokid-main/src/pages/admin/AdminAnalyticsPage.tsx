import { useEffect, useState, useMemo } from "react"
import { AdminLayout } from "@/src/components/admin/AdminLayout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Euro,
    ShoppingCart,
    Users,
    Package,
    Loader2,
    RefreshCw,
    Calendar,
    Star,
    Percent
} from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts"
import { collection, getDocs, query, orderBy, limit, getCountFromServer } from "firebase/firestore"
import { db } from "@/src/lib/firebase"

interface OrderData {
    id: string
    total: number
    subtotal: number
    status: string
    paymentMethod: string
    shippingMethod: string
    items: { category?: string }[]
    createdAt: Date
    category?: string
}

interface AnalyticsData {
    orders: OrderData[]
    totalProducts: number
    totalUsers: number
    totalReviews: number
    totalNewsletter: number
}

const COLORS = ["#4A90B8", "#82ca9d", "#ffc658", "#ff8042", "#8884d8", "#e76f51"]

export default function AdminAnalyticsPage() {
    const [data, setData] = useState<AnalyticsData>({
        orders: [],
        totalProducts: 0,
        totalUsers: 0,
        totalReviews: 0,
        totalNewsletter: 0,
    })
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState<"7" | "30" | "90">("30")

    const loadData = async () => {
        setLoading(true)
        try {
            const [ordersSnap, productsCount, usersCount, reviewsCount, newsletterCount] = await Promise.all([
                getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(500))),
                getCountFromServer(collection(db, "products")),
                getCountFromServer(collection(db, "users")),
                getCountFromServer(collection(db, "reviews")),
                getCountFromServer(collection(db, "newsletter")),
            ])

            const orders = ordersSnap.docs.map(d => {
                const data = d.data()
                return {
                    id: d.id,
                    total: data.total || 0,
                    subtotal: data.subtotal || 0,
                    status: data.status || "pending",
                    paymentMethod: data.paymentMethod || "card",
                    shippingMethod: data.shippingMethod || "delivery",
                    items: data.items || [],
                    createdAt: data.createdAt?.toDate?.() || new Date(),
                    category: data.items?.[0]?.category,
                }
            })

            setData({
                orders,
                totalProducts: productsCount.data().count,
                totalUsers: usersCount.data().count,
                totalReviews: reviewsCount.data().count,
                totalNewsletter: newsletterCount.data().count,
            })
        } catch (error) {
            console.error("Erro ao carregar analytics:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadData() }, [])

    const days = parseInt(period)
    const cutoff = useMemo(() => {
        const d = new Date()
        d.setDate(d.getDate() - days)
        d.setHours(0, 0, 0, 0)
        return d
    }, [days])

    const periodOrders = useMemo(() => 
        data.orders.filter(o => o.createdAt >= cutoff),
        [data.orders, cutoff]
    )

    const paidOrders = useMemo(() =>
        periodOrders.filter(o => !["cancelled", "refunded"].includes(o.status)),
        [periodOrders]
    )

    const totalRevenue = paidOrders.reduce((s, o) => s + o.total, 0)
    const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0
    const totalItems = paidOrders.reduce((s, o) => s + (o.items?.length || 0), 0)
    const conversionEstimate = data.totalUsers > 0 ? ((paidOrders.length / data.totalUsers) * 100).toFixed(1) : "0"

    // Previous period comparison
    const prevCutoff = useMemo(() => {
        const d = new Date(cutoff)
        d.setDate(d.getDate() - days)
        return d
    }, [cutoff, days])

    const prevPeriodOrders = useMemo(() =>
        data.orders.filter(o => o.createdAt >= prevCutoff && o.createdAt < cutoff && !["cancelled", "refunded"].includes(o.status)),
        [data.orders, prevCutoff, cutoff]
    )
    const prevRevenue = prevPeriodOrders.reduce((s, o) => s + o.total, 0)
    const revenueChange = prevRevenue > 0 ? (((totalRevenue - prevRevenue) / prevRevenue) * 100).toFixed(0) : null

    // Revenue chart - daily
    const revenueChart = useMemo(() => {
        const dailyMap = new Map<string, number>()
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            dailyMap.set(d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" }), 0)
        }
        paidOrders.forEach(order => {
            const key = order.createdAt.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" })
            if (dailyMap.has(key)) {
                dailyMap.set(key, (dailyMap.get(key) || 0) + order.total)
            }
        })
        return Array.from(dailyMap.entries()).map(([date, revenue]) => ({ date, revenue: parseFloat(revenue.toFixed(2)) }))
    }, [paidOrders, days])

    // Orders per day chart
    const ordersChart = useMemo(() => {
        const dailyMap = new Map<string, number>()
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            dailyMap.set(d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" }), 0)
        }
        periodOrders.forEach(order => {
            const key = order.createdAt.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" })
            if (dailyMap.has(key)) {
                dailyMap.set(key, (dailyMap.get(key) || 0) + 1)
            }
        })
        return Array.from(dailyMap.entries()).map(([date, count]) => ({ date, encomendas: count }))
    }, [periodOrders, days])

    // Payment methods distribution
    const paymentChart = useMemo(() => {
        const methods: Record<string, number> = {}
        paidOrders.forEach(o => {
            const label = o.paymentMethod === "card" ? "Cartão" : o.paymentMethod === "shop" ? "Na Loja" : o.paymentMethod
            methods[label] = (methods[label] || 0) + 1
        })
        return Object.entries(methods).map(([name, value]) => ({ name, value }))
    }, [paidOrders])

    // Order status distribution
    const statusChart = useMemo(() => {
        const statuses: Record<string, number> = {}
        const labels: Record<string, string> = {
            pending: "Pendente", paid: "Pago", processing: "Preparação",
            shipped: "Enviado", delivered: "Entregue", cancelled: "Cancelado",
            refunded: "Reembolsado", ready_pickup: "Levantamento"
        }
        periodOrders.forEach(o => {
            const label = labels[o.status] || o.status
            statuses[label] = (statuses[label] || 0) + 1
        })
        return Object.entries(statuses).map(([name, value]) => ({ name, value }))
    }, [periodOrders])

    if (loading) {
        return (
            <AdminLayout title="Analytics" subtitle="A carregar...">
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400 dark:text-gray-500" />
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout title="Analytics" subtitle="Métricas e desempenho da loja">
            {/* Period selector */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex gap-2">
                    {(["7", "30", "90"] as const).map(p => (
                        <Button
                            key={p}
                            variant={period === p ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPeriod(p)}
                            className={period === p ? "bg-blue-600 hover:bg-blue-700" : "rounded-lg"}
                        >
                            <Calendar className="h-4 w-4 mr-1" />
                            {p === "7" ? "7 dias" : p === "30" ? "30 dias" : "90 dias"}
                        </Button>
                    ))}
                </div>
                <Button variant="ghost" size="sm" onClick={loadData}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Receita</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">€{totalRevenue.toFixed(2)}</p>
                            {revenueChange !== null && (
                                <div className={`flex items-center gap-1 text-xs mt-1 ${parseInt(revenueChange) >= 0 ? "text-green-600" : "text-red-600"}`}>
                                    {parseInt(revenueChange) >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                    {revenueChange}% vs período anterior
                                </div>
                            )}
                        </div>
                        <Euro className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Encomendas</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{periodOrders.length}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{paidOrders.length} pagas</p>
                        </div>
                        <ShoppingCart className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Valor Médio</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">€{avgOrderValue.toFixed(2)}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{totalItems} artigos vendidos</p>
                        </div>
                        <BarChart3 className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Utilizadores</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.totalUsers}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{data.totalNewsletter} newsletter</p>
                        </div>
                        <Users className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
                {/* Revenue Chart */}
                <Card className="p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <Euro className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        Receita Diária
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueChart}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip formatter={(value: number) => [`€${value.toFixed(2)}`, "Receita"]} />
                                <Area type="monotone" dataKey="revenue" stroke="#4A90B8" fill="#4A90B8" fillOpacity={0.2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Orders Chart */}
                <Card className="p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        Encomendas por Dia
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ordersChart}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Bar dataKey="encomendas" fill="#8884d8" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Payment Methods */}
                <Card className="p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Métodos de Pagamento</h3>
                    {paymentChart.length > 0 ? (
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={paymentChart} cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} dataKey="value" fontSize={12}>
                                        {paymentChart.map((_, index) => (
                                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-8">Sem dados</p>
                    )}
                </Card>

                {/* Order Status */}
                <Card className="p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Estado das Encomendas</h3>
                    {statusChart.length > 0 ? (
                        <div className="space-y-3">
                            {statusChart.map((item, i) => (
                                <div key={item.name} className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                    <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{item.name}</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-8">Sem dados</p>
                    )}
                </Card>

                {/* Quick Stats */}
                <Card className="p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Resumo</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Package className="h-4 w-4" />
                                Produtos
                            </div>
                            <span className="font-bold text-gray-900 dark:text-gray-100">{data.totalProducts}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Star className="h-4 w-4" />
                                Avaliações
                            </div>
                            <span className="font-bold text-gray-900 dark:text-gray-100">{data.totalReviews}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Percent className="h-4 w-4" />
                                Conversão (est.)
                            </div>
                            <span className="font-bold text-gray-900 dark:text-gray-100">{conversionEstimate}%</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Users className="h-4 w-4" />
                                Newsletter
                            </div>
                            <span className="font-bold text-gray-900 dark:text-gray-100">{data.totalNewsletter}</span>
                        </div>
                    </div>
                </Card>
            </div>
        </AdminLayout>
    )
}
