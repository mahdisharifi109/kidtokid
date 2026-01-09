import { Header } from "@/src/components/layout/Header"
import { Footer } from "@/src/components/Footer"
import { Card } from "@/components/ui/card"
import { Recycle, Heart, Users, TrendingUp } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            Sobre a <span className="text-k2k-pink">Kid to Kid</span>
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
            Somos a maior loja de artigos de crianças em segunda mão em Portugal. A nossa missão é ajudar famílias a
            poupar dinheiro enquanto protegem o planeta.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-16 grid gap-6 md:grid-cols-4">
          {[
            { label: "Produtos Vendidos", value: "50.000+", icon: TrendingUp },
            { label: "Famílias Servidas", value: "10.000+", icon: Users },
            { label: "CO₂ Poupado", value: "15 ton", icon: Recycle },
            { label: "Satisfação", value: "98%", icon: Heart },
          ].map((stat, idx) => {
            const Icon = stat.icon
            return (
              <Card key={idx} className="p-6 text-center">
                <Icon className="mx-auto mb-3 h-8 w-8 text-k2k-pink" />
                <div className="text-3xl font-bold text-k2k-blue">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            )
          })}
        </div>

        {/* Our Story */}
        <div className="mb-16">
          <h2 className="mb-6 text-3xl font-bold">A Nossa História</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <p className="mb-4 text-muted-foreground">
                A Kid to Kid nasceu em 2015 com um objetivo simples: tornar a roupa e artigos de crianças mais
                acessíveis e sustentáveis. Sabemos que as crianças crescem rapidamente e que muitas peças ficam quase
                novas quando já não servem.
              </p>
              <p className="text-muted-foreground">
                Criámos uma plataforma onde pais podem comprar e vender artigos de qualidade a preços justos,
                prolongando a vida útil de cada peça e reduzindo o desperdício.
              </p>
            </div>
            <div>
              <p className="mb-4 text-muted-foreground">
                Hoje, somos orgulhosamente a maior comunidade portuguesa de famílias conscientes que escolhem a
                sustentabilidade sem comprometer a qualidade. Cada artigo é cuidadosamente verificado pela nossa equipa
                antes de estar disponível.
              </p>
              <p className="text-muted-foreground">
                Mais do que uma loja, somos um movimento de famílias que acreditam num futuro melhor para os nossos
                filhos e para o planeta.
              </p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div>
          <h2 className="mb-6 text-3xl font-bold">Os Nossos Valores</h2>
          <div className="grid gap-6 md:grid-cols-3">
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
              <Card key={idx} className="p-6">
                <h3 className="mb-3 text-xl font-bold text-k2k-pink">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
