import { useState } from "react"
import { collection, addDoc, getDocs, deleteDoc, doc, Timestamp, writeBatch } from "firebase/firestore"
import { db } from "@/src/lib/firebase"
import { generateAllProducts, CATEGORIES } from "@/src/data/productsData"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function AdminSeedPage() {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState("")
  const [stats, setStats] = useState<Record<string, number>>({})

  // Popular base de dados com produtos
  const seedProducts = async () => {
    setLoading(true)
    setProgress("A gerar produtos...")
    
    try {
      const products = generateAllProducts()
      const productsRef = collection(db, "products")
      
      // Usar batches para melhor performance (max 500 por batch)
      const batchSize = 500
      let totalAdded = 0
      const categoryStats: Record<string, number> = {}
      
      for (let i = 0; i < products.length; i += batchSize) {
        const batch = writeBatch(db)
        const chunk = products.slice(i, i + batchSize)
        
        for (const product of chunk) {
          const docRef = doc(productsRef)
          batch.set(docRef, {
            ...product,
            createdAt: Timestamp.fromDate(product.createdAt),
          })
          
          // Contar por categoria
          categoryStats[product.category] = (categoryStats[product.category] || 0) + 1
        }
        
        await batch.commit()
        totalAdded += chunk.length
        setProgress(`A adicionar produtos... ${totalAdded}/${products.length}`)
      }
      
      setStats(categoryStats)
      setProgress(`✅ Concluído! ${totalAdded} produtos adicionados.`)
    } catch (error) {
      console.error("Erro ao popular base de dados:", error)
      setProgress(`❌ Erro: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  // Popular categorias
  const seedCategories = async () => {
    setLoading(true)
    setProgress("A adicionar categorias...")
    
    try {
      const categoriesRef = collection(db, "categories")
      
      for (const category of CATEGORIES) {
        await addDoc(categoriesRef, category)
      }
      
      setProgress(`✅ ${CATEGORIES.length} categorias adicionadas!`)
    } catch (error) {
      console.error("Erro ao adicionar categorias:", error)
      setProgress(`❌ Erro: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  // Limpar produtos
  const clearProducts = async () => {
    if (!confirm("Tem certeza que deseja apagar TODOS os produtos?")) return
    
    setLoading(true)
    setProgress("A apagar produtos...")
    
    try {
      const productsRef = collection(db, "products")
      const snapshot = await getDocs(productsRef)
      
      const batchSize = 500
      let deleted = 0
      
      for (let i = 0; i < snapshot.docs.length; i += batchSize) {
        const batch = writeBatch(db)
        const chunk = snapshot.docs.slice(i, i + batchSize)
        
        for (const docSnap of chunk) {
          batch.delete(doc(db, "products", docSnap.id))
        }
        
        await batch.commit()
        deleted += chunk.length
        setProgress(`A apagar... ${deleted}/${snapshot.docs.length}`)
      }
      
      setProgress(`✅ ${deleted} produtos apagados!`)
      setStats({})
    } catch (error) {
      console.error("Erro ao apagar:", error)
      setProgress(`❌ Erro: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  // Contar produtos
  const countProducts = async () => {
    setLoading(true)
    setProgress("A contar produtos...")
    
    try {
      const productsRef = collection(db, "products")
      const snapshot = await getDocs(productsRef)
      
      const categoryStats: Record<string, number> = {}
      snapshot.docs.forEach((doc) => {
        const data = doc.data()
        categoryStats[data.category] = (categoryStats[data.category] || 0) + 1
      })
      
      setStats(categoryStats)
      setProgress(`Total: ${snapshot.docs.length} produtos`)
    } catch (error) {
      console.error("Erro:", error)
      setProgress(`❌ Erro: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const totalProducts = Object.values(stats).reduce((a, b) => a + b, 0)

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">🔧 Admin - Popular Base de Dados</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Button 
          onClick={seedProducts} 
          disabled={loading}
          className="h-20 text-lg"
        >
          {loading ? "A processar..." : "🚀 Popular Produtos"}
        </Button>
        
        <Button 
          onClick={seedCategories} 
          disabled={loading}
          variant="secondary"
          className="h-20 text-lg"
        >
          📁 Adicionar Categorias
        </Button>
        
        <Button 
          onClick={countProducts} 
          disabled={loading}
          variant="outline"
          className="h-20 text-lg"
        >
          📊 Contar Produtos
        </Button>
        
        <Button 
          onClick={clearProducts} 
          disabled={loading}
          variant="destructive"
          className="h-20 text-lg"
        >
          🗑️ Apagar Tudo
        </Button>
      </div>
      
      {progress && (
        <Card className="p-4 mb-8">
          <p className="text-lg font-medium">{progress}</p>
        </Card>
      )}
      
      {totalProducts > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">📈 Estatísticas ({totalProducts} produtos)</h2>
          <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-4">
            {Object.entries(stats).sort((a, b) => b[1] - a[1]).map(([category, count]) => {
              const cat = CATEGORIES.find(c => c.id === category)
              return (
                <div 
                  key={category} 
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <span className="flex items-center gap-2">
                    <span>{cat?.icon || "📦"}</span>
                    <span className="capitalize">{cat?.name || category}</span>
                  </span>
                  <span className="font-bold">{count}</span>
                </div>
              )
            })}
          </div>
        </Card>
      )}
      
      <Card className="p-6 mt-8 bg-blue-50">
        <h3 className="font-bold text-lg mb-2">ℹ️ Instruções</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Clique em <strong>"Popular Produtos"</strong> para adicionar ~800 produtos à base de dados</li>
          <li>Clique em <strong>"Adicionar Categorias"</strong> para criar as 12 categorias</li>
          <li>Use <strong>"Contar Produtos"</strong> para ver as estatísticas</li>
          <li>Use <strong>"Apagar Tudo"</strong> apenas se quiser recomeçar do zero</li>
        </ol>
        <p className="mt-4 text-sm text-muted-foreground">
          Os produtos são gerados automaticamente com marcas reais, preços realistas e descrições em português.
        </p>
      </Card>
    </div>
  )
}
