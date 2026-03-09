import { 
    collection, 
    doc, 
    addDoc,
    setDoc,
    updateDoc, 
    deleteDoc, 
    getDoc, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    limit,
    serverTimestamp,
    Timestamp,
    increment,
    writeBatch
} from "firebase/firestore"
import { db, auth } from "@/src/lib/firebase"

// Types

export interface Review {
    id: string
    productId: string
    userId: string
    userName: string
    userPhoto?: string
    rating: number // 1-5 estrelas
    title: string
    comment: string
    pros?: string[] // Pontos positivos
    cons?: string[] // Pontos negativos
    verified: boolean // Compra verificada
    helpful: number // Votos de "útil"
    reported: boolean
    createdAt: Date
    updatedAt?: Date
}

export interface ReviewStats {
    totalReviews: number
    averageRating: number
    ratingDistribution: {
        1: number
        2: number
        3: number
        4: number
        5: number
    }
}

export interface CreateReviewData {
    productId: string
    rating: number
    title: string
    comment: string
    pros?: string[]
    cons?: string[]
}

// Create a new review

export const createReview = async (data: CreateReviewData): Promise<Review> => {
    const user = auth.currentUser
    if (!user) {
        throw new Error("Precisas de iniciar sessão para deixar uma avaliação")
    }

    // Validações
    if (data.rating < 1 || data.rating > 5) {
        throw new Error("A avaliação deve ser entre 1 e 5 estrelas")
    }

    if (!data.title.trim() || data.title.length < 3) {
        throw new Error("O título deve ter pelo menos 3 caracteres")
    }

    if (!data.comment.trim() || data.comment.length < 10) {
        throw new Error("O comentário deve ter pelo menos 10 caracteres")
    }

    // Verificar se já avaliou este produto
    const existingReview = await getUserReviewForProduct(data.productId, user.uid)
    if (existingReview) {
        throw new Error("Já avaliaste este produto")
    }

    // Verificar se comprou o produto (opcional - para "compra verificada")
    const hasVerifiedPurchase = await checkVerifiedPurchase(user.uid, data.productId)

    // Obter dados do utilizador
    const userDoc = await getDoc(doc(db, "users", user.uid))
    const userData = userDoc.data()

    const reviewData = {
        productId: data.productId,
        userId: user.uid,
        userName: userData?.displayName || userData?.firstName || user.displayName || "Anónimo",
        userPhoto: userData?.photoURL || user.photoURL || null,
        rating: Math.round(data.rating),
        title: data.title.trim(),
        comment: data.comment.trim(),
        pros: data.pros?.filter(p => p.trim()) || [],
        cons: data.cons?.filter(c => c.trim()) || [],
        verified: hasVerifiedPurchase,
        helpful: 0,
        reported: false,
        createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, "reviews"), reviewData)

    // Atualizar estatísticas do produto
    await updateProductRating(data.productId)

    return {
        id: docRef.id,
        ...reviewData,
        createdAt: new Date(),
    } as Review
}

// Fetch reviews

export const getProductReviews = async (
    productId: string, 
    sortBy: 'recent' | 'helpful' | 'rating-high' | 'rating-low' = 'recent'
): Promise<Review[]> => {
    let q = query(
        collection(db, "reviews"),
        where("productId", "==", productId),
        where("reported", "==", false)
    )

    // Ordenação
    switch (sortBy) {
        case 'helpful':
            q = query(q, orderBy("helpful", "desc"), orderBy("createdAt", "desc"))
            break
        case 'rating-high':
            q = query(q, orderBy("rating", "desc"), orderBy("createdAt", "desc"))
            break
        case 'rating-low':
            q = query(q, orderBy("rating", "asc"), orderBy("createdAt", "desc"))
            break
        default:
            q = query(q, orderBy("createdAt", "desc"))
    }

    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (doc.data().updatedAt as Timestamp)?.toDate(),
    })) as Review[]
}

export const getUserReviewForProduct = async (productId: string, userId: string): Promise<Review | null> => {
    const q = query(
        collection(db, "reviews"),
        where("productId", "==", productId),
        where("userId", "==", userId),
        limit(1)
    )

    const snapshot = await getDocs(q)
    
    if (snapshot.empty) return null

    const doc = snapshot.docs[0]
    return {
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
    } as Review
}

export const getUserReviews = async (userId: string): Promise<Review[]> => {
    const q = query(
        collection(db, "reviews"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
    )

    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
    })) as Review[]
}

// Review statistics

export const getProductReviewStats = async (productId: string): Promise<ReviewStats> => {
    const q = query(
        collection(db, "reviews"),
        where("productId", "==", productId),
        where("reported", "==", false)
    )

    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
        return {
            totalReviews: 0,
            averageRating: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        }
    }

    const reviews = snapshot.docs.map(doc => doc.data())
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    let totalRating = 0

    reviews.forEach(review => {
        const rating = review.rating as 1 | 2 | 3 | 4 | 5
        distribution[rating] = (distribution[rating] || 0) + 1
        totalRating += review.rating
    })

    return {
        totalReviews: reviews.length,
        averageRating: Math.round((totalRating / reviews.length) * 10) / 10,
        ratingDistribution: distribution
    }
}

