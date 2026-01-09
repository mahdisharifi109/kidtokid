

import { Facebook, Instagram, MessageCircle } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Logo and Description */}
          <div className="col-span-2">
            <h3 className="mb-4 text-2xl font-bold">
              <span className="text-k2k-pink">Kid to Kid</span>{" "}
              <span className="text-k2k-blue">Telheiras</span>
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Loja de roupa e artigos de crianças em segunda mão. Compre e venda com confiança!
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/k2ktelheiras"
                target="_blank"
                rel="noopener noreferrer"
                className="text-k2k-blue hover:opacity-80"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href="https://www.instagram.com/kidtokid_telheiras/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-k2k-pink hover:opacity-80"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a
                href="http://m.me/k2ktelheiras"
                target="_blank"
                rel="noopener noreferrer"
                className="text-k2k-blue hover:opacity-80"
              >
                <MessageCircle className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-4 font-semibold">Links Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/loja" className="text-muted-foreground hover:text-k2k-pink">
                  Loja
                </a>
              </li>
              <li>
                <a href="/sobre" className="text-muted-foreground hover:text-k2k-pink">
                  Sobre Nós
                </a>
              </li>
              <li>
                <a href="/vender" className="text-muted-foreground hover:text-k2k-pink">
                  Vender-nos
                </a>
              </li>
              <li>
                <a href="/devolucoes" className="text-muted-foreground hover:text-k2k-pink">
                  Devoluções
                </a>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="mb-4 font-semibold">Informações</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Portes Grátis acima de €60</li>
              <li>€3,99 em compras acima de €39,99</li>
              <li>Promoções válidas até final de stock</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Kid to Kid Online Telheiras. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
