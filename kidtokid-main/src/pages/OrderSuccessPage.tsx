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
    Home
} from "lucide-react"
import { getOrderByNumber, type Order, getPaymentMethodText } from "@/src/services/orderService"
import { getPaymentInstructions } from "@/src/services/paymentService"
import { useAuth } from "@/src/contexts/AuthContext"
import confetti from 'canvas-confetti'

export default function OrderSuccessPage() {
    const [searchParams] = useSearchParams()
    const orderNumber = searchParams.get('order')
    const { user } = useAuth()
    
    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)

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
                    console.error('Erro ao carregar encomenda:', error)
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

    return (
        <div className="min-h-screen bg-linear-to-b from-green-50 via-white to-gray-50">
            {/* Minimal Header */}
            <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
                <div className="container mx-auto px-4 h-14 flex items-center justify-center">
                    <Link to="/" className="flex items-center gap-2">
                        <img src="/logo.png" alt="Kid to Kid" className="h-7" />
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 md:py-12">
                <div className="max-w-xl mx-auto">
                    
                    {/* Success Animation - Vinted Style */}
                    <div className="text-center mb-8">
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

                        <h1 className="mb-2 text-2xl md:text-3xl font-bold text-gray-900">
                            Encomenda Confirmada
                        </h1>
                        <p className="text-gray-600 max-w-sm mx-auto">
                            Obrigado pela tua compra! Preparámos tudo com muito carinho para ti.
                        </p>
                    </div>

                    {/* Order Number - Vinted Style */}
                    <div className="bg-white rounded-2xl border-2 border-dashed border-k2k-blue/30 p-5 mb-6 text-center">
                        <p className="text-sm text-gray-500 mb-2">Número da Encomenda</p>
                        <div className="flex items-center justify-center gap-3">
                            <p className="font-mono font-bold text-2xl md:text-3xl text-k2k-blue">
                                #{orderNumber || '------'}
                            </p>
                            <button 
                                onClick={handleCopyOrderNumber}
                                className={`p-2 rounded-lg transition-all ${copied ? 'bg-green-100 text-green-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                            >
                                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                            </button>
                        </div>
                        {copied && <p className="text-xs text-green-600 mt-2">Copiado!</p>}
                    </div>

                    {/* Order Details */}
                    {loading ? (
                        <Card className="p-8 rounded-2xl">
                            <div className="flex flex-col items-center gap-3">
                                <div className="h-8 w-8 animate-spin rounded-full border-2 border-k2k-blue border-t-transparent" />
                                <p className="text-sm text-gray-500">A carregar detalhes...</p>
                            </div>
                        </Card>
                    ) : order ? (
                        <div className="space-y-4">
                            {/* Items Summary */}
                            <Card className="rounded-2xl overflow-hidden">
                                <div className="p-4 border-b bg-gray-50">
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
                                                className="w-16 h-16 rounded-xl object-cover bg-gray-100"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm line-clamp-1">{item.title}</p>
                                                <p className="text-xs text-gray-500">{item.brand} • Tam. {item.size}</p>
                                            </div>
                                            <p className="font-semibold text-gray-900">€{item.price.toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t p-4 bg-gray-50">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-gray-900">Total pago</span>
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
                                    <p className="font-medium text-sm text-gray-900 mb-1">
                                        {order.shippingMethod === 'pickup' ? 'Levantamento' : 'Envio'}
                                    </p>
                                    <p className="text-xs text-gray-500 line-clamp-2">
                                        {order.shippingAddress.street}
                                    </p>
                                </Card>

                                <Card className="p-4 rounded-2xl">
                                    <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 mb-3 flex items-center justify-center">
                                        <CreditCard className="h-5 w-5" />
                                    </div>
                                    <p className="font-medium text-sm text-gray-900 mb-1">Pagamento</p>
                                    <p className="text-xs text-gray-500">{getPaymentMethodText(order.paymentMethod)}</p>
                                </Card>
                            </div>

                            {/* Payment Instructions */}
                            {(order.paymentMethod as string) === 'multibanco' && order.paymentReference && (
                                <Card className="p-4 rounded-2xl border-blue-200 bg-blue-50">
                                    <div className="flex gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                                            <CreditCard className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-blue-800 text-sm mb-2">Dados Multibanco</p>
                                            <div className="bg-white rounded-lg p-3 space-y-1 font-mono text-sm">
                                                <p className="text-gray-600">{order.paymentReference}</p>
                                                <p className="text-gray-600">Montante: <span className="font-bold text-gray-900">€{order.total.toFixed(2)}</span></p>
                                            </div>
                                            <p className="text-xs text-blue-600 mt-2">Válido por 48 horas</p>
                                        </div>
                                    </div>
                                </Card>
                            )}

                            <Card className="p-4 rounded-2xl border-amber-200 bg-amber-50">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
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
                                    <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                        <Mail className="h-5 w-5 text-k2k-blue" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">Confirmação por Email</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Enviámos todos os detalhes para o teu email.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                                        <ShieldCheck className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">Compra Protegida</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            A tua encomenda está protegida até à entrega.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* CTA Buttons - Vinted Style */}
                    <div className="space-y-3 mt-8">
                        <Link to="/">
                            <Button className="w-full h-12 text-base font-semibold bg-k2k-blue hover:bg-k2k-blue/90 rounded-xl">
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
                    <div className="mt-8 text-center">
                        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm">
                            <ShieldCheck className="h-4 w-4" />
                            Compra 100% Segura
                        </div>
                    </div>

                    {/* Help note */}
                    <p className="text-center text-xs text-gray-500 mt-6">
                        Dúvidas? Contacta-nos via{' '}
                        <a href="mailto:info@kidtokid.pt" className="text-k2k-blue hover:underline">info@kidtokid.pt</a>
                        {' '}ou visita a nossa <Link to="/ajuda" className="text-k2k-blue hover:underline">página de ajuda</Link>.
                    </p>
                </div>
            </main>
        </div>
    )
}
