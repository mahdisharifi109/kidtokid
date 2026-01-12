import { useState } from "react"
import { Header } from "@/src/components/layout/Header"
import { Footer } from "@/src/components/Footer"
import { Button } from "@/components/ui/button"
import { addProduct, getAllProducts, deleteProduct } from "@/src/services/productService"
import { toast } from "sonner"
import type { IProduct } from "@/src/types"

// Produtos de exemplo para popular a base de dados
const sampleProducts: Omit<IProduct, "id">[] = [
  {
    title: "Vestido de Verão Floral",
    brand: "Zara Kids",
    price: 12.99,
    originalPrice: 29.99,
    size: "4-5A",
    condition: "good",
    images: ["https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400"],
    category: "menina",
    gender: "menina",
    stock: 1,
    isReserved: false,
    description: "Vestido florido em excelente estado. Perfeito para o verão!",
    createdAt: new Date(),
  },
  {
    title: "Calças de Ganga Azul",
    brand: "H&M",
    price: 8.50,
    size: "6-7A",
    condition: "used",
    images: ["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400"],
    category: "menino",
    gender: "menino",
    stock: 1,
    isReserved: false,
    description: "Calças de ganga clássicas, muito confortáveis.",
    createdAt: new Date(),
  },
  {
    title: "Casaco de Inverno Rosa",
    brand: "Gap Kids",
    price: 22.00,
    originalPrice: 49.99,
    size: "8-9A",
    condition: "good",
    images: ["https://images.unsplash.com/photo-1544923246-77307dd628b5?w=400"],
    category: "menina",
    gender: "menina",
    stock: 1,
    isReserved: false,
    description: "Casaco quente e confortável para o inverno.",
    createdAt: new Date(),
  },
  {
    title: "T-Shirt Listrada",
    brand: "Next",
    price: 5.99,
    size: "3-4A",
    condition: "new",
    images: ["https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400"],
    category: "menino",
    gender: "menino",
    stock: 1,
    isReserved: false,
    description: "T-shirt nova com etiqueta. Nunca usada!",
    createdAt: new Date(),
  },
  {
    title: "Sapatilhas Brancas",
    brand: "Nike",
    price: 18.00,
    originalPrice: 45.00,
    size: "28",
    condition: "good",
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"],
    category: "calcado",
    gender: "unisex",
    stock: 1,
    isReserved: false,
    description: "Sapatilhas em bom estado, muito confortáveis.",
    createdAt: new Date(),
  },
  {
    title: "Babygrow Estampado",
    brand: "Chicco",
    price: 6.50,
    size: "6-9M",
    condition: "good",
    images: ["https://images.unsplash.com/photo-1522771930-78848d9293e8?w=400"],
    category: "bebe",
    gender: "unisex",
    stock: 1,
    isReserved: false,
    description: "Babygrow fofo com estampado de animais.",
    createdAt: new Date(),
  },
  {
    title: "Peluche Urso Grande",
    brand: "Steiff",
    price: 15.00,
    originalPrice: 35.00,
    size: "Grande",
    condition: "good",
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"],
    category: "brinquedos",
    gender: "unisex",
    stock: 1,
    isReserved: false,
    description: "Peluche macio e fofo, em excelente estado.",
    createdAt: new Date(),
  },
  {
    title: "Carrinho de Bebé Trio",
    brand: "Chicco",
    price: 150.00,
    originalPrice: 450.00,
    size: "Universal",
    condition: "good",
    images: ["https://images.unsplash.com/photo-1591088398332-8a7791972843?w=400"],
    category: "equipamentos",
    gender: "unisex",
    stock: 1,
    isReserved: false,
    description: "Carrinho trio completo: alcofa, ovo e cadeira de passeio.",
    createdAt: new Date(),
  },
  {
    title: "Saia Plissada Azul",
    brand: "Mayoral",
    price: 9.99,
    size: "5-6A",
    condition: "new",
    images: ["https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400"],
    category: "menina",
    gender: "menina",
    stock: 1,
    isReserved: false,
    description: "Saia elegante, perfeita para ocasiões especiais.",
    createdAt: new Date(),
  },
  {
    title: "Polo Verde",
    brand: "Ralph Lauren",
    price: 14.00,
    originalPrice: 55.00,
    size: "7-8A",
    condition: "good",
    images: ["https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400"],
    category: "menino",
    gender: "menino",
    stock: 1,
    isReserved: false,
    description: "Polo clássico em excelente estado.",
    createdAt: new Date(),
  },
]

export default function AdminSeedPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [products, setProducts] = useState<IProduct[]>([])

  const handleSeedProducts = async () => {
    setIsLoading(true)
    try {
      for (const product of sampleProducts) {
        await addProduct(product)
      }
      toast.success(`${sampleProducts.length} produtos adicionados com sucesso!`)
      loadProducts()
    } catch (error) {
      console.error("Erro ao adicionar produtos:", error)
      toast.error("Erro ao adicionar produtos")
    } finally {
      setIsLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      const allProducts = await getAllProducts()
      setProducts(allProducts)
    } catch (error) {
      console.error("Erro ao carregar produtos:", error)
    }
  }

  const handleDeleteAll = async () => {
    if (!confirm("Tem a certeza que quer apagar TODOS os produtos?")) return
    
    setIsLoading(true)
    try {
      for (const product of products) {
        await deleteProduct(product.id)
      }
      toast.success("Todos os produtos foram apagados")
      setProducts([])
    } catch (error) {
      console.error("Erro ao apagar produtos:", error)
      toast.error("Erro ao apagar produtos")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Administração - Produtos</h1>
          
          <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
            <div>
              <h2 className="font-semibold mb-2">Adicionar Produtos de Exemplo</h2>
              <p className="text-sm text-gray-500 mb-4">
                Clique no botão abaixo para adicionar {sampleProducts.length} produtos de exemplo à base de dados Firebase.
              </p>
              <Button 
                onClick={handleSeedProducts} 
                disabled={isLoading}
                className="bg-k2k-pink hover:bg-k2k-pink/90"
              >
                {isLoading ? "A adicionar..." : `Adicionar ${sampleProducts.length} Produtos`}
              </Button>
            </div>

            <hr />

            <div>
              <h2 className="font-semibold mb-2">Ver Produtos</h2>
              <Button 
                variant="outline" 
                onClick={loadProducts}
                disabled={isLoading}
              >
                Carregar Produtos
              </Button>
              
              {products.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">{products.length} produtos na base de dados:</p>
                  <ul className="text-sm space-y-1 max-h-60 overflow-y-auto">
                    {products.map((p) => (
                      <li key={p.id} className="flex justify-between items-center py-1 border-b">
                        <span>{p.title} - €{p.price.toFixed(2)}</span>
                        <span className="text-gray-400 text-xs">{p.category}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <hr />

            <div>
              <h2 className="font-semibold mb-2 text-red-600">Zona de Perigo</h2>
              <Button 
                variant="destructive" 
                onClick={handleDeleteAll}
                disabled={isLoading || products.length === 0}
              >
                Apagar Todos os Produtos
              </Button>
            </div>
          </div>

          <p className="text-center mt-6 text-sm text-gray-400">
            Esta página é apenas para administração. Remova-a em produção.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
