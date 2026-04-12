/**
 * Account page tab components
 * Smaller, focused components extracted from the main AccountPage
 */

import { type ReactNode } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Phone, Edit2, Save, User, Loader2, Package, ShoppingBag, MapPin, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import type { User as FirebaseUser } from "firebase/auth"

interface AccountCardHeaderProps {
  title: string
  subtitle: string
  action?: ReactNode
}

export function AccountCardHeader({ title, subtitle, action }: AccountCardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
      </div>
      {action}
    </div>
  )
}

interface AccountFormFieldProps {
  label: string
  htmlFor: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  icon?: ReactNode
  helperText?: string
}

export function AccountFormField({
  label,
  htmlFor,
  value,
  onChange,
  disabled = false,
  placeholder,
  icon,
  helperText,
}: AccountFormFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </Label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500">{icon}</div>}
        <Input
          id={htmlFor}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className={cn("transition-all", icon && "pl-10", !disabled && "ring-2 ring-blue-100 border-blue-300")}
        />
      </div>
      {helperText && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{helperText}</p>}
    </div>
  )
}

interface AccountEditButtonsProps {
  isEditing: boolean
  isSaving?: boolean
  onEdit: () => void
  onCancel: () => void
  onSave: () => void
}

export function AccountEditButtons({ isEditing, isSaving = false, onEdit, onCancel, onSave }: AccountEditButtonsProps) {
  if (!isEditing) {
    return (
      <Button variant="outline" size="sm" onClick={onEdit}>
        <Edit2 className="h-4 w-4 mr-2" />
        Editar
      </Button>
    )
  }

  return (
    <div className="flex gap-2">
      <Button variant="ghost" size="sm" onClick={onCancel} disabled={isSaving}>
        Cancelar
      </Button>
      <Button
        size="sm"
        onClick={onSave}
        className="bg-k2k-blue hover:bg-k2k-blue/90 text-white"
        disabled={isSaving}
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        {isSaving ? "A guardar..." : "Guardar"}
      </Button>
    </div>
  )
}

interface AccountInfoItemProps {
  icon: ReactNode
  label: string
  value: string
  status?: "verified" | "unverified"
}

export function AccountInfoItem({ icon, label, value, status }: AccountInfoItemProps) {
  const iconColor = status === "verified" ? "text-green-500" : status === "unverified" ? "text-yellow-500" : "text-gray-400"

  return (
    <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-400">
      <div className={cn("h-4 w-4", iconColor)}>{icon}</div>
      <span>{value}</span>
    </div>
  )
}

interface AccountEmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: {
    label: string
    href: string
  }
}

export function AccountEmptyState({ icon, title, description, action }: AccountEmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="h-10 w-10 text-gray-300 mx-auto mb-4">{icon}</div>
      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 max-w-xs mx-auto">{description}</p>
      {action && (
        <a href={action.href}>
          <Button variant="outline" size="sm">
            {action.label}
          </Button>
        </a>
      )}
    </div>
  )
}

interface AccountLoadingStateProps {
  message?: string
}

export function AccountLoadingState({ message = "A carregar..." }: AccountLoadingStateProps) {
  return (
    <div className="flex justify-center py-16">
      <div className="text-center">
        <Loader2 className="h-6 w-6 animate-spin rounded-full mx-auto mb-3 text-k2k-blue" />
        <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
      </div>
    </div>
  )
}
