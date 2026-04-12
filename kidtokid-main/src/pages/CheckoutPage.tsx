import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useCart } from "@/src/contexts/CartContext"
import { useAuth } from "@/src/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { ArrowLeft, CreditCard, Store, Lock, Loader2, ExternalLink } from "lucide-react"
import { type PaymentMethod } from "@/src/services/orderService"
import { initiateStripePayment } from "@/src/services/paymentService"
import { validateCoupon } from "@/src/services/couponService"
import { getStoreSettings, type StoreSettings, defaultSettings } from "@/src/services/settingsService"
import { getConditionLabel } from "@/src/types"
import { createSecureOrderWithTimeout } from "@/src/lib/cloudFunctions"
import { validateEmail, validatePhone, validatePostalCode } from "@/src/lib/validators"

export default function CheckoutPage() {
    const { items, totalPrice, clearCart } = useCart()
    const { user, userData, isAuthenticated, isLoading } = useAuth()
    const navigate = useNavigate()

    const [isProcessing, setIsProcessing] = useState(false)
    const [orderCompleted, setOrderCompleted] = useState(false)
    const [storeSettings, setStoreSettings] = useState<StoreSettings>(defaultSettings)

    const [couponCode, setCouponCode] = useState('')
    const [couponDiscount, setCouponDiscount] = useState(0)
    const [, setCouponId] = useState<string | null>(null)
    const [couponError, setCouponError] = useState('')
    const [couponApplied, setCouponApplied] = useState(false)
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        paymentMethod: 'card' as PaymentMethod,
        shippingMethod: 'delivery' as 'delivery' | 'express' | 'pickup',
        customerNotes: ''
    })

    useEffect(() => {
        if (userData || user) {
            setFormData(prev => ({
                ...prev,
                name: userData?.firstName ? `${userData.firstName} ${userData.lastName || ''}`.trim() : prev.name,
                email: user?.email || prev.email,
                phone: userData?.phone || prev.phone,
            }))
        }
    }, [userData, user])

    useEffect(() => {
        getStoreSettings().then(setStoreSettings)
    }, [])

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            toast.error("Inicia sessão para continuar")
            navigate('/entrar?redirect=/checkout')
        }
    }, [isAuthenticated, isLoading, navigate])

    useEffect(() => {
        if (items.length === 0 && !isProcessing && !orderCompleted) {
            navigate('/carrinho')
        }
    }, [items.length, isProcessing, orderCompleted, navigate])

    if (items.length === 0 && !isProcessing && !orderCompleted) {
        return null
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target
        setFormData({ ...formData, [id]: value })
    }

    const shippingCost = formData.shippingMethod === 'pickup' 
        ? 0 
        : formData.shippingMethod === 'express'
            ? (totalPrice >= storeSettings.freeShippingThreshold ? 0 : storeSettings.expressShippingCost)
            : (totalPrice >= storeSettings.freeShippingThreshold ? 0 : storeSettings.standardShippingCost)
    const protectionFee = storeSettings.protectionFee ?? 0.50
    const total = Math.max(0, totalPrice - couponDiscount) + shippingCost + protectionFee

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return
        setIsValidatingCoupon(true)
        setCouponError('')
        try {
            const result = await validateCoupon(couponCode.trim(), totalPrice)
            if (result.valid && result.discount !== undefined && result.coupon) {
                setCouponDiscount(result.discount)
                setCouponId(result.coupon.id)
                setCouponApplied(true)
                setCouponError('')
                toast.success(`Cupão aplicado! -€${result.discount.toFixed(2)}`)
            } else {
                setCouponError(result.error || 'Cupão inválido')
                setCouponDiscount(0)
                setCouponId(null)
                setCouponApplied(false)
            }
        } catch {
            setCouponError('Erro ao validar cupão')
        } finally {
            setIsValidatingCoupon(false)
        }
    }

    const handleRemoveCoupon = () => {
        setCouponCode('')
        setCouponDiscount(0)
        setCouponId(null)
        setCouponApplied(false)
        setCouponError('')
    }

    const hasValidAddress = () => {
        if (formData.shippingMethod === 'pickup') return true
        return formData.address.trim() && formData.city.trim() && validatePostalCode(formData.postalCode)
    }

    const canProceed = () => {
        return formData.name.trim() && 
               validateEmail(formData.email) && 
               validatePhone(formData.phone) &&
               hasValidAddress()
    }

    const handleFinishOrder = async () => {
        if (!canProceed()) {
            if (!formData.name.trim()) toast.error("Introduz o teu nome")
            else if (!validateEmail(formData.email)) toast.error("Email inválido")
            else if (!validatePhone(formData.phone)) toast.error("Telemóvel inválido (9xxxxxxxx)")
            else if (!hasValidAddress()) toast.error("Completa a morada de entrega")
            return
        }

        setIsProcessing(true)

        try {
            const orderData = {
                items: items.map(item => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                })),
                shippingAddress: {
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    phone: formData.phone.replace(/\s/g, ''),
                    street: formData.shippingMethod === 'pickup' ? 'Levantamento em Loja' : formData.address.trim(),
                    city: formData.shippingMethod === 'pickup' ? storeSettings.storeCity : formData.city.trim(),
                    postalCode: formData.shippingMethod === 'pickup' ? storeSettings.storePostalCode : formData.postalCode.trim(),
                    country: 'Portugal'
                },
                shippingMethod: formData.shippingMethod,
                paymentMethod: formData.paymentMethod,
                customerNotes: formData.customerNotes?.substring(0, 500) || undefined,
                couponCode: couponApplied ? couponCode.trim() : undefined,
            }

            const result = await createSecureOrderWithTimeout(orderData, 30_000)
            const order = result.data as { orderId: string; orderNumber: string; total: number }

            if (formData.paymentMethod === 'card') {
                try {
                    setOrderCompleted(true)
                    await initiateStripePayment(order.orderId, order.orderNumber)
                    clearCart()
                    navigate(`/sucesso?order=${order.orderNumber}`)
                } catch (paymentError: unknown) {
                    console.error('Erro ao iniciar pagamento Stripe:', paymentError)
                    toast.error('Erro ao redirecionar para pagamento', { 
                        description: 'A encomenda foi criada. Podes tentar pagar depois na tua conta.' 
                    })
                    setOrderCompleted(true)
                    clearCart()
                    navigate(`/sucesso?order=${order.orderNumber}`)
                }
            } else {
                setOrderCompleted(true)
                clearCart()
                navigate(`/sucesso?order=${order.orderNumber}`)
            }

        } catch (error: unknown) {
            console.error('Erro ao criar encomenda:', error)
            const err = error as { details?: string; message?: string }
            const errorMessage = err?.details || err?.message || 'Tenta novamente.'
            toast.error("Erro ao processar encomenda", { description: errorMessage })
        } finally {
            setIsProcessing(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
        )
    }

    const paymentMethods = [
        { id: 'card', label: 'Cartão de Crédito/Débito', icon: CreditCard, desc: 'Visa, Mastercard, Apple Pay, Google Pay', enabled: true },
        { id: 'shop', label: 'Na Loja', icon: Store, desc: 'Paga ao levantar', enabled: storeSettings.shopPaymentEnabled && formData.shippingMethod === 'pickup' },
    ]

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            {/* Header */}
            <header className="bg-white dark:bg-gray-950 border-b dark:border-gray-700 sticky top-0 z-50">
                <div className="container mx-auto px-4 h-14 flex items-center justify-between">
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 text-sm"
                        aria-label="Voltar"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Voltar</span>
                    </button>
                    <Link to="/">
                        <img src="/logo.png" alt="Kid to Kid" className="h-7" />
                    </Link>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                        <Lock className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Pagamento Seguro</span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6 max-w-4xl">
                <div className="grid lg:grid-cols-5 gap-8">
                    
                    {/* Left — Form */}
                    <div className="lg:col-span-3 space-y-6">
                        
                        {/* Items */}
                        <section>
                            <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Os teus artigos ({items.length})</h2>
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
                                {items.map((item) => (
                                    <div key={item.product.id} className="p-3 flex gap-3">
                                        <div className="relative shrink-0">
                                            <img 
                                                src={item.product.images[0] || '/placeholder.svg'} 
                                                alt={item.product.title}
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                            {item.quantity > 1 && (
                                                <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                                                    {item.quantity}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{item.product.title}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.product.brand} · Tam. {item.product.size} · {getConditionLabel(item.product.condition)}</p>
                                        </div>
                                        <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">€{item.product.price.toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Shipping */}
                        <section>
                            <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Envio</h2>
                            <div className="space-y-2">
                                <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                    formData.shippingMethod === 'delivery' ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}>
                                    <input
                                        type="radio"
                                        name="shipping"
                                        checked={formData.shippingMethod === 'delivery'}
                                        onChange={() => setFormData({ ...formData, shippingMethod: 'delivery', paymentMethod: formData.paymentMethod === 'shop' ? 'card' : formData.paymentMethod })}
                                        className="accent-blue-600"
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Envio Standard</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">CTT Expresso · 2-4 dias úteis</p>
                                    </div>
                                    {totalPrice >= storeSettings.freeShippingThreshold ? (
                                        <span className="text-sm font-medium text-green-600">Grátis</span>
                                    ) : (
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">€{storeSettings.standardShippingCost.toFixed(2)}</span>
                                    )}
                                </label>

                                <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                    formData.shippingMethod === 'express' ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}>
                                    <input
                                        type="radio"
                                        name="shipping"
                                        checked={formData.shippingMethod === 'express'}
                                        onChange={() => setFormData({ ...formData, shippingMethod: 'express', paymentMethod: formData.paymentMethod === 'shop' ? 'card' : formData.paymentMethod })}
                                        className="accent-blue-600"
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Envio Expresso</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Entrega rápida · 1-2 dias úteis</p>
                                    </div>
                                    {totalPrice >= storeSettings.freeShippingThreshold ? (
                                        <span className="text-sm font-medium text-green-600">Grátis</span>
                                    ) : (
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">€{storeSettings.expressShippingCost.toFixed(2)}</span>
                                    )}
                                </label>

                                {storeSettings.pickupEnabled && (
                                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                        formData.shippingMethod === 'pickup' ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="shipping"
                                            checked={formData.shippingMethod === 'pickup'}
                                            onChange={() => setFormData({ ...formData, shippingMethod: 'pickup' })}
                                            className="accent-blue-600"
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Levantar na Loja</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{storeSettings.storeAddress}, {storeSettings.storeCity}</p>
                                        </div>
                                        <span className="text-sm font-medium text-green-600">Grátis</span>
                                    </label>
                                )}
                            </div>

                            {/* Address form */}
                            {formData.shippingMethod !== 'pickup' && (
                                <div className="mt-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Morada de Entrega</h3>
                                        <a
                                            href={`https://www.google.com/maps/search/${encodeURIComponent(
                                                [formData.address, formData.postalCode, formData.city].filter(Boolean).join(', ') || 'Portugal'
                                            )}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                            Google Maps
                                        </a>
                                    </div>
                                    <Input
                                        id="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="Rua, número, andar..."
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <Input
                                            id="postalCode"
                                            value={formData.postalCode}
                                            onChange={handleInputChange}
                                            placeholder="0000-000"
                                        />
                                        <Input
                                            id="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            placeholder="Cidade"
                                        />
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Payment */}
                        <section>
                            <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Pagamento</h2>
                            <div className="grid grid-cols-2 gap-2">
                                {paymentMethods.filter(m => m.enabled).map((method) => (
                                    <label
                                        key={method.id}
                                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                            formData.paymentMethod === method.id
                                                ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment"
                                            checked={formData.paymentMethod === method.id}
                                            onChange={() => setFormData({ ...formData, paymentMethod: method.id as PaymentMethod })}
                                            className="accent-blue-600"
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{method.label}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{method.desc}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </section>

                        {/* Personal data */}
                        <section>
                            <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Os teus dados</h2>
                            <div className="space-y-3">
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Nome completo"
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Email"
                                    />
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="Telemóvel (9xxxxxxxx)"
                                    />
                                </div>
                                <textarea
                                    id="customerNotes"
                                    value={formData.customerNotes}
                                    onChange={handleInputChange}
                                    placeholder="Ex: tocar à campainha, deixar no vizinho... (opcional)"
                                    rows={2}
                                    maxLength={500}
                                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-sm resize-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none dark:bg-gray-900 dark:text-gray-100"
                                />
                            </div>
                        </section>
                    </div>

                    {/* Right — Summary */}
                    <div className="lg:col-span-2">
                        <div className="lg:sticky lg:top-20">
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                                <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Resumo</h2>
                                
                                <div className="space-y-2.5 text-sm">
                                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                        <span>Artigos ({items.reduce((a, b) => a + b.quantity, 0)})</span>
                                        <span>€{totalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                        <span>Envio</span>
                                        {shippingCost === 0 ? (
                                            <span className="text-green-600 font-medium">Grátis</span>
                                        ) : (
                                            <span>€{shippingCost.toFixed(2)}</span>
                                        )}
                                    </div>
                                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                        <span>Proteção do comprador</span>
                                        <span>€{protectionFee.toFixed(2)}</span>
                                    </div>
                                    
                                    {couponDiscount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Cupão</span>
                                            <span>-€{couponDiscount.toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Coupon */}
                                <div className="border-t dark:border-gray-700 mt-3 pt-3">
                                    {couponApplied ? (
                                        <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 p-2 rounded text-sm">
                                            <span className="font-medium">{couponCode.toUpperCase()}</span>
                                            <button onClick={handleRemoveCoupon} className="text-xs hover:text-red-500">Remover</button>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={couponCode}
                                                    onChange={(e) => { setCouponCode(e.target.value); setCouponError('') }}
                                                    placeholder="Código do cupão"
                                                    className="text-sm h-9"
                                                    disabled={isValidatingCoupon}
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleApplyCoupon}
                                                    disabled={isValidatingCoupon || !couponCode.trim()}
                                                    className="shrink-0 h-9"
                                                >
                                                    {isValidatingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Aplicar'}
                                                </Button>
                                            </div>
                                            {couponError && <p className="text-xs text-red-500 mt-1.5">{couponError}</p>}
                                        </div>
                                    )}
                                </div>
                                
                                {totalPrice < storeSettings.freeShippingThreshold && formData.shippingMethod !== 'pickup' && (
                                    <p className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-950/30 p-2 rounded text-center mt-3">
                                        Faltam <strong>€{(storeSettings.freeShippingThreshold - totalPrice).toFixed(2)}</strong> para envio grátis
                                    </p>
                                )}
                                
                                <div className="border-t dark:border-gray-700 mt-3 pt-3">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-gray-900 dark:text-gray-100">Total</span>
                                        <span className="text-xl font-bold text-gray-900 dark:text-gray-100">€{total.toFixed(2)}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 text-right mt-0.5">IVA incluído</p>
                                </div>
                                
                                <Button 
                                    onClick={handleFinishOrder}
                                    disabled={isProcessing || !canProceed()}
                                    className="w-full h-11 mt-4 bg-blue-600 hover:bg-blue-700 font-medium disabled:opacity-50"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            A processar...
                                        </>
                                    ) : (
                                        <>Pagar €{total.toFixed(2)}</>
                                    )}
                                </Button>
                                
                                <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-3">
                                    Ao continuar, aceitas os{" "}
                                    <Link to="/termos-e-condicoes" className="text-blue-600 hover:underline">
                                        Termos e Condições
                                    </Link>
                                </p>
                            </div>

                            <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-3">
                                Compra segura · SSL encriptado
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
