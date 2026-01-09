

import { Facebook, Instagram, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function ContactSection() {
  return (
    <section className="mb-12 py-8">
      <Card className="bg-gradient-to-br from-[var(--k2k-pink)]/10 to-[var(--k2k-blue)]/10">
        <CardContent className="p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold md:text-3xl">Não encontrou o que procura?</h2>
          <p className="mb-6 text-muted-foreground">
            Contacte-nos através das redes sociais ou email e diga-nos o que precisa!
          </p>
          <p className="mb-6 text-lg font-semibold text-[var(--k2k-pink)]">
            Temos mais de 20.000 artigos únicos disponíveis para si!
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              className="gap-2 border-[var(--k2k-blue)] text-[var(--k2k-blue)] hover:bg-[var(--k2k-blue)] hover:text-white bg-transparent"
              asChild
            >
              <a href="https://www.facebook.com/k2ktelheiras" target="_blank" rel="noopener noreferrer">
                <Facebook className="h-5 w-5" />
                Facebook
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-2 border-[var(--k2k-pink)] text-[var(--k2k-pink)] hover:bg-[var(--k2k-pink)] hover:text-white bg-transparent"
              asChild
            >
              <a href="https://www.instagram.com/kidtokid_telheiras/" target="_blank" rel="noopener noreferrer">
                <Instagram className="h-5 w-5" />
                Instagram
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-2 border-[var(--k2k-blue)] text-[var(--k2k-blue)] hover:bg-[var(--k2k-blue)] hover:text-white bg-transparent"
              asChild
            >
              <a href="http://m.me/k2ktelheiras" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5" />
                Messenger
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
