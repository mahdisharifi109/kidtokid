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
    title: "Arrume e Ganhe",
    subtitle: "Venda-nos o que os seus filhos já não podem usar",
    image: "https://images.pexels.com/photos/3661452/pexels-photo-3661452.jpeg?auto=compress&cs=tinysrgb&w=1200",
    link: "/sobre",
  },
  {
    title: "BRINQUEDOS",
    subtitle: "Milhares de brinquedos aos melhores preços",
    image: "https://images.pexels.com/photos/3661193/pexels-photo-3661193.jpeg?auto=compress&cs=tinysrgb&w=1200",
    link: "/categoria/brinquedos",
  },
  {
    title: "ROUPA MENINA",
    subtitle: "Roupa de qualidade em segunda mão",
    image: "https://images.pexels.com/photos/5693889/pexels-photo-5693889.jpeg?auto=compress&cs=tinysrgb&w=1200",
    link: "/categoria/menina",
  },
  {
    title: "ROUPA MENINO",
    subtitle: "Roupa de qualidade para rapazes",
    image: "https://images.pexels.com/photos/5693891/pexels-photo-5693891.jpeg?auto=compress&cs=tinysrgb&w=1200",
    link: "/categoria/menino",
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
    <div className="relative mb-6 md:mb-8 overflow-hidden rounded-lg md:rounded-xl">
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={index} className="min-w-full">
            <Link to={slide.link}>
              <div className="group relative aspect-video sm:aspect-21/9 overflow-hidden bg-k2k-gray">
                <img
                  src={slide.image || "/placeholder.svg"}
                  alt={slide.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/30 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-center p-4 sm:p-8 md:p-16">
                  <h2 className="mb-2 md:mb-3 text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-white">{slide.title}</h2>
                  {slide.subtitle && <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 max-w-[80%] sm:max-w-none">{slide.subtitle}</p>}
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
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white h-8 w-8 sm:h-10 sm:w-10"
        onClick={goToPrevious}
      >
        <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white h-8 w-8 sm:h-10 sm:w-10"
        onClick={goToNext}
      >
        <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
      </Button>

      {/* Dots Navigation */}
      <div className="absolute bottom-2 sm:bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 sm:gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1.5 sm:h-2 w-1.5 sm:w-2 rounded-full transition-all ${
              index === currentSlide ? "w-6 sm:w-8 bg-white" : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

