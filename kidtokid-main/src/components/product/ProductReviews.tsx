import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { 
    Star, 
    ThumbsUp, 
    CheckCircle2, 
    Loader2,
    MessageSquare
} from "lucide-react"
import { useAuth } from "@/src/contexts/AuthContext"
import { UserAvatar } from "@/src/components/UserAvatar"
import { 
    getProductReviews, 
    getProductReviewStats, 
    createReview, 
    markReviewHelpful,
    getUserReviewForProduct,
    type Review, 
    type ReviewStats,
    getTimeAgo,
    getRatingText
} from "@/src/services/reviewService"

interface ProductReviewsProps {
    productId: string
    productName: string
}

export function ProductReviews({ productId, productName }: ProductReviewsProps) {
    const { user, isAuthenticated } = useAuth()
    const [reviews, setReviews] = useState<Review[]>([])
    const [stats, setStats] = useState<ReviewStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating-high' | 'rating-low'>('recent')
    const [userHasReviewed, setUserHasReviewed] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    // Form state
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [title, setTitle] = useState("")
    const [comment, setComment] = useState("")

    const loadReviews = useCallback(async () => {
        setIsLoading(true)
        try {
            const [reviewsData, statsData] = await Promise.all([
                getProductReviews(productId, sortBy),
                getProductReviewStats(productId)
            ])
            setReviews(reviewsData)
            setStats(statsData)
        } catch (error) {
            console.error("Erro ao carregar avaliações:", error)
        } finally {
            setIsLoading(false)
        }
    }, [productId, sortBy])

    const checkUserReview = useCallback(async () => {
        if (!user) return
        const existingReview = await getUserReviewForProduct(productId, user.uid)
        setUserHasReviewed(!!existingReview)
    }, [productId, user])

    useEffect(() => {
        loadReviews()
    }, [loadReviews])

    useEffect(() => {
        if (user) {
            checkUserReview()
        }
    }, [user, checkUserReview])

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isAuthenticated) {
            toast.error("Inicia sessão para deixar uma avaliação")
            return
        }

        if (rating === 0) {
            toast.error("Seleciona uma classificação")
            return
        }

        setSubmitting(true)
        try {
            await createReview({
                productId,
                rating,
                title,
                comment
            })
            toast.success("Avaliação publicada com sucesso!")
            setShowForm(false)
            setRating(0)
            setTitle("")
            setComment("")
            setUserHasReviewed(true)
            loadReviews()
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Erro ao publicar avaliação")
        } finally {
            setSubmitting(false)
        }
    }

    const handleMarkHelpful = async (reviewId: string) => {
        if (!isAuthenticated) {
            toast.error("Inicia sessão para votar")
            return
        }
        try {
            await markReviewHelpful(reviewId)
            setReviews(prev => prev.map(r => 
                r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r
            ))
            toast.success("Voto registado!")
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Erro ao votar")
        }
    }

    const StarRating = ({ value, size = 'md', interactive = false }: { value: number, size?: 'sm' | 'md' | 'lg', interactive?: boolean }) => {
        const sizes = { sm: 'h-3.5 w-3.5', md: 'h-5 w-5', lg: 'h-7 w-7' }
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        disabled={!interactive}
                        onClick={() => interactive && setRating(star)}
                        onMouseEnter={() => interactive && setHoverRating(star)}
                        onMouseLeave={() => interactive && setHoverRating(0)}
                        className={interactive ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'}
                    >
                        <Star 
                            className={`${sizes[size]} ${
                                star <= (interactive ? (hoverRating || rating) : value)
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'fill-gray-200 text-gray-200'
                            } transition-colors`}
                        />
                    </button>
                ))}
            </div>
        )
    }

    const RatingBar = ({ rating: ratingValue, count, total }: { rating: number, count: number, total: number }) => {
        const percentage = total > 0 ? (count / total) * 100 : 0
        return (
            <div className="flex items-center gap-2 text-sm">
                <span className="w-3 text-gray-600">{ratingValue}</span>
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-yellow-400 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <span className="w-8 text-gray-500 text-right">{count}</span>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="py-8 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-k2k-blue" />
            </div>
        )
    }

    return (
        <section className="mt-10 sm:mt-14">
            <div className="flex items-center gap-3 mb-8">
                <div className="h-px flex-1 max-w-8 bg-linear-to-r from-transparent to-gray-200" />
                <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-gray-800">
                    Avaliações
                </h2>
                <div className="h-px flex-1 max-w-8 bg-linear-to-l from-transparent to-gray-200" />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <Card className="p-6 rounded-2xl border-gray-100">
                    {stats && stats.totalReviews > 0 ? (
                        <div className="space-y-4">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-gray-900">{stats.averageRating}</div>
                                <StarRating value={stats.averageRating} size="md" />
                                <p className="text-sm text-gray-500 mt-1">
                                    {getRatingText(stats.averageRating)} • {stats.totalReviews} {stats.totalReviews === 1 ? 'avaliação' : 'avaliações'}
                                </p>
                            </div>
                            <div className="space-y-1.5">
                                {[5, 4, 3, 2, 1].map(r => (
                                    <RatingBar 
                                        key={r} 
                                        rating={r} 
                                        count={stats.ratingDistribution[r as 1|2|3|4|5]} 
                                        total={stats.totalReviews} 
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <Star className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                            <p className="font-medium text-gray-800">Sem avaliações</p>
                            <p className="text-sm text-gray-400 mt-1">Sê o primeiro a avaliar</p>
                        </div>
                    )}

                    {/* Write Review Button */}
                    {isAuthenticated && !userHasReviewed && (
                        <Button 
                            onClick={() => setShowForm(!showForm)}
                            className="w-full mt-4 bg-k2k-blue hover:bg-k2k-blue/90 text-white"
                        >
                            Escrever Avaliação
                        </Button>
                    )}
                    {!isAuthenticated && (
                        <p className="text-xs text-center text-gray-500 mt-4">
                            <Link to="/entrar" className="text-k2k-blue hover:underline">Inicia sessão</Link> para deixar uma avaliação
                        </p>
                    )}
                    {userHasReviewed && (
                        <p className="text-xs text-center text-green-600 mt-4 flex items-center justify-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Já avaliaste este produto
                        </p>
                    )}
                </Card>

                {/* Reviews List */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Review Form */}
                    {showForm && (
                        <Card className="p-5 border-k2k-blue animate-in slide-in-from-top-2">
                            <form onSubmit={handleSubmitReview} className="space-y-4">
                                <h3 className="font-semibold">A tua avaliação de {productName}</h3>
                                
                                <div>
                                    <label className="text-sm text-gray-600 block mb-2">Classificação *</label>
                                    <StarRating value={rating} size="lg" interactive />
                                </div>

                                <div>
                                    <label className="text-sm text-gray-600 block mb-1">Título *</label>
                                    <Input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Resumo da tua experiência"
                                        maxLength={100}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-gray-600 block mb-1">Comentário *</label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Conta a tua experiência com este produto..."
                                        rows={4}
                                        required
                                        minLength={10}
                                        className="w-full rounded-lg border p-3 text-sm resize-none focus:border-k2k-blue focus:ring-1 focus:ring-k2k-blue focus:outline-none"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button 
                                        type="submit" 
                                        disabled={submitting || rating === 0}
                                        className="bg-k2k-blue hover:bg-k2k-blue/90 text-white"
                                    >
                                        {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        Publicar
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                                        Cancelar
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    )}

                    {/* Sort */}
                    {reviews.length > 0 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">{reviews.length} avaliações</p>
                            <select 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                                className="text-sm border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-k2k-blue"
                            >
                                <option value="recent">Mais recentes</option>
                                <option value="helpful">Mais úteis</option>
                                <option value="rating-high">Melhor classificação</option>
                                <option value="rating-low">Pior classificação</option>
                            </select>
                        </div>
                    )}

                    {/* Reviews */}
                    {reviews.length > 0 ? (
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <Card key={review.id} className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                            <UserAvatar
                                                src={review.userPhoto}
                                                alt={review.userName}
                                                fallbackInitials={review.userName?.charAt(0).toUpperCase()}
                                                size="md"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-medium text-sm">{review.userName}</span>
                                                {review.verified && (
                                                    <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Compra verificada
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <StarRating value={review.rating} size="sm" />
                                                <span className="text-xs text-gray-400">{getTimeAgo(review.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-3">
                                        <h4 className="font-medium text-sm">{review.title}</h4>
                                        <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
                                    </div>

                                    <div className="mt-3 flex items-center gap-4">
                                        <button 
                                            onClick={() => handleMarkHelpful(review.id)}
                                            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-k2k-blue transition-colors"
                                        >
                                            <ThumbsUp className="h-3.5 w-3.5" />
                                            Útil ({review.helpful})
                                        </button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : !showForm && (
                        <Card className="p-8 text-center">
                            <MessageSquare className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                            <p className="text-gray-500">Ainda não há avaliações para este produto.</p>
                            {isAuthenticated && !userHasReviewed && (
                                <Button 
                                    onClick={() => setShowForm(true)}
                                    variant="outline"
                                    className="mt-4"
                                >
                                    Sê o primeiro a avaliar
                                </Button>
                            )}
                        </Card>
                    )}
                </div>
            </div>
        </section>
    )
}
