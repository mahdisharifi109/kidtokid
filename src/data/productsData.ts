/**
 * Base de dados completa Kid to Kid
 * Produtos organizados por categorias com dados realistas
 */

import type { IProduct, ProductCondition } from "@/src/types"

// Marcas populares de roupa infantil
export const BRANDS = [
  "Zara Kids", "H&M", "Mayoral", "Chicco", "Zippy", "Gocco", "Mango Kids",
  "Gap Kids", "Next", "Benetton", "Petit Bateau", "Boboli", "Tuc Tuc",
  "Neck & Neck", "Knot", "Lanidor Kids", "Laranjinha", "Losan", "Newness",
  "Prenatal", "Primark", "C&A", "Kiabi", "Vertbaudet", "Du Pareil Au Même",
  "Bonpoint", "Catimini", "Sergent Major", "Orchestra", "Okaïdi", "Jacadi"
]

// Tamanhos por faixa etária
export const SIZES = {
  bebe: ["0-1M", "0-3M", "3-6M", "6-9M", "9-12M", "12-18M", "18-24M"],
  crianca: ["2A", "3A", "4A", "5A", "6A", "7A", "8A", "9A", "10A", "11A", "12A", "14A"],
  calcado: ["16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35"],
  maternidade: ["XS", "S", "M", "L", "XL"]
}

// Estações
export const SEASONS = ["Primavera/Verão", "Outono/Inverno", "Todo o ano"]

// Cores populares
export const COLORS = [
  "Rosa", "Azul", "Branco", "Preto", "Vermelho", "Verde", "Amarelo", 
  "Laranja", "Roxo", "Bege", "Cinzento", "Marinho", "Coral", "Menta",
  "Estampado", "Riscas", "Xadrez", "Flores", "Animais", "Multicolor"
]

