

import { Facebook, Instagram, Phone, MapPin, Clock } from "lucide-react"
import { Link } from "react-router-dom"

export function Footer() {
  return (
    <footer className="border-t bg-gray-50 py-6 md:py-8">
      <div className="container mx-auto px-4">
        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* Logo and Description */}
          <div className="text-center sm:text-left">
            <div className="mb-3 md:mb-4 flex justify-center sm:justify-start">
              <img src="/logo.png" alt="Kid to Kid Braga" className="h-8 md:h-10" />
            </div>
            <p className="mb-3 md:mb-4 text-sm text-muted-foreground">
              Loja de roupa e artigos de crianças em segunda mão. Compre com confiança!
            </p>
            <div className="flex gap-4 justify-center sm:justify-start">
              <a
                href="https://www.facebook.com/Kid-to-Kid-Braga-419643264796595/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-k2k-blue hover:opacity-80"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5 md:h-6 md:w-6" />
              </a>
              <a
                href="https://www.instagram.com/kidtokidbraga_"
                target="_blank"
                rel="noopener noreferrer"
                className="text-k2k-blue hover:opacity-80"
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
                <span>Rua do Raio, 9<br />4710-926 Braga</span>
              </li>
              <li className="flex items-center gap-2 justify-center sm:justify-start">
                <Phone className="h-4 w-4 shrink-0" />
                <a href="tel:+351253215379" className="hover:text-k2k-blue">
                  +351 253 215 379
                </a>
              </li>
              <li className="flex items-start gap-2 justify-center sm:justify-start">
                <Clock className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Seg-Sáb: 10:00 - 19:00<br />Domingo: Fechado</span>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div className="text-center sm:text-left">
            <h4 className="mb-3 md:mb-4 font-semibold text-sm md:text-base">Links Rápidos</h4>
            <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-k2k-blue">
                  Loja
                </Link>
              </li>
              <li>
                <Link to="/sobre" className="text-muted-foreground hover:text-k2k-blue">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link to="/termos" className="text-muted-foreground hover:text-k2k-blue">
                  Termos e Condições
                </Link>
              </li>
              <li>
                <Link to="/privacidade" className="text-muted-foreground hover:text-k2k-blue">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div className="text-center sm:text-left">
            <h4 className="mb-3 md:mb-4 font-semibold text-sm md:text-base">Informações</h4>
            <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><span className="text-k2k-blue">•</span> Portes Grátis acima de 60€</li>
              <li className="flex items-center gap-2"><span className="text-k2k-blue">•</span> 3,99€ em compras acima de 39,99€</li>
              <li className="flex items-center gap-2"><span className="text-k2k-blue">•</span> Artigos verificados</li>
              <li className="flex items-center gap-2"><span className="text-k2k-blue">•</span> Moda sustentável</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 md:mt-8 border-t pt-4 md:pt-8 text-center text-xs md:text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Kid to Kid Braga. Todos os direitos reservados.</p>
          <p className="mt-1">
            <a href="mailto:info@kidtokid.pt" className="hover:text-k2k-blue">info@kidtokid.pt</a>
          </p>
        </div>
      </div>
    </footer>
  )
}

