import { ReactNode, useState, useEffect, useRef, useMemo, useCallback } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/src/contexts/AuthContext"
import { useAdminTheme } from "@/src/contexts/AdminThemeContext"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    Store,
    Bell,
    Search,
    Tag,
    CheckCheck,
    ShoppingBag,
    Star,
    MessageSquare,
    BarChart3,
    Mail,
} from "lucide-react"
import {
    subscribeToAdminNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    type AdminNotification,
} from "@/src/services/notificationService"

interface AdminLayoutProps {
    children: ReactNode
    title: string
    subtitle?: string
}

const navigation = [
    { name: "Painel", href: "/admin", icon: LayoutDashboard },
    { name: "Produtos", href: "/admin/produtos", icon: Package },
    { name: "Encomendas", href: "/admin/encomendas", icon: ShoppingCart },
    { name: "Clientes", href: "/admin/clientes", icon: Users },
    { name: "Cupões", href: "/admin/cupoes", icon: Tag },
    { name: "Mensagens", href: "/admin/mensagens", icon: MessageSquare },
    { name: "Avaliações", href: "/admin/avaliacoes", icon: Star },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Newsletter", href: "/admin/newsletter", icon: Mail },
    { name: "Definições", href: "/admin/definicoes", icon: Settings },
]

function getGreeting(): string {
    const hour = new Date().getHours()
    if (hour >= 6 && hour < 12) return "Bom dia"
    if (hour >= 12 && hour < 19) return "Boa tarde"
    return "Boa noite"
}

