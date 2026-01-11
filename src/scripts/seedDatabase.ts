/**
 * Script para popular a base de dados Firebase com produtos iniciais
 * 
 * Para executar este script:
 * 1. Configure as variáveis de ambiente no ficheiro .env
 * 2. Execute: npx tsx src/scripts/seedDatabase.ts
 * 
 * Ou pode usar este código numa página de admin para popular a base de dados
 */

import { addProduct } from "@/src/services/productService"
import type { IProduct, ProductCondition } from "@/src/types"

const brands = ["Zara Kids", "H&M", "Gap Kids", "Next", "Mango Kids", "Mayoral", "Chicco"]
const conditions: ProductCondition[] = ["new", "good", "used"]
const sizes = [
  "0-3M", "3-6M", "6-9M", "9-12M", "12-18M", "18-24M",
  "2-3A", "3-4A", "4-5A", "5-6A", "6-7A", "7-8A",
  "8-9A", "9-10A", "10-11A", "11-12A",
]

const categoryData: Record<string, { titles: string[]; gender: "menina" | "menino" | "unisex" }> = {
  brinquedos: {
    titles: ["Carro de Brincar", "Boneca", "Puzzle", "Jogo de Tabuleiro", "Peluche", "Lego", "Bola"],
    gender: "unisex",
  },
  babygrows: {
    titles: ["Babygrow Estampado", "Babygrow Liso", "Body Manga Curta", "Body Manga Comprida", "Pijama"],
    gender: "unisex",
  },
  menina: {
    titles: ["Vestido", "Saia", "Calças", "Casaco", "T-shirt", "Sweater", "Leggings"],
    gender: "menina",
  },
  menino: {
    titles: ["Calças de Ganga", "T-shirt", "Camisa", "Casaco", "Sweater", "Calções"],
    gender: "menino",
  },
  calcado: {
    titles: ["Ténis", "Botas", "Sandálias", "Sapatilhas", "Sapatos"],
    gender: "unisex",
  },
  maternidade: {
    titles: ["Vestido Grávida", "Top Amamentação", "Calças Grávida", "Blusa Maternidade"],
    gender: "unisex",
  },
  puericultura: {
    titles: ["Biberão", "Chupeta", "Toalhas", "Fraldas Reutilizáveis", "Babete"],
    gender: "unisex",
  },
  equipamentos: {
    titles: ["Carrinho de Bebé", "Cadeira Auto", "Alcofa", "Espreguiçadeira", "Parque"],
    gender: "unisex",
  },
  agasalhos: {
    titles: ["Casaco de Inverno", "Blusão", "Parka", "Gilet", "Impermeável"],
    gender: "unisex",
  },
  praia: {
    titles: ["Fato de Banho", "Bikini", "Calções de Banho", "T-shirt UV", "Chapéu de Sol"],
    gender: "unisex",
  },
  carnaval: {
    titles: ["Fato de Princesa", "Fato de Super-Herói", "Fato de Animal", "Acessórios Carnaval"],
    gender: "unisex",
  },
}

function generateProduct(category: string, index: number): Omit<IProduct, "id"> {
  const catData = categoryData[category] || categoryData.menina
  const condition = conditions[Math.floor(Math.random() * conditions.length)]
  const basePrice = Math.random() * 30 + 5
  const hasDiscount = Math.random() > 0.6

  return {
    title: `${catData.titles[Math.floor(Math.random() * catData.titles.length)]} ${index + 1}`,
    brand: brands[Math.floor(Math.random() * brands.length)],
    price: Number.parseFloat(basePrice.toFixed(2)),
    originalPrice: hasDiscount ? Number.parseFloat((basePrice * 1.5).toFixed(2)) : undefined,
    size: sizes[Math.floor(Math.random() * sizes.length)],
    condition,
    images: [`/placeholder.svg?height=400&width=400&query=${category}`],
    category,
    gender: catData.gender,
    stock: Math.random() > 0.2 ? 1 : 0,
    isReserved: false,
    description: `Artigo de segunda mão em ${
      condition === "new" ? "estado novo" : condition === "good" ? "bom estado" : "estado usado"
    }. Ideal para crianças.`,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
  }
}

export async function seedProducts(productsPerCategory: number = 10) {
  const categories = Object.keys(categoryData)
  let totalAdded = 0

  for (const category of categories) {
    console.log(`A adicionar produtos para categoria: ${category}`)
    
    for (let i = 0; i < productsPerCategory; i++) {
      try {
        const product = generateProduct(category, i)
        await addProduct(product)
        totalAdded++
      } catch (error) {
        console.error(`Erro ao adicionar produto ${i} da categoria ${category}:`, error)
      }
    }
  }

  console.log(`✅ Adicionados ${totalAdded} produtos à base de dados!`)
  return totalAdded
}

// Para executar diretamente
// seedProducts(10).then(() => process.exit(0))
