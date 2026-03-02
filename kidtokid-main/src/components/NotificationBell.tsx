import { useState, useEffect, useRef, useCallback } from "react"
import { Bell, Package, Star, MessageSquare, Check } from "lucide-react"
import { useNavigate } from "react-router-dom"
import {
    subscribeToAdminNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    type AdminNotification,
} from "@/src/services/notificationService"

interface NotificationBellProps {
    isAdmin: boolean
}

export function NotificationBell({ isAdmin }: NotificationBellProps) {
    const [notifications, setNotifications] = useState<AdminNotification[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()

    useEffect(() => {
        if (!isAdmin) return
        const unsub = subscribeToAdminNotifications(setNotifications)
        return unsub
    }, [isAdmin])

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

    const unreadCount = notifications.filter((n) => !n.read).length

    const handleClick = useCallback(
        async (notif: AdminNotification) => {
            if (!notif.read) {
                await markNotificationRead(notif)
                setNotifications((prev) =>
                    prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
                )
            }
            setIsOpen(false)
            if (notif.link) navigate(notif.link)
        },
        [navigate]
    )

    const handleMarkAllRead = useCallback(async () => {
        await markAllNotificationsRead(notifications)
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    }, [notifications])

    if (!isAdmin) return null

    const iconForType = (type: string) => {
        switch (type) {
            case "new_order":
                return <Package className="h-4 w-4 text-blue-500" />
            case "new_review":
                return <Star className="h-4 w-4 text-yellow-500" />
            case "new_contact":
                return <MessageSquare className="h-4 w-4 text-green-500" />
            default:
                return <Bell className="h-4 w-4 text-gray-400" />
        }
    }

    const timeAgo = (date: Date) => {
        const diff = Date.now() - date.getTime()
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
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Notificações"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-medium rounded-full flex items-center justify-center min-w-[18px] h-[18px]">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900">Notificações</h3>
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
                                <Bell className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                                <p className="text-sm text-gray-400">Sem notificações</p>
                            </div>
                        ) : (
                            notifications.slice(0, 15).map((notif) => (
                                <button
                                    key={notif.id}
                                    onClick={() => handleClick(notif)}
                                    className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${!notif.read ? "bg-blue-50/40" : ""
                                        }`}
                                >
                                    <div className="mt-0.5 shrink-0">{iconForType(notif.type)}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className={`text-sm truncate ${!notif.read ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                                                {notif.title}
                                            </p>
                                            {!notif.read && (
                                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 truncate mt-0.5">{notif.message}</p>
                                        <p className="text-xs text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
