import { Header } from "@/src/components/layout/Header"
import { ProductCard } from "@/src/components/product/ProductCard"
import { HeroSlider } from "@/src/components/HeroSlider"
import { CategoryGrid } from "@/src/components/CategoryGrid"
import { ContactSection } from "@/src/components/ContactSection"
import { InfoBanner } from "@/src/components/InfoBanner"
import { Footer } from "@/src/components/Footer"
import type { IProduct } from "@/src/types"
import { useCart } from "@/src/contexts/CartContext"

// Mock data for demonstration
const mockProducts: IProduct[] = [
  {
    id: "1",
    title: "Vestido de Verão Floral",
    brand: "Zara Kids",
    price: 12.99,
    originalPrice: 29.99,
    size: "4-5 Anos",
    condition: "good",
    images: ["/kids-dress-floral.jpg"],
    category: "menina",
    gender: "menina",
    stock: 1,
    isReserved: false,
    createdAt: new Date(),
  },
  {
    id: "2",
    title: "Calças de Ganga Azul",
    brand: "H&M",
    price: 8.5,
    size: "6-7 Anos",
    condition: "used",
    images: ["/kids-jeans-blue.jpg"],
    category: "menino",
    gender: "menino",
    stock: 0,
    isReserved: false,
    createdAt: new Date(),
  },
  {
    id: "3",
    title: "Casaco de Inverno Rosa",
    brand: "Gap Kids",
    price: 22.0,
    originalPrice: 49.99,
    size: "8-9 Anos",
    condition: "good",
    images: ["/kids-winter-jacket-pink.jpg"],
    category: "menina",
    gender: "menina",
    stock: 1,
    isReserved: false,
    createdAt: new Date(),
  },
  {
    id: "4",
    title: "T-Shirt Listrada",
    brand: "Next",
    price: 5.99,
    size: "3-4 Anos",
    condition: "new",
    images: ["/kids-striped-tshirt.jpg"],
    category: "menino",
    gender: "menino",
    stock: 1,
    isReserved: false,
    createdAt: new Date(),
  },
]

export default function HomePage() {
  const { addToCart } = useCart()

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Slider */}
        <HeroSlider />

        {/* Category Grid */}
        <CategoryGrid />

        {/* Contact Section */}
        <ContactSection />

        {/* Info Banner */}
        <section className="mb-8">
          <h2 className="mb-2 text-center text-xl font-semibold text-k2k-pink">Promoções</h2>
          <p className="mb-6 text-center text-sm text-muted-foreground">
            Em artigos assinalados com "Promo", válidas de 01/01/2022 a 31/12/2022 ou até final de stock existente.
          </p>
        </section>

        <InfoBanner />

        {/* Shipping Info */}
        <section className="mb-8 rounded-lg bg-k2k-gray p-6 text-center">
          <p className="text-sm font-medium">Portes Grátis em compras superiores a €60,00 para Portugal Continental.</p>
          <p className="text-sm text-muted-foreground">3,99€ em compras superiores a 39,99€</p>
        </section>

        <section className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {mockProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
          ))}
        </section>
      </main>

      <Footer />
    </div>
  )
}
