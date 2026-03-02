import { Header } from "@/src/components/layout/Header"
import { Footer } from "@/src/components/Footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Phone,
    Mail,
    MapPin,
    ChevronDown,
    Send,
    Loader2,
    MessageCircle
} from "lucide-react"
import { useState } from "react"
import { collection, addDoc, Timestamp } from "firebase/firestore"
import { db } from "@/src/lib/firebase"
import { toast } from "sonner"

interface FAQItemProps {
    question: string
    answer: string
}

function FAQItem({ question, answer }: FAQItemProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="border-b border-gray-100 last:border-b-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between py-4 text-left hover:text-blue-600 transition-colors"
            >
                <span className="font-medium text-sm text-gray-900 pr-4">{question}</span>
                <ChevronDown
                    className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
            </button>
            {isOpen && (
                <div className="pb-4 text-sm text-gray-500 leading-relaxed">
                    {answer}
                </div>
            )}
        </div>
    )
}

function ContactForm() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    })
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.email || !formData.message) {
            toast.error("Por favor preencha o email e a mensagem")
            return
        }

        if (formData.message.length < 10) {
            toast.error("A mensagem deve ter pelo menos 10 caracteres")
            return
        }

        if (formData.message.length > 2000) {
            toast.error("A mensagem não pode exceder 2000 caracteres")
            return
        }

        setSending(true)
        try {
            await addDoc(collection(db, "contacts"), {
                name: formData.name.trim() || "Anónimo",
                email: formData.email.trim(),
                subject: formData.subject.trim() || "Sem assunto",
                message: formData.message.trim(),
                createdAt: Timestamp.now()
            })
            toast.success("Mensagem enviada com sucesso!", {
                description: "Responderemos o mais breve possível."
            })
            setSent(true)
            setFormData({ name: "", email: "", subject: "", message: "" })
        } catch (error) {
            console.error("Erro ao enviar mensagem:", error)
            toast.error("Erro ao enviar mensagem. Tente novamente.")
        } finally {
            setSending(false)
        }
    }

    if (sent) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <p className="font-medium text-green-800 mb-1">Mensagem enviada!</p>
                <p className="text-sm text-green-600 mb-4">Vamos responder o mais rápido possível.</p>
                <button
                    onClick={() => setSent(false)}
                    className="text-sm text-green-700 underline hover:no-underline"
                >
                    Enviar outra mensagem
                </button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="contact-name" className="text-sm text-gray-700">Nome</Label>
                    <Input
                        id="contact-name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="O seu nome"
                        className="mt-1"
                        disabled={sending}
                    />
                </div>
                <div>
                    <Label htmlFor="contact-email" className="text-sm text-gray-700">Email *</Label>
                    <Input
                        id="contact-email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="o-seu-email@exemplo.com"
                        className="mt-1"
                        disabled={sending}
                    />
                </div>
            </div>
            <div>
                <Label htmlFor="contact-subject" className="text-sm text-gray-700">Assunto</Label>
                <Input
                    id="contact-subject"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Ex: Dúvida sobre encomenda"
                    className="mt-1"
                    disabled={sending}
                />
            </div>
            <div>
                <Label htmlFor="contact-message" className="text-sm text-gray-700">Mensagem *</Label>
                <textarea
                    id="contact-message"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Escreva a sua mensagem aqui..."
                    rows={5}
                    maxLength={2000}
                    className="mt-1 w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none disabled:opacity-50"
                    disabled={sending}
                />
                <p className="text-xs text-gray-400 mt-1">{formData.message.length}/2000</p>
            </div>
            <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={sending}
            >
                {sending ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> A enviar...</>
                ) : (
                    <><Send className="h-4 w-4 mr-2" /> Enviar mensagem</>
                )}
            </Button>
        </form>
    )
}

