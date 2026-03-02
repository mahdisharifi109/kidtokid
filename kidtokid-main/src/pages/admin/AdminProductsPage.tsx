import { useEffect, useState, useMemo, useCallback } from "react"
import { Link } from "react-router-dom"
import { AdminLayout } from "@/src/components/admin/AdminLayout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
    Package, 
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    RefreshCw,
    Image as ImageIcon,
    CheckCircle2,
    XCircle
} from "lucide-react"
import { collection, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from "firebase/firestore"
import { ref, deleteObject } from "firebase/storage"
import { db } from "@/src/lib/firebase"
import { storage } from "@/src/lib/firebase"
import { toast } from "sonner"
import type { IProduct } from "@/src/types"
import { CATEGORY_OPTIONS } from "@/src/constants/categories"

export default function AdminProductsPage() {
    const [products, setProducts] = useState<IProduct[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string>("all")
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const categories = useMemo(() => [
        { value: "all", label: "Todas" },
        ...CATEGORY_OPTIONS
    ], [])

    const loadProducts = useCallback(async () => {
        setLoading(true)
        try {
            const productsQuery = query(
                collection(db, "products"),
                orderBy("createdAt", "desc")
            )
            const snapshot = await getDocs(productsQuery)
            const productsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as IProduct[]
            setProducts(productsData)
        } catch (error) {
            console.error("Erro ao carregar produtos:", error)
            toast.error("Erro ao carregar produtos")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadProducts()
    }, [loadProducts])

    // Usar useMemo em vez de useEffect+setState para evitar re-renders desnecessários
    const filteredProducts = useMemo(() => {
        let filtered = products

        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(p => 
                p.title.toLowerCase().includes(term) ||
                p.brand.toLowerCase().includes(term) ||
                p.sku?.toLowerCase().includes(term)
            )
        }

        if (selectedCategory !== "all") {
            filtered = filtered.filter(p => p.category === selectedCategory)
        }

        return filtered
    }, [products, searchTerm, selectedCategory])

    const handleDelete = async (productId: string) => {
        if (!confirm("Tens a certeza que queres eliminar este produto? As imagens também serão apagadas.")) return

        setDeletingId(productId)
        try {
            // Find the product to get its images
            const product = products.find(p => p.id === productId)
            
            // Delete images from Firebase Storage
            if (product?.images) {
                for (const imageUrl of product.images) {
                    try {
                        // Extract storage path from URL
                        if (imageUrl.includes("firebasestorage.googleapis.com") || imageUrl.includes("firebasestorage.app")) {
                            const storageRef = ref(storage, imageUrl)
                            await deleteObject(storageRef)
                        }
                    } catch (imgError) {
                        // Ignore — image may already be deleted
                        console.warn("Imagem não encontrada:", imgError)
                    }
                }
            }

            // Delete the product document
            await deleteDoc(doc(db, "products", productId))
            setProducts(prev => prev.filter(p => p.id !== productId))
            toast.success("Produto e imagens eliminados")
        } catch (error) {
            console.error("Erro ao eliminar:", error)
            toast.error("Erro ao eliminar produto")
        } finally {
            setDeletingId(null)
        }
    }

    const toggleStock = async (product: IProduct) => {
        try {
            const newStock = product.stock > 0 ? 0 : 1
            await updateDoc(doc(db, "products", product.id), { stock: newStock })
            setProducts(prev => prev.map(p => 
                p.id === product.id ? { ...p, stock: newStock } : p
            ))
            toast.success(newStock > 0 ? "Produto disponível" : "Produto esgotado")
        } catch {
            toast.error("Erro ao atualizar stock")
        }
    }

    const getConditionLabel = (condition: string) => {
        const labels: Record<string, string> = {
            "novo": "Novo",
            "como-novo": "Como Novo",
            "bom": "Bom Estado",
            "usado": "Usado"
        }
        return labels[condition] || condition
    }

    return (
        <AdminLayout 
            title="Produtos" 
            subtitle={`${products.length} produtos na loja`}
        >
            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 flex gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Pesquisar por nome, marca ou SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 rounded-lg border-gray-200 focus:border-blue-300"
                        />
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-200 bg-white"
                    >
                        {categories.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={loadProducts}
                        disabled={loading}
                        className="rounded-lg border-gray-200"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Link to="/admin/produtos/novo">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Produto
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Products Table */}
            <Card className="overflow-hidden border border-gray-200">
                {loading ? (
                    <div className="p-10 text-center">
                        <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                            <RefreshCw className="h-6 w-6 animate-spin text-blue-400" />
                        </div>
                        <p className="text-gray-500 font-medium">A carregar produtos...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="p-14 text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                            <Package className="h-7 w-7 text-gray-300" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">Nenhum produto encontrado</h3>
                        <p className="text-gray-500 text-sm mb-5">
                            {searchTerm || selectedCategory !== "all" 
                                ? "Tenta ajustar os filtros de pesquisa"
                                : "Começa por adicionar o primeiro produto"
                            }
                        </p>
                        {!searchTerm && selectedCategory === "all" && (
                            <Link to="/admin/produtos/novo">
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Adicionar Produto
                                </Button>
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50/80 border-b border-gray-100">
                                <tr>
                                    <th className="text-left p-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Produto</th>
                                    <th className="text-left p-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Categoria</th>
                                    <th className="text-left p-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Tamanho</th>
                                    <th className="text-left p-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Condição</th>
                                    <th className="text-left p-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Preço</th>
                                    <th className="text-left p-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Stock</th>
                                    <th className="text-right p-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3.5">
                                                <div className="w-12 h-12 rounded-lg bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                                                    {product.images?.[0] ? (
                                                        <img 
                                                            src={product.images[0]} 
                                                            alt={product.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <ImageIcon className="h-5 w-5 text-gray-300" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-gray-900 truncate max-w-50">
                                                        {product.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{product.brand}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg">
                                                {categories.find(c => c.value === product.category)?.label || product.category}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm font-medium text-gray-700">{product.size}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm text-gray-600">
                                                {getConditionLabel(product.condition)}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-bold text-gray-900">
                                                €{product.price.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => toggleStock(product)}
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                                                    product.stock > 0 
                                                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100"
                                                        : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
                                                }`}
                                            >
                                                {product.stock > 0 ? (
                                                    <>
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Disponível
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="h-3 w-3" />
                                                        Esgotado
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link to={`/produto/${product.id}`} target="_blank">
                                                    <Button variant="ghost" size="sm" className="rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link to={`/admin/produtos/${product.id}`}>
                                                    <Button variant="ghost" size="sm" className="rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => handleDelete(product.id)}
                                                    disabled={deletingId === product.id}
                                                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                                >
                                                    {deletingId === product.id ? (
                                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Stats */}
            {!loading && filteredProducts.length > 0 && (
                <div className="mt-4 text-sm text-gray-400 flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5" />
                    A mostrar {filteredProducts.length} de {products.length} produtos
                </div>
            )}
        </AdminLayout>
    )
}
