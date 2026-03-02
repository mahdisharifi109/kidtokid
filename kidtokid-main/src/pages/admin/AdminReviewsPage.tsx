import { useEffect, useState } from "react"
import { AdminLayout } from "@/src/components/admin/AdminLayout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Star,
    AlertTriangle,
    Trash2,
    Loader2,
    RefreshCw,
    User,
    CheckCircle2,
    Flag,
    Eye,
    ThumbsUp,
    MessageSquare
} from "lucide-react"
import { collection, getDocs, query, orderBy, doc, deleteDoc, updateDoc, type QueryDocumentSnapshot } from "firebase/firestore"
import { db } from "@/src/lib/firebase"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"

interface Review {
    id: string
    productId: string
    userId: string
    userName: string
    userPhoto?: string
    rating: number
    title: string
    comment: string
    verified: boolean
    helpful: number
    reported: boolean
    createdAt: Date
}

interface ReviewReport {
    id: string
    reviewId: string
    userId: string
    reason: string
    createdAt: Date
}

function convertToReview(d: QueryDocumentSnapshot): Review {
    const data = d.data()
    return {
        id: d.id,
        productId: data.productId || "",
        userId: data.userId || "",
        userName: data.userName || "Anónimo",
        userPhoto: data.userPhoto,
        rating: data.rating || 0,
        title: data.title || "",
        comment: data.comment || "",
        verified: data.verified || false,
        helpful: data.helpful || 0,
        reported: data.reported || false,
        createdAt: data.createdAt?.toDate?.() || new Date(),
    }
}

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([])
    const [reports, setReports] = useState<ReviewReport[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<"all" | "reported">("all")

    const loadData = async () => {
        setLoading(true)
        try {
            const [reviewsSnap, reportsSnap] = await Promise.all([
                getDocs(query(collection(db, "reviews"), orderBy("createdAt", "desc"))),
                getDocs(query(collection(db, "reviewReports"), orderBy("createdAt", "desc")))
            ])
            setReviews(reviewsSnap.docs.map(convertToReview))
            setReports(reportsSnap.docs.map(d => {
                const data = d.data()
                return {
                    id: d.id,
                    reviewId: data.reviewId,
                    userId: data.userId,
                    reason: data.reason || "",
                    createdAt: data.createdAt?.toDate?.() || new Date(),
                }
            }))
        } catch (error) {
            console.error("Erro ao carregar avaliações:", error)
            toast.error("Erro ao carregar avaliações")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadData() }, [])

    const handleDelete = async (reviewId: string) => {
        if (!confirm("Apagar esta avaliação?")) return
        try {
            await deleteDoc(doc(db, "reviews", reviewId))
            // Also clean up any reports for this review
            const relatedReports = reports.filter(r => r.reviewId === reviewId)
            await Promise.all(relatedReports.map(r => deleteDoc(doc(db, "reviewReports", r.id))))
            setReviews(prev => prev.filter(r => r.id !== reviewId))
            setReports(prev => prev.filter(r => r.reviewId !== reviewId))
            toast.success("Avaliação apagada")
        } catch {
            toast.error("Erro ao apagar")
        }
    }

    const dismissReport = async (reviewId: string) => {
        try {
            await updateDoc(doc(db, "reviews", reviewId), { reported: false })
            // Delete all reports for this review
            const relatedReports = reports.filter(r => r.reviewId === reviewId)
            await Promise.all(relatedReports.map(r => deleteDoc(doc(db, "reviewReports", r.id))))
            setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, reported: false } : r))
            setReports(prev => prev.filter(r => r.reviewId !== reviewId))
            toast.success("Denúncia dispensada")
        } catch {
            toast.error("Erro ao dispensar")
        }
    }

    const reportedReviews = reviews.filter(r => r.reported)
    const displayedReviews = activeTab === "reported" ? reportedReviews : reviews

    const renderStars = (rating: number) => (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <Star
                    key={i}
                    className={cn("h-4 w-4", i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200")}
                />
            ))}
        </div>
    )

    if (loading) {
        return (
            <AdminLayout title="Avaliações" subtitle="A carregar...">
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            </AdminLayout>
        )
    }

    const avgRating = reviews.length > 0
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : "0.0"

    return (
        <AdminLayout title="Avaliações" subtitle={`${reviews.length} avaliações · Média: ${avgRating}★`}>
            {/* Stats */}
            <div className="grid sm:grid-cols-4 gap-4 mb-6">
                <Card className="p-4 flex items-center gap-3">
                    <Star className="h-5 w-5 text-gray-400" />
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
                        <p className="text-xs text-gray-500">Total avaliações</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-3">
                    <ThumbsUp className="h-5 w-5 text-gray-400" />
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{avgRating}</p>
                        <p className="text-xs text-gray-500">Média</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-gray-400" />
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{reviews.filter(r => r.verified).length}</p>
                        <p className="text-xs text-gray-500">Verificadas</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-3">
                    <Flag className="h-5 w-5 text-gray-400" />
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{reportedReviews.length}</p>
                        <p className="text-xs text-gray-500">Denunciadas</p>
                    </div>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-4 mb-6">
                <div className="flex gap-2">
                    <Button
                        variant={activeTab === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveTab("all")}
                        className={activeTab === "all" ? "bg-blue-600 hover:bg-blue-700" : "rounded-lg"}
                    >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Todas ({reviews.length})
                    </Button>
                    <Button
                        variant={activeTab === "reported" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveTab("reported")}
                        className={cn(activeTab === "reported" ? "bg-red-600" : "", reportedReviews.length > 0 && "border-red-300 text-red-600")}
                    >
                        <Flag className="h-4 w-4 mr-2" />
                        Denunciadas ({reportedReviews.length})
                    </Button>
                </div>
                <div className="ml-auto">
                    <Button variant="ghost" size="sm" onClick={loadData}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Atualizar
                    </Button>
                </div>
            </div>

            {/* Reviews List */}
            <Card>
                {displayedReviews.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <Star className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                        <p>{activeTab === "reported" ? "Nenhuma avaliação denunciada" : "Nenhuma avaliação"}</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {displayedReviews.map(review => {
                            const reviewReports = reports.filter(r => r.reviewId === review.id)
                            return (
                                <div key={review.id} className={cn("p-4 hover:bg-gray-50 transition-colors", review.reported && "bg-red-50/50")}>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                            {review.userPhoto ? (
                                                <img src={review.userPhoto} alt="" className="w-10 h-10 rounded-full object-cover" />
                                            ) : (
                                                <User className="h-5 w-5 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-medium text-gray-900 text-sm">{review.userName}</span>
                                                {review.verified && (
                                                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                                        <CheckCircle2 className="h-3 w-3" /> Verificada
                                                    </span>
                                                )}
                                                {review.reported && (
                                                    <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                                        <AlertTriangle className="h-3 w-3" /> Denunciada
                                                    </span>
                                                )}
                                                <span className="text-xs text-gray-400">
                                                    {review.createdAt.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <div className="mt-1">{renderStars(review.rating)}</div>
                                            {review.title && <p className="font-medium text-gray-800 mt-1 text-sm">{review.title}</p>}
                                            <p className="text-gray-600 text-sm mt-1 line-clamp-3">{review.comment}</p>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                                <Link to={`/produto/${review.productId}`} className="text-blue-600 hover:underline flex items-center gap-1">
                                                    <Eye className="h-3 w-3" /> Ver produto
                                                </Link>
                                                {review.helpful > 0 && (
                                                    <span className="flex items-center gap-1">
                                                        <ThumbsUp className="h-3 w-3" /> {review.helpful} útil
                                                    </span>
                                                )}
                                            </div>

                                            {/* Reports detail */}
                                            {reviewReports.length > 0 && (
                                                <div className="mt-3 p-3 bg-red-50 rounded-lg text-sm space-y-1">
                                                    <p className="font-medium text-red-800 text-xs">Motivos da denúncia:</p>
                                                    {reviewReports.map(rep => (
                                                        <p key={rep.id} className="text-red-700 text-xs">• {rep.reason}</p>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-1 shrink-0">
                                            {review.reported && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => dismissReport(review.id)}
                                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                    title="Dispensar denúncia"
                                                >
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(review.id)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                title="Apagar avaliação"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </Card>
        </AdminLayout>
    )
}
