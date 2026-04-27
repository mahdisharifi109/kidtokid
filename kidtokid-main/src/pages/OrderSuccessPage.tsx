import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
    CheckCircle2, 
    Package, 
    Mail, 
    CreditCard, 
    Copy, 
    Check, 
    Truck, 
    Store, 
    Clock, 
    Heart,
    ShieldCheck,
    Sparkles,
    Home,
    Printer,
    FileText,
    AlertCircle
} from "lucide-react"
import { getOrderByNumber, type Order, getPaymentMethodText } from "@/src/services/orderService"
import { getPaymentInstructions, initiateStripePayment } from "@/src/services/paymentService"
import { useAuth } from "@/src/contexts/AuthContext"
import { toast } from "sonner"
import confetti from 'canvas-confetti'

export default function OrderSuccessPage() {
    const [searchParams] = useSearchParams()
    const orderNumber = searchParams.get('order')
    const { user } = useAuth()
    
    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)
    const [isRetrying, setIsRetrying] = useState(false)

    const isPaid = order?.paymentStatus === 'paid'
    const isPending = order?.paymentStatus === 'pending'

    // Confetti effect on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            try {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#00a0e3', '#E4007C', '#10b981', '#fbbf24']
                })
            } catch {
                // Confetti library might not be installed
            }
        }, 300)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        const fetchOrder = async () => {
            if (orderNumber && user) {
                try {
                    const orderData = await getOrderByNumber(orderNumber)
                    if (orderData && orderData.userId === user.uid) {
                        setOrder(orderData)
                    }
                } catch (error) {
                    console.error('Ups! Problema ao carregar encomenda:', error)
                }
            }
            setLoading(false)
        }

        fetchOrder()
    }, [orderNumber, user])

    const handleCopyOrderNumber = () => {
        if (orderNumber) {
            navigator.clipboard.writeText(orderNumber)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handlePrintInvoice = () => {
        window.print()
    }

    const handleRetryPayment = async () => {
        if (!order || order.paymentMethod !== 'card') return
        setIsRetrying(true)
        try {
            await initiateStripePayment(order.id, order.orderNumber)
        } catch (error: unknown) {
            console.error('Ups! Problema ao iniciar pagamento Stripe:', error)
            toast.error('Não foi possível redirecionar para o pagamento', { 
                description: 'Tenta novamente mais tarde.' 
            })
            setIsRetrying(false)
        }
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-green-50 dark:from-green-950/20 via-white dark:via-gray-950 to-gray-50 dark:to-gray-950">
            {/* Print-only styles */}
            <style>{`
                @media print {
                    body { background: white !important; }
                    header, .no-print, footer { display: none !important; }
                    .print-only { display: block !important; }
                    .print-invoice { 
                        box-shadow: none !important; 
                        border: none !important;
                        max-width: 100% !important;
                        padding: 0 !important;
                    }
                    * { color: #333 !important; background: white !important; }
                }
            `}</style>

            {/* Minimal Header */}
            <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b sticky top-0 z-50 no-print">
                <div className="container mx-auto px-4 h-14 flex items-center justify-center">
                    <Link to="/" className="flex items-center gap-2">
                        <img src="/logo.png" alt="Kid to Kid" className="h-7" />
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 md:py-12">
                <div className="max-w-xl mx-auto">
                    
                    {/* Success Animation */}
                    <div className="text-center mb-8 no-print">
                        <div className="mb-6 flex justify-center">
                            <div className="relative">
                                <div className="h-28 w-28 rounded-full bg-green-100 flex items-center justify-center animate-in zoom-in duration-500 shadow-lg shadow-green-100">
                                    <CheckCircle2 className="h-14 w-14 text-green-500" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-k2k-pink flex items-center justify-center animate-bounce shadow-lg">
                                    <Heart className="h-5 w-5 text-white fill-white" />
                                </div>
                                <div className="absolute -top-1 -left-1 h-7 w-7 rounded-full bg-k2k-blue flex items-center justify-center animate-pulse">
                                    <Sparkles className="h-4 w-4 text-white" />
                                </div>
                            </div>
                        </div>

                        <h1 className="mb-2 text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                            Encomenda Confirmada
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
                            Obrigado pela tua compra! Preparámos tudo com muito carinho para ti.
                        </p>
                    </div>

                    {/* Order Number */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-dashed border-k2k-blue/30 p-5 mb-6 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Número da Encomenda</p>
                        <div className="flex items-center justify-center gap-3">
                            <p className="font-mono font-bold text-2xl md:text-3xl text-k2k-blue">
                                #{orderNumber || '------'}
                            </p>
                            <button 
                                onClick={handleCopyOrderNumber}
                                className={`p-2 rounded-lg transition-all no-print ${copied ? 'bg-green-100 text-green-600' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
                            >
                                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                            </button>
                        </div>
                        {copied && <p className="text-xs text-green-600 mt-2">Copiado!</p>}
                    </div>

                    {/* Payment Status Badge */}
                    {order && (
                        <div className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl mb-6 text-sm font-medium ${
                            isPaid 
                                ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400' 
                                : isPending
                                    ? 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400'
                                    : 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                        }`}>
                            {isPaid ? (
                                <><CheckCircle2 className="h-4 w-4" /> Pagamento Confirmado</>
                            ) : isPending ? (
                                <><Clock className="h-4 w-4" /> Aguarda Pagamento</>
                            ) : (
                                <><AlertCircle className="h-4 w-4" /> Pagamento {order.paymentStatus}</>
                            )}
                        </div>
                    )}

                    {/* Order Details */}
                    {loading ? (
                        <Card className="p-8 rounded-2xl">
                            <div className="flex flex-col items-center gap-3">
                                <div className="h-8 w-8 animate-spin rounded-full border-2 border-k2k-blue border-t-transparent" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">A carregar detalhes...</p>
                            </div>
                        </Card>
                    ) : order ? (
                        <div className="space-y-4 print-invoice">
                            {/* Items Summary */}
                            <Card className="rounded-2xl overflow-hidden">
                                <div className="p-4 border-b bg-gray-50 dark:bg-gray-800">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <Package className="h-5 w-5 text-k2k-blue" />
                                        Os teus artigos ({order.items.length})
                                    </h3>
                                </div>
                                <div className="p-4 space-y-3 max-h-60 overflow-y-auto">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="flex gap-3">
                                            <img 
                                                src={item.image} 
                                                alt={item.title}
                                                className="w-16 h-16 rounded-xl object-cover bg-gray-100 dark:bg-gray-800"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm line-clamp-1">{item.title}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{item.brand} • Tam. {item.size}</p>
                                                {item.quantity > 1 && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">x{item.quantity}</p>
                                                )}
                                            </div>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">€{(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Invoice / Financial Summary */}
                                <div className="border-t p-4 bg-gray-50 dark:bg-gray-800 space-y-2">
                                    <div className="flex items-center gap-2 mb-3">
                                        <FileText className="h-4 w-4 text-k2k-blue" />
                                        <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Fatura</h4>
                                    </div>
                                    
                                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                        <span>Subtotal</span>
                                        <span>€{order.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                        <span>Envio</span>
                                        {order.shippingCost === 0 ? (
                                            <span className="text-green-600 font-medium">Grátis</span>
                                        ) : (
                                            <span>€{order.shippingCost.toFixed(2)}</span>
                                        )}
                                    </div>
                                    {(order as any).protectionFee > 0 && (
                                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                            <span>Proteção do comprador</span>
                                            <span>€{(order as any).protectionFee.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {order.discount > 0 && (
                                        <div className="flex justify-between text-sm text-green-600">
                                            <span>Desconto {order.couponCode ? `(${order.couponCode})` : ''}</span>
                                            <span>-€{order.discount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center pt-3 border-t border-dashed">
                                        <span className="font-semibold text-gray-900 dark:text-gray-100">Total</span>
                                        <span className="font-bold text-xl text-k2k-blue">€{order.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </Card>

                            {/* Delivery & Payment Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <Card className="p-4 rounded-2xl">
                                    <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center ${order.shippingMethod === 'pickup' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-k2k-blue'}`}>
                                        {order.shippingMethod === 'pickup' ? <Store className="h-5 w-5" /> : <Truck className="h-5 w-5" />}
                                    </div>
                                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1">
                                        {order.shippingMethod === 'pickup' ? 'Levantamento' : 'Envio'}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                        {order.shippingAddress.street}
                                    </p>
                                </Card>

                                <Card className="p-4 rounded-2xl">
                                    <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center ${isPaid ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                        <CreditCard className="h-5 w-5" />
                                    </div>
                                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1">Pagamento</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{getPaymentMethodText(order.paymentMethod)}</p>
                                </Card>
                            </div>

                            {/* Order Date & Details (for print) */}
                            <Card className="p-4 rounded-2xl">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">Data</p>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                            {order.createdAt.toLocaleDateString('pt-PT', { 
                                                day: 'numeric', month: 'long', year: 'numeric' 
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">Morada</p>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                            {order.shippingAddress.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {order.shippingAddress.street}, {order.shippingAddress.postalCode} {order.shippingAddress.city}
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            {/* Print Invoice Button / Pay Button */}
                            <div className="flex flex-col gap-3 no-print">
                                {order.paymentMethod === 'card' && isPending && (
                                    <Button 
                                        onClick={handleRetryPayment}
                                        className="w-full h-11 rounded-xl bg-k2k-blue hover:bg-k2k-blue/90 text-white"
                                        disabled={isRetrying}
                                    >
                                        {isRetrying ? (
                                            <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        ) : (
                                            <CreditCard className="h-4 w-4 mr-2" />
                                        )}
                                        {isRetrying ? "A redirecionar..." : "Pagar Agora"}
                                    </Button>
                                )}
                                
                                <Button 
                                    onClick={handlePrintInvoice}
                                    variant="outline"
                                    className="w-full h-11 rounded-xl"
                                >
                                    <Printer className="h-4 w-4 mr-2" />
                                    {isPaid || order.paymentMethod === 'shop' ? 'Imprimir Fatura' : 'Imprimir Resumo'}
                                </Button>
                            </div>

                            {/* Payment Instructions */}
                            {(order.paymentMethod as string) === 'multibanco' && order.paymentReference && (
                                <Card className="p-4 rounded-2xl border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
                                    <div className="flex gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                                            <CreditCard className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-blue-800 text-sm mb-2">Dados Multibanco</p>
                                            <div className="bg-white dark:bg-gray-900 rounded-lg p-3 space-y-1 font-mono text-sm">
                                                <p className="text-gray-600 dark:text-gray-400">{order.paymentReference}</p>
                                                <p className="text-gray-600 dark:text-gray-400">Montante: <span className="font-bold text-gray-900 dark:text-gray-100">€{order.total.toFixed(2)}</span></p>
                                            </div>
                                            <p className="text-xs text-blue-600 mt-2">Válido por 48 horas</p>
                                        </div>
                                    </div>
                                </Card>
                            )}

                            <Card className="p-4 rounded-2xl border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 no-print">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                                        <Clock className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-amber-800 text-sm">Próximo Passo</p>
                                        <p className="text-xs text-amber-700 mt-1">
                                            {getPaymentInstructions(order.paymentMethod)}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    ) : (
                        /* Fallback Info */
                        <Card className="p-6 rounded-2xl">
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                        <Mail className="h-5 w-5 text-k2k-blue" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">Confirmação por Email</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Enviámos todos os detalhes para o teu email.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                                        <ShieldCheck className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">Compra Protegida</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            A tua encomenda está protegida até à entrega.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* CTA Buttons */}
                    <div className="space-y-3 mt-8 no-print">
                        <Link to="/">
                            <Button className="w-full h-12 text-base font-semibold bg-k2k-blue hover:bg-k2k-blue/90 text-white rounded-xl">
                                <Home className="mr-2 h-5 w-5" />
                                Continuar a comprar
                            </Button>
                        </Link>
                        <Link to="/minha-conta?tab=encomendas">
                            <Button variant="outline" className="w-full h-12 text-base rounded-xl">
                                <Package className="mr-2 h-5 w-5" />
                                Ver minhas encomendas
                            </Button>
                        </Link>
                    </div>

                    {/* Trust Badge */}
                    <div className="mt-8 text-center no-print">
                        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm">
                            <ShieldCheck className="h-4 w-4" />
                            Compra 100% Segura
                        </div>
                    </div>

                    {/* Help note */}
                    <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6 no-print">
                        Dúvidas? Contacta-nos via{' '}
                        <a href="mailto:info@kidtokid.pt" className="text-k2k-blue hover:underline">info@kidtokid.pt</a>
                        {' '}ou visita a nossa <Link to="/ajuda" className="text-k2k-blue hover:underline">página de ajuda</Link>.
                    </p>
                </div>
            </main>
        </div>
    )
}
