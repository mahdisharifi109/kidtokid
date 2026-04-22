import { doc, getDoc, onSnapshot } from "firebase/firestore"
import { db } from "@/src/lib/firebase"

// Types

export interface StoreSettings {
    // Informações da Loja
    storeName: string
    storeEmail: string
    storePhone: string
    storeAddress: string
    storeCity: string
    storePostalCode: string
    
    // Horário
    weekdayHours: string
    saturdayHours: string
    sundayHours: string
    
    // Envio
    freeShippingThreshold: number
    standardShippingCost: number
    expressShippingCost: number
    pickupEnabled: boolean
    
    // Pagamento
    stripeEnabled: boolean
    shopPaymentEnabled: boolean
    
    // Notificações
    orderNotificationEmail: string
    lowStockThreshold: number
    emailNotificationsEnabled: boolean
    
    // SEO
    seoTitle: string
    seoDescription: string
    
    // Proteção
    protectionFee?: number

    // Outros
    maintenanceMode: boolean
    allowGuestCheckout: boolean
}

// Default values

export const defaultSettings: StoreSettings = {
    storeName: "Kid to Kid Braga",
    storeEmail: "info@kidtokid.pt",
    storePhone: "+351 253 215 379",
    storeAddress: "Rua do Raio, 9",
    storeCity: "Braga",
    storePostalCode: "4710-926",
    
    weekdayHours: "10:00 - 19:00",
    saturdayHours: "10:00 - 19:00",
    sundayHours: "Fechado",
    
    freeShippingThreshold: 50,
    standardShippingCost: 4.50,
    expressShippingCost: 8.90,
    pickupEnabled: true,
    
    stripeEnabled: true,
    shopPaymentEnabled: true,
    
    orderNotificationEmail: "info@kidtokid.pt",
    lowStockThreshold: 5,
    emailNotificationsEnabled: true,
    
    seoTitle: "Kid to Kid Braga | Roupa de Criança",
    seoDescription: "Descubra roupa de qualidade para crianças a preços acessíveis. Sustentabilidade e economia para a tua família.",
    
    maintenanceMode: false,
    allowGuestCheckout: false
}

// Local cache

let cachedSettings: StoreSettings | null = null
let lastFetch: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

// API

/**
 * Carrega as definições da loja do Firestore
 * Usa cache local para evitar chamadas desnecessárias
 */
export async function getStoreSettings(): Promise<StoreSettings> {
    const now = Date.now()
    
    // Retornar cache se ainda válido
    if (cachedSettings && (now - lastFetch) < CACHE_DURATION) {
        return cachedSettings
    }
    
    try {
        const docRef = doc(db, "settings", "store")
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
            cachedSettings = { ...defaultSettings, ...docSnap.data() as StoreSettings }
        } else {
            cachedSettings = defaultSettings
        }
        
        lastFetch = now
        return cachedSettings
    } catch (error) {
        console.error("Ups! Problema ao carregar definições:", error)
        return defaultSettings
    }
}

/**
 * Subscreve a alterações em tempo real nas definições
 */
export function subscribeToSettings(callback: (settings: StoreSettings) => void): () => void {
    const docRef = doc(db, "settings", "store")
    
    return onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
            const settings = { ...defaultSettings, ...doc.data() as StoreSettings }
            cachedSettings = settings
            lastFetch = Date.now()
            callback(settings)
        } else {
            callback(defaultSettings)
        }
    }, (error) => {
        console.error("Ups! Problema ao subscrever definições:", error)
        callback(defaultSettings)
    })
}

/**
 * Limpa o cache das definições
 */
export function clearSettingsCache(): void {
    cachedSettings = null
    lastFetch = 0
}

/**
 * Calcula o custo de envio baseado nas definições
 */
export function calculateShippingCost(
    subtotal: number, 
    method: 'standard' | 'express' | 'pickup',
    settings: StoreSettings
): number {
    // Levantamento em loja é sempre grátis
    if (method === 'pickup') {
        return 0
    }
    
    // Envio grátis acima do limite
    if (subtotal >= settings.freeShippingThreshold) {
        return 0
    }
    
    // Retornar custo baseado no método
    return method === 'express' 
        ? settings.expressShippingCost 
        : settings.standardShippingCost
}

/**
 * Verifica se o envio é grátis para um determinado valor
 */
export function isFreeShipping(subtotal: number, settings: StoreSettings): boolean {
    return subtotal >= settings.freeShippingThreshold
}

/**
 * Retorna quanto falta para envio grátis
 */
export function amountForFreeShipping(subtotal: number, settings: StoreSettings): number {
    const remaining = settings.freeShippingThreshold - subtotal
    return remaining > 0 ? remaining : 0
}

/**
 * Retorna os métodos de pagamento ativos
 */
export function getActivePaymentMethods(settings: StoreSettings): string[] {
    const methods: string[] = []
    
    if (settings.stripeEnabled) methods.push('card')
    if (settings.shopPaymentEnabled) methods.push('shop')
    
    return methods
}

/**
 * Formata a morada completa da loja
 */
export function getFormattedStoreAddress(settings: StoreSettings): string {
    return `${settings.storeAddress}, ${settings.storePostalCode} ${settings.storeCity}`
}
