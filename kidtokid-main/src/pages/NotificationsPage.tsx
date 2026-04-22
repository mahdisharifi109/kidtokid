import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Header } from "@/src/components/layout/Header"
import { Footer } from "@/src/components/Footer"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/src/contexts/AuthContext"
import { usePageTitle } from "@/src/hooks/usePageTitle"
import {
  subscribeToUserNotifications,
  markUserNotificationRead,
  markAllUserNotificationsRead,
  deleteUserNotification,
  type UserNotification,
} from "@/src/services/notificationService"
import {
  Bell,
  Check,
  CheckCheck,
  Megaphone,
  Package,
  Trash2,
  ArrowLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function NotificationsPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [notifications, setNotifications] = useState<UserNotification[]>([])
  const navigate = useNavigate()
  usePageTitle("Notificações")

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/entrar")
    }
  }, [isAuthenticated, isLoading, navigate])

  useEffect(() => {
    if (!user) return
    const unsub = subscribeToUserNotifications(user.uid, setNotifications)
    return unsub
  }, [user])

  const handleMarkRead = useCallback(async (notif: UserNotification) => {
    if (!user || notif.read) return
    await markUserNotificationRead(user.uid, notif.id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    )
  }, [user])

  const handleMarkAllRead = useCallback(async () => {
    if (!user) return
    await markAllUserNotificationsRead(user.uid, notifications)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    toast.success("Todas as notificações marcadas como lidas")
  }, [user, notifications])

  const handleDelete = useCallback(async (notifId: string) => {
    if (!user) return
    await deleteUserNotification(user.uid, notifId)
    setNotifications((prev) => prev.filter((n) => n.id !== notifId))
    toast.success("Notificação removida")
  }, [user])

  const handleClick = useCallback((notif: UserNotification) => {
    handleMarkRead(notif)
    if (notif.actionLink) navigate(notif.actionLink)
    else if (notif.link) navigate(notif.link)
  }, [handleMarkRead, navigate])

  const unreadCount = notifications.filter((n) => !n.read).length

  const iconForType = (type: string) => {
    switch (type) {
      case "newsletter":
      case "promo":
        return <Megaphone className="h-5 w-5 text-indigo-500" />
      case "order_update":
        return <Package className="h-5 w-5 text-green-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-400" />
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "Agora mesmo"
    if (mins < 60) return `Há ${mins} minuto${mins > 1 ? "s" : ""}`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `Há ${hours} hora${hours > 1 ? "s" : ""}`
    const days = Math.floor(hours / 24)
    if (days < 7) return `Há ${days} dia${days > 1 ? "s" : ""}`
    return date.toLocaleDateString("pt-PT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50 dark:bg-gray-950">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6 md:py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Notificações
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {unreadCount > 0
                  ? `${unreadCount} por ler`
                  : "Tudo em dia ✓"}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="gap-1.5 text-xs"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Marcar tudo como lido
            </Button>
          )}
        </div>

        {/* Lista de notificações */}
        {notifications.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl border p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <Bell className="h-7 w-7 text-gray-300 dark:text-gray-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
              Sem notificações
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
              Quando recebermos novidades para ti, vão aparecer aqui.
              Ativa a newsletter nas definições da tua conta para seres o primeiro a saber!
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/minha-conta?tab=definicoes")}
              className="mt-5"
            >
              <Bell className="h-4 w-4 mr-2" />
              Ativar newsletter
            </Button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-xl border overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={cn(
                  "group flex items-start gap-4 p-4 transition-colors relative",
                  !notif.read
                    ? "bg-blue-50/50 dark:bg-blue-950/20"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                )}
              >
                {/* Ícone */}
                <div className="mt-0.5 shrink-0">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      !notif.read
                        ? "bg-indigo-100 dark:bg-indigo-900/40"
                        : "bg-gray-100 dark:bg-gray-800"
                    )}
                  >
                    {iconForType(notif.type)}
                  </div>
                </div>

                {/* Conteúdo */}
                <button
                  className="flex-1 min-w-0 text-left"
                  onClick={() => handleClick(notif)}
                >
                  <div className="flex items-center gap-2">
                    <p
                      className={cn(
                        "text-sm",
                        !notif.read
                          ? "font-semibold text-gray-900 dark:text-gray-100"
                          : "font-medium text-gray-700 dark:text-gray-300"
                      )}
                    >
                      {notif.title}
                    </p>
                    {!notif.read && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {notif.message}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                    {formatDate(notif.createdAt)}
                  </p>
                  {notif.actionLink && (
                    <span className="inline-flex items-center text-xs text-blue-600 dark:text-blue-400 mt-1.5 font-medium hover:underline">
                      Ver mais →
                    </span>
                  )}
                </button>

                {/* Ações */}
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notif.read && (
                    <button
                      onClick={() => handleMarkRead(notif)}
                      className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                      title="Marcar como lida"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notif.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                    title="Remover"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
