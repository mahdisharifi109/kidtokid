import { useEffect, useState, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AdminLayout } from "@/src/components/admin/AdminLayout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    ArrowLeft,
    ArrowUp,
    ArrowDown,
    Save,
    Image as ImageIcon,
    Plus,
    X,
    Loader2,
    Upload
} from "lucide-react"
import { doc, getDoc, setDoc, addDoc, collection, Timestamp } from "firebase/firestore"
import { db } from "@/src/lib/firebase"
import { toast } from "sonner"
import type { IProduct } from "@/src/types"
import { CATEGORY_OPTIONS, CONDITIONS, GENDERS, CATALOGUE } from "@/src/constants/categories"
import { uploadProductImage } from "@/src/services/storageService"

interface ProductFormData {
    title: string
    brand: string
    description: string
    price: string
    originalPrice: string
    category: string
    subcategory: string
    condition: string
    gender: string
    size: string
    color: string
    stock: string
    images: string[]
    sku: string
}

const initialFormData: ProductFormData = {
    title: "",
    brand: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "roupa",
    subcategory: "",
    condition: "bom",
    gender: "menina",
    size: "",
    color: "",
    stock: "1",
    images: [],
    sku: ""
}

export default function AdminProductFormPage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const isEditing = Boolean(id)

    const [formData, setFormData] = useState<ProductFormData>(initialFormData)
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [newImageUrl, setNewImageUrl] = useState("")
    const [uploading, setUploading] = useState(false)

    const loadProduct = useCallback(async (productId: string) => {
        setLoading(true)
        try {
            const docRef = doc(db, "products", productId)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                const data = docSnap.data() as IProduct
                setFormData({
                    title: data.title || "",
                    brand: data.brand || "",
                    description: data.description || "",
                    price: data.price?.toString() || "",
                    originalPrice: data.originalPrice?.toString() || "",
                    category: data.category || "roupa",
                    subcategory: data.subcategory || "",
                    condition: data.condition || "bom",
                    gender: data.gender || "menina",
                    size: data.size || "",
                    color: data.color || "",
                    stock: data.stock?.toString() || "1",
                    images: data.images || [],
                    sku: data.sku || ""
                })
            } else {
                toast.error("Produto não encontrado")
                navigate("/admin/produtos")
            }
        } catch (error) {
            console.error("Erro ao carregar produto:", error)
            toast.error("Erro ao carregar produto")
        } finally {
            setLoading(false)
        }
    }, [navigate])

    useEffect(() => {
        if (isEditing && id) {
            loadProduct(id)
        }
    }, [id, isEditing, loadProduct])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => {
            const updated = { ...prev, [name]: value }
            // Reset subcategory when category changes
            if (name === "category") {
                updated.subcategory = ""
            }
            return updated
        })
    }

    const addImageUrl = () => {
        if (!newImageUrl.trim()) return
        if (!newImageUrl.startsWith("http")) {
            toast.error("URL inválido. Deve começar com http:// ou https://")
            return
        }
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, newImageUrl.trim()]
        }))
        setNewImageUrl("")
    }

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }))
    }

    const moveImage = (index: number, direction: "up" | "down") => {
        setFormData(prev => {
            const newImages = [...prev.images]
            const target = direction === "up" ? index - 1 : index + 1
            if (target < 0 || target >= newImages.length) return prev
                ;[newImages[index], newImages[target]] = [newImages[target], newImages[index]]
            return { ...prev, images: newImages }
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validações
        if (!formData.title.trim()) {
            toast.error("O título é obrigatório")
            return
        }
        if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
            toast.error("Preço inválido")
            return
        }
        if (!formData.size.trim()) {
            toast.error("O tamanho é obrigatório")
            return
        }

        setSaving(true)
        try {
            const productData = {
                title: formData.title.trim(),
                brand: formData.brand.trim(),
                description: formData.description.trim(),
                price: parseFloat(formData.price),
                originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
                category: formData.category,
                subcategory: formData.subcategory || null,
                condition: formData.condition,
                gender: formData.gender,
                size: formData.size.trim(),
                color: formData.color.trim(),
                stock: parseInt(formData.stock) || 1,
                isReserved: false,
                images: formData.images.length > 0 ? formData.images : ["/placeholder.svg"],
                sku: formData.sku.trim() || `K2K-${Date.now()}`,
                updatedAt: Timestamp.now()
            }

            if (isEditing && id) {
                await setDoc(doc(db, "products", id), {
                    ...productData
                }, { merge: true })
                toast.success("Produto atualizado!")
            } else {
                await addDoc(collection(db, "products"), {
                    ...productData,
                    createdAt: Timestamp.now()
                })
                toast.success("Produto criado!")
            }

            navigate("/admin/produtos")
        } catch (error) {
            console.error("Erro ao guardar:", error)
            toast.error("Erro ao guardar produto")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <AdminLayout title="A carregar..." subtitle="">
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout
            title={isEditing ? "Editar Produto" : "Novo Produto"}
            subtitle={isEditing ? formData.title : "Adicionar um novo produto à loja"}
        >
            <form onSubmit={handleSubmit}>
                {/* Back button */}
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate("/admin/produtos")}
                    className="mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar aos produtos
                </Button>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="p-6">
                            <h2 className="font-semibold text-gray-900 mb-4">Informação Básica</h2>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="title">Título *</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="Ex: Vestido Florido Zara"
                                        className="mt-1"
                                    />
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="brand">Marca</Label>
                                        <Input
                                            id="brand"
                                            name="brand"
                                            value={formData.brand}
                                            onChange={handleInputChange}
                                            placeholder="Ex: Zara, H&M, Nike"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="sku">SKU</Label>
                                        <Input
                                            id="sku"
                                            name="sku"
                                            value={formData.sku}
                                            onChange={handleInputChange}
                                            placeholder="Auto-gerado se vazio"
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="description">Descrição</Label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={4}
                                        placeholder="Descreve o produto..."
                                        className="mt-1 w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-k2k-blue focus:ring-1 focus:ring-k2k-blue focus:outline-none resize-none"
                                    />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h2 className="font-semibold text-gray-900 mb-4">Detalhes do Produto</h2>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="category">Categoria *</Label>
                                    <select
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="mt-1 w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-k2k-blue focus:ring-1 focus:ring-k2k-blue"
                                    >
                                        {CATEGORY_OPTIONS.map(cat => (
                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="subcategory">Subcategoria</Label>
                                    <select
                                        id="subcategory"
                                        name="subcategory"
                                        value={formData.subcategory}
                                        onChange={handleInputChange}
                                        className="mt-1 w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-k2k-blue focus:ring-1 focus:ring-k2k-blue"
                                    >
                                        <option value="">— Selecione —</option>
                                        {CATALOGUE[formData.category]?.subcategorias.map(sub => (
                                            <option key={sub.id} value={sub.id}>{sub.nome}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Ajuda os clientes a encontrar o produto mais facilmente
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="condition">Condição *</Label>
                                    <select
                                        id="condition"
                                        name="condition"
                                        value={formData.condition}
                                        onChange={handleInputChange}
                                        className="mt-1 w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-k2k-blue focus:ring-1 focus:ring-k2k-blue"
                                    >
                                        {CONDITIONS.map(cond => (
                                            <option key={cond.value} value={cond.value}>{cond.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="gender">Género</Label>
                                    <select
                                        id="gender"
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        className="mt-1 w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-k2k-blue focus:ring-1 focus:ring-k2k-blue"
                                    >
                                        {GENDERS.map(g => (
                                            <option key={g.value} value={g.value}>{g.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="size">Tamanho *</Label>
                                    <Input
                                        id="size"
                                        name="size"
                                        value={formData.size}
                                        onChange={handleInputChange}
                                        placeholder="Ex: 6 anos, 128cm, 38"
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="color">Cor</Label>
                                    <Input
                                        id="color"
                                        name="color"
                                        value={formData.color}
                                        onChange={handleInputChange}
                                        placeholder="Ex: Azul, Rosa, Multicolor"
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h2 className="font-semibold text-gray-900 mb-4">Imagens</h2>

                            <div className="space-y-4">
                                {/* File Upload */}
                                <div>
                                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-k2k-blue hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            {uploading ? (
                                                <><Loader2 className="h-5 w-5 animate-spin" /> A carregar...</>
                                            ) : (
                                                <><Upload className="h-5 w-5" /> Carregar imagens (JPEG, PNG, WebP - máx 5MB)</>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp,image/gif"
                                            multiple
                                            className="hidden"
                                            disabled={uploading}
                                            onChange={async (e) => {
                                                const files = Array.from(e.target.files || [])
                                                if (files.length === 0) return
                                                setUploading(true)
                                                try {
                                                    const urls: string[] = []
                                                    for (const file of files) {
                                                        const url = await uploadProductImage(file, id || `new-${Date.now()}`)
                                                        urls.push(url)
                                                    }
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        images: [...prev.images, ...urls]
                                                    }))
                                                    toast.success(`${urls.length} imagem(ns) carregada(s)!`)
                                                } catch (error) {
                                                    console.error("Erro no upload:", error)
                                                    toast.error(error instanceof Error ? error.message : "Erro ao carregar imagem")
                                                } finally {
                                                    setUploading(false)
                                                    e.target.value = ""
                                                }
                                            }}
                                        />
                                    </label>
                                </div>

                                {/* Add Image URL (fallback) */}
                                <div className="flex gap-2">
                                    <Input
                                        value={newImageUrl}
                                        onChange={(e) => setNewImageUrl(e.target.value)}
                                        placeholder="Ou cole o URL da imagem..."
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
                                    />
                                    <Button type="button" onClick={addImageUrl} variant="outline">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Image Grid */}
                                {formData.images.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {formData.images.map((img, index) => (
                                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
                                                <img
                                                    src={img}
                                                    alt={`Imagem ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {index > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => moveImage(index, "up")}
                                                            className="w-6 h-6 bg-white/90 text-gray-700 rounded-full flex items-center justify-center hover:bg-white shadow"
                                                            title="Mover para a esquerda"
                                                        >
                                                            <ArrowUp className="h-3 w-3" />
                                                        </button>
                                                    )}
                                                    {index < formData.images.length - 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => moveImage(index, "down")}
                                                            className="w-6 h-6 bg-white/90 text-gray-700 rounded-full flex items-center justify-center hover:bg-white shadow"
                                                            title="Mover para a direita"
                                                        >
                                                            <ArrowDown className="h-3 w-3" />
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                                {index === 0 && (
                                                    <span className="absolute bottom-2 left-2 text-xs bg-black/60 text-white px-2 py-0.5 rounded">
                                                        Principal
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                                        <ImageIcon className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">Nenhuma imagem adicionada</p>
                                        <p className="text-xs text-gray-400 mt-1">Carregue ficheiros ou cole um URL acima</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card className="p-6">
                            <h2 className="font-semibold text-gray-900 mb-4">Preço e Stock</h2>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="price">Preço (€) *</Label>
                                    <Input
                                        id="price"
                                        name="price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                        className="mt-1 text-lg font-semibold"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="originalPrice">Preço Original (€)</Label>
                                    <Input
                                        id="originalPrice"
                                        name="originalPrice"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.originalPrice}
                                        onChange={handleInputChange}
                                        placeholder="Deixe vazio se não tem desconto"
                                        className="mt-1"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Se preenchido, mostra o desconto ao cliente
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="stock">Quantidade em Stock</Label>
                                    <Input
                                        id="stock"
                                        name="stock"
                                        type="number"
                                        min="0"
                                        value={formData.stock}
                                        onChange={handleInputChange}
                                        className="mt-1"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Para produtos em segunda mão, normalmente é 1
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h2 className="font-semibold text-gray-900 mb-4">Publicar</h2>

                            <div className="space-y-3">
                                <Button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            A guardar...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            {isEditing ? "Guardar Alterações" : "Publicar Produto"}
                                        </>
                                    )}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => navigate("/admin/produtos")}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </form>
        </AdminLayout>
    )
}
