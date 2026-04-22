import { useState, useEffect, useRef, useCallback } from "react"
import { Bell, Package, Star, MessageSquare, Check, Megaphone } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/src/contexts/AuthContext"
import {
    subscribeToAdminNotifications,
    subscribeToUserNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    markUserNotificationRead,
    markAllUserNotificationsRead,
    type AdminNotification,
    type UserNotification,
} from "@/src/services/notificationService"

interface NotificationBellProps {
    isAdmin: boolean
}

export function NotificationBell({ isAdmin }: NotificationBellProps) {
    const { user } = useAuth()
    const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([])
    const [userNotifications, setUserNotifications] = useState<UserNotification[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()

    useEffect(() => {
        if (!isAdmin) return
        const unsub = subscribeToAdminNotifications(setAdminNotifications)
        return unsub
    }, [isAdmin])

    useEffect(() => {
        if (!user) return
        const unsub = subscribeToUserNotifications(user.uid, setUserNotifications)
        return unsub
    }, [user])

    // close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside)
        }
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [isOpen])

    const notifications = isAdmin ? adminNotifications : userNotifications
    const unreadCount = notifications.filter((n) => !n.read).length

    const handleClick = useCallback(
        async (notif: AdminNotification | UserNotification) => {
            if (!notif.read) {
                if (isAdmin) {
                    await markNotificationRead(notif as AdminNotification)
                    setAdminNotifications((prev) =>
                        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
                    )
                } else if (user) {
                    await markUserNotificationRead(user.uid, notif.id)
                    setUserNotifications((prev) =>
                        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
                    )
                }
            }
            setIsOpen(false)
            if (notif.link) navigate(notif.link)
            if ('actionLink' in notif && notif.actionLink) navigate(notif.actionLink)
        },
        [isAdmin, user, navigate]
    )

    const handleMarkAllRead = useCallback(async () => {
        if (isAdmin) {
            await markAllNotificationsRead(adminNotifications)
            setAdminNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        } else if (user) {
            await markAllUserNotificationsRead(user.uid, userNotifications)
            setUserNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        }
    }, [isAdmin, user, adminNotifications, userNotifications])

    // Mostrar sino para todos os utilizadores autenticados (admin vê sempre)
    if (!isAdmin && !user) return null

    const iconForType = (type: string) => {
        switch (type) {
            case "new_order":
                return <Package className="h-4 w-4 text-blue-500" />
            case "order_update":
                return <Package className="h-4 w-4 text-green-500" />
            case "new_review":
                return <Star className="h-4 w-4 text-yellow-500" />
            case "new_contact":
                return <MessageSquare className="h-4 w-4 text-green-500" />
            case "newsletter":
            case "promo":
                return <Megaphone className="h-4 w-4 text-indigo-500" />
            case "new_subscriber":
                return <Bell className="h-4 w-4 text-pink-500" />
            default:
                return <Bell className="h-4 w-4 text-gray-400 dark:text-gray-500" />
        }
    }

    const timeAgo = (date: Date) => {
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 1) return "agora"
        if (mins < 60) return `${mins}m`
        const hours = Math.floor(mins / 60)
        if (hours < 24) return `${hours}h`
        return `${Math.floor(hours / 24)}d`
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                aria-label="Notificações"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-medium rounded-full flex items-center justify-center min-w-4.5">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notificações</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                            >
                                <Check className="h-3 w-3" />
                                Marcar tudo como lido
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center">
                                <Bell className="h-8 w-8 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
                                <p className="text-sm text-gray-400 dark:text-gray-500">Sem notificações</p>
                            </div>
                        ) : (
                            notifications.slice(0, 15).map((notif) => (
                                <button
                                    key={notif.id}
                                    onClick={() => handleClick(notif)}
                                    className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-50 dark:border-gray-700 last:border-0 ${!notif.read ? "bg-blue-50/40 dark:bg-blue-900/30" : ""
                                        }`}
                                >
                                    <div className="mt-0.5 shrink-0">{iconForType(notif.type)}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className={`text-sm truncate ${!notif.read ? "font-semibold text-gray-900 dark:text-gray-100" : "text-gray-700 dark:text-gray-300"}`}>
                                                {notif.title}
                                            </p>
                                            {!notif.read && (
                                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{notif.message}</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{timeAgo(notif.createdAt)}</p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700 text-center">
                            <button
                                onClick={() => {
                                    setIsOpen(false)
                                    navigate(isAdmin ? "/admin/encomendas" : "/notificacoes")
                                }}
                                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                            >
                                Ver todas as notificações →
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
