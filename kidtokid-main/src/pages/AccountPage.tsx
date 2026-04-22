import { useEffect, useMemo, useState, type ReactNode } from "react"
import { useNavigate, Link, useSearchParams } from "react-router-dom"
import { Header } from "@/src/components/layout/Header"
import { Footer } from "@/src/components/Footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/src/contexts/AuthContext"
import { useTheme } from "@/src/contexts/ThemeContext"
import { UserAvatar } from "@/src/components/UserAvatar"
import { useFavorites } from "@/src/contexts/FavoritesContext"
import { useCart } from "@/src/contexts/CartContext"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { Address } from "@/src/services/authService"
import { getUserOrders, getOrderStatusText as getOrderStatusLabel, type Order } from "@/src/services/orderService"
import {
    User,
    Package,
    Heart,
    MapPin,
    Settings,
    LogOut,
    ShoppingBag,
    ChevronRight,
    Edit2,
    Save,
    Phone,
    Mail,
    Truck,
    Shield,
    Bell,
    Lock,
    Trash2,
    Plus,
    X,
    Check,
    ExternalLink,
    RefreshCw,
    Camera,
    Loader2,
    Sun,
    Moon,
    Monitor
} from "lucide-react"
// Account sub-components (available for future extraction)

type TabType = "perfil" | "encomendas" | "favoritos" | "moradas" | "definicoes"

