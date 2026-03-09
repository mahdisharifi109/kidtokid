import { useEffect, useState } from "react"
import { AdminLayout } from "@/src/components/admin/AdminLayout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    MessageSquare,
    Mail,
    Phone,
    Clock,
    Trash2,
    Eye,
    EyeOff,
    Loader2,
    RefreshCw,
    User,
    X
} from "lucide-react"
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc, type QueryDocumentSnapshot } from "firebase/firestore"
import { db } from "@/src/lib/firebase"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Contact {
    id: string
    name: string
    email: string
    phone?: string
    subject: string
    message: string
    read: boolean
    createdAt: Date
}

function convertToContact(d: QueryDocumentSnapshot): Contact {
    const data = d.data()
    return {
        id: d.id,
        name: data.name || "",
        email: data.email || "",
        phone: data.phone,
        subject: data.subject || "(sem assunto)",
        message: data.message || "",
        read: data.read || false,
        createdAt: data.createdAt?.toDate?.() || new Date(),
    }
}

export default function AdminContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState<Contact | null>(null)

    const loadContacts = async () => {
        setLoading(true)
        try {
            const q = query(collection(db, "contacts"), orderBy("createdAt", "desc"))
            const snapshot = await getDocs(q)
            setContacts(snapshot.docs.map(convertToContact))
        } catch (error) {
            console.error("Erro ao carregar mensagens:", error)
            toast.error("Erro ao carregar mensagens")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadContacts() }, [])

    const toggleRead = async (contact: Contact) => {
        try {
            await updateDoc(doc(db, "contacts", contact.id), { read: !contact.read })
            setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, read: !c.read } : c))
            if (selected?.id === contact.id) {
                setSelected(prev => prev ? { ...prev, read: !prev.read } : null)
            }
        } catch {
            toast.error("Erro ao atualizar")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Apagar esta mensagem?")) return
        try {
            await deleteDoc(doc(db, "contacts", id))
            setContacts(prev => prev.filter(c => c.id !== id))
            if (selected?.id === id) setSelected(null)
            toast.success("Mensagem apagada")
        } catch {
            toast.error("Erro ao apagar")
        }
    }

    const markAsRead = async (contact: Contact) => {
        if (!contact.read) {
            await updateDoc(doc(db, "contacts", contact.id), { read: true })
            setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, read: true } : c))
        }
        setSelected({ ...contact, read: true })
    }

    const unreadCount = contacts.filter(c => !c.read).length

    if (loading) {
        return (
            <AdminLayout title="Mensagens" subtitle="A carregar...">
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400 dark:text-gray-500" />
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout title="Mensagens" subtitle={`${contacts.length} mensagens${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ''}`}>
            <div className="grid lg:grid-cols-5 gap-6">
                {/* List */}
                <div className="lg:col-span-2">
                    <Card className="divide-y max-h-[75vh] overflow-y-auto">
                        <div className="p-4 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 z-10 border-b">
                            <h2 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-green-600" />
                                Mensagens
                            </h2>
                            <Button variant="ghost" size="sm" onClick={loadContacts}>
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>

                        {contacts.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                <MessageSquare className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                                <p>Nenhuma mensagem</p>
                            </div>
                        ) : (
                            contacts.map(contact => (
                                <button
                                    key={contact.id}
                                    onClick={() => markAsRead(contact)}
                                    className={cn(
                                        "w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                                        selected?.id === contact.id && "bg-blue-50/80",
                                        !contact.read && "bg-blue-50/40"
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                            contact.read ? "bg-gray-100 dark:bg-gray-800" : "bg-blue-100 dark:bg-blue-900/30"
                                        )}>
                                            <User className={cn("h-5 w-5", contact.read ? "text-gray-400 dark:text-gray-500" : "text-blue-600")} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                    <p className={cn("text-sm truncate", !contact.read && "font-semibold text-gray-900 dark:text-gray-100")}>
                                                    {contact.name}
                                                </p>
                                                {!contact.read && <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />}
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{contact.subject}</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                {contact.createdAt.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </Card>
                </div>

                {/* Detail */}
                <div className="lg:col-span-3">
                    {selected ? (
                        <Card className="p-6">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selected.subject}</h2>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <User className="h-4 w-4" />
                                            {selected.name}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            {selected.createdAt.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => toggleRead(selected)} title={selected.read ? "Marcar como não lida" : "Marcar como lida"}>
                                        {selected.read ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(selected.id)} className="text-red-500 hover:text-red-700">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <a href={`mailto:${selected.email}`} className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                                    <Mail className="h-4 w-4" />
                                    {selected.email}
                                </a>
                                {selected.phone && (
                                    <a href={`tel:${selected.phone}`} className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                                        <Phone className="h-4 w-4" />
                                        {selected.phone}
                                    </a>
                                )}
                            </div>

                            <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                {selected.message}
                            </div>

                            <div className="mt-6 pt-4 border-t flex gap-3">
                                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                                    <a href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}>
                                        <Mail className="h-4 w-4 mr-2" />
                                        Responder por Email
                                    </a>
                                </Button>
                            </div>
                        </Card>
                    ) : (
                        <Card className="p-12 text-center">
                            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">Seleciona uma mensagem para ver os detalhes</p>
                        </Card>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}