// Subcategorias por categoria principal
export const SUBCATEGORIES = {
  menina: [
    { name: "Vestidos", types: ["Vestido casual", "Vestido festa", "Vestido verão", "Vestido inverno", "Vestido cerimónia"] },
    { name: "Calças", types: ["Calças ganga", "Leggings", "Calças fato treino", "Calças tecido", "Calças bombazine"] },
    { name: "Saias", types: ["Saia plissada", "Saia tutu", "Saia ganga", "Saia rodada"] },
    { name: "Calções", types: ["Calções ganga", "Calções algodão", "Calções desportivos"] },
    { name: "T-shirts", types: ["T-shirt manga curta", "T-shirt manga comprida", "Top"] },
    { name: "Camisolas", types: ["Camisola malha", "Sweatshirt", "Hoodie", "Cardigan"] },
    { name: "Casacos", types: ["Casaco inverno", "Blusão", "Parka", "Impermeável", "Colete"] },
    { name: "Conjuntos", types: ["Conjunto 2 peças", "Conjunto 3 peças", "Fato treino"] },
    { name: "Pijamas", types: ["Pijama verão", "Pijama inverno", "Roupão"] }
  ],
  menino: [
    { name: "Calças", types: ["Calças ganga", "Calças chino", "Calças fato treino", "Calças cargo"] },
    { name: "Calções", types: ["Calções ganga", "Calções cargo", "Calções desportivos", "Bermudas"] },
    { name: "T-shirts", types: ["T-shirt manga curta", "T-shirt manga comprida", "Polo"] },
    { name: "Camisas", types: ["Camisa casual", "Camisa xadrez", "Camisa linho"] },
    { name: "Camisolas", types: ["Camisola malha", "Sweatshirt", "Hoodie", "Cardigan"] },
    { name: "Casacos", types: ["Casaco inverno", "Blusão", "Parka", "Impermeável", "Colete", "Bomber"] },
    { name: "Conjuntos", types: ["Conjunto 2 peças", "Conjunto 3 peças", "Fato treino"] },
    { name: "Pijamas", types: ["Pijama verão", "Pijama inverno"] }
  ],
  babygrows: [
    { name: "Babygrows", types: ["Babygrow manga comprida", "Babygrow manga curta", "Babygrow atoalhado"] },
    { name: "Bodies", types: ["Body manga comprida", "Body manga curta", "Body alças"] },
    { name: "Pijamas bebé", types: ["Pijama 1 peça", "Pijama 2 peças"] },
    { name: "Conjuntos bebé", types: ["Conjunto 2 peças", "Conjunto 3 peças", "Conjunto saída maternidade"] }
  ],
  calcado: [
    { name: "Ténis", types: ["Ténis desportivos", "Ténis casual", "Ténis luzes", "Ténis velcro"] },
    { name: "Sapatos", types: ["Sapatos clássicos", "Mocassins", "Sapatos cerimónia"] },
    { name: "Sandálias", types: ["Sandálias casual", "Sandálias praia", "Chinelos"] },
    { name: "Botas", types: ["Botas inverno", "Botas chuva", "Botins", "Botas camurça"] },
    { name: "Sapatilhas", types: ["Sapatilhas lona", "Slip-on"] },
    { name: "Pantufas", types: ["Pantufas quentes", "Pantufas personagens"] }
  ],
  brinquedos: [
    { name: "Bonecas", types: ["Boneca bebé", "Barbie", "Boneca de pano", "Acessórios boneca"] },
    { name: "Carros", types: ["Carro telecomandado", "Pista carros", "Carros miniatura"] },
    { name: "Jogos", types: ["Jogo tabuleiro", "Puzzle", "Jogo educativo", "Jogo memória"] },
    { name: "Peluches", types: ["Peluche pequeno", "Peluche grande", "Peluche personagem"] },
    { name: "Construção", types: ["Lego", "Blocos", "Construção magnética"] },
    { name: "Exterior", types: ["Bicicleta", "Trotinete", "Bola", "Brinquedos areia"] },
    { name: "Musicais", types: ["Instrumento musical", "Brinquedo sons"] }
  ],
  equipamentos: [
    { name: "Carrinhos", types: ["Carrinho passeio", "Carrinho duplo", "Carrinho guarda-chuva", "Carrinho trio"] },
    { name: "Cadeiras Auto", types: ["Ovo", "Cadeira grupo 0+", "Cadeira grupo 1", "Cadeira grupo 2/3", "Cadeira isofix"] },
    { name: "Berços", types: ["Berço madeira", "Berço viagem", "Alcofa", "Mini berço"] },
    { name: "Cadeiras Refeição", types: ["Cadeira alta", "Cadeira portátil", "Assento elevatório"] },
    { name: "Parques", types: ["Parque bebé", "Espreguiçadeira", "Baloiço bebé"] },
    { name: "Transporte", types: ["Marsúpio", "Porta-bebé", "Mochila transporte"] }
  ],
  puericultura: [
    { name: "Amamentação", types: ["Bomba leite", "Esterilizador", "Aquecedor biberões", "Almofada amamentação"] },
    { name: "Alimentação", types: ["Biberão", "Chupeta", "Babete", "Kit papa", "Copo aprendizagem"] },
    { name: "Higiene", types: ["Banheira bebé", "Muda fraldas", "Kit higiene", "Termómetro"] },
    { name: "Segurança", types: ["Barreira escadas", "Protetor tomadas", "Protetor cantos", "Intercomunicador"] },
    { name: "Passeio", types: ["Saco carrinho", "Sombrinha", "Rede mosquiteira", "Protetor chuva"] }
  ],
  maternidade: [
    { name: "Roupa Grávida", types: ["Calças grávida", "Vestido grávida", "T-shirt grávida", "Jeans grávida"] },
    { name: "Amamentação", types: ["Top amamentação", "Soutien amamentação", "Vestido amamentação"] },
    { name: "Shapewear", types: ["Cinta pós-parto", "Cuecas grávida"] }
  ],
  agasalhos: [
    { name: "Casacos Inverno", types: ["Casaco acolchoado", "Parka", "Duffel coat", "Sobretudo"] },
    { name: "Polares", types: ["Polar liso", "Polar com capuz"] },
    { name: "Coletes", types: ["Colete acolchoado", "Colete malha"] },
    { name: "Gorros e Luvas", types: ["Gorro", "Luvas", "Cachecol", "Conjunto inverno"] }
  ],
  praia: [
    { name: "Fatos Banho", types: ["Fato banho inteiro", "Bikini", "Calções banho", "Fralda piscina"] },
    { name: "Proteção Solar", types: ["T-shirt UV", "Fato UV", "Chapéu praia"] },
    { name: "Acessórios", types: ["Toalha praia", "Saco praia", "Bóias", "Óculos natação"] }
  ],
  carnaval: [
    { name: "Fatos Completos", types: ["Fato princesa", "Fato super-herói", "Fato animal", "Fato profissão"] },
    { name: "Acessórios", types: ["Máscara", "Peruca", "Chapéu carnaval", "Varinha", "Capa"] }
  ],
  acessorios: [
    { name: "Chapéus", types: ["Boné", "Chapéu sol", "Gorro fino"] },
    { name: "Mochilas", types: ["Mochila escola", "Mochila passeio", "Lancheira"] },
    { name: "Bijuteria", types: ["Pulseira", "Colar", "Gancho cabelo", "Fita cabelo"] },
    { name: "Outros", types: ["Óculos sol", "Guarda-chuva", "Carteira", "Relógio"] }
  ]
}

