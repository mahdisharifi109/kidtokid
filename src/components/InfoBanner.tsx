

import { Package, Recycle, RotateCcw } from "lucide-react"

const features = [
  {
    icon: Package,
    title: "Milhares de artigos",
    subtitle: "Aos Melhores Preços",
    link: "/loja",
  },
  {
    icon: Recycle,
    title: "Reutilize",
    subtitle: "Ajude o Planeta",
    link: "http://www.kidtokid.pt",
  },
  {
    icon: RotateCcw,
    title: "Devoluções",
    subtitle: "Sem complicações",
    link: "/devolucoes",
  },
]

export function InfoBanner() {
  return (
    <section className="mb-12">
      <div className="grid gap-6 md:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <a
              key={index}
              href={feature.link}
              className="group flex flex-col items-center rounded-lg bg-gradient-to-br from-[var(--k2k-pink)] to-[var(--k2k-blue)] p-8 text-white transition-transform hover:scale-105"
            >
              <Icon className="mb-4 h-12 w-12" />
              <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
              <p className="text-center text-sm opacity-90">{feature.subtitle}</p>
            </a>
          )
        })}
      </div>
    </section>
  )
}
