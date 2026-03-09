import { useState } from "react"
import { AdminLayout } from "@/src/components/admin/AdminLayout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, AlertTriangle, ArrowRight, Database, RefreshCw } from "lucide-react"
import { collection, getDocs, doc, updateDoc, query, orderBy } from "firebase/firestore"
import { db } from "@/src/lib/firebase"
import { LEGACY_SLUG_MAP, CATEGORY_NAMES } from "@/src/constants/categories"
import { toast } from "sonner"

interface MigrationProduct {
    id: string
    title: string
    oldCategory: string
    newCategory: string
}

interface MigrationResult {
    id: string
    title: string
    oldCategory: string
    newCategory: string
    success: boolean
    error?: string
}

export default function AdminMigrateCategoriesPage() {
    const [scanning, setScanning] = useState(false)
    const [migrating, setMigrating] = useState(false)
    const [toMigrate, setToMigrate] = useState<MigrationProduct[]>([])
    const [alreadyCorrect, setAlreadyCorrect] = useState<number>(0)
    const [unknown, setUnknown] = useState<{ id: string; title: string; category: string }[]>([])
    const [results, setResults] = useState<MigrationResult[]>([])
    const [scanned, setScanned] = useState(false)

    // Fase 1: Scan — ver o que precisa de ser migrado
    const handleScan = async () => {
        setScanning(true)
        setResults([])
        setScanned(false)

        try {
            const productsRef = collection(db, "products")
            const q = query(productsRef, orderBy("createdAt", "desc"))
            const snapshot = await getDocs(q)

            const needsMigration: MigrationProduct[] = []
            const unknownCategories: { id: string; title: string; category: string }[] = []
            let correctCount = 0

            snapshot.docs.forEach((docSnap) => {
                const data = docSnap.data()
                const currentCategory = data.category || ""
                const title = data.title || "(sem título)"

                if (LEGACY_SLUG_MAP[currentCategory]) {
                    // Precisa de migração
                    needsMigration.push({
                        id: docSnap.id,
                        title,
                        oldCategory: currentCategory,
                        newCategory: LEGACY_SLUG_MAP[currentCategory],
                    })
                } else if (CATEGORY_NAMES[currentCategory]) {
                    // Já está correto
                    correctCount++
                } else if (currentCategory) {
                    // Categoria desconhecida
                    unknownCategories.push({ id: docSnap.id, title, category: currentCategory })
                }
            })

            setToMigrate(needsMigration)
            setAlreadyCorrect(correctCount)
            setUnknown(unknownCategories)
            setScanned(true)

            if (needsMigration.length === 0) {
                toast.success("Todas as categorias já estão atualizadas!")
            } else {
                toast.info(`${needsMigration.length} produtos precisam de migração`)
            }
        } catch (error) {
            console.error("Erro ao escanear:", error)
            toast.error("Erro ao escanear produtos")
        } finally {
            setScanning(false)
        }
    }

    // Fase 2: Migrar — atualizar os documentos no Firestore
    const handleMigrate = async () => {
        if (!confirm(`Confirmas a migração de ${toMigrate.length} produtos? Esta ação atualiza o campo 'category' de cada documento.`)) return

        setMigrating(true)
        const migrationResults: MigrationResult[] = []

        for (const product of toMigrate) {
            try {
                const docRef = doc(db, "products", product.id)
                await updateDoc(docRef, { category: product.newCategory })
                migrationResults.push({ ...product, success: true })
            } catch (error) {
                migrationResults.push({
                    ...product,
                    success: false,
                    error: error instanceof Error ? error.message : "Erro desconhecido",
                })
            }
        }

        setResults(migrationResults)

        const successCount = migrationResults.filter((r) => r.success).length
        const failCount = migrationResults.filter((r) => !r.success).length

        if (failCount === 0) {
            toast.success(`✅ ${successCount} produtos migrados com sucesso!`)
            setToMigrate([])
            setAlreadyCorrect((prev) => prev + successCount)
        } else {
            toast.error(`${failCount} produtos falharam a migração. ${successCount} migrados com sucesso.`)
        }

        setMigrating(false)
    }

    return (
        <AdminLayout
            title="Migração de Categorias"
            subtitle="Atualizar categorias antigas para a nova estrutura"
        >
            <div className="max-w-3xl space-y-6">
                {/* Info Card */}
                <Card className="p-6 border-blue-200 bg-blue-50/50">
                    <div className="flex gap-3">
                        <Database className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">O que faz esta ferramenta?</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                Atualiza o campo <code className="bg-white px-1.5 py-0.5 rounded text-xs border">category</code> dos
                                produtos no Firestore, substituindo os slugs antigos pelos novos.
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-white dark:bg-gray-900 rounded-lg p-2.5 border">
                                    <p className="font-medium text-gray-500 dark:text-gray-400 mb-1.5">Slugs Antigos →</p>
                                    {Object.entries(LEGACY_SLUG_MAP).map(([old, newSlug]) => (
                                        <div key={old} className="flex items-center gap-1.5 py-0.5">
                                            <span className="text-red-600 line-through">{old}</span>
                                            <ArrowRight className="h-3 w-3 text-gray-400" />
                                            <span className="text-green-700 font-medium">{newSlug}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-white dark:bg-gray-900 rounded-lg p-2.5 border">
                                    <p className="font-medium text-gray-500 dark:text-gray-400 mb-1.5">Categorias Válidas ✓</p>
                                    {Object.entries(CATEGORY_NAMES).map(([slug, label]) => (
                                        <div key={slug} className="py-0.5">
                                            <span className="text-green-700 font-medium">{slug}</span>
                                            <span className="text-gray-400 dark:text-gray-500 ml-1">({label})</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Passo 1: Scan */}
                <Card className="p-6">
                    <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Passo 1 — Escanear Produtos</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Verifica quantos produtos usam categorias antigas e quantos já estão atualizados.
                    </p>
                    <Button onClick={handleScan} disabled={scanning || migrating}>
                        {scanning ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                A escanear...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                {scanned ? "Re-escanear" : "Escanear Produtos"}
                            </>
                        )}
                    </Button>

                    {/* Scan Results */}
                    {scanned && (
                        <div className="mt-5 space-y-3">
                            {/* Correct */}
                            <div className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <span className="text-gray-700 dark:text-gray-300">
                                    <strong>{alreadyCorrect}</strong> produtos já com categoria correta
                                </span>
                            </div>

                            {/* Needs migration */}
                            <div className="flex items-center gap-2 text-sm">
                                {toMigrate.length > 0 ? (
                                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                                ) : (
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                )}
                                <span className="text-gray-700 dark:text-gray-300">
                                    <strong>{toMigrate.length}</strong> produtos precisam de migração
                                </span>
                            </div>

                            {/* Unknown */}
                            {unknown.length > 0 && (
                                <div className="flex items-center gap-2 text-sm">
                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                    <span className="text-gray-700 dark:text-gray-300">
                                        <strong>{unknown.length}</strong> produtos com categoria desconhecida
                                    </span>
                                </div>
                            )}

                            {/* List products to migrate */}
                            {toMigrate.length > 0 && (
                                <div className="mt-3 max-h-60 overflow-y-auto rounded-lg border">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                                            <tr>
                                                <th className="text-left p-2.5 font-medium text-gray-500 dark:text-gray-400">Produto</th>
                                                <th className="text-left p-2.5 font-medium text-gray-500 dark:text-gray-400">Antiga</th>
                                                <th className="p-2.5"></th>
                                                <th className="text-left p-2.5 font-medium text-gray-500 dark:text-gray-400">Nova</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {toMigrate.map((p) => (
                                                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <td className="p-2.5 truncate max-w-48">{p.title}</td>
                                                    <td className="p-2.5">
                                                        <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded text-xs">{p.oldCategory}</span>
                                                    </td>
                                                    <td className="p-1">
                                                        <ArrowRight className="h-3 w-3 text-gray-400" />
                                                    </td>
                                                    <td className="p-2.5">
                                                        <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded text-xs font-medium">{p.newCategory}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Unknown categories */}
                            {unknown.length > 0 && (
                                <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                                    <p className="text-xs font-medium text-red-700 mb-1.5">Categorias desconhecidas (precisam de revisão manual):</p>
                                    {unknown.map((u) => (
                                        <p key={u.id} className="text-xs text-red-600">
                                            • {u.title} — <code>{u.category}</code>
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </Card>

                {/* Passo 2: Migrar */}
                {scanned && toMigrate.length > 0 && (
                    <Card className="p-6 border-amber-200 bg-amber-50/30">
                        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Passo 2 — Executar Migração</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Isto vai atualizar o campo <code className="bg-white px-1 py-0.5 rounded text-xs border">category</code> de{" "}
                            <strong>{toMigrate.length}</strong> produtos no Firestore. A operação é segura — apenas muda o valor da categoria.
                        </p>
                        <Button
                            onClick={handleMigrate}
                            disabled={migrating}
                            className="bg-amber-600 hover:bg-amber-700"
                        >
                            {migrating ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    A migrar...
                                </>
                            ) : (
                                <>
                                    <Database className="h-4 w-4 mr-2" />
                                    Migrar {toMigrate.length} Produtos
                                </>
                            )}
                        </Button>
                    </Card>
                )}

                {/* Migration Results */}
                {results.length > 0 && (
                    <Card className="p-6">
                        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Resultados da Migração</h2>
                        <div className="max-h-60 overflow-y-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                                    <tr>
                                        <th className="text-left p-2.5 font-medium text-gray-500 dark:text-gray-400">Produto</th>
                                        <th className="text-left p-2.5 font-medium text-gray-500 dark:text-gray-400">De → Para</th>
                                        <th className="text-right p-2.5 font-medium text-gray-500 dark:text-gray-400">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {results.map((r) => (
                                        <tr key={r.id} className={r.success ? "bg-green-50/50" : "bg-red-50/50"}>
                                            <td className="p-2.5 truncate max-w-48">{r.title}</td>
                                            <td className="p-2.5 text-xs">
                                                <span className="text-gray-500 dark:text-gray-400">{r.oldCategory}</span>
                                                <ArrowRight className="h-3 w-3 inline mx-1 text-gray-400" />
                                                <span className="font-medium">{r.newCategory}</span>
                                            </td>
                                            <td className="p-2.5 text-right">
                                                {r.success ? (
                                                    <span className="text-green-700 text-xs font-medium">✓ OK</span>
                                                ) : (
                                                    <span className="text-red-600 text-xs">{r.error}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                            {results.filter((r) => r.success).length} de {results.length} migrados com sucesso.
                        </p>
                    </Card>
                )}

                {/* All done */}
                {scanned && toMigrate.length === 0 && results.length > 0 && (
                    <Card className="p-6 border-green-200 bg-green-50/50 text-center">
                        <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto mb-2" />
                        <h3 className="font-semibold text-green-800">Migração Completa!</h3>
                        <p className="text-sm text-green-700 mt-1">
                            Todos os produtos estão a usar as novas categorias.
                        </p>
                    </Card>
                )}
            </div>
        </AdminLayout>
    )
}
