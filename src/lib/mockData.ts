import type { IProduct } from "@/src/types"

// Generate mock products for different categories
export function generateMockProducts(category?: string, count = 20): IProduct[] {
  const brands = ["Zara Kids", "H&M", "Gap Kids", "Next", "Mango Kids", "Mayoral", "Chicco"]
  const conditions: Array<"new" | "good" | "used"> = ["new", "good", "used"]
  const sizes = [
    "0-3M",
    "3-6M",
    "6-9M",
    "9-12M",
    "12-18M",
    "18-24M",
    "2-3A",
    "3-4A",
    "4-5A",
    "5-6A",
    "6-7A",
    "7-8A",
    "8-9A",
    "9-10A",
    "10-11A",
    "11-12A",
  ]

  const products: IProduct[] = []

  const categoryTitles: Record<string, string[]> = {
    brinquedos: ["Carro de Brincar", "Boneca", "Puzzle", "Jogo de Tabuleiro", "Peluche", "Lego", "Bola"],
    babygrows: ["Babygrow Estampado", "Babygrow Liso", "Body Manga Curta", "Body Manga Comprida", "Pijama"],
    menina: ["Vestido", "Saia", "Calças", "Casaco", "T-shirt", "Sweater", "Leggings"],
    menino: ["Calças de Ganga", "T-shirt", "Camisa", "Casaco", "Sweater", "Calções"],
    calcado: ["Ténis", "Botas", "Sandálias", "Sapatilhas", "Sapatos"],
    maternidade: ["Vestido Grávida", "Top Amamentação", "Calças Grávida", "Blusa Maternidade"],
    puericultura: ["Biberão", "Chupeta", "Toalhas", "Fraldas Reutilizáveis", "Babete"],
    equipamentos: ["Carrinho de Bebé", "Cadeira Auto", "Alcofa", "Espreguiçadeira", "Parque"],
    agasalhos: ["Casaco de Inverno", "Blusão", "Parka", "Gilet", "Impermeável"],
    praia: ["Fato de Banho", "Bikini", "Calções de Banho", "T-shirt UV", "Chapéu de Sol"],
    carnaval: ["Fato de Princesa", "Fato de Super-Herói", "Fato de Animal", "Acessórios Carnaval"],
  }

  const titles = categoryTitles[category || "menina"] || categoryTitles.menina

  for (let i = 0; i < count; i++) {
    const condition = conditions[Math.floor(Math.random() * conditions.length)]
    const basePrice = Math.random() * 30 + 5
    const hasDiscount = Math.random() > 0.6

    products.push({
      id: `${category}-${i}`,
      title: `${titles[Math.floor(Math.random() * titles.length)]} ${Math.floor(Math.random() * 100)}`,
      brand: brands[Math.floor(Math.random() * brands.length)],
      price: Number.parseFloat(basePrice.toFixed(2)),
      originalPrice: hasDiscount ? Number.parseFloat((basePrice * 1.5).toFixed(2)) : undefined,
      size: sizes[Math.floor(Math.random() * sizes.length)],
      condition,
      images: [`/placeholder.svg?height=400&width=400&query=${category || "kids clothing"}`],
      category: category || "menina",
      gender: category === "menina" || category === "menino" ? category : "unisex",
      stock: Math.random() > 0.2 ? 1 : 0,
      isReserved: false,
      description: `Artigo de segunda mão em ${condition === "new" ? "estado novo" : condition === "good" ? "bom estado" : "estado usado"}. Ideal para crianças.`,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    })
  }

  return products
}

export const allProducts = generateMockProducts("menina", 100)
