

import { useEffect, useState } from "react"
import { Facebook, Instagram, Phone, MapPin, Clock, Send } from "lucide-react"
import { Link } from "react-router-dom"
import { getStoreSettings, type StoreSettings, defaultSettings } from "@/src/services/settingsService"
import { doc, setDoc, Timestamp } from "firebase/firestore"
import { db } from "@/src/lib/firebase"
import { toast } from "sonner"

export function Footer() {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings)
  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [isSubscribing, setIsSubscribing] = useState(false)

  useEffect(() => {
    getStoreSettings().then(setSettings)
  }, [])

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    const email = newsletterEmail.trim().toLowerCase()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Email inválido")
      return
    }

    setIsSubscribing(true)
    try {
      await setDoc(doc(db, "newsletter", email), {
        email,
        subscribedAt: Timestamp.now(),
        active: true,
      })
      toast.success("Subscrito com sucesso! 🎉")
      setNewsletterEmail("")
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code
      if (code === "permission-denied") {
        toast.info("Este email já está subscrito!")
        setNewsletterEmail("")
      } else {
        console.error("Erro na subscrição:", error)
        toast.error("Erro ao subscrever. Tenta novamente.")
      }
    } finally {
      setIsSubscribing(false)
    }
  }

  return (
    <footer className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 sm:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* Logo and Description */}
          <div className="text-center sm:text-left">
            <div className="mb-3 md:mb-4 flex justify-center sm:justify-start">
              <img src="/logo.png" alt={settings.storeName} className="h-8 md:h-10" />
            </div>
            <p className="mb-3 md:mb-4 text-sm text-muted-foreground">
              Roupa e artigos de criança com nova vida, a preços amigos ❤️
            </p>
            <div className="flex gap-4 justify-center sm:justify-start">
              <a
                href="https://www.facebook.com/Kid-to-Kid-Braga-419643264796595/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:scale-110 transition-transform"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5 md:h-6 md:w-6" />
              </a>
              <a
                href="https://www.instagram.com/kidtokidbraga_"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:scale-110 transition-transform"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5 md:h-6 md:w-6" />
              </a>
            </div>
          </div>

          {/* Contactos */}
          <div className="text-center sm:text-left">
            <h4 className="mb-3 md:mb-4 font-semibold text-sm md:text-base">Contactos</h4>
            <ul className="space-y-2 text-xs md:text-sm text-muted-foreground">
              <li className="flex items-start gap-2 justify-center sm:justify-start">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{settings.storeAddress}<br />{settings.storePostalCode} {settings.storeCity}</span>
              </li>
              <li className="flex items-center gap-2 justify-center sm:justify-start">
                <Phone className="h-4 w-4 shrink-0" />
                <a href={`tel:${settings.storePhone.replace(/\s/g, '')}`} className="hover:text-blue-600">
                  {settings.storePhone}
                </a>
              </li>
              <li className="flex items-start gap-2 justify-center sm:justify-start">
                <Clock className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Seg-Sex: {settings.weekdayHours}<br />Sáb: {settings.saturdayHours}<br />Dom: {settings.sundayHours}</span>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div className="text-center sm:text-left">
            <h4 className="mb-3 md:mb-4 font-semibold text-sm md:text-base">Links Rápidos</h4>
            <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-blue-600">
                  Loja
                </Link>
              </li>
              <li>
                <Link to="/sobre" className="text-muted-foreground hover:text-blue-600">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link to="/termos-e-condicoes" className="text-muted-foreground hover:text-blue-600">
                  Termos e Condições
                </Link>
              </li>
              <li>
                <Link to="/politica-de-privacidade" className="text-muted-foreground hover:text-blue-600">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link to="/ajuda" className="text-muted-foreground hover:text-blue-600">
                  Ajuda
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="text-muted-foreground hover:text-blue-600">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter & Info */}
          <div className="text-center sm:text-left">
            <h4 className="mb-3 md:mb-4 font-semibold text-sm md:text-base text-gray-800 dark:text-gray-100">Newsletter</h4>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-3">Recebe novidades e promoções exclusivas!</p>
            <form onSubmit={handleNewsletterSubscribe} className="flex gap-2 max-w-xs mx-auto sm:mx-0">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="O teu email"
                className="flex-1 min-w-0 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none dark:text-gray-100"
                disabled={isSubscribing}
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="shrink-0 rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                aria-label="Subscrever"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <ul className="space-y-2 md:space-y-3 text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-4">
              <li className="flex items-center gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-600" /> Portes Grátis acima de €{settings.freeShippingThreshold}</li>
              <li className="flex items-center gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-600" /> Envio: €{settings.standardShippingCost.toFixed(2)}</li>
              <li className="flex items-center gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-green-600" /> Artigos verificados</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 md:mt-12 border-t border-gray-100 dark:border-gray-800 pt-6 md:pt-8 text-center text-xs md:text-sm text-gray-400 dark:text-gray-500">
          <p>&copy; {new Date().getFullYear()} {settings.storeName}. Todos os direitos reservados.</p>
          <p className="mt-1.5">
            <a href={`mailto:${settings.storeEmail}`} className="hover:text-blue-600 transition-colors">{settings.storeEmail}</a>
          </p>
        </div>
      </div>
    </footer>
  )
}

