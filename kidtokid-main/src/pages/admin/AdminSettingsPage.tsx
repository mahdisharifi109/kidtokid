import { useEffect, useState } from "react"
import { AdminLayout } from "@/src/components/admin/AdminLayout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
    Save,
    Store,
    Mail,
    Phone,
    MapPin,
    Clock,
    Truck,
    CreditCard,
    Shield,
    Bell,
    Globe,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Euro,
    Package,
    Palette
} from "lucide-react"
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore"
import { db } from "@/src/lib/firebase"
import { toast } from "sonner"
import { type StoreSettings, defaultSettings } from "@/src/services/settingsService"
import { COLOR_SCHEMES, useAdminTheme } from "@/src/contexts/AdminThemeContext"

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<StoreSettings>(defaultSettings)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState("appearance")
    const { scheme, setSchemeId } = useAdminTheme()

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        try {
            const docRef = doc(db, "settings", "store")
            const docSnap = await getDoc(docRef)
            
            if (docSnap.exists()) {
                setSettings({ ...defaultSettings, ...docSnap.data() as StoreSettings })
            }
        } catch (error) {
            console.error("Ups! Problema ao carregar definições:", error)
            toast.error("Ups! Problema ao carregar definições")
        } finally {
            setLoading(false)
        }
    }

    const saveSettings = async () => {
        setSaving(true)
        try {
            await setDoc(doc(db, "settings", "store"), {
                ...settings,
                updatedAt: Timestamp.now()
            })
            toast.success("Definições guardadas com sucesso!")
        } catch (error) {
            console.error("Ups! Problema ao guardar:", error)
            toast.error("Ups! Problema ao guardar definições")
        } finally {
            setSaving(false)
        }
    }

    const handleInputChange = (field: keyof StoreSettings, value: string | number | boolean) => {
        setSettings(prev => ({ ...prev, [field]: value }))
    }

    const tabs = [
        { id: "appearance", label: "Aparência", icon: Palette },
        { id: "store", label: "Loja", icon: Store },
        { id: "shipping", label: "Envio", icon: Truck },
        { id: "payment", label: "Pagamentos", icon: CreditCard },
        { id: "notifications", label: "Notificações", icon: Bell },
        { id: "seo", label: "SEO", icon: Globe },
        { id: "security", label: "Segurança", icon: Shield }
    ]

    if (loading) {
        return (
            <AdminLayout title="Definições" subtitle="A carregar as tuas preferências...">
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400 dark:text-gray-500" />
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout title="Definições" subtitle="Personaliza a loja ao teu gosto">
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Tabs Sidebar */}
                <div className="lg:w-64 shrink-0">
                    <Card className="p-2">
                        <nav className="space-y-1">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${
                                        activeTab === tab.id 
                                            ? 'bg-blue-50 text-blue-700 font-medium' 
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <tab.icon className="h-5 w-5" />
                                    <span className="font-medium">{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                    </Card>
                </div>

                {/* Content */}
                <div className="flex-1">
                    {/* Appearance / Color Scheme */}
                    {activeTab === "appearance" && (
                        <Card className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Palette className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Esquema de Cores do Admin</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Personalize o visual do painel de administração</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {COLOR_SCHEMES.map((cs) => {
                                    const isSelected = scheme.id === cs.id
                                    return (
                                        <label
                                            key={cs.id}
                                            className={`relative cursor-pointer rounded-lg border-2 p-3 transition-all ${
                                                isSelected
                                                    ? "border-blue-600 ring-2 ring-blue-100"
                                                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="admin-color-scheme"
                                                value={cs.id}
                                                checked={isSelected}
                                                onChange={() => setSchemeId(cs.id)}
                                                className="sr-only"
                                            />
                                            {/* Radio circle */}
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                                    isSelected ? "border-blue-600" : "border-gray-400"
                                                }`}>
                                                    {isSelected && (
                                                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                                                    )}
                                                </div>
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{cs.name}</span>
                                            </div>
                                            {/* Color swatches — WordPress style */}
                                            <div className="flex rounded-md overflow-hidden h-7">
                                                {cs.swatches.map((color, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex-1"
                                                        style={{ backgroundColor: color }}
                                                    />
                                                ))}
                                            </div>
                                        </label>
                                    )
                                })}
                            </div>
                        </Card>
                    )}

                    {/* Store Info */}
                    {activeTab === "store" && (
                        <Card className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Store className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Informações da Loja</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Os dados que os clientes vêem sobre a tua loja</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="storeName">Nome da Loja</Label>
                                        <Input
                                            id="storeName"
                                            value={settings.storeName}
                                            onChange={(e) => handleInputChange('storeName', e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="storeEmail">Email</Label>
                                        <div className="relative mt-1">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                            <Input
                                                id="storeEmail"
                                                type="email"
                                                value={settings.storeEmail}
                                                onChange={(e) => handleInputChange('storeEmail', e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="storePhone">Telefone</Label>
                                    <div className="relative mt-1">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                        <Input
                                            id="storePhone"
                                            value={settings.storePhone}
                                            onChange={(e) => handleInputChange('storePhone', e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        Morada
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="storeAddress">Rua</Label>
                                            <Input
                                                id="storeAddress"
                                                value={settings.storeAddress}
                                                onChange={(e) => handleInputChange('storeAddress', e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="storeCity">Cidade</Label>
                                                <Input
                                                    id="storeCity"
                                                    value={settings.storeCity}
                                                    onChange={(e) => handleInputChange('storeCity', e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="storePostalCode">Código Postal</Label>
                                                <Input
                                                    id="storePostalCode"
                                                    value={settings.storePostalCode}
                                                    onChange={(e) => handleInputChange('storePostalCode', e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Horário de Funcionamento
                                    </h3>
                                    <div className="grid sm:grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="weekdayHours">Seg - Sex</Label>
                                            <Input
                                                id="weekdayHours"
                                                value={settings.weekdayHours}
                                                onChange={(e) => handleInputChange('weekdayHours', e.target.value)}
                                                placeholder="10:00 - 19:00"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="saturdayHours">Sábado</Label>
                                            <Input
                                                id="saturdayHours"
                                                value={settings.saturdayHours}
                                                onChange={(e) => handleInputChange('saturdayHours', e.target.value)}
                                                placeholder="10:00 - 13:00"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="sundayHours">Domingo</Label>
                                            <Input
                                                id="sundayHours"
                                                value={settings.sundayHours}
                                                onChange={(e) => handleInputChange('sundayHours', e.target.value)}
                                                placeholder="Fechado"
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Shipping */}
                    {activeTab === "shipping" && (
                        <Card className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Truck className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Opções de Envio</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Define custos e métodos de entrega para os teus clientes</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid sm:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="freeShippingThreshold">Envio Grátis a partir de (€)</Label>
                                        <div className="relative mt-1">
                                            <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                            <Input
                                                id="freeShippingThreshold"
                                                type="number"
                                                step="0.01"
                                                value={settings.freeShippingThreshold}
                                                onChange={(e) => handleInputChange('freeShippingThreshold', parseFloat(e.target.value) || 0)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="standardShippingCost">Envio Standard (€)</Label>
                                        <div className="relative mt-1">
                                            <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                            <Input
                                                id="standardShippingCost"
                                                type="number"
                                                step="0.01"
                                                value={settings.standardShippingCost}
                                                onChange={(e) => handleInputChange('standardShippingCost', parseFloat(e.target.value) || 0)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="expressShippingCost">Envio Expresso (€)</Label>
                                        <div className="relative mt-1">
                                            <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                            <Input
                                                id="expressShippingCost"
                                                type="number"
                                                step="0.01"
                                                value={settings.expressShippingCost}
                                                onChange={(e) => handleInputChange('expressShippingCost', parseFloat(e.target.value) || 0)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <Label htmlFor="protectionFee">Taxa de Proteção do Comprador (€)</Label>
                                        <div className="relative mt-1">
                                            <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                            <Input
                                                id="protectionFee"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={settings.protectionFee ?? 0.50}
                                                onChange={(e) => handleInputChange('protectionFee', parseFloat(e.target.value) || 0)}
                                                className="pl-10"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Taxa adicionada no checkout para proteção do comprador. Coloque 0 para desativar.</p>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Métodos de Entrega</h3>
                                    <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={settings.pickupEnabled}
                                            onChange={(e) => handleInputChange('pickupEnabled', e.target.checked)}
                                            className="h-5 w-5 rounded border-gray-300 text-k2k-blue focus:ring-k2k-blue"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 dark:text-gray-100">Levantamento em Loja</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Os clientes podem levantar na loja sem custos de envio</p>
                                        </div>
                                        <Package className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                    </label>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Payment */}
                    {activeTab === "payment" && (
                        <Card className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <CreditCard className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Métodos de Pagamento</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Escolhe como os teus clientes podem pagar</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { id: 'stripeEnabled', label: 'Stripe (Cartão)', desc: 'Visa, Mastercard, Apple Pay, Google Pay via Stripe' },
                                    { id: 'shopPaymentEnabled', label: 'Pagamento na Loja', desc: 'Pagar ao levantar a encomenda' },
                                ].map(method => (
                                    <label 
                                        key={method.id}
                                        className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={settings[method.id as keyof StoreSettings] as boolean}
                                            onChange={(e) => handleInputChange(method.id as keyof StoreSettings, e.target.checked)}
                                            className="h-5 w-5 rounded border-gray-300 text-k2k-blue focus:ring-k2k-blue"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 dark:text-gray-100">{method.label}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{method.desc}</p>
                                        </div>
                                        {settings[method.id as keyof StoreSettings] ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        ) : (
                                            <AlertCircle className="h-5 w-5 text-gray-300" />
                                        )}
                                    </label>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Notifications */}
                    {activeTab === "notifications" && (
                        <Card className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Bell className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notificações</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Fique a par de tudo o que acontece na loja</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <Label htmlFor="orderNotificationEmail">Email para Notificações de Encomendas</Label>
                                    <div className="relative mt-1">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                        <Input
                                            id="orderNotificationEmail"
                                            type="email"
                                            value={settings.orderNotificationEmail}
                                            onChange={(e) => handleInputChange('orderNotificationEmail', e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Receberá um email sempre que entrar uma nova encomenda</p>
                                </div>

                                <div>
                                    <Label htmlFor="lowStockThreshold">Alerta de Stock Baixo</Label>
                                    <Input
                                        id="lowStockThreshold"
                                        type="number"
                                        min="1"
                                        value={settings.lowStockThreshold}
                                        onChange={(e) => handleInputChange('lowStockThreshold', parseInt(e.target.value) || 1)}
                                        className="mt-1 max-w-xs"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Receber aviso quando um produto tiver menos de X unidades</p>
                                </div>

                                <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={settings.emailNotificationsEnabled}
                                        onChange={(e) => handleInputChange('emailNotificationsEnabled', e.target.checked)}
                                        className="h-5 w-5 rounded border-gray-300 text-k2k-blue focus:ring-k2k-blue"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 dark:text-gray-100">Ativar Notificações por Email</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Receber emails sobre novas encomendas e stock baixo</p>
                                    </div>
                                </label>
                            </div>
                        </Card>
                    )}

                    {/* SEO */}
                    {activeTab === "seo" && (
                        <Card className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Globe className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">SEO e Redes Sociais</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Ajuda os clientes a encontrar a tua loja no Google</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <Label htmlFor="seoTitle">Título do Site</Label>
                                    <Input
                                        id="seoTitle"
                                        value={settings.seoTitle}
                                        onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                                        className="mt-1"
                                        maxLength={60}
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{settings.seoTitle.length}/60 caracteres (recomendado)</p>
                                </div>

                                <div>
                                    <Label htmlFor="seoDescription">Descrição do Site</Label>
                                    <textarea
                                        id="seoDescription"
                                        value={settings.seoDescription}
                                        onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                                        rows={3}
                                        maxLength={160}
                                        className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-sm focus:border-k2k-blue focus:ring-1 focus:ring-k2k-blue focus:outline-none resize-none"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{settings.seoDescription.length}/160 caracteres (recomendado)</p>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Pré-visualização no Google:</p>
                                    <div className="bg-white dark:bg-gray-900 border rounded-lg p-3">
                                        <p className="text-blue-600 text-lg hover:underline cursor-pointer">{settings.seoTitle}</p>
                                        <p className="text-green-700 text-sm">https://kidtokid.pt</p>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{settings.seoDescription}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Security */}
                    {activeTab === "security" && (
                        <Card className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Shield className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Segurança e Acesso</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Mantém a tua loja protegida e segura</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-center gap-3 p-4 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition-colors border border-red-200">
                                    <input
                                        type="checkbox"
                                        checked={settings.maintenanceMode}
                                        onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                                        className="h-5 w-5 rounded border-red-300 text-red-600 focus:ring-red-500"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-red-900">Modo de Manutenção</p>
                                        <p className="text-sm text-red-700">Atenção: quando ativo, só administradores acedem ao site</p>
                                    </div>
                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                </label>

                                <div className="border-t border-gray-100 dark:border-gray-800 pt-6 mt-6">
                                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Estatísticas de Segurança</h3>
                                    <div className="grid sm:grid-cols-3 gap-4">
                                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                                            <CheckCircle2 className="h-5 w-5 text-gray-500 dark:text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">SSL Ativo</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Conexão encriptada</p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                                            <CheckCircle2 className="h-5 w-5 text-gray-500 dark:text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Firestore Rules</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Regras configuradas</p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                                            <CheckCircle2 className="h-5 w-5 text-gray-500 dark:text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Rate Limiting</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Proteção ativa</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Save Button */}
                    <div className="mt-6 flex justify-end">
                        <Button 
                            onClick={saveSettings}
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-700 px-8"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    A guardar...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Guardar Definições
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