// Preços base por categoria (min, max)
const PRICE_RANGES: Record<string, [number, number]> = {
  menina: [3.99, 24.99],
  menino: [3.99, 24.99],
  babygrows: [2.99, 14.99],
  calcado: [5.99, 29.99],
  brinquedos: [2.99, 49.99],
  equipamentos: [19.99, 199.99],
  puericultura: [2.99, 49.99],
  maternidade: [4.99, 34.99],
  agasalhos: [7.99, 39.99],
  praia: [3.99, 19.99],
  carnaval: [5.99, 29.99],
  acessorios: [1.99, 19.99]
}

// Descrições por tipo de produto
const DESCRIPTIONS: Record<string, string[]> = {
  vestido: [
    "Vestido elegante em tecido de qualidade. Perfeito para ocasiões especiais.",
    "Vestido casual e confortável para o dia a dia. Fácil de vestir.",
    "Vestido com detalhes encantadores. Em muito bom estado de conservação.",
  ],
  calcas: [
    "Calças confortáveis e práticas. Cintura ajustável para melhor fit.",
    "Calças em bom estado, ideais para o dia a dia na escola.",
    "Calças resistentes e duráveis. Com bolsos funcionais.",
  ],
  camisola: [
    "Camisola quentinha e macia. Ideal para os dias mais frios.",
    "Camisola em malha de qualidade. Muito confortável.",
    "Camisola com design moderno. Em excelente estado.",
  ],
  casaco: [
    "Casaco quente e aconchegante. Perfeito para o inverno.",
    "Casaco impermeável com capuz. Protege do frio e da chuva.",
    "Casaco em muito bom estado. Forro interior macio.",
  ],
  tenis: [
    "Ténis confortáveis e leves. Ideais para brincar.",
    "Ténis em bom estado com sola antiderrapante.",
    "Ténis de qualidade, fáceis de calçar com velcro.",
  ],
  brinquedo: [
    "Brinquedo em excelente estado, como novo. Muito pouco usado.",
    "Brinquedo educativo e divertido. Completo com todas as peças.",
    "Brinquedo de qualidade que proporciona horas de diversão.",
  ],
  equipamento: [
    "Equipamento em muito bom estado. Funciona perfeitamente.",
    "Equipamento de marca de qualidade. Seguro e prático.",
    "Equipamento pouco usado, bem conservado. Inclui acessórios.",
  ],
  generico: [
    "Artigo em bom estado de conservação. Qualidade garantida.",
    "Artigo de segunda mão em excelente condição.",
    "Artigo bem cuidado, pronto a usar. Ótimo preço.",
  ]
}

// Função para gerar ID único
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Função para escolher item aleatório de array
function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Função para gerar preço
function generatePrice(category: string, hasDiscount: boolean): { price: number; originalPrice?: number } {
  const [min, max] = PRICE_RANGES[category] || [4.99, 19.99]
  const basePrice = Math.random() * (max - min) + min
  const price = Math.round(basePrice * 100) / 100
  
  // Arredondar para .99
  const roundedPrice = Math.floor(price) + 0.99
  
  if (hasDiscount) {
    const originalPrice = Math.floor(roundedPrice * (1.3 + Math.random() * 0.4)) + 0.99
    return { price: roundedPrice, originalPrice }
  }
  
  return { price: roundedPrice }
}

// Função para gerar condição
function generateCondition(): ProductCondition {
  const rand = Math.random()
  if (rand < 0.25) return "new"
  if (rand < 0.7) return "good"
  return "used"
}

// Função para gerar tamanho baseado na categoria
function generateSize(category: string): string {
  if (category === "babygrows") return randomItem(SIZES.bebe)
  if (category === "calcado") return randomItem(SIZES.calcado)
  if (category === "maternidade") return randomItem(SIZES.maternidade)
  if (category === "brinquedos" || category === "equipamentos" || category === "puericultura") return "Único"
  return randomItem([...SIZES.bebe, ...SIZES.crianca])
}