export default function HelpPage() {
    const faqs = [
        {
            question: "Como posso vender artigos à Kid to Kid?",
            answer: "Traga os artigos à nossa loja em Braga. A equipa analisa cada peça e faz-lhe uma proposta na hora. Aceitamos roupa, calçado, brinquedos e artigos de puericultura em bom estado. O horário de compras termina uma hora antes do fecho."
        },
        {
            question: "Que tipo de artigos aceitam?",
            answer: "Roupa de criança dos 0 aos 14 anos, calçado, brinquedos, equipamentos de bebé (carrinhos, cadeiras auto, berços) e artigos de puericultura. O importante é que estejam em bom estado, limpos e a funcionar."
        },
        {
            question: "Como funciona a entrega ao domicílio?",
            answer: "Enviamos para todo o Portugal Continental. Portes grátis em compras acima de 50€ — abaixo são 4,50€. A encomenda chega normalmente em 2 a 5 dias úteis através dos CTT."
        },
        {
            question: "Posso devolver um artigo?",
            answer: "Sim, tem 14 dias após receber a encomenda para devolver qualquer artigo nas mesmas condições em que o recebeu. Envie-nos um email ou ligue para iniciar o processo."
        },
        {
            question: "Quais são os métodos de pagamento?",
            answer: "Na loja: dinheiro, Multibanco e MB Way. Online: MB Way ou referência Multibanco."
        },
        {
            question: "Os artigos têm garantia?",
            answer: "A equipa verifica cada artigo antes de o pôr à venda. Para equipamentos, oferecemos uma garantia extra de 30 dias."
        },
        {
            question: "Como sei o tamanho certo?",
            answer: "Cada artigo tem a indicação do tamanho. Se tiver dúvidas entre marcas, contacte-nos que ajudamos a encontrar o tamanho certo."
        },
        {
            question: "Posso reservar artigos?",
            answer: "Sim, pode reservar artigos por até 48 horas. Ligue-nos ou envie um email com o que pretende."
        }
    ]

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="container mx-auto px-4 py-8 md:py-14 max-w-4xl">
                {/* Header */}
                <div className="mb-10 md:mb-14 max-w-2xl">
                    <p className="text-sm font-medium text-blue-600 mb-2">Apoio ao Cliente</p>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                        Como podemos ajudar?
                    </h1>
                    <p className="text-gray-500 text-base md:text-lg leading-relaxed">
                        Encontre respostas rápidas ou fale connosco diretamente.
                    </p>
                </div>

                {/* Contacto rápido */}
                <div className="grid gap-3 sm:grid-cols-4 mb-12">
                    <a href="tel:+351253215379" className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <div>
                            <p className="text-sm font-medium text-gray-900">Ligar</p>
                            <p className="text-xs text-gray-500">253 215 379</p>
                        </div>
                    </a>
                    <a href="mailto:info@kidtokid.pt" className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <div>
                            <p className="text-sm font-medium text-gray-900">Email</p>
                            <p className="text-xs text-gray-500">info@kidtokid.pt</p>
                        </div>
                    </a>
                    <a
                        href="https://wa.me/351253215379"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                    >
                        <MessageCircle className="h-4 w-4 text-gray-400" />
                        <div>
                            <p className="text-sm font-medium text-gray-900">WhatsApp</p>
                            <p className="text-xs text-gray-500">Resposta rápida</p>
                        </div>
                    </a>
                    <a
                        href="https://www.google.com/maps/place/Kid+To+Kid+Braga/@41.550932,-8.4201418,17z"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                    >
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                            <p className="text-sm font-medium text-gray-900">Visitar</p>
                            <p className="text-xs text-gray-500">Rua do Raio, 9</p>
                        </div>
                    </a>
                </div>

                {/* Info útil */}
                <div className="grid gap-8 md:grid-cols-2 mb-12">
                    {/* Envios */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Envios</h2>
                        <p className="text-sm text-gray-600 leading-relaxed mb-3">
                            Entregamos em todo o Portugal Continental via CTT, em 2-5 dias úteis.
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-green-50 rounded-lg p-3 text-center">
                                <p className="text-lg font-bold text-green-700">Grátis</p>
                                <p className="text-xs text-gray-500">Compras +50€</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                                <p className="text-lg font-bold text-gray-900">4,50€</p>
                                <p className="text-xs text-gray-500">Até 49,99€</p>
                            </div>
                        </div>
                    </section>

                    {/* Devoluções */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Devoluções</h2>
                        <p className="text-sm text-gray-600 leading-relaxed mb-3">
                            Tem <strong className="text-gray-900">14 dias</strong> para devolver qualquer artigo nas mesmas condições.
                        </p>
                        <ul className="space-y-1.5 text-sm text-gray-500">
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-0.5">&#10003;</span>
                                Reembolso em 14 dias úteis
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-0.5">&#10003;</span>
                                Artigos com etiqueta e embalagem
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-gray-400 mt-0.5">&#8226;</span>
                                Portes de devolução por conta do cliente
                            </li>
                        </ul>
                    </section>

                    {/* Pagamentos */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Pagamentos</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="font-medium text-gray-900 mb-1.5">Na Loja</p>
                                <p className="text-gray-500">Dinheiro, Multibanco, MB Way</p>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 mb-1.5">Online</p>
                                <p className="text-gray-500">MB Way, Ref. Multibanco</p>
                            </div>
                        </div>
                    </section>

                    {/* Vender */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Vender artigos</h2>
                        <p className="text-sm text-gray-600 leading-relaxed mb-3">
                            Traga o que os filhos já não usam à nossa loja. Avaliamos na hora e pagamos no momento.
                        </p>
                        <div className="flex gap-4 text-sm text-gray-500">
                            <div>
                                <span className="text-blue-600 font-medium">1.</span> Traga os artigos
                            </div>
                            <div>
                                <span className="text-blue-600 font-medium">2.</span> Avaliação
                            </div>
                            <div>
                                <span className="text-blue-600 font-medium">3.</span> Receba dinheiro
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Compras aceites até uma hora antes do fecho.</p>
                    </section>
                </div>

                {/* Horário + O que aceitamos */}
                <div className="grid gap-8 md:grid-cols-2 mb-12 pb-12 border-b border-gray-100">
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Horário</h2>
                        <div className="space-y-1.5 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Segunda a Sábado</span>
                                <span className="text-gray-700">10:00 – 19:00</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Domingo</span>
                                <span className="text-red-500">Fechado</span>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">O que aceitamos</h2>
                        <div className="flex flex-wrap gap-2">
                            {[
                                "Roupa (0-14 anos)", "Calçado", "Brinquedos",
                                "Carrinhos de bebé", "Cadeiras auto", "Berços",
                                "Artigos de puericultura"
                            ].map((item) => (
                                <span key={item} className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                                    {item}
                                </span>
                            ))}
                        </div>
                    </section>
                </div>

                {/* FAQ */}
                <section className="mb-12">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Dúvidas frequentes</h2>
                    <div>
                        {faqs.map((faq, idx) => (
                            <FAQItem key={idx} question={faq.question} answer={faq.answer} />
                        ))}
                    </div>
                </section>

                {/* Formulário de contacto */}
                <section id="contacto">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Envie-nos uma mensagem</h2>
                    <p className="text-sm text-gray-500 mb-6">Respondemos normalmente em menos de 24 horas.</p>
                    <div className="max-w-xl">
                        <ContactForm />
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
