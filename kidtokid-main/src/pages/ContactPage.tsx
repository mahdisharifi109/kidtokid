import { useState, useEffect } from "react"
import { usePageTitle } from "@/src/hooks/usePageTitle"
import { Header } from "@/src/components/layout/Header"
import { Footer } from "@/src/components/Footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Phone, Mail, Clock, Send, Loader2, CheckCircle } from "lucide-react"
import { collection, addDoc, Timestamp } from "firebase/firestore"
import { db } from "@/src/lib/firebase"
import { getStoreSettings, defaultSettings, type StoreSettings } from "@/src/services/settingsService"
import { toast } from "sonner"

const subjects = [
    "Dúvida sobre um produto",
    "Estado da minha encomenda",
    "Devoluções e trocas",
    "Problema com pagamento",
    "Quero vender artigos",
    "Sugestão ou elogio",
    "Outro assunto",
]

export default function ContactPage() {
    const [settings, setSettings] = useState<StoreSettings>(defaultSettings)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
    })

    usePageTitle("Contacto")

    useEffect(() => {
        getStoreSettings().then(setSettings)
    }, [])

    const updateField = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!form.name.trim() || !form.email.trim() || !form.subject || !form.message.trim()) {
            toast.error("Preenche todos os campos obrigatórios")
            return
        }

        if (form.message.trim().length < 10) {
            toast.error("A mensagem deve ter pelo menos 10 caracteres")
            return
        }

        setIsSubmitting(true)
        try {
            await addDoc(collection(db, "contacts"), {
                name: form.name.trim(),
                email: form.email.trim().toLowerCase(),
                phone: form.phone.trim() || null,
                subject: form.subject,
                message: form.message.trim(),
                read: false,
                createdAt: Timestamp.now(),
            })
            setSubmitted(true)
        } catch (error) {
            console.error("Erro ao enviar mensagem:", error)
            toast.error("Não conseguimos enviar a mensagem. Tenta novamente.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex flex-col bg-white">
                <Header />
                <main className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-5">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Mensagem enviada!</h1>
                    <p className="text-gray-500 max-w-sm mb-6">
                        Obrigado por nos contactar. Vamos responder o mais rápido possível, normalmente em 24 horas.
                    </p>
                    <Button
                        onClick={() => {
                            setSubmitted(false)
                            setForm({ name: "", email: "", phone: "", subject: "", message: "" })
                        }}
                        variant="outline"
                    >
                        Enviar outra mensagem
                    </Button>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-5xl">
                <div className="text-center mb-8 md:mb-10">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Fala connosco</h1>
                    <p className="text-gray-500 max-w-lg mx-auto">
                        Tens alguma dúvida ou sugestão? Estamos aqui para ajudar.
                    </p>
                </div>

                <div className="grid md:grid-cols-5 gap-8 md:gap-12">
                    {/* Formulário */}
                    <div className="md:col-span-3">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Nome *
                                    </label>
                                    <Input
                                        id="contact-name"
                                        value={form.name}
                                        onChange={(e) => updateField("name", e.target.value)}
                                        placeholder="O teu nome"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Email *
                                    </label>
                                    <Input
                                        id="contact-email"
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => updateField("email", e.target.value)}
                                        placeholder="email@exemplo.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Telefone <span className="text-gray-400 font-normal">(opcional)</span>
                                    </label>
                                    <Input
                                        id="contact-phone"
                                        type="tel"
                                        value={form.phone}
                                        onChange={(e) => updateField("phone", e.target.value)}
                                        placeholder="912 345 678"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="contact-subject" className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Assunto *
                                    </label>
                                    <select
                                        id="contact-subject"
                                        value={form.subject}
                                        onChange={(e) => updateField("subject", e.target.value)}
                                        required
                                        className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                                    >
                                        <option value="">Seleciona um assunto</option>
                                        {subjects.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Mensagem *
                                </label>
                                <textarea
                                    id="contact-message"
                                    value={form.message}
                                    onChange={(e) => updateField("message", e.target.value)}
                                    placeholder="Escreve a tua mensagem aqui..."
                                    required
                                    minLength={10}
                                    maxLength={2000}
                                    rows={5}
                                    className="flex w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none resize-none"
                                />
                                <p className="text-xs text-gray-400 mt-1 text-right">
                                    {form.message.length}/2000
                                </p>
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full sm:w-auto h-11 px-8 bg-blue-600 hover:bg-blue-700 font-medium"
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> A enviar...</>
                                ) : (
                                    <><Send className="h-4 w-4 mr-2" /> Enviar mensagem</>
                                )}
                            </Button>
                        </form>
                    </div>

                    {/* Info lateral */}
                    <div className="md:col-span-2">
                        <div className="bg-gray-50 rounded-xl p-6 space-y-5">
                            <h2 className="font-semibold text-gray-900">Informações</h2>

                            <div className="space-y-4 text-sm">
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-gray-900">Morada</p>
                                        <p className="text-gray-500">{settings.storeAddress}</p>
                                        <p className="text-gray-500">{settings.storePostalCode} {settings.storeCity}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Phone className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-gray-900">Telefone</p>
                                        <a href={`tel:${settings.storePhone.replace(/\s/g, '')}`} className="text-gray-500 hover:text-blue-600">
                                            {settings.storePhone}
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Mail className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-gray-900">Email</p>
                                        <a href={`mailto:${settings.storeEmail}`} className="text-gray-500 hover:text-blue-600">
                                            {settings.storeEmail}
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Clock className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-gray-900">Horário</p>
                                        <p className="text-gray-500">Seg-Sex: {settings.weekdayHours}</p>
                                        <p className="text-gray-500">Sáb: {settings.saturdayHours}</p>
                                        <p className="text-gray-500">Dom: {settings.sundayHours}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200">
                                <p className="text-xs text-gray-400">
                                    Normalmente respondemos em menos de 24 horas úteis.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
