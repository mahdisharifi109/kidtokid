import { Header } from "@/src/components/layout/Header"
import { Footer } from "@/src/components/Footer"
import { MapPin, Phone, Clock, Mail } from "lucide-react"
import { usePageTitle } from "@/src/hooks/usePageTitle"

export default function AboutPage() {
  usePageTitle("Sobre Nós")
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-4 py-8 md:py-14 max-w-4xl">
        {/* Intro */}
        <div className="mb-12 md:mb-16 max-w-2xl">
          <img
            src="/logo.png"
            alt="Kid to Kid Braga"
            className="h-12 md:h-14 w-auto mb-6"
          />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Sobre nós
          </h1>
          <p className="text-gray-600 text-base md:text-lg leading-relaxed">
            Somos uma família que adora crianças — e acreditamos que as melhores peças merecem uma segunda vida.
            Compramos e vendemos roupa, brinquedos e artigos infantis com carinho e a preços amigos.
          </p>
        </div>

        {/* Arrume e Ganhe */}
        <section className="mb-12 md:mb-16">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">
            Arrume e ganhe
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>
                Num piscar de olhos, os miúdos crescem e aquela roupinha favorita já não lhes serve.
                Em vez de ficar no fundo da gaveta, essas peças podem ter uma nova história
                e ainda colocar dinheiro no seu bolso.
              </p>
              <p>
                Na Kid to Kid, tratamos cada peça com o mesmo carinho que a sua família lhe deu.
                Traga-nos o calçado, a roupa e os brinquedos que já não usam — avaliamos tudo na hora.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 mb-3">Neste momento procuramos:</p>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="flex items-center gap-2.5">
                  <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                  Roupa de rapaz (6-12 anos)
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                  Andarilhos e Parques
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                  Brinquedos didáticos
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                  Cadeiras de Papa
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                  Camas de viagem
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Promoções */}
        <section className="mb-12 md:mb-16">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">
            Surpresas especiais
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-gray-50 rounded-lg p-5">
              <h3 className="font-medium text-gray-900 mb-2">Laços de todas as cores</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Temos laços de todas as cores e feitios: grandes, pequenos, com bolinhas ou lisinhos.
                A partir de 2,99€.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-5">
              <h3 className="font-medium text-gray-900 mb-2">Clube do Livro</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Receba um livro grátis (até 2€) todos os meses com qualquer compra.
                Basta apresentar o cartão — 1 por família.
              </p>
            </div>
          </div>
        </section>

        {/* Valores */}
        <section className="mb-12 md:mb-16">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">
            O que nos move
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h3 className="font-medium text-gray-900 mb-1.5">Sustentabilidade</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Cada peça que ganha uma nova vida é menos desperdício. Cuidamos do planeta para os nossos filhos.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1.5">Qualidade</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Analisamos todos os artigos com atenção. Se não está em bom estado, não entra na loja.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1.5">Comunidade</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Somos mais do que uma loja — somos uma comunidade de famílias que se ajudam.
              </p>
            </div>
          </div>
        </section>

        {/* Onde estamos */}
        <section className="mb-12 md:mb-16">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6">
            Onde estamos
          </h2>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Mapa */}
            <div className="rounded-lg overflow-hidden border border-gray-200 h-72 md:h-80">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d748.7!2d-8.4266!3d41.5509!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd24fee7dcb51c67%3A0x3c9e60c8c4d9a7c2!2sR.%20do%20Raio%209%2C%204710-926%20Braga!5e0!3m2!1spt-PT!2spt!4v1706601600000!5m2!1spt-PT!2spt"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização Kid to Kid Braga"
              ></iframe>
            </div>

            {/* Informações */}
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Morada</p>
                  <p className="text-sm text-gray-500">
                    Rua do Raio, 9<br />
                    4710-926 Braga
                  </p>
                  <a
                    href="https://www.google.com/maps/place/Kid+To+Kid+Braga/@41.550932,-8.4201418,17z"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                  >
                    Abrir no Google Maps
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-gray-400 shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Telefone</p>
                  <a href="tel:+351253215379" className="text-sm text-gray-500 hover:text-blue-600">
                    +351 253 215 379
                  </a>
                  <p className="text-xs text-gray-400">Chamada para rede fixa nacional</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-gray-400 shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <a href="mailto:info@kidtokid.pt" className="text-sm text-gray-500 hover:text-blue-600">
                    info@kidtokid.pt
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-gray-400 shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1.5">Horário</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between gap-8">
                      <span className="text-gray-500">Segunda a Sábado</span>
                      <span className="text-gray-700">10:00 – 19:00</span>
                    </div>
                    <div className="flex justify-between gap-8">
                      <span className="text-gray-500">Domingo</span>
                      <span className="text-red-500">Fechado</span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    Compras de artigos aceites até uma hora antes do fecho.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pagamentos */}
        <section className="pt-8 border-t border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Pagamentos seguros</h2>
          <p className="text-sm text-gray-500 mb-5">
            Todos os pagamentos são processados com encriptação SSL por entidades bancárias certificadas.
          </p>
          <div className="flex flex-wrap gap-3">
            {["Multibanco", "MB Way", "Cartão", "Dinheiro (na loja)"].map((method) => (
              <span
                key={method}
                className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2"
              >
                {method}
              </span>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