// Função para gerar descrição
function generateDescription(category: string, subcategory: string, condition: ProductCondition): string {
  let descriptions: string[] = DESCRIPTIONS.generico
  
  if (subcategory.toLowerCase().includes("vestido")) descriptions = DESCRIPTIONS.vestido
  else if (subcategory.toLowerCase().includes("calças") || subcategory.toLowerCase().includes("calca")) descriptions = DESCRIPTIONS.calcas
  else if (subcategory.toLowerCase().includes("camisola") || subcategory.toLowerCase().includes("sweat")) descriptions = DESCRIPTIONS.camisola
  else if (subcategory.toLowerCase().includes("casaco") || subcategory.toLowerCase().includes("blusão")) descriptions = DESCRIPTIONS.casaco
  else if (subcategory.toLowerCase().includes("ténis") || subcategory.toLowerCase().includes("tenis")) descriptions = DESCRIPTIONS.tenis
  else if (category === "brinquedos") descriptions = DESCRIPTIONS.brinquedo
  else if (category === "equipamentos") descriptions = DESCRIPTIONS.equipamento
  
  const conditionText = condition === "new" 
    ? " Artigo novo com etiqueta." 
    : condition === "good" 
    ? " Em muito bom estado." 
    : " Apresenta sinais normais de uso."
  
  return randomItem(descriptions) + conditionText
}

// Função principal para gerar produtos
export function generateProducts(category: string, count: number = 20): Omit<IProduct, "id">[] {
  const products: Omit<IProduct, "id">[] = []
  const subcats = SUBCATEGORIES[category as keyof typeof SUBCATEGORIES] || []
  
  if (subcats.length === 0) return products
  
  for (let i = 0; i < count; i++) {
    const subcat = randomItem(subcats)
    const type = randomItem(subcat.types)
    const brand = randomItem(BRANDS)
    const color = randomItem(COLORS)
    const size = generateSize(category)
    const condition = generateCondition()
    const hasDiscount = Math.random() > 0.65
    const { price, originalPrice } = generatePrice(category, hasDiscount)
    
    // Determinar género
    let gender: "menina" | "menino" | "unisex" = "unisex"
    if (category === "menina") gender = "menina"
    else if (category === "menino") gender = "menino"
    
    // Gerar título
    let title = `${type} ${brand}`
    if (color !== "Estampado" && color !== "Multicolor" && Math.random() > 0.5) {
      title = `${type} ${color} ${brand}`
    }
    title += ` (${size})`
    
    products.push({
      title,
      brand,
      price,
      originalPrice,
      size,
      condition,
      images: [`/placeholder.svg?height=400&width=400&query=${encodeURIComponent(type + " " + category)}`],
      category,
      subcategory: subcat.name,
      gender,
      color,
      season: randomItem(SEASONS),
      stock: Math.random() > 0.15 ? 1 : 0,
      isReserved: false,
      description: generateDescription(category, subcat.name, condition),
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000), // Últimos 60 dias
    })
  }
  
  return products
}

// Gerar todos os produtos para a base de dados
export function generateAllProducts(): Omit<IProduct, "id">[] {
  const allProducts: Omit<IProduct, "id">[] = []
  
  // Quantidade de produtos por categoria (similar ao Kid to Kid real)
  const categoryCounts: Record<string, number> = {
    menina: 150,
    menino: 120,
    babygrows: 80,
    calcado: 100,
    brinquedos: 60,
    equipamentos: 40,
    puericultura: 50,
    maternidade: 30,
    agasalhos: 60,
    praia: 40,
    carnaval: 30,
    acessorios: 40
  }
  
  for (const [category, count] of Object.entries(categoryCounts)) {
    const products = generateProducts(category, count)
    allProducts.push(...products)
  }
  
  return allProducts
}

// Categorias para o menu/navegação
export const CATEGORIES = [
  { id: "menina", name: "Roupa Menina", icon: "👧", color: "#FF69B4" },
  { id: "menino", name: "Roupa Menino", icon: "👦", color: "#4169E1" },
  { id: "babygrows", name: "Babygrows", icon: "👶", color: "#98D8C8" },
  { id: "calcado", name: "Calçado", icon: "👟", color: "#DEB887" },
  { id: "brinquedos", name: "Brinquedos", icon: "🧸", color: "#FFD700" },
  { id: "equipamentos", name: "Equipamentos", icon: "🍼", color: "#87CEEB" },
  { id: "puericultura", name: "Puericultura", icon: "🧴", color: "#DDA0DD" },
  { id: "maternidade", name: "Maternidade", icon: "🤰", color: "#FFC0CB" },
  { id: "agasalhos", name: "Agasalhos", icon: "🧥", color: "#CD853F" },
  { id: "praia", name: "Praia", icon: "🏖️", color: "#00CED1" },
  { id: "carnaval", name: "Carnaval", icon: "🎭", color: "#FF6347" },
  { id: "acessorios", name: "Acessórios", icon: "🎒", color: "#9370DB" }
]

export default {
  generateProducts,
  generateAllProducts,
  BRANDS,
  SIZES,
  COLORS,
  CATEGORIES,
  SUBCATEGORIES
}
