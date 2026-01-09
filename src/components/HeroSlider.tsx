import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeroSlide {
  title: string
  subtitle?: string
  image: string
  link: string
}

const slides: HeroSlide[] = [
  {
    title: "CARNAVAL",
    subtitle: "Fatos e acessórios para os mais pequenos",
    image: "/carnival-costumes-kids.jpg",
    link: "/categoria/carnaval",
  },
  {
    title: "BRINQUEDOS",
    subtitle: "Milhares de brinquedos aos melhores preços",
    image: "/kids-toys-colorful.jpg",
    link: "/categoria/brinquedos",
  },
  {
    title: "ROUPA MENINA",
    subtitle: "Roupa de qualidade em segunda mão",
    image: "/girls-clothing-fashion.jpg",
    link: "/categoria/menina",
  },
]

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  return (
    <div className="relative mb-8 overflow-hidden rounded-xl">
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={index} className="min-w-full">
            <Link to={slide.link}>
              <div className="group relative aspect-21/9 overflow-hidden bg-k2k-gray">
                <img
                  src={slide.image || "/placeholder.svg"}
                  alt={slide.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/30 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-16">
                  <h2 className="mb-3 text-4xl font-bold text-white md:text-6xl">{slide.title}</h2>
                  {slide.subtitle && <p className="text-lg text-white/90 md:text-xl">{slide.subtitle}</p>}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
        onClick={goToPrevious}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
        onClick={goToNext}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Dots Navigation */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 w-2 rounded-full transition-all ${
              index === currentSlide ? "w-8 bg-white" : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