export function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
    const location = useLocation()
    const navigate = useNavigate()
    const { user, userData, logout } = useAuth()
    const { scheme } = useAdminTheme()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [notifications, setNotifications] = useState<AdminNotification[]>([])
    const [showNotifications, setShowNotifications] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const notifRef = useRef<HTMLDivElement>(null)

    // Subscribe to real-time notifications
    useEffect(() => {
        const unsub = subscribeToAdminNotifications((notifs) => {
            setNotifications(notifs)
        })
        return () => unsub()
    }, [])

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setShowNotifications(false)
            }
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [])

    const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications])

    const handleNotificationClick = useCallback(async (notification: AdminNotification) => {
        if (!notification.read) {
            await markNotificationRead(notification)
        }
        if (notification.link) {
            navigate(notification.link)
        }
        setShowNotifications(false)
    }, [navigate])

    const handleMarkAllRead = useCallback(async () => {
        await markAllNotificationsRead(notifications)
    }, [notifications])

    const getNotificationIcon = (type: AdminNotification["type"]) => {
        switch (type) {
            case "new_order": return <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center"><ShoppingBag className="h-4 w-4 text-blue-500" /></div>
            case "low_stock": return <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center"><Package className="h-4 w-4 text-orange-500" /></div>
            case "new_review": return <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center"><Star className="h-4 w-4 text-amber-500" /></div>
            case "new_contact": return <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center"><MessageSquare className="h-4 w-4 text-emerald-500" /></div>
        }
    }

    const formatTimeAgo = (date: Date) => {
        const now = new Date()
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
        if (diff < 60) return "agora"
        if (diff < 3600) return `${Math.floor(diff / 60)}m`
        if (diff < 86400) return `${Math.floor(diff / 3600)}h`
        return `${Math.floor(diff / 86400)}d`
    }

    const handleLogout = useCallback(async () => {
        await logout()
        navigate("/")
    }, [logout, navigate])

    const isActive = useCallback((href: string) => {
        if (href === "/admin") {
            return location.pathname === "/admin"
        }
        return location.pathname.startsWith(href)
    }, [location.pathname])

    const greeting = useMemo(() => getGreeting(), [])

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/20 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 lg:translate-x-0",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
                style={{ backgroundColor: scheme.sidebarBg }}
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-5" style={{ borderBottom: `1px solid ${scheme.sidebarHoverBg}` }}>
                    <Link to="/admin" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: scheme.accent }}>
                            <Store className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-semibold" style={{ color: scheme.sidebarActiveText }}>Kid to Kid</span>
                    </Link>
                    <button 
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-1"
                        style={{ color: scheme.sidebarTextMuted }}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="mt-4 px-3 space-y-0.5">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            to={item.href}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
                            style={
                                isActive(item.href)
                                    ? { backgroundColor: scheme.sidebarActiveBg, color: scheme.sidebarActiveText, fontWeight: 500 }
                                    : { color: scheme.sidebarText }
                            }
                            onMouseEnter={(e) => {
                                if (!isActive(item.href)) {
                                    e.currentTarget.style.backgroundColor = scheme.sidebarHoverBg
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive(item.href)) {
                                    e.currentTarget.style.backgroundColor = "transparent"
                                }
                            }}
                        >
                            <item.icon className="h-4.5 w-4.5" />
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </nav>

                {/* User info */}
                <div className="absolute bottom-0 left-0 right-0 p-3" style={{ borderTop: `1px solid ${scheme.sidebarHoverBg}` }}>
                    <div className="flex items-center gap-3 px-2 py-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium" style={{ backgroundColor: scheme.sidebarActiveBg, color: scheme.sidebarActiveText }}>
                            {userData?.firstName?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || "A"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: scheme.sidebarActiveText }}>
                                {userData?.firstName || "Admin"}
                            </p>
                            <p className="text-xs truncate" style={{ color: scheme.sidebarTextMuted }}>
                                {user?.email}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-1 mt-1">
                        <button
                            className="flex-1 flex items-center text-xs px-2 py-1.5 rounded-md transition-colors"
                            style={{ color: scheme.sidebarTextMuted }}
                            onClick={() => navigate("/")}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = scheme.sidebarHoverBg }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent" }}
                        >
                            <Store className="h-3.5 w-3.5 mr-1.5" />
                            Ver Loja
                        </button>
                        <button
                            className="flex items-center px-2 py-1.5 rounded-md transition-colors"
                            style={{ color: scheme.sidebarTextMuted }}
                            onClick={handleLogout}
                            onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.backgroundColor = scheme.sidebarHoverBg }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = scheme.sidebarTextMuted; e.currentTarget.style.backgroundColor = "transparent" }}
                        >
                            <LogOut className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <header className="sticky top-0 z-30 h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1.5"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
                            {subtitle ? (
                                <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
                            ) : (
                                <p className="text-xs text-gray-400 dark:text-gray-500">{greeting}, {userData?.firstName || "Admin"}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        {/* Search */}
                        <div className="hidden md:flex items-center gap-2 bg-gray-50 dark:bg-gray-950 rounded-lg px-3 py-1.5 border border-gray-200 dark:border-gray-700 focus-within:border-blue-300 focus-within:ring-1 focus-within:ring-blue-100 transition-all">
                            <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <input
                                type="text"
                                placeholder="Pesquisar..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && searchQuery.trim()) {
                                        const q = searchQuery.trim().toLowerCase()
                                        if (q.includes("produto") || q.includes("artigo")) {
                                            navigate("/admin/produtos")
                                        } else if (q.includes("encomend") || q.includes("order")) {
                                            navigate("/admin/encomendas")
                                        } else if (q.includes("client") || q.includes("utilizador")) {
                                            navigate("/admin/clientes")
                                        } else if (q.includes("cup") || q.includes("desconto")) {
                                            navigate("/admin/cupoes")
                                        } else if (q.includes("defini") || q.includes("config")) {
                                            navigate("/admin/definicoes")
                                        } else {
                                            navigate(`/admin/produtos?search=${encodeURIComponent(searchQuery.trim())}`)
                                        }
                                        setSearchQuery("")
                                    }
                                }}
                                className="bg-transparent border-none outline-none text-sm w-40 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            />
                        </div>

                        {/* Notifications */}
                        <div className="relative" ref={notifRef}>
                            <button
                                className="relative p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                onClick={() => setShowNotifications(!showNotifications)}
                                aria-label={`Notificações${unreadCount > 0 ? ` (${unreadCount} novas)` : ''}`}
                            >
                                <Bell className="h-5 w-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 min-w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1">
                                        {unreadCount > 9 ? "9+" : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-1 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                            Notificações
                                        </h3>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={handleMarkAllRead}
                                                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                            >
                                                <CheckCheck className="h-3.5 w-3.5" />
                                                Marcar como lidas
                                            </button>
                                        )}
                                    </div>

                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="py-8 text-center">
                                                <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Sem notificações</p>
                                            </div>
                                        ) : (
                                            notifications.slice(0, 15).map((notif) => (
                                                <button
                                                    key={notif.id}
                                                    onClick={() => handleNotificationClick(notif)}
                                                    className={cn(
                                                        "w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-50 last:border-0",
                                                        !notif.read && "bg-blue-50/40"
                                                    )}
                                                >
                                                    <div className="mt-0.5 shrink-0">
                                                        {getNotificationIcon(notif.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={cn(
                                                            "text-sm truncate",
                                                            notif.read ? "text-gray-600 dark:text-gray-400" : "text-gray-900 dark:text-gray-100 font-medium"
                                                        )}>
                                                            {notif.title}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{notif.message}</p>
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0 mt-1">
                                                        {formatTimeAgo(notif.createdAt)}
                                                    </span>
                                                </button>
                                            ))
                                        )}
                                    </div>

                                    {notifications.length > 0 && (
                                        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 text-center">
                                            <Link
                                                to="/admin/encomendas"
                                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                                onClick={() => setShowNotifications(false)}
                                            >
                                                Ver todas as encomendas →
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