// Update and delete reviews

export const updateReview = async (
    reviewId: string, 
    data: Partial<Pick<Review, 'rating' | 'title' | 'comment' | 'pros' | 'cons'>>
): Promise<void> => {
    const user = auth.currentUser
    if (!user) throw new Error("Não autenticado")

    const reviewRef = doc(db, "reviews", reviewId)
    const reviewDoc = await getDoc(reviewRef)

    if (!reviewDoc.exists()) {
        throw new Error("Avaliação não encontrada")
    }

    if (reviewDoc.data().userId !== user.uid) {
        throw new Error("Não tens permissão para editar esta avaliação")
    }

    await updateDoc(reviewRef, {
        ...data,
        updatedAt: serverTimestamp()
    })

    // Atualizar estatísticas se o rating mudou
    if (data.rating !== undefined) {
        await updateProductRating(reviewDoc.data().productId)
    }
}

export const deleteReview = async (reviewId: string): Promise<void> => {
    const user = auth.currentUser
    if (!user) throw new Error("Não autenticado")

    const reviewRef = doc(db, "reviews", reviewId)
    const reviewDoc = await getDoc(reviewRef)

    if (!reviewDoc.exists()) {
        throw new Error("Avaliação não encontrada")
    }

    const reviewData = reviewDoc.data()

    // Verificar permissão (dono ou admin via custom claims)
    if (reviewData.userId !== user.uid) {
        const idTokenResult = await user.getIdTokenResult()
        const isAdmin = idTokenResult.claims.admin === true
        if (!isAdmin) {
            throw new Error("Não tens permissão para eliminar esta avaliação")
        }
    }

    await deleteDoc(reviewRef)
    await updateProductRating(reviewData.productId)
}

// Mark review as helpful

export const markReviewHelpful = async (reviewId: string): Promise<void> => {
    const user = auth.currentUser
    if (!user) throw new Error("Inicia sessão para votar")

    const reviewRef = doc(db, "reviews", reviewId)
    const voteRef = doc(db, "reviewVotes", `${reviewId}_${user.uid}`)

    // Prevent self-voting
    const reviewDoc = await getDoc(reviewRef)
    if (reviewDoc.exists() && reviewDoc.data().userId === user.uid) {
        throw new Error("Não podes votar na tua própria avaliação")
    }

    // Verificar se já votou
    const voteDoc = await getDoc(voteRef)
    if (voteDoc.exists()) {
        throw new Error("Já votaste nesta avaliação")
    }

    const batch = writeBatch(db)
    
    // Incrementar contador
    batch.update(reviewRef, { helpful: increment(1) })
    
    // Registar voto
    batch.set(voteRef, {
        reviewId,
        userId: user.uid,
        createdAt: serverTimestamp()
    })

    await batch.commit()
}

// Report a review

export const reportReview = async (reviewId: string, reason: string): Promise<void> => {
    const user = auth.currentUser
    if (!user) throw new Error("Inicia sessão para reportar")

    // Use deterministic ID to prevent duplicate reports from same user
    const reportRef = doc(db, "reviewReports", `${reviewId}_${user.uid}`)
    const existingReport = await getDoc(reportRef)
    if (existingReport.exists()) {
        throw new Error("Já reportaste esta avaliação")
    }

    await setDoc(reportRef, {
        reviewId,
        reportedBy: user.uid,
        reason,
        createdAt: serverTimestamp(),
        resolved: false
    })
}

// Internal helpers

const checkVerifiedPurchase = async (userId: string, productId: string): Promise<boolean> => {
    try {
        const q = query(
            collection(db, "orders"),
            where("userId", "==", userId),
            where("status", "in", ["delivered", "completed"])
        )

        const snapshot = await getDocs(q)
        
        for (const orderDoc of snapshot.docs) {
            const items = orderDoc.data().items || []
            if (items.some((item: { productId?: string }) => item.productId === productId)) {
                return true
            }
        }

        return false
    } catch {
        return false
    }
}

const updateProductRating = async (productId: string): Promise<void> => {
    try {
        const stats = await getProductReviewStats(productId)
        
        await updateDoc(doc(db, "products", productId), {
            rating: stats.averageRating,
            reviewCount: stats.totalReviews
        })
    } catch (error) {
        console.error("Erro ao atualizar rating do produto:", error)
    }
}

// Display helpers

export const getRatingText = (rating: number): string => {
    if (rating >= 4.5) return "Excelente"
    if (rating >= 4) return "Muito Bom"
    if (rating >= 3) return "Bom"
    if (rating >= 2) return "Razoável"
    return "Fraco"
}

export const getTimeAgo = (date: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "Hoje"
    if (diffDays === 1) return "Ontem"
    if (diffDays < 7) return `Há ${diffDays} dias`
    if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} semanas`
    if (diffDays < 365) return `Há ${Math.floor(diffDays / 30)} meses`
    return `Há ${Math.floor(diffDays / 365)} anos`
}
