/**
 * Fonte única de verdade para todas as categorias da loja Kid to Kid.
 * Usado em: CategoryGrid, CategoryPage, Header, AdminProductFormPage, etc.
 *
 * Estrutura: 7 Categorias Pai → Subcategorias
 * O género (Menina/Menino/Unissexo) é tratado como FILTRO, não como categoria.
 */

export interface Category {
  slug: string
  label: string
  image: string
}

export interface CatalogueSubcategory {
  id: string
  nome: string
  items: string[]
}

export interface CatalogueCategory {
  id: string
  nome: string
  subcategorias: CatalogueSubcategory[]
}

// ─── Lista principal de categorias da loja (7 categorias pai) ─────────
export const CATEGORIES: Category[] = [
  { slug: "roupa", label: "Roupa", image: "/diverse-girls-clothing.png" },
  { slug: "calcado", label: "Calçado", image: "/kids-shoes-sneakers.jpg" },
  { slug: "brinquedos", label: "Brinquedos", image: "/colorful-kids-toys.png" },
  { slug: "bebe", label: "Bebé", image: "/baby-cute-smiling.jpg" },
  { slug: "equipamento", label: "Equipamento e Puericultura", image: "/baby-stroller-equipment.jpg" },
  { slug: "maternidade", label: "Maternidade", image: "/maternity-clothes.jpg" },
  { slug: "ocasioes", label: "Ocasiões Especiais", image: "/carnival-costumes-kids.jpg" },
]

// ─── Mapa slug → label para acesso rápido ─────────────────────────────
export const CATEGORY_NAMES: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c.label])
)

// ─── Mapa de slugs antigos → novos (compatibilidade com dados existentes) ──
export const LEGACY_SLUG_MAP: Record<string, string> = {
  menina: "roupa",
  menino: "roupa",
  babygrows: "bebe",
  agasalhos: "roupa",
  acessorios: "roupa",
  praia: "roupa",
  carnaval: "ocasioes",
  puericultura: "equipamento",
  equipamentos: "equipamento",
}

// Resolver slug (suporta slugs antigos)
export function resolveSlug(slug: string): string {
  return LEGACY_SLUG_MAP[slug] || slug
}

// Resolver nome de categoria (suporta slugs antigos)
export function resolveCategoryName(slug: string): string | undefined {
  const resolved = resolveSlug(slug)
  return CATEGORY_NAMES[resolved]
}

// ─── Opções para selects/forms no admin ───────────────────────────────
export const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({
  value: c.slug,
  label: c.label,
}))

// ─── Condições do produto ─────────────────────────────────────────────
export const CONDITIONS = [
  { value: "novo", label: "Novo (com etiqueta)" },
  { value: "como-novo", label: "Como Novo" },
  { value: "bom", label: "Bom Estado" },
  { value: "usado", label: "Usado" },
] as const

// ─── Géneros ──────────────────────────────────────────────────────────
export const GENDERS = [
  { value: "menina", label: "Menina" },
  { value: "menino", label: "Menino" },
  { value: "unissexo", label: "Unissexo" },
] as const

// ─── Tamanhos disponíveis ─────────────────────────────────────────────
export const SIZES = [
  "0-3M", "3-6M", "6-9M", "9-12M", "12-18M", "18-24M",
  "2-3A", "3-4A", "4-5A", "5-6A", "6-7A", "7-8A", "8-9A", "9-10A", "10-12A",
] as const

