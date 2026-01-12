import { Header } from "@/src/components/layout/Header"
import { Footer } from "@/src/components/Footer"
import { Card } from "@/components/ui/card"
import { MapPin, Phone, Clock, Mail } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12">
        {/* Hero Section */}
        <div className="mb-8 sm:mb-10 md:mb-12 text-center">
          {/* Logo */}
          <div className="mb-4 sm:mb-6 flex justify-center">
            <img 
              src="/logo.png" 
              alt="Kid to Kid Braga" 
              className="h-16 sm:h-20 md:h-24 w-auto"
            />
          </div>
          <h1 className="mb-3 sm:mb-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
            <span className="text-k2k-pink">Kid to Kid</span> Braga
          </h1>
          <p className="mx-auto max-w-3xl text-sm sm:text-base md:text-lg text-muted-foreground px-2">
            Compramos & Vendemos o que deixou de servir aos seus filhos. Loja de roupa e artigos de crianças em segunda mão.
          </p>
        </div>

        {/* Arrume e Ganhe Section */}
        <div className="mb-10 sm:mb-12 md:mb-16 bg-k2k-gray rounded-lg p-6 sm:p-8">
          <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl md:text-3xl font-bold text-center text-k2k-pink">Arrume e Ganhe</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-4 text-sm sm:text-base text-muted-foreground">
                Venha à Kid to Kid e venda-nos o que os seus filhos já não podem usar. Estamos sempre a comprar! 
                Esta é a altura em que tantas famílias fazem as suas arrumações e limpezas.
              </p>
              <p className="text-sm sm:text-base text-muted-foreground">
                Compramos roupa, calçado, brinquedos, equipamentos, puericultura… Vender à Kid to Kid é simples. Visite-nos!
              </p>
            </div>
            <div>
              <h3 className="mb-3 font-semibold text-k2k-pink">O que mais precisamos:</h3>
              <ul className="space-y-2 text-sm sm:text-base text-muted-foreground">
                <li>• Roupa de rapaz dos 6 aos 12 anos</li>
                <li>• Andarilhos e Parques</li>
                <li>• Brinquedos</li>
                <li>• Cadeiras da Papa</li>
                <li>• Camas de viagem e de grades</li>
                <li>• Cadeiras Auto Grupo 1 e Grupo 2+3</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Promoções */}
        <div className="mb-10 sm:mb-12 md:mb-16">
          <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl md:text-3xl font-bold text-k2k-pink">Promoções Especiais</h2>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <Card className="p-6 border-k2k-pink border-2">
              <h3 className="mb-3 text-lg font-bold text-k2k-pink">Laços de todas as cores</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Um laço para cada conjunto! Na Kid to Kid temos laços de todas as cores. 
                Escolha entre um laço grande, pequeno, com bolinhas ou liso. Laços a partir de 2,99€.
              </p>
            </Card>
            <Card className="p-6 border-k2k-blue border-2">
              <h3 className="mb-3 text-lg font-bold text-k2k-blue">Clube do Livro</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                O Clube do Livro oferece aos seus clientes um livro por mês. Receba um livro grátis até 2€ 
                todos os meses, com qualquer compra. Obrigatória a apresentação do cartão. 1 Cartão por família.
              </p>
            </Card>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mb-10 sm:mb-12 md:mb-16">
          <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl md:text-3xl font-bold text-k2k-pink">Visite-nos</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-k2k-pink shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold">Morada</h4>
                    <p className="text-sm text-muted-foreground">
                      Rua do Raio, 9<br />
                      4710-926 Braga<br />
                      Portugal
                    </p>
                    <a 
                      href="https://www.google.com/maps/place/Kid+To+Kid+Braga/@41.550932,-8.4201418,17z"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-k2k-pink hover:underline mt-1 inline-block"
                    >
                      Ver no Google Maps →
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-k2k-pink shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold">Telefone</h4>
                    <a href="tel:+351253215379" className="text-sm text-muted-foreground hover:text-k2k-pink">
                      +351 253 215 379
                    </a>
                    <p className="text-xs text-muted-foreground">(chamada para rede fixa nacional)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-k2k-pink shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold">Email</h4>
                    <a href="mailto:info@kidtokid.pt" className="text-sm text-muted-foreground hover:text-k2k-pink">
                      info@kidtokid.pt
                    </a>
                  </div>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-k2k-pink shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-3">Horário</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Segunda-Feira</span>
                      <span className="text-muted-foreground">10:00 - 19:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Terça-Feira</span>
                      <span className="text-muted-foreground">10:00 - 19:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quarta-Feira</span>
                      <span className="text-muted-foreground">10:00 - 19:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quinta-Feira</span>
                      <span className="text-muted-foreground">10:00 - 19:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sexta-Feira</span>
                      <span className="text-muted-foreground">10:00 - 19:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sábado</span>
                      <span className="text-muted-foreground">10:00 - 19:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Domingo</span>
                      <span className="text-red-500">Fechado</span>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground italic">
                    O horário de compras termina uma hora antes do fecho.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Values */}
        <div>
          <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl md:text-3xl font-bold text-k2k-pink">Os Nossos Valores</h2>
          <div className="grid gap-3 sm:gap-4 md:gap-6 sm:grid-cols-2 md:grid-cols-3">
            {[
              {
                title: "Sustentabilidade",
                description:
                  "Reduzimos o desperdício têxtil e promovemos a economia circular. Cada compra ajuda o planeta.",
                color: "green",
              },
              {
                title: "Qualidade",
                description:
                  "Todos os artigos são verificados e só aceitamos peças em bom estado. Garantimos a satisfação.",
                color: "blue",
              },
              {
                title: "Comunidade",
                description: "Criamos uma rede de apoio entre famílias, onde todos ganham. Juntos somos mais fortes.",
                color: "pink",
              },
            ].map((value, idx) => (
              <Card key={idx} className="p-4 sm:p-5 md:p-6">
                <h3 className="mb-2 sm:mb-3 text-base sm:text-lg md:text-xl font-bold text-k2k-pink">{value.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