function ThemeSettingRow() {
    const { theme, setTheme } = useTheme()
    const options: { value: "light" | "dark" | "system"; label: string; icon: ReactNode }[] = [
        { value: "light", label: "Claro", icon: <Sun className="h-4 w-4" /> },
        { value: "dark", label: "Escuro", icon: <Moon className="h-4 w-4" /> },
        { value: "system", label: "Sistema", icon: <Monitor className="h-4 w-4" /> },
    ]
    return (
        <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors -mx-2">
            <div className="flex items-center gap-3">
                <Sun className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Tema</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Escolhe o modo de visualização</p>
                </div>
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 p-0.5">
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => setTheme(opt.value)}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                            theme === opt.value
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                    >
                        {opt.icon}
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default function AccountPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user, userData, isAuthenticated, isLoading, logout, updateProfile, uploadPhoto, removePhoto, sendPasswordReset } = useAuth()
    const { favorites, removeFromFavorites } = useFavorites()
    const { items: cartItems } = useCart()

    // Ler tab da URL ou usar "perfil" como default
    const tabFromUrl = searchParams.get("tab") as TabType | null
    const validTabs = useMemo<TabType[]>(() => ["perfil", "encomendas", "favoritos", "moradas", "definicoes"], [])
    const initialTab = tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : "perfil"

    const [activeTab, setActiveTab] = useState<TabType>(initialTab)
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [newsletter, setNewsletter] = useState(false)
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
    })

    // Estados para moradas
    const [addresses, setAddresses] = useState<Address[]>([])
    const [showAddressModal, setShowAddressModal] = useState(false)
    const [addressForm, setAddressForm] = useState<Partial<Address>>({
        name: "",
        street: "",
        city: "",
        postalCode: "",
        country: "Portugal",
        phone: "",
        isDefault: false,
    })

    // Estados para encomendas reais do Firebase
    const [orders, setOrders] = useState<Order[]>([])
    const [ordersLoading, setOrdersLoading] = useState(false)

    // Estado para reset de password
    const [isResettingPassword, setIsResettingPassword] = useState(false)

    // Estado para upload de foto
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploadingPhoto(true)
        const result = await uploadPhoto(file)
        setIsUploadingPhoto(false)

        if (result.success) {
            toast.success("Foto atualizada com sucesso!")
        } else {
            toast.error(result.error || "Ups! Problema ao carregar foto")
        }
        // Reset input
        e.target.value = ""
    }

    const handleRemovePhoto = async () => {
        setIsUploadingPhoto(true)
        const result = await removePhoto()
        setIsUploadingPhoto(false)

        if (result.success) {
            toast.success("Foto removida")
        } else {
            toast.error(result.error || "Ups! Problema ao remover foto")
        }
    }

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate("/entrar")
        }
    }, [isAuthenticated, isLoading, navigate])

    // Atualizar tab quando URL muda
    useEffect(() => {
        if (tabFromUrl && validTabs.includes(tabFromUrl)) {
            setActiveTab(tabFromUrl)
        }
    }, [tabFromUrl, validTabs])

    // Carregar encomendas do Firebase
    useEffect(() => {
        const loadOrders = async () => {
            if (user) {
                setOrdersLoading(true)
                try {
                    const userOrders = await getUserOrders()
                    setOrders(userOrders)
                } catch (error) {
                    console.error('Ups! Problema ao carregar encomendas:', error)
                } finally {
                    setOrdersLoading(false)
                }
            }
        }
        loadOrders()
    }, [user])

    const handleRefreshOrders = async () => {
        setOrdersLoading(true)
        try {
            const userOrders = await getUserOrders()
            setOrders(userOrders)
            toast.success("Encomendas atualizadas!")
        } catch (error) {
            console.error('Ups! Problema ao atualizar encomendas:', error)
            toast.error("Ups! Problema ao atualizar encomendas")
        } finally {
            setOrdersLoading(false)
        }
    }

    useEffect(() => {
        if (userData) {
            setFormData({
                firstName: userData.firstName || "",
                lastName: userData.lastName || "",
                email: user?.email || "",
                phone: userData.phone || "",
            })
            setNewsletter(userData.newsletter || false)
            // Carregar moradas do userData
            if (userData.addresses && Array.isArray(userData.addresses)) {
                setAddresses(userData.addresses)
            }
        }
    }, [userData, user])

    const handleLogout = async () => {
        await logout()
        toast.success("Até à próxima")
        navigate("/")
    }

    const handleSaveProfile = async () => {
        setIsSaving(true)
        const result = await updateProfile({
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
        })
        setIsSaving(false)

        if (result.success) {
            toast.success("Alterações guardadas!")
            setIsEditing(false)
        } else {
            toast.error(result.error || "Ups! Problema ao guardar")
        }
    }

    const handleNewsletterChange = async (checked: boolean) => {
        const previousValue = newsletter
        setNewsletter(checked)
        try {
            const result = await updateProfile({ newsletter: checked })
            if (result.success) {
                toast.success(checked ? "Newsletter ativada!" : "Newsletter desativada")
            } else {
                // Revert on failure
                setNewsletter(previousValue)
                toast.error(result.error || "Ups! Problema ao atualizar newsletter. Tenta novamente.")
            }
        } catch (error) {
            setNewsletter(previousValue)
            toast.error("Ups! Problema ao atualizar newsletter. Tenta novamente.")
            console.error("Erro newsletter:", error)
        }
    }

    // Funções de moradas
    const handleAddAddress = async () => {
        if (!addressForm.name || !addressForm.street || !addressForm.city || !addressForm.postalCode) {
            toast.error("Preenche todos os campos obrigatórios")
            return
        }

        const newAddress: Address = {
            id: Date.now().toString(),
            name: addressForm.name || "",
            street: addressForm.street || "",
            city: addressForm.city || "",
            postalCode: addressForm.postalCode || "",
            country: addressForm.country || "Portugal",
            phone: addressForm.phone,
            isDefault: addresses.length === 0 ? true : addressForm.isDefault || false,
        }

        const updatedAddresses = [...addresses, newAddress]
        const result = await updateProfile({ addresses: updatedAddresses })

        if (result.success) {
            setAddresses(updatedAddresses)
            setShowAddressModal(false)
            setAddressForm({
                name: "",
                street: "",
                city: "",
                postalCode: "",
                country: "Portugal",
                phone: "",
                isDefault: false,
            })
            toast.success("Morada adicionada!")
        } else {
            toast.error("Ups! Problema ao guardar morada")
        }
    }

    const handleRemoveAddress = async (id: string) => {
        const updatedAddresses = addresses.filter(a => a.id !== id)
        const result = await updateProfile({ addresses: updatedAddresses })

        if (result.success) {
            setAddresses(updatedAddresses)
            toast.success("Morada removida")
        }
    }

    const handleSetDefaultAddress = async (id: string) => {
        const updatedAddresses = addresses.map(a => ({
            ...a,
            isDefault: a.id === id
        }))
        const result = await updateProfile({ addresses: updatedAddresses })

        if (result.success) {
            setAddresses(updatedAddresses)
            toast.success("Morada principal atualizada")
        }
    }

    // Reset de password
    const handleResetPassword = async () => {
        if (!user?.email) {
            toast.error("Infelizmente não conseguimos determinar o teu email. Tenta fazer logout e login novamente.")
            return
        }

        setIsResettingPassword(true)
        try {
            const result = await sendPasswordReset(user.email)
            if (result.success) {
                toast.success("Email enviado! Verifica a tua caixa de correio (e a pasta de spam).")
            } else {
                toast.error(result.error || "Ups! Problema ao enviar email de recuperação. Tenta novamente.")
            }
        } catch (error) {
            console.error("Ups! Problema ao enviar reset de password:", error)
            toast.error("Ups! Problema ao enviar email. Verifica a tua ligação à internet.")
        } finally {
            setIsResettingPassword(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-k2k-blue border-t-transparent mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Um momento...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    const firstName = userData?.firstName || user?.displayName?.split(' ')[0] || "amigo"
    const memberSince = user?.metadata?.creationTime
        ? new Date(user.metadata.creationTime).toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })
        : null

    // Calcular stats do utilizador
    const totalFavorites = favorites.length
    const totalCartItems = cartItems.length
    const userInitials = firstName ? firstName.charAt(0).toUpperCase() : "?"

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950">
            <Header />

            <main className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
                {/* Perfil do utilizador */}
                <div className="mb-6">
                    <div className="bg-white dark:bg-gray-900 rounded-xl border p-6 md:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                            {/* Avatar */}
                            <div className="shrink-0 relative group/avatar">
                                {userData?.photoURL || user?.photoURL ? (
                                    <UserAvatar
                                        src={userData?.photoURL || user?.photoURL}
                                        alt={firstName}
                                        fallbackInitials={userInitials}
                                        size="lg"
                                        className="border-2 border-gray-100 dark:border-gray-800 rounded-full"
                                    />
                                ) : (
                                    <div className="w-18 h-18 md:w-20 md:h-20 rounded-full bg-k2k-blue/10 flex items-center justify-center">
                                        <span className="text-2xl md:text-3xl font-semibold text-k2k-blue">{userInitials}</span>
                                    </div>
                                )}
                                {/* Photo upload overlay */}
                                <label className="absolute inset-0 rounded-full bg-black/0 group-hover/avatar:bg-black/30 flex items-center justify-center cursor-pointer transition-all opacity-0 group-hover/avatar:opacity-100">
                                    {isUploadingPhoto ? (
                                        <Loader2 className="h-5 w-5 text-white animate-spin" />
                                    ) : (
                                        <Camera className="h-5 w-5 text-white" />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handlePhotoUpload}
                                        className="hidden"
                                        disabled={isUploadingPhoto}
                                    />
                                </label>
                                {(userData?.photoURL || user?.photoURL) && !isUploadingPhoto && (
                                    <button
                                        onClick={handleRemovePhoto}
                                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity"
                                        title="Remover foto"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100">Olá, {firstName}</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                    {memberSince ? `Membro desde ${memberSince}` : user?.email}
                                </p>

                                {/* Quick Stats */}
                                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1.5">
                                        <Heart className="h-3.5 w-3.5" />
                                        {totalFavorites} favoritos
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <ShoppingBag className="h-3.5 w-3.5" />
                                        {totalCartItems} no carrinho
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Package className="h-3.5 w-3.5" />
                                        {orders.length} encomendas
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-4">
                    {/* Menu */}
                    <div className="lg:col-span-1">
                        <Card className="p-2 sticky top-24">
                            <nav className="space-y-0.5">
                                <button
                                    onClick={() => setActiveTab("perfil")}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                        activeTab === "perfil"
                                            ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200"
                                    )}
                                >
                                    <User className="h-4 w-4" />
                                    Os meus dados
                                </button>
                                <button
                                    onClick={() => setActiveTab("encomendas")}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                        activeTab === "encomendas"
                                            ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200"
                                    )}
                                >
                                    <Package className="h-4 w-4" />
                                    Encomendas
                                    {orders.length > 0 && activeTab !== "encomendas" && (
                                        <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
                                            {orders.length}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab("favoritos")}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                        activeTab === "favoritos"
                                            ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200"
                                    )}
                                >
                                    <Heart className="h-4 w-4" />
                                    Favoritos
                                    {favorites.length > 0 && activeTab !== "favoritos" && (
                                        <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
                                            {favorites.length}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab("moradas")}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                        activeTab === "moradas"
                                            ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200"
                                    )}
                                >
                                    <MapPin className="h-4 w-4" />
                                    Moradas
                                    {addresses.length > 0 && activeTab !== "moradas" && (
                                        <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
                                            {addresses.length}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab("definicoes")}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                        activeTab === "definicoes"
                                            ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200"
                                    )}
                                >
                                    <Settings className="h-4 w-4" />
                                    Definições
                                </button>

                                <hr className="my-2" />

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 dark:text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Terminar sessão
                                </button>
                            </nav>
                        </Card>

                        {/* Ajuda */}
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Precisas de ajuda?</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Qualquer dúvida, estamos aqui.
                            </p>
                            <Link to="/ajuda" className="inline-flex items-center gap-1 text-xs text-k2k-blue hover:underline mt-2 font-medium">
                                Fala connosco
                                <ChevronRight className="h-3 w-3" />
                            </Link>
                        </div>
                    </div>

                    {/* Conteúdo */}
                    <div className="lg:col-span-3">
                        {/* Perfil */}
                        {activeTab === "perfil" && (
                            <Card className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Dados Pessoais</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Informações da tua conta</p>
                                    </div>
                                    {!isEditing ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            <Edit2 className="h-4 w-4 mr-2" />
                                            Editar
                                        </Button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setIsEditing(false)}
                                                disabled={isSaving}
                                            >
                                                Cancelar
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={handleSaveProfile}
                                                className="bg-k2k-blue hover:bg-k2k-blue/90 text-white"
                                                disabled={isSaving}
                                            >
                                                {isSaving ? (
                                                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                ) : (
                                                    <Save className="h-4 w-4 mr-2" />
                                                )}
                                                {isSaving ? "A guardar..." : "Guardar"}
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-5">
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 dark:text-gray-300">Primeiro nome</Label>
                                            <Input
                                                id="firstName"
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                disabled={!isEditing}
                                                placeholder="O teu nome"
                                                className={cn("transition-all", isEditing && "ring-2 ring-blue-100 border-blue-300")}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 dark:text-gray-300">Apelido</Label>
                                            <Input
                                                id="lastName"
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                disabled={!isEditing}
                                                placeholder="O teu apelido"
                                                className={cn("transition-all", isEditing && "ring-2 ring-blue-100 border-blue-300")}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                            <Input
                                                id="email"
                                                value={formData.email}
                                                disabled
                                                className="pl-10 bg-gray-50 dark:bg-gray-800"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Este é o email que usas para entrar</p>
                                    </div>

                                    <div>
                                        <Label htmlFor="phone" className="text-sm text-gray-600 dark:text-gray-400">Telemóvel (opcional)</Label>
                                        <div className="relative mt-1.5">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                            <Input
                                                id="phone"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                disabled={!isEditing}
                                                placeholder="912 345 678"
                                                className="pl-10"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Só usamos para te contactar sobre encomendas</p>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="mt-8 pt-6 border-t">
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Sobre a tua conta</h3>
                                    <div className="grid gap-3 sm:grid-cols-2 text-sm">
                                        <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-400">
                                            <Mail className={`h-4 w-4 ${user?.emailVerified ? 'text-green-500' : 'text-yellow-500'}`} />
                                            <span>{user?.emailVerified ? 'Email verificado' : 'Email não verificado'}</span>
                                        </div>
                                        {memberSince && (
                                            <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-400">
                                                <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                <span>Membro desde {memberSince}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Encomendas */}
                        {activeTab === "encomendas" && (
                            <Card className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">As Minhas Encomendas</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Acompanha o estado das tuas compras</p>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={handleRefreshOrders}
                                        disabled={ordersLoading}
                                        className="gap-2"
                                    >
                                        <RefreshCw className={cn("h-4 w-4", ordersLoading && "animate-spin")} />
                                        Atualizar
                                    </Button>
                                </div>

                                {ordersLoading && orders.length === 0 ? (
                                    <div className="flex justify-center py-16">
                                        <div className="text-center">
                                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-k2k-blue border-t-transparent mx-auto mb-3" />
                                            <p className="text-sm text-gray-500 dark:text-gray-400">A carregar encomendas...</p>
                                        </div>
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="text-center py-16">
                                        <Package className="h-10 w-10 text-gray-300 mx-auto mb-4" />
                                        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Ainda sem encomendas</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 max-w-xs mx-auto">
                                            Quando fizeres uma compra, podes acompanhar tudo aqui.
                                        </p>
                                        <Link to="/">
                                            <Button variant="outline" size="sm">
                                                <ShoppingBag className="h-4 w-4 mr-2" />
                                                Ver produtos
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {orders.map((order) => (
                                            <div
                                                key={order.id}
                                                className="p-4 border rounded-lg hover:bg-gray-50/50 transition-colors"
                                            >
                                                <div className="flex items-start gap-4">
                                                    {/* Thumbnail do primeiro item */}
                                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shrink-0">
                                                        {order.items[0]?.image ? (
                                                            <img 
                                                                src={order.items[0].image} 
                                                                alt={order.items[0].title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Package className="h-6 w-6 text-gray-300" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <p className="font-semibold text-gray-900 dark:text-gray-100">
                                                                    Encomenda #{order.orderNumber}
                                                                </p>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                                                    {order.createdAt.toLocaleDateString('pt-PT', { 
                                                                        day: 'numeric', 
                                                                        month: 'long', 
                                                                        year: 'numeric' 
                                                                    })}
                                                                    {' • '}
                                                                    {order.items.length} artigo{order.items.length > 1 ? 's' : ''}
                                                                </p>
                                                            </div>
                                                            <span className={cn(
                                                                "text-xs px-3 py-1.5 rounded-full font-medium shrink-0",
                                                                order.status === 'pending' && "bg-yellow-100 text-yellow-700",
                                                                order.status === 'paid' && "bg-blue-100 text-blue-700",
                                                                order.status === 'processing' && "bg-purple-100 text-purple-700",
                                                                order.status === 'shipped' && "bg-indigo-100 text-indigo-700",
                                                                order.status === 'ready_pickup' && "bg-orange-100 text-orange-700",
                                                                order.status === 'delivered' && "bg-green-100 text-green-700",
                                                                order.status === 'cancelled' && "bg-red-100 text-red-700",
                                                                order.status === 'refunded' && "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                                            )}>
                                                                {getOrderStatusLabel(order.status)}
                                                            </span>
                                                        </div>
                                                        
                                                        {/* Items preview */}
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-1">
                                                            {order.items.map(item => item.title).join(', ')}
                                                        </p>

                                                        {/* Tracking info */}
                                                        {order.trackingNumber && (
                                                            <div className="flex items-center gap-2 mt-2 p-2 bg-indigo-50 rounded-lg text-sm">
                                                                <Truck className="h-4 w-4 text-indigo-600 shrink-0" />
                                                                <span className="text-indigo-700 font-medium">
                                                                    Tracking: {order.trackingNumber}
                                                                </span>
                                                                {order.trackingUrl && (
                                                                    <a
                                                                        href={order.trackingUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-indigo-600 hover:text-indigo-800 underline ml-auto flex items-center gap-1"
                                                                    >
                                                                        Seguir
                                                                        <ExternalLink className="h-3 w-3" />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        )}
                                                        
                                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-dashed">
                                                            <p className="font-bold text-lg text-k2k-blue">
                                                                €{order.total.toFixed(2)}
                                                            </p>
                                                            <Link 
                                                                to={`/sucesso?order=${order.orderNumber}`}
                                                                className="text-sm text-k2k-blue hover:underline font-medium flex items-center gap-1"
                                                            >
                                                                Ver detalhes
                                                                <ChevronRight className="h-4 w-4" />
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        )}

                        {/* Favoritos */}
                        {activeTab === "favoritos" && (
                            <Card className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Os Meus Favoritos</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {favorites.length > 0
                                                ? `${favorites.length} artigo${favorites.length > 1 ? 's' : ''} guardado${favorites.length > 1 ? 's' : ''}`
                                                : "Artigos que guardaste para mais tarde"
                                            }
                                        </p>
                                    </div>
                                    {favorites.length > 0 && (
                                        <Link to="/favoritos">
                                            <Button variant="outline" size="sm">
                                                Ver todos
                                                <ChevronRight className="h-4 w-4 ml-1" />
                                            </Button>
                                        </Link>
                                    )}
                                </div>

                                {favorites.length === 0 ? (
                                    <div className="text-center py-16">
                                        <Heart className="h-10 w-10 text-gray-300 mx-auto mb-4" />
                                        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">A tua lista está vazia</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 max-w-xs mx-auto">
                                            Guarda os produtos que mais gostas para os encontrar facilmente.
                                        </p>
                                        <Link to="/">
                                            <Button variant="outline" size="sm">
                                                Explorar produtos
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {favorites.slice(0, 5).map((product) => (
                                            <div 
                                                key={product.id} 
                                                className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shrink-0">
                                                    {product.images && product.images.length > 0 ? (
                                                        <img
                                                            src={product.images[0]}
                                                            alt={product.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <ShoppingBag className="h-6 w-6 text-gray-300" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">{product.title}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{product.brand} • {product.size}</p>
                                                    <p className="text-k2k-blue font-semibold text-sm mt-0.5">€{product.price.toFixed(2)}</p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link to={`/produto/${product.id}`}>
                                                            Ver
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            removeFromFavorites(product.id)
                                                            toast.success("Removido dos favoritos")
                                                        }}
                                                        className="text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        {favorites.length > 5 && (
                                            <div className="text-center pt-4">
                                                <Link to="/favoritos">
                                                    <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400">
                                                        Ver todos os {favorites.length} favoritos
                                                        <ChevronRight className="h-4 w-4 ml-1" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Card>
                        )}

                        {/* Moradas */}
                        {activeTab === "moradas" && (
                            <Card className="p-6">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Moradas de Entrega</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{addresses.length} morada{addresses.length !== 1 ? 's' : ''} guardada{addresses.length !== 1 ? 's' : ''}</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        className="bg-k2k-blue hover:bg-k2k-blue/90 text-white"
                                        onClick={() => setShowAddressModal(true)}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Nova morada
                                    </Button>
                                </div>

                                {addresses.length === 0 ? (
                                    <div className="text-center py-16">
                                        <MapPin className="h-10 w-10 text-gray-300 mx-auto mb-4" />
                                        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Sem moradas guardadas</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-5">
                                            Adiciona uma morada para tornar o checkout mais rápido.
                                        </p>
                                        <Button 
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowAddressModal(true)}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Adicionar morada
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {addresses.map((address) => (
                                            <div
                                                key={address.id}
                                                className={`p-4 border rounded-lg ${address.isDefault ? 'border-k2k-blue/30 bg-blue-50/30' : ''}`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-medium text-gray-900 dark:text-gray-100">{address.name}</p>
                                                                {address.isDefault && (
                                                                    <span className="text-xs bg-k2k-blue text-white px-2 py-0.5 rounded-full">
                                                                        Principal
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{address.street}</p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">{address.postalCode} {address.city}</p>
                                                            {address.phone && (
                                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{address.phone}</p>
                                                            )}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {!address.isDefault && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleSetDefaultAddress(address.id)}
                                                                className="text-gray-500 dark:text-gray-400 hover:text-k2k-blue"
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveAddress(address.id)}
                                                            className="text-gray-400 dark:text-gray-500 hover:text-red-500"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Info */}
                                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-400">
                                    <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">Informações de entrega</p>
                                    <ul className="space-y-1">
                                        <li>• Entrega em 2-5 dias úteis</li>
                                        <li>• Portes grátis acima de 50€</li>
                                        <li>• Levantamento grátis na loja</li>
                                    </ul>
                                </div>

                                {/* Modal de adicionar morada */}
                                {showAddressModal && (
                                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                        <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-xl">
                                            {/* Header */}
                                            <div className="flex items-center justify-between p-6 border-b">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Nova morada</h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Adiciona uma morada de entrega</p>
                                                </div>
                                                <button
                                                    onClick={() => setShowAddressModal(false)}
                                                    className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
                                                >
                                                    <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                                </button>
                                            </div>

                                            {/* Formulário */}
                                            <div className="p-6 space-y-4">
                                                <div>
                                                    <Label htmlFor="addressName">Nome da morada</Label>
                                                    <Input
                                                        id="addressName"
                                                        placeholder="Ex: Casa, Trabalho..."
                                                        value={addressForm.name || ""}
                                                        onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                                                        className="mt-1.5"
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="street">Morada</Label>
                                                    <Input
                                                        id="street"
                                                        placeholder="Rua, número, andar..."
                                                        value={addressForm.street || ""}
                                                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                                                        className="mt-1.5"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <Label htmlFor="postalCode">Código Postal</Label>
                                                        <Input
                                                            id="postalCode"
                                                            placeholder="0000-000"
                                                            value={addressForm.postalCode || ""}
                                                            onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                                                            className="mt-1.5"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="city">Cidade</Label>
                                                        <Input
                                                            id="city"
                                                            placeholder="Braga"
                                                            value={addressForm.city || ""}
                                                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                                            className="mt-1.5"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <Label htmlFor="addressPhone">Telemóvel (opcional)</Label>
                                                    <Input
                                                        id="addressPhone"
                                                        placeholder="912 345 678"
                                                        value={addressForm.phone || ""}
                                                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                                                        className="mt-1.5"
                                                    />
                                                </div>

                                                <div className="flex items-center gap-2 pt-2">
                                                    <input
                                                        type="checkbox"
                                                        id="isDefault"
                                                        checked={addressForm.isDefault || false}
                                                        onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                                                        className="rounded border-gray-300 text-k2k-blue focus:ring-k2k-blue"
                                                    />
                                                    <Label htmlFor="isDefault" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                                                        Definir como morada principal
                                                    </Label>
                                                </div>
                                            </div>

                                            {/* Botões */}
                                            <div className="p-6 pt-0 flex gap-3">
                                                <Button
                                                    variant="outline"
                                                    className="flex-1"
                                                    onClick={() => setShowAddressModal(false)}
                                                >
                                                    Cancelar
                                                </Button>
                                                <Button
                                                    className="flex-1 bg-k2k-blue hover:bg-k2k-blue/90 text-white"
                                                    onClick={handleAddAddress}
                                                >
                                                    Guardar
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        )}

                        {/* Definições */}
                        {activeTab === "definicoes" && (
                            <div className="space-y-4">
                                <Card className="p-6">
                                    <div className="mb-6">
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Definições</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Gere as preferências da tua conta</p>
                                    </div>

                                    <div className="space-y-1">
                                        {/* Tema */}
                                        <ThemeSettingRow />

                                        {/* Newsletter */}
                                        <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors -mx-2">
                                            <div className="flex items-center gap-3">
                                                <Bell className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-gray-100">Newsletter</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Recebe promoções e novidades por email</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={newsletter}
                                                    onChange={(e) => handleNewsletterChange(e.target.checked)}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:bg-k2k-blue"></div>
                                            </label>
                                        </div>

                                        {/* Password */}
                                        <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors -mx-2">
                                            <div className="flex items-center gap-3">
                                                <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-gray-100">Alterar password</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Recebe um link por email para criar nova password</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-gray-600 dark:text-gray-400"
                                                onClick={handleResetPassword}
                                                disabled={isResettingPassword}
                                            >
                                                {isResettingPassword ? "A enviar..." : "Enviar email"}
                                                <ChevronRight className="h-4 w-4 ml-1" />
                                            </Button>
                                        </div>

                                        {/* Privacidade */}
                                        <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors -mx-2">
                                            <div className="flex items-center gap-3">
                                                <Shield className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-gray-100">Privacidade</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Como tratamos os teus dados</p>
                                                </div>
                                            </div>
                                            <Link to="/politica-de-privacidade">
                                                <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400">
                                                    Ver
                                                    <ChevronRight className="h-4 w-4 ml-1" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </Card>

                                {/* Apagar conta */}
                                <Card className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Trash2 className="h-5 w-5 text-red-400" />
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">Apagar conta</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Isto é permanente e não dá para voltar atrás</p>
                                            </div>
                                        </div>
                                <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={async () => {
                                                const confirm1 = window.confirm("Tens a certeza que queres apagar a tua conta? Esta ação é irreversível.")
                                                if (!confirm1) return
                                                const confirm2 = window.confirm("ÚLTIMA CONFIRMAÇÃO: Todos os teus dados serão eliminados permanentemente. Continuar?")
                                                if (!confirm2) return
                                                try {
                                                    // Delete user data from Firestore
                                                    const { doc, collection, query, where, getDocs, writeBatch } = await import("firebase/firestore")
                                                    const { deleteUser } = await import("firebase/auth")
                                                    const { db } = await import("@/src/lib/firebase")
                                                    if (user) {
                                                        const batch = writeBatch(db)
                                                        
                                                        // Delete user profile doc
                                                        batch.delete(doc(db, "users", user.uid))
                                                        
                                                        // Delete user favorites
                                                        try {
                                                            const favsSnap = await getDocs(query(collection(db, "favorites"), where("userId", "==", user.uid)))
                                                            favsSnap.docs.forEach(d => batch.delete(d.ref))
                                                        } catch { /* ignore */ }
                                                        
                                                        // Delete user reviews
                                                        try {
                                                            const reviewsSnap = await getDocs(query(collection(db, "reviews"), where("userId", "==", user.uid)))
                                                            reviewsSnap.docs.forEach(d => batch.delete(d.ref))
                                                        } catch { /* ignore */ }
                                                        
                                                        // Delete newsletter subscription
                                                        try {
                                                            const nlSnap = await getDocs(query(collection(db, "newsletter"), where("email", "==", user.email)))
                                                            nlSnap.docs.forEach(d => batch.delete(d.ref))
                                                        } catch { /* ignore */ }
                                                        
                                                        await batch.commit()
                                                        
                                                        // Delete auth account
                                                        await deleteUser(user)
                                                        toast.success("Conta eliminada com sucesso")
                                                        navigate("/")
                                                    }
                                                } catch (error: unknown) {
                                                    const code = (error as { code?: string }).code
                                                    if (code === "auth/requires-recent-login") {
                                                        toast.error("Por segurança, faz logout e login novamente antes de apagar a conta.")
                                                    } else {
                                                        toast.error("Ups! Problema ao apagar conta. Contacta-nos: info@kidtokid.pt")
                                                    }
                                                }
                                            }}
                                        >
                                            Apagar
                                        </Button>
                                    </div>
                                </Card>

                                {/* Sair no mobile */}
                                <Button
                                    onClick={handleLogout}
                                    variant="outline"
                                    className="w-full sm:hidden text-gray-600 dark:text-gray-400"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Terminar sessão
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