// ─── Catálogo completo para mega menu do Header ───────────────────────
export const CATALOGUE: Record<string, CatalogueCategory> = {
  roupa: {
    id: "roupa",
    nome: "Roupa",
    subcategorias: [
      { id: "tops-tshirts", nome: "Tops e T-shirts", items: ["T-shirts", "Blusas", "Polos", "Camisolas"] },
      { id: "calcas-leggings", nome: "Calças e Leggings", items: ["Calças de ganga", "Leggings", "Calças de treino", "Chinos"] },
      { id: "vestidos-saias", nome: "Vestidos e Saias", items: ["Vestidos de festa", "Vestidos casual", "Saias", "Saias-calção"] },
      { id: "casacos-agasalhos", nome: "Casacos e Agasalhos", items: ["Casacos de inverno", "Blusões", "Impermeáveis", "Cardigans", "Polares"] },
      { id: "calcoes", nome: "Calções", items: ["Calções de praia", "Calções desportivos", "Bermudas"] },
      { id: "pijamas", nome: "Pijamas", items: ["Pijamas de inverno", "Pijamas de verão"] },
      { id: "acessorios-roupa", nome: "Acessórios", items: ["Chapéus e Gorros", "Mochilas e Malas", "Óculos de sol", "Cintos", "Fitas de cabelo"] },
      { id: "praia-banho", nome: "Praia e Banho", items: ["Biquínis", "Fatos inteiros", "Calções de banho", "T-shirts UV", "Chapéus de praia"] },
    ],
  },
  calcado: {
    id: "calcado",
    nome: "Calçado",
    subcategorias: [
      { id: "tenis", nome: "Ténis e Sapatilhas", items: ["Ténis desportivos", "Sapatilhas casual"] },
      { id: "botas", nome: "Botas", items: ["Botas de inverno", "Botas de chuva", "Botins"] },
      { id: "sandalias", nome: "Sandálias e Chinelos", items: ["Sandálias", "Chinelos", "Crocs"] },
      { id: "sapatos", nome: "Sapatos de Cerimónia", items: ["Sapatos de cerimónia", "Mocassins"] },
    ],
  },
  brinquedos: {
    id: "brinquedos",
    nome: "Brinquedos",
    subcategorias: [
      { id: "peluches", nome: "Peluches", items: ["Peluches pequenos", "Peluches grandes"] },
      { id: "jogos", nome: "Jogos e Puzzles", items: ["Jogos de tabuleiro", "Puzzles", "Jogos educativos"] },
      { id: "bonecas", nome: "Bonecas", items: ["Bonecas", "Acessórios de bonecas"] },
      { id: "veiculos", nome: "Veículos e Construção", items: ["Carros", "Comboios", "LEGO", "Aviões"] },
    ],
  },
  bebe: {
    id: "bebe",
    nome: "Bebé",
    subcategorias: [
      { id: "babygrows-bodies", nome: "Babygrows e Bodies", items: ["Babygrows lisos", "Babygrows estampados", "Bodies manga curta", "Bodies manga comprida"] },
      { id: "conjuntos", nome: "Conjuntos", items: ["Conjuntos de 2 peças", "Conjuntos de 3 peças"] },
      { id: "pijamas-bebe", nome: "Pijamas Bebé", items: ["Pijamas de inverno", "Pijamas de verão"] },
      { id: "agasalhos-bebe", nome: "Agasalhos Bebé", items: ["Casacos", "Gorros", "Luvas"] },
    ],
  },
  equipamento: {
    id: "equipamento",
    nome: "Equipamento e Puericultura",
    subcategorias: [
      { id: "carrinhos", nome: "Carrinhos e Passeio", items: ["Carrinhos de passeio", "Carrinhos duo", "Marsúpios", "Porta-bebés"] },
      { id: "cadeiras", nome: "Cadeiras Auto", items: ["Grupo 0", "Grupo 1", "Grupo 2/3"] },
      { id: "camas", nome: "Camas e Berços", items: ["Berços", "Camas de grades", "Alcofa"] },
      { id: "alimentacao", nome: "Alimentação", items: ["Cadeiras de refeição", "Biberões", "Esterilizadores"] },
      { id: "higiene", nome: "Higiene e Banho", items: ["Banheiras", "Fraldas reutilizáveis", "Kits higiene"] },
      { id: "seguranca", nome: "Segurança", items: ["Cancelas", "Protetores", "Babá eletrónica"] },
    ],
  },
  maternidade: {
    id: "maternidade",
    nome: "Maternidade",
    subcategorias: [
      { id: "roupa-gravida", nome: "Roupa de Grávida", items: ["Calças", "Vestidos", "Tops"] },
      { id: "amamentacao", nome: "Amamentação", items: ["Soutiens", "Almofadas", "Bombas"] },
    ],
  },
  ocasioes: {
    id: "ocasioes",
    nome: "Ocasiões Especiais",
    subcategorias: [
      { id: "disfarces", nome: "Disfarces e Fantasias", items: ["Princesas", "Super-heróis", "Animais", "Personagens"] },
      { id: "acessorios-festa", nome: "Acessórios de Festa", items: ["Máscaras", "Capas", "Perucas", "Decorações"] },
    ],
  },
}
