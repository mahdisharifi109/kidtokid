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
    subtitle: "Vende-nos o que os teus filhos já não usam",
    image: "/baby-clothes-onesie.jpg",
    link: "/sobre",
  },
  {
    title: "Brinquedos",
    subtitle: "Os melhores brinquedos a preços amigos",
    image: "/colorful-kids-toys.png",
    link: "/categoria/brinquedos",
  },
  {
    title: "Roupa",
    subtitle: "Roupa de qualidade em segunda mão para todas as idades",
    image: "/diverse-girls-clothing.png",
    link: "/categoria/roupa",
  },
  {
    title: "Bebé",
    subtitle: "Tudo para o teu bebé ao melhor preço",
    image: "/baby-cute-smiling.jpg",
    link: "/categoria/bebe",
  },
]

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isPaused])

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
    <div
      className="relative mb-6 md:mb-10 overflow-hidden rounded-2xl md:rounded-3xl shadow-lg"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={index} className="min-w-full">
            <Link to={slide.link}>
              <div className="group relative aspect-video sm:aspect-21/9 overflow-hidden">
                <img
                  src={slide.image || "/placeholder.svg"}
                  alt={slide.title}
                  loading={index === 0 ? "eager" : "lazy"}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
                />
                <div className="absolute inset-0 bg-linear-to-r from-black/55 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-center p-5 sm:p-10 md:p-16">
                  <h2 className="mb-2 md:mb-3 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-white tracking-tight">{slide.title}</h2>
                  {slide.subtitle && <p className="text-sm sm:text-base md:text-lg text-white/85 max-w-md font-light">{slide.subtitle}</p>}
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
        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-gray-800/90 h-9 w-9 sm:h-11 sm:w-11 rounded-full shadow-md transition-all"
        onClick={goToPrevious}
        aria-label="Slide anterior"
      >
        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-gray-800/90 h-9 w-9 sm:h-11 sm:w-11 rounded-full shadow-md transition-all"
        onClick={goToNext}
        aria-label="Próximo slide"
      >
        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>

      {/* Dots Navigation */}
      <div className="absolute bottom-3 sm:bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
              }`}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

