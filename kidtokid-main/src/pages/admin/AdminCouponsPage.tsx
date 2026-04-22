import { useState, useEffect } from "react"
import { AdminLayout } from "@/src/components/admin/AdminLayout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Trash2,
  Loader2,
  Tag,
  Percent,
  Euro,
  Calendar,
  ToggleLeft,
  ToggleRight,
} from "lucide-react"
import { toast } from "sonner"
import {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  type Coupon,
} from "@/src/services/couponService"

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: "",
    minOrderValue: "",
    maxUses: "",
    validFrom: new Date().toISOString().split("T")[0],
    validUntil: "",
  })

  useEffect(() => {
    loadCoupons()
  }, [])

  const loadCoupons = async () => {
    setLoading(true)
    try {
      const data = await getAllCoupons()
      setCoupons(data)
    } catch (error) {
      console.error("Ups! Problema ao carregar cupões:", error)
      toast.error("Ups! Problema ao carregar cupões")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      minOrderValue: "",
      maxUses: "",
      validFrom: new Date().toISOString().split("T")[0],
      validUntil: "",
    })
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.code.trim()) {
      toast.error("O código é obrigatório")
      return
    }
    if (!formData.discountValue || parseFloat(formData.discountValue) <= 0) {
      toast.error("Valor do desconto inválido")
      return
    }
    if (!formData.validUntil) {
      toast.error("Data de validade é obrigatória")
      return
    }

    setSaving(true)
    try {
      await createCoupon({
        code: formData.code,
        description: formData.description,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        minOrderValue: parseFloat(formData.minOrderValue) || 0,
        maxUses: parseInt(formData.maxUses) || 0,
        isActive: true,
        validFrom: new Date(formData.validFrom),
        validUntil: new Date(formData.validUntil),
      })
      toast.success("Cupão criado!")
      resetForm()
      setShowForm(false)
      loadCoupons()
    } catch (error) {
      console.error("Ups! Problema ao criar cupão:", error)
      toast.error("Ups! Problema ao criar cupão")
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (coupon: Coupon) => {
    try {
      await updateCoupon(coupon.id, { isActive: !coupon.isActive })
      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? { ...c, isActive: !c.isActive } : c))
      )
      toast.success(coupon.isActive ? "Cupão desativado" : "Cupão ativado")
    } catch {
      toast.error("Ups! Problema ao atualizar cupão")
    }
  }

  const handleDelete = async (coupon: Coupon) => {
    if (!confirm(`Eliminar o cupão "${coupon.code}"?`)) return
    try {
      await deleteCoupon(coupon.id)
      setCoupons((prev) => prev.filter((c) => c.id !== coupon.id))
      toast.success("Cupão eliminado")
    } catch {
      toast.error("Ups! Problema ao eliminar cupão")
    }
  }

  const isExpired = (coupon: Coupon) => new Date() > coupon.validUntil
  const isMaxedOut = (coupon: Coupon) => coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses

  return (
    <AdminLayout title="Cupões" subtitle="Gerir cupões de desconto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">{coupons.length} cupões</p>
          <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Novo Cupão
          </Button>
        </div>

        {/* Create Form */}
        {showForm && (
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Novo Cupão</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Código *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="Ex: VERAO2026"
                    className="mt-1 font-mono"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ex: Desconto de verão"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label>Tipo de Desconto</Label>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({ ...formData, discountType: e.target.value as "percentage" | "fixed" })
                    }
                    className="mt-1 w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 text-sm"
                  >
                    <option value="percentage">Percentagem (%)</option>
                    <option value="fixed">Valor Fixo (€)</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="discountValue">
                    Valor {formData.discountType === "percentage" ? "(%)" : "(€)"} *
                  </Label>
                  <Input
                    id="discountValue"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="minOrderValue">Encomenda Mínima (€)</Label>
                  <Input
                    id="minOrderValue"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                    placeholder="0 = sem mínimo"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="validFrom">Válido Desde</Label>
                  <Input
                    id="validFrom"
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="validUntil">Válido Até *</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="maxUses">Máx. Utilizações</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    min="0"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                    placeholder="0 = ilimitado"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm() }}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Tag className="h-4 w-4 mr-2" />}
                  Criar Cupão
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Coupons List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 dark:text-gray-500" />
          </div>
        ) : coupons.length === 0 ? (
          <Card className="p-12 text-center">
            <Tag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">Nenhum cupão criado</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Cria o primeiro cupão de desconto para os teus clientes</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {coupons.map((coupon) => (
              <Card key={coupon.id} className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-lg text-gray-900 dark:text-gray-100">{coupon.code}</span>
                      {coupon.isActive && !isExpired(coupon) && !isMaxedOut(coupon) ? (
                        <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700">Ativo</Badge>
                      ) : isExpired(coupon) ? (
                        <Badge variant="destructive">Expirado</Badge>
                      ) : isMaxedOut(coupon) ? (
                        <Badge variant="secondary">Esgotado</Badge>
                      ) : (
                        <Badge variant="secondary">Desativado</Badge>
                      )}
                    </div>
                    {coupon.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{coupon.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500">
                      <span className="flex items-center gap-1">
                        {coupon.discountType === "percentage" ? (
                          <><Percent className="h-3 w-3" /> {coupon.discountValue}%</>
                        ) : (
                          <><Euro className="h-3 w-3" /> {coupon.discountValue.toFixed(2)}€</>
                        )}
                      </span>
                      {coupon.minOrderValue > 0 && (
                        <span>Min. {coupon.minOrderValue.toFixed(2)}€</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        até {coupon.validUntil.toLocaleDateString("pt-PT")}
                      </span>
                      <span>
                        {coupon.usedCount}{coupon.maxUses > 0 ? `/${coupon.maxUses}` : ""} utilizações
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggle(coupon)}
                      title={coupon.isActive ? "Desativar" : "Ativar"}
                    >
                      {coupon.isActive ? (
                        <ToggleRight className="h-5 w-5 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(coupon)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
