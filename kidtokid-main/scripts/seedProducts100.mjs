/**
 * 🛍️ Seed 100 Produtos — Kid to Kid Braga
 *
 * Usa o Firebase Admin SDK para criar produtos sem precisar de autenticação.
 *
 * Pré-requisitos:
 *   1. Ficheiro: scripts/serviceAccountKey.json
 *      - Firebase Console → Project Settings → Service Accounts
 *      - Clicar em "Generate new private key"
 *
 *   2. npm install (na pasta scripts)
 *
 * Uso:
 *   node scripts/seedProducts100.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { readFileSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const serviceAccountPath = join(__dirname, 'serviceAccountKey.json')

if (!existsSync(serviceAccountPath)) {
  console.error('❌ Ficheiro serviceAccountKey.json não encontrado!')
  console.log('')
  console.log('📋 Para obter o ficheiro:')
  console.log('   1. Vai a https://console.firebase.google.com/project/kidtokid-4d642/settings/serviceaccounts/adminsdk')
  console.log('   2. Clica em "Generate new private key"')
  console.log('   3. Guarda o ficheiro como: scripts/serviceAccountKey.json')
  console.log('')
  process.exit(1)
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'))
initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore()

// ─────────────────────────────────────────────────────────────────────
//  100 PRODUTOS — Kid to Kid Braga
//  Categorias: roupa | calcado | brinquedos | bebe | equipamento | maternidade | ocasioes
// ─────────────────────────────────────────────────────────────────────
const products = [

  // ══════════════════════════════════════════════════════════
  //  ROUPA (30 produtos)
  // ══════════════════════════════════════════════════════════

  // tops-tshirts
  {
    title: "T-shirt Zara 4-5 Anos",
    description: "T-shirt de algodão da Zara com estampado colorido. Perfeita para o dia a dia.",
    price: 3.99, originalPrice: 9.99,
    category: "roupa", subcategory: "tops-tshirts",
    size: "4-5A", brand: "ZARA", condition: "bom", gender: "menina",
    images: ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop"],
    stock: 2, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Polo Lacoste 6-7 Anos",
    description: "Polo clássico da Lacoste em piquê de algodão. Estado excelente.",
    price: 12.99, originalPrice: 49.99,
    category: "roupa", subcategory: "tops-tshirts",
    size: "6-7A", brand: "LACOSTE", condition: "como-novo", gender: "menino",
    images: ["https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Camisola H&M 2-3 Anos",
    description: "Camisola às riscas da H&M. Lavagem a frio. Muito colorida e alegre.",
    price: 2.99, originalPrice: 7.99,
    category: "roupa", subcategory: "tops-tshirts",
    size: "2-3A", brand: "H&M", condition: "bom", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1555274175-6b1ded4b9d08?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "T-shirt GAP 8-9 Anos",
    description: "T-shirt GAP com logo estampado, 100% algodão. Estado muito bom.",
    price: 4.99, originalPrice: 14.99,
    category: "roupa", subcategory: "tops-tshirts",
    size: "8-9A", brand: "GAP", condition: "bom", gender: "menino",
    images: ["https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Blusa Mango Kids 10-12 Anos",
    description: "Blusa estampada da Mango Kids. Tecido leve de verão. Como nova.",
    price: 5.99, originalPrice: 17.99,
    category: "roupa", subcategory: "tops-tshirts",
    size: "10-12A", brand: "MANGO", condition: "como-novo", gender: "menina",
    images: ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },

  // calcas-leggings
  {
    title: "Calças de Ganga Zara 5-6 Anos",
    description: "Calças slim fit da Zara. Pouco uso, excelente estado.",
    price: 6.99, originalPrice: 22.99,
    category: "roupa", subcategory: "calcas-leggings",
    size: "5-6A", brand: "ZARA", condition: "como-novo", gender: "menino",
    images: ["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Leggings Mayoral 3-4 Anos",
    description: "Pack de 2 leggings Mayoral em cores neutras. Lavadas e prontas a usar.",
    price: 4.99, originalPrice: 15.99,
    category: "roupa", subcategory: "calcas-leggings",
    size: "3-4A", brand: "MAYORAL", condition: "bom", gender: "menina",
    images: ["https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Calças de Treino Nike 10-12 Anos",
    description: "Calças desportivas Nike Dri-FIT. Ideais para desporto e lazer.",
    price: 9.99, originalPrice: 34.99,
    category: "roupa", subcategory: "calcas-leggings",
    size: "10-12A", brand: "NIKE", condition: "bom", gender: "menino",
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Calças de Ganga H&M 7-8 Anos",
    description: "Calças de ganga clássicas com elástico na cintura. Muito resistentes.",
    price: 5.99, originalPrice: 17.99,
    category: "roupa", subcategory: "calcas-leggings",
    size: "7-8A", brand: "H&M", condition: "bom", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },

  // vestidos-saias
  {
    title: "Vestido de Festa Mayoral 3-4 Anos",
    description: "Vestido elegante cor rosa com laço nas costas. Usado apenas uma vez.",
    price: 9.99, originalPrice: 39.99,
    category: "roupa", subcategory: "vestidos-saias",
    size: "3-4A", brand: "MAYORAL", condition: "como-novo", gender: "menina",
    images: ["https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Vestido Casual Zara 6-7 Anos",
    description: "Vestido com flores da Zara. Tecido leve para primavera/verão.",
    price: 5.99, originalPrice: 19.99,
    category: "roupa", subcategory: "vestidos-saias",
    size: "6-7A", brand: "ZARA", condition: "bom", gender: "menina",
    images: ["https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Saia Tutu Primark 5-6 Anos",
    description: "Saia tutu cor-de-rosa. Perfeita para festas e aniversários.",
    price: 3.49, originalPrice: 9.99,
    category: "roupa", subcategory: "vestidos-saias",
    size: "5-6A", brand: "PRIMARK", condition: "bom", gender: "menina",
    images: ["https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Vestido de Verão Name It 8-9 Anos",
    description: "Vestido de alças com padrão geométrico. Muito fresco para o verão.",
    price: 6.99, originalPrice: 22.99,
    category: "roupa", subcategory: "vestidos-saias",
    size: "8-9A", brand: "NAME IT", condition: "bom", gender: "menina",
    images: ["https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },

  // casacos-agasalhos
  {
    title: "Casaco de Inverno Columbia 7-8 Anos",
    description: "Casaco acolchoado da Columbia, muito quente. Ideal para o inverno.",
    price: 19.99, originalPrice: 79.99,
    category: "roupa", subcategory: "casacos-agasalhos",
    size: "7-8A", brand: "COLUMBIA", condition: "bom", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Blusão Adidas 9-10 Anos",
    description: "Blusão com capuz da Adidas. Fecho de correr e bolso canguru.",
    price: 13.99, originalPrice: 44.99,
    category: "roupa", subcategory: "casacos-agasalhos",
    size: "9-10A", brand: "ADIDAS", condition: "como-novo", gender: "menino",
    images: ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Impermeável Decathlon 4-5 Anos",
    description: "Impermeável leve da Decathlon, com tira refletora. Bom estado.",
    price: 7.99, originalPrice: 24.99,
    category: "roupa", subcategory: "casacos-agasalhos",
    size: "4-5A", brand: "DECATHLON", condition: "bom", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&h=400&fit=crop"],
    stock: 2, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Polar Fleece Zara Kids 6-7 Anos",
    description: "Casaco polar suave, com zip até ao pescoço. Muito confortável.",
    price: 5.99, originalPrice: 19.99,
    category: "roupa", subcategory: "casacos-agasalhos",
    size: "6-7A", brand: "ZARA", condition: "bom", gender: "menina",
    images: ["https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },

  // calcoes
  {
    title: "Calções de Praia Name It 5-6 Anos",
    description: "Calções de banho Name It com estampa de palmeiras. Secagem rápida.",
    price: 3.99, originalPrice: 12.99,
    category: "roupa", subcategory: "calcoes",
    size: "5-6A", brand: "NAME IT", condition: "bom", gender: "menino",
    images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Bermudas Ganga H&M 7-8 Anos",
    description: "Bermudas de ganga com cinto elástico. Ideais para o verão.",
    price: 4.99, originalPrice: 14.99,
    category: "roupa", subcategory: "calcoes",
    size: "7-8A", brand: "H&M", condition: "bom", gender: "menino",
    images: ["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },

  // pijamas
  {
    title: "Pijama Frozen Primark 6-7 Anos",
    description: "Pijama com estampa da Frozen. Material suave, ótimo para dormir.",
    price: 4.99, originalPrice: 13.99,
    category: "roupa", subcategory: "pijamas",
    size: "6-7A", brand: "PRIMARK", condition: "bom", gender: "menina",
    images: ["https://images.unsplash.com/photo-1631885558-854b69f22168?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Pijama Dinossauro H&M 4-5 Anos",
    description: "Pijama de dois tons com estampa de dinossauros. Material algodão.",
    price: 3.99, originalPrice: 11.99,
    category: "roupa", subcategory: "pijamas",
    size: "4-5A", brand: "H&M", condition: "bom", gender: "menino",
    images: ["https://images.unsplash.com/photo-1631885558-854b69f22168?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Pijama Spider-Man Primark 5-6 Anos",
    description: "Pijama do Homem-Aranha. Algodão macio. Bom estado.",
    price: 4.49, originalPrice: 12.99,
    category: "roupa", subcategory: "pijamas",
    size: "5-6A", brand: "PRIMARK", condition: "bom", gender: "menino",
    images: ["https://images.unsplash.com/photo-1631885558-854b69f22168?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },

  // acessorios-roupa
  {
    title: "Mochila Escolar Tuc Tuc",
    description: "Mochila da Tuc Tuc com bolso frontal e alças ajustáveis. Muito bem conservada.",
    price: 8.99, originalPrice: 29.99,
    category: "roupa", subcategory: "acessorios-roupa",
    size: "único", brand: "TUC TUC", condition: "bom", gender: "menina",
    images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Gorro de Lã Mayoral 2-4 Anos",
    description: "Gorro de lã com pompom. Mantém a cabeça bem quente no inverno.",
    price: 2.49, originalPrice: 8.99,
    category: "roupa", subcategory: "acessorios-roupa",
    size: "2-3A", brand: "MAYORAL", condition: "bom", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1510598155744-7bad1553aca4?w=400&h=400&fit=crop"],
    stock: 2, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Óculos de Sol Disney 3-6 Anos",
    description: "Óculos de sol com proteção UV e armação da Minnie. Como novos.",
    price: 2.99, originalPrice: 9.99,
    category: "roupa", subcategory: "acessorios-roupa",
    size: "único", brand: "DISNEY", condition: "como-novo", gender: "menina",
    images: ["https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },

  // praia-banho
  {
    title: "Biquíni Decathlon 6-7 Anos",
    description: "Biquíni com proteção UV50+. Cores vibrantes de verão.",
    price: 4.99, originalPrice: 14.99,
    category: "roupa", subcategory: "praia-banho",
    size: "6-7A", brand: "DECATHLON", condition: "como-novo", gender: "menina",
    images: ["https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Fato de Banho Zara 4-5 Anos",
    description: "Fato de banho inteiro com estampa tropical. Excelente estado.",
    price: 5.99, originalPrice: 17.99,
    category: "roupa", subcategory: "praia-banho",
    size: "4-5A", brand: "ZARA", condition: "bom", gender: "menina",
    images: ["https://images.unsplash.com/photo-1560516537-44bec7dcab13?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Calção de Banho Timberland 7-8 Anos",
    description: "Calção de banho com logo Timberland. Secagem rápida. Bom estado.",
    price: 5.99, originalPrice: 19.99,
    category: "roupa", subcategory: "praia-banho",
    size: "7-8A", brand: "TIMBERLAND", condition: "bom", gender: "menino",
    images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "T-shirt UV Decathlon 5-6 Anos",
    description: "T-shirt anti-UV para praia. Protege dos raios solares. Lavável.",
    price: 3.99, originalPrice: 12.99,
    category: "roupa", subcategory: "praia-banho",
    size: "5-6A", brand: "DECATHLON", condition: "bom", gender: "menino",
    images: ["https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },

  // ══════════════════════════════════════════════════════════
  //  CALÇADO (14 produtos)
  // ══════════════════════════════════════════════════════════

  {
    title: "Sapatilhas Nike Air Max nº30",
    description: "Nike Air Max em excelente estado. Pouco uso. Ideais para desporto e lazer.",
    price: 19.99, originalPrice: 59.99,
    category: "calcado", subcategory: "tenis",
    size: "30", brand: "NIKE", condition: "como-novo", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Sapatilhas Adidas Stan Smith nº28",
    description: "Adidas Stan Smith brancas e verdes, clássicas. Em bom estado.",
    price: 14.99, originalPrice: 49.99,
    category: "calcado", subcategory: "tenis",
    size: "28", brand: "ADIDAS", condition: "bom", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Ténis Superga nº32",
    description: "Ténis Superga em lona branca. Clássicos e versáteis.",
    price: 11.99, originalPrice: 39.99,
    category: "calcado", subcategory: "tenis",
    size: "32", brand: "SUPERGA", condition: "bom", gender: "menina",
    images: ["https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Sapatilhas Puma Velcro nº35",
    description: "Puma coloridas com velcro. Ideais para crianças que não sabem apertar os cordões.",
    price: 10.99, originalPrice: 34.99,
    category: "calcado", subcategory: "tenis",
    size: "35", brand: "PUMA", condition: "como-novo", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Botas de Chuva Chicco nº24",
    description: "Galochas de borracha impermeáveis com estampa. Perfeitas para dias chuvosos.",
    price: 7.99, originalPrice: 24.99,
    category: "calcado", subcategory: "botas",
    size: "24", brand: "CHICCO", condition: "bom", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Botas de Inverno Timberland nº29",
    description: "Botas impermeáveis Timberland. Quentes e resistentes para o inverno.",
    price: 24.99, originalPrice: 89.99,
    category: "calcado", subcategory: "botas",
    size: "29", brand: "TIMBERLAND", condition: "bom", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Botins Zara nº31",
    description: "Botins de couro sintético da Zara. Com elástico nas laterais. Bom estado.",
    price: 8.99, originalPrice: 29.99,
    category: "calcado", subcategory: "botas",
    size: "31", brand: "ZARA", condition: "bom", gender: "menina",
    images: ["https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Sandálias Biomecanics nº26",
    description: "Sandálias ortopédicas Biomecanics. Muito confortáveis para o verão.",
    price: 12.99, originalPrice: 44.99,
    category: "calcado", subcategory: "sandalias",
    size: "26", brand: "BIOMECANICS", condition: "bom", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Crocs Clássicos nº27",
    description: "Crocs originais em azul. Fáceis de calçar e muito confortáveis.",
    price: 8.99, originalPrice: 29.99,
    category: "calcado", subcategory: "sandalias",
    size: "27", brand: "CROCS", condition: "bom", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Sandálias Ipanema nº30",
    description: "Sandálias Ipanema cor rosa. Leves e impermeáveis. Ótimas para praia.",
    price: 4.99, originalPrice: 14.99,
    category: "calcado", subcategory: "sandalias",
    size: "30", brand: "IPANEMA", condition: "bom", gender: "menina",
    images: ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Sapatos Cerimónia Mayoral nº28",
    description: "Sapatos de verniz preto para cerimónia. Usados apenas num batizado.",
    price: 9.99, originalPrice: 34.99,
    category: "calcado", subcategory: "sapatos",
    size: "28", brand: "MAYORAL", condition: "como-novo", gender: "menino",
    images: ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Sabrinas de Verniz Zara nº30",
    description: "Sabrinas de verniz preto para cerimónia. Elegantes e em como-novo estado.",
    price: 7.99, originalPrice: 24.99,
    category: "calcado", subcategory: "sapatos",
    size: "30", brand: "ZARA", condition: "como-novo", gender: "menina",
    images: ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Mocassins Geox nº33",
    description: "Mocassins Geox respiráveis, muito confortáveis. Bom estado.",
    price: 13.99, originalPrice: 49.99,
    category: "calcado", subcategory: "sapatos",
    size: "33", brand: "GEOX", condition: "bom", gender: "menino",
    images: ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Sapatinhos Primeiros Passos Chicco nº19",
    description: "Sapatinhos da Chicco para primeiros passos. Em excelente estado.",
    price: 6.99, originalPrice: 24.99,
    category: "calcado", subcategory: "sapatos",
    size: "19", brand: "CHICCO", condition: "como-novo", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },

  // ══════════════════════════════════════════════════════════
  //  BRINQUEDOS (16 produtos)
  // ══════════════════════════════════════════════════════════

  {
    title: "Peluche Ursinho Teddy 40cm",
    description: "Ursinho de peluche macio em excelente estado. Lavado e desinfetado.",
    price: 4.99, originalPrice: 14.99,
    category: "brinquedos", subcategory: "peluches",
    size: "único", brand: "IKEA", condition: "bom", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Peluche Simba o Leão 30cm",
    description: "Peluche do Simba (Rei Leão) Disney. Muito bem conservado.",
    price: 5.99, originalPrice: 19.99,
    category: "brinquedos", subcategory: "peluches",
    size: "único", brand: "DISNEY", condition: "bom", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Peluche Stitch Disney 50cm",
    description: "Peluche grande do Stitch em ótimo estado. Criança vai adorar!",
    price: 9.99, originalPrice: 29.99,
    category: "brinquedos", subcategory: "peluches",
    size: "único", brand: "DISNEY", condition: "como-novo", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Puzzle Djeco 100 Peças",
    description: "Puzzle educativo Djeco com 100 peças em perfeito estado. Completo.",
    price: 6.99, originalPrice: 19.99,
    category: "brinquedos", subcategory: "jogos",
    size: "único", brand: "DJECO", condition: "bom", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Jogo Uno Clássico",
    description: "Jogo de cartas Uno completo. Perfeito para a família jogar.",
    price: 3.99, originalPrice: 9.99,
    category: "brinquedos", subcategory: "jogos",
    size: "único", brand: "MATTEL", condition: "bom", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Jogo de Tabuleiro Memory Hasbro",
    description: "Memory com animais. Excelente para desenvolver a concentração. Completo.",
    price: 4.49, originalPrice: 12.99,
    category: "brinquedos", subcategory: "jogos",
    size: "único", brand: "HASBRO", condition: "bom", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Lego City Police Station",
    description: "Lego City com instruções. Todas as peças presentes e verificadas.",
    price: 24.99, originalPrice: 69.99,
    category: "brinquedos", subcategory: "jogos",
    size: "único", brand: "LEGO", condition: "bom", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Boneca Baby Born 43cm",
    description: "Baby Born com roupa e acessórios. Faz xixi. Bom estado.",
    price: 14.99, originalPrice: 49.99,
    category: "brinquedos", subcategory: "bonecas",
    size: "único", brand: "ZAPF CREATION", condition: "bom", gender: "menina",
    images: ["https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Barbie Fashionista com Roupa",
    description: "Barbie com vários conjuntos de roupa. Excelente estado.",
    price: 7.99, originalPrice: 24.99,
    category: "brinquedos", subcategory: "bonecas",
    size: "único", brand: "MATTEL", condition: "bom", gender: "menina",
    images: ["https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Boneca Nancy com Acessórios",
    description: "Boneca Nancy com mala de roupa e acessórios variados. Completa.",
    price: 9.99, originalPrice: 34.99,
    category: "brinquedos", subcategory: "bonecas",
    size: "único", brand: "FAMOSA", condition: "bom", gender: "menina",
    images: ["https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Pack 10 Carros Hot Wheels",
    description: "Pack com 10 carros Hot Wheels variados. Bom estado. Ótimo para colecionar.",
    price: 7.99, originalPrice: 19.99,
    category: "brinquedos", subcategory: "veiculos",
    size: "único", brand: "HOT WHEELS", condition: "bom", gender: "menino",
    images: ["https://images.unsplash.com/photo-1566897819059-b023f5e97c50?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Pista de Comboios em Madeira",
    description: "Pista de comboios em madeira com 2 locomotivas e carruagens. Completa.",
    price: 17.99, originalPrice: 54.99,
    category: "brinquedos", subcategory: "veiculos",
    size: "único", brand: "BIGJIGS", condition: "bom", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1566897819059-b023f5e97c50?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Lego Duplo Animais da Quinta",
    description: "Lego Duplo com animais da quinta. Completo e em perfeito estado.",
    price: 12.99, originalPrice: 39.99,
    category: "brinquedos", subcategory: "veiculos",
    size: "único", brand: "LEGO", condition: "como-novo", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Scooter Micro Mini 2-5 Anos",
    description: "Scooter de 3 rodas da Micro, ajustável. Cor azul. Bom estado.",
    price: 29.99, originalPrice: 89.99,
    category: "brinquedos", subcategory: "veiculos",
    size: "único", brand: "MICRO", condition: "bom", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1566897819059-b023f5e97c50?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Bicicleta de Equilíbrio 2-4 Anos",
    description: "Bicicleta de equilíbrio de madeira. Ótima para aprender a andar. Bom estado.",
    price: 19.99, originalPrice: 59.99,
    category: "brinquedos", subcategory: "veiculos",
    size: "único", brand: "KINDERFEETS", condition: "bom", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1576858740799-40264e2e4a44?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Helicóptero Fisher Price com Sons",
    description: "Helicóptero da Fisher Price com sons e luzes. Pilhas novas. Bom estado.",
    price: 9.99, originalPrice: 29.99,
    category: "brinquedos", subcategory: "veiculos",
    size: "único", brand: "FISHER PRICE", condition: "bom", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1566897819059-b023f5e97c50?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },

  // ══════════════════════════════════════════════════════════
  //  BEBÉ (16 produtos)
  // ══════════════════════════════════════════════════════════

  {
    title: "Pack 5 Babygrows 0-3 Meses",
    description: "Pack de 5 babygrows de algodão com botões a pressão. Lavados e prontos.",
    price: 7.99, originalPrice: 24.99,
    category: "bebe", subcategory: "babygrows-bodies",
    size: "0-3M", brand: "PRIMARK", condition: "bom", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1522771930-78c8c8e54e87?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Babygrow Zara Baby 3-6 Meses",
    description: "Babygrow estampado com animais. Algodão 100%. Excelente estado.",
    price: 3.99, originalPrice: 12.99,
    category: "bebe", subcategory: "babygrows-bodies",
    size: "3-6M", brand: "ZARA", condition: "como-novo", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1522771930-78c8c8e54e87?w=400&h=400&fit=crop"],
    stock: 2, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Pack 3 Bodies Manga Curta 6-9 Meses",
    description: "Pack de 3 bodies de manga curta em algodão. Cores neutras.",
    price: 4.99, originalPrice: 14.99,
    category: "bebe", subcategory: "babygrows-bodies",
    size: "6-9M", brand: "H&M", condition: "bom", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1522771930-78c8c8e54e87?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Babygrow com Pés Chicco 9-12 Meses",
    description: "Babygrow com pés antiderrapantes. Quente e confortável para o inverno.",
    price: 4.99, originalPrice: 16.99,
    category: "bebe", subcategory: "babygrows-bodies",
    size: "9-12M", brand: "CHICCO", condition: "bom", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1522771930-78c8c8e54e87?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Bodies Manga Comprida Mayoral 12-18M",
    description: "Pack de 2 bodies de manga comprida da Mayoral. Confortáveis.",
    price: 4.49, originalPrice: 13.99,
    category: "bebe", subcategory: "babygrows-bodies",
    size: "12-18M", brand: "MAYORAL", condition: "bom", gender: "menina",
    images: ["https://images.unsplash.com/photo-1522771930-78c8c8e54e87?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Conjunto 2 Peças Tuc Tuc 6-9 Meses",
    description: "Conjunto de calças e camisola da Tuc Tuc. Muito delicado. Como novo.",
    price: 7.99, originalPrice: 24.99,
    category: "bebe", subcategory: "conjuntos",
    size: "6-9M", brand: "TUC TUC", condition: "como-novo", gender: "menino",
    images: ["https://images.unsplash.com/photo-1522771930-78c8c8e54e87?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Conjunto 3 Peças Algodão Orgânico 3-6M",
    description: "Conjunto de body, calças e casaquinho. Algodão orgânico. Excelente.",
    price: 9.99, originalPrice: 29.99,
    category: "bebe", subcategory: "conjuntos",
    size: "3-6M", brand: "NOBODINOZ", condition: "como-novo", gender: "menina",
    images: ["https://images.unsplash.com/photo-1522771930-78c8c8e54e87?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Pijama de Inverno Bebé 18-24 Meses",
    description: "Pijama quente de algodão aveludado. Com fecho e pés. Bom estado.",
    price: 5.99, originalPrice: 17.99,
    category: "bebe", subcategory: "pijamas-bebe",
    size: "18-24M", brand: "PRIMARK", condition: "bom", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1631885558-854b69f22168?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Saco de Dormir Grobag 1 TOG 0-6M",
    description: "Saco de dormir Grobag 1 TOG para verão. Excelente estado.",
    price: 14.99, originalPrice: 49.99,
    category: "bebe", subcategory: "pijamas-bebe",
    size: "0-6M", brand: "GROBAG", condition: "como-novo", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1631885558-854b69f22168?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Casaco Polar Polo Ralph Lauren 9-12M",
    description: "Casaco polar macio e quente. Perfeito para passeios de outono.",
    price: 9.99, originalPrice: 34.99,
    category: "bebe", subcategory: "agasalhos-bebe",
    size: "9-12M", brand: "RALPH LAUREN", condition: "como-novo", gender: "menino",
    images: ["https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Gorro e Luvas de Lã Bebé 6-12M",
    description: "Conjunto de gorro e luvas de lã. Muito quentinho para o inverno.",
    price: 3.49, originalPrice: 10.99,
    category: "bebe", subcategory: "agasalhos-bebe",
    size: "6-9M", brand: "H&M", condition: "bom", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1510598155744-7bad1553aca4?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Casaco de Cerimónia Bebé Menino 12-18M",
    description: "Casaco elegante para cerimónia. Usado uma vez. Impecável.",
    price: 8.99, originalPrice: 29.99,
    category: "bebe", subcategory: "agasalhos-bebe",
    size: "12-18M", brand: "MAYORAL", condition: "como-novo", gender: "menino",
    images: ["https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Manta de Bebé em Tricô Artesanal",
    description: "Manta artesanal em tricô para bebé. Suave e quentinha. Nova.",
    price: 9.99, originalPrice: 24.99,
    category: "bebe", subcategory: "agasalhos-bebe",
    size: "único", brand: "Artesanal", condition: "novo", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1579547621706-1a9c79d5c9f1?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Conjunto Bebé Menina Batizado 3-6M",
    description: "Vestido e casaco para batizado. Branco e rosa. Como novo.",
    price: 14.99, originalPrice: 49.99,
    category: "bebe", subcategory: "conjuntos",
    size: "3-6M", brand: "TUC TUC", condition: "como-novo", gender: "menina",
    images: ["https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Saco de Dormir de Inverno Müsli 0-3M",
    description: "Saco de dormir quente em algodão orgânico 2.5 TOG. Como novo.",
    price: 17.99, originalPrice: 54.99,
    category: "bebe", subcategory: "pijamas-bebe",
    size: "0-3M", brand: "MÜSLI", condition: "como-novo", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1631885558-854b69f22168?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Saco Quente IKEA Len 6-12M",
    description: "Saco de bebé tipo ninho em polar. Muito macio e quente.",
    price: 4.99, originalPrice: 12.99,
    category: "bebe", subcategory: "agasalhos-bebe",
    size: "6-12M", brand: "IKEA", condition: "bom", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1579547621706-1a9c79d5c9f1?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },

  // ══════════════════════════════════════════════════════════
  //  EQUIPAMENTO E PUERICULTURA (12 produtos)
  // ══════════════════════════════════════════════════════════

  {
    title: "Carrinho de Passeio Chicco Sprint",
    description: "Carrinho dobrável Chicco Sprint leve e compacto. Inclui capa de chuva.",
    price: 89.99, originalPrice: 199.99,
    category: "equipamento", subcategory: "carrinhos",
    size: "único", brand: "CHICCO", condition: "bom", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Marsúpio Ergobaby Original",
    description: "Marsúpio ergonómico Ergobaby para recém-nascido. Inclui inserção. Bom estado.",
    price: 49.99, originalPrice: 129.99,
    category: "equipamento", subcategory: "carrinhos",
    size: "único", brand: "ERGOBABY", condition: "bom", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Cadeira Auto Maxi-Cosi Pebble Grupo 0+",
    description: "Cadeira auto Maxi-Cosi Pebble para recém-nascido. Inclui base e adaptadores.",
    price: 119.99, originalPrice: 299.99,
    category: "equipamento", subcategory: "cadeiras",
    size: "único", brand: "MAXI-COSI", condition: "bom", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Cadeira Auto Chicco Grupos 1-2-3",
    description: "Cadeira auto da Chicco, cresce com a criança. Ótimo estado.",
    price: 79.99, originalPrice: 199.99,
    category: "equipamento", subcategory: "cadeiras",
    size: "único", brand: "CHICCO", condition: "bom", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Berço de Grades Branco Micuna",
    description: "Berço de grades completo com colchão. Madeira maciça. Bom estado.",
    price: 59.99, originalPrice: 149.99,
    category: "equipamento", subcategory: "camas",
    size: "único", brand: "MICUNA", condition: "bom", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1586336153815-e2f1db3d9a81?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Alcofa de Vimes Branca com Roupa",
    description: "Alcofa de vimes clássica com roupa de cama incluída. Como nova.",
    price: 39.99, originalPrice: 89.99,
    category: "equipamento", subcategory: "camas",
    size: "único", brand: "Artesanal", condition: "como-novo", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1586336153815-e2f1db3d9a81?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Cadeira de Refeição IKEA Antilop",
    description: "Cadeira de refeição IKEA Antilop com tabuleiro e cinto. Muito prática.",
    price: 19.99, originalPrice: 39.99,
    category: "equipamento", subcategory: "alimentacao",
    size: "único", brand: "IKEA", condition: "bom", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Esterilizador Elétrico Philips Avent",
    description: "Esterilizador para 6 biberões. Funciona perfeitamente. Bom estado.",
    price: 24.99, originalPrice: 64.99,
    category: "equipamento", subcategory: "alimentacao",
    size: "único", brand: "PHILIPS AVENT", condition: "bom", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Banheira Stokke Flexibath Dobrável",
    description: "Banheira dobrável Stokke Flexibath. Fácil de guardar. Excelente estado.",
    price: 29.99, originalPrice: 59.99,
    category: "equipamento", subcategory: "higiene",
    size: "único", brand: "STOKKE", condition: "como-novo", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Tapete de Atividades Fisher Price",
    description: "Tapete de atividades com arco e brinquedos pendurados. Bom estado.",
    price: 17.99, originalPrice: 49.99,
    category: "equipamento", subcategory: "higiene",
    size: "único", brand: "FISHER PRICE", condition: "bom", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Cancela de Escada Safety 1st",
    description: "Cancela de escada com abertura automática. Fixação à parede. Bom estado.",
    price: 19.99, originalPrice: 49.99,
    category: "equipamento", subcategory: "seguranca",
    size: "único", brand: "SAFETY 1ST", condition: "bom", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Babá Eletrónica Philips Avent DECT",
    description: "Babá eletrónica com visualização de temperatura e luz noturna. Bom estado.",
    price: 34.99, originalPrice: 89.99,
    category: "equipamento", subcategory: "seguranca",
    size: "único", brand: "PHILIPS AVENT", condition: "bom", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },

  // ══════════════════════════════════════════════════════════
  //  MATERNIDADE (6 produtos)
  // ══════════════════════════════════════════════════════════

  {
    title: "Calças de Grávida Mamalicious Taille M",
    description: "Calças de ganga com elástico ajustável para grávida. Taille M. Excelente.",
    price: 11.99, originalPrice: 34.99,
    category: "maternidade", subcategory: "roupa-gravida",
    size: "M", brand: "MAMALICIOUS", condition: "bom", gender: "menina",
    images: ["https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Vestido de Verão Grávida Taille S",
    description: "Vestido de verão floral para grávida. Confortável. Taille S.",
    price: 9.99, originalPrice: 29.99,
    category: "maternidade", subcategory: "roupa-gravida",
    size: "S", brand: "ASOS MATERNITY", condition: "bom", gender: "menina",
    images: ["https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Pack 3 Tops de Grávida H&M Taille M",
    description: "Pack de 3 tops de algodão para grávida. Cores neutras. Bom estado.",
    price: 9.99, originalPrice: 24.99,
    category: "maternidade", subcategory: "roupa-gravida",
    size: "M", brand: "H&M", condition: "bom", gender: "menina",
    images: ["https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Almofada de Amamentação My Brest Friend",
    description: "Almofada de amamentação ergonómica. Capa lavável. Excelente estado.",
    price: 19.99, originalPrice: 49.99,
    category: "maternidade", subcategory: "amamentacao",
    size: "único", brand: "MY BREST FRIEND", condition: "como-novo", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1579547621706-1a9c79d5c9f1?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Bomba Tira-Leite Dupla Philips Avent",
    description: "Bomba tira-leite dupla Philips Avent. Muito eficaz. Bom estado.",
    price: 44.99, originalPrice: 129.99,
    category: "maternidade", subcategory: "amamentacao",
    size: "único", brand: "PHILIPS AVENT", condition: "bom", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1579547621706-1a9c79d5c9f1?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Soutien de Amamentação Cake Maternity B/C",
    description: "Soutien de amamentação com abertura fácil. Tamanho B/C. Excelente.",
    price: 14.99, originalPrice: 39.99,
    category: "maternidade", subcategory: "amamentacao",
    size: "B/C", brand: "CAKE MATERNITY", condition: "como-novo", gender: "menina",
    images: ["https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },

  // ══════════════════════════════════════════════════════════
  //  OCASIÕES ESPECIAIS (6 produtos)
  // ══════════════════════════════════════════════════════════

  {
    title: "Fato Princesa Elsa Frozen 5-6 Anos",
    description: "Fantasia da Elsa com peruca e varinha. Muito bem conservado. Mágico!",
    price: 9.99, originalPrice: 29.99,
    category: "ocasioes", subcategory: "disfarces",
    size: "5-6A", brand: "DISNEY", condition: "bom", gender: "menina",
    images: ["https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Fato Homem-Aranha 4-5 Anos",
    description: "Fantasia completa do Homem-Aranha com máscara. Perfeita para carnaval.",
    price: 8.99, originalPrice: 24.99,
    category: "ocasioes", subcategory: "disfarces",
    size: "4-5A", brand: "MARVEL", condition: "bom", gender: "menino",
    images: ["https://images.unsplash.com/photo-1594736797933-d0aa5e9c9b8a?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Fato de Leão Fofo 2-3 Anos",
    description: "Traje de leão com capuz e cauda. Ótimo para carnaval e Halloween.",
    price: 6.99, originalPrice: 19.99,
    category: "ocasioes", subcategory: "disfarces",
    size: "2-3A", brand: "PRIMARK", condition: "bom", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Fato de Bruxa com Chapéu 6-8 Anos",
    description: "Fato de bruxa preto com capa e chapéu. Ideal para Halloween e carnaval.",
    price: 7.99, originalPrice: 22.99,
    category: "ocasioes", subcategory: "disfarces",
    size: "6-7A", brand: "PRIMARK", condition: "bom", gender: "menina",
    images: ["https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Kit Acessórios Festa Princesa",
    description: "Kit com tiara, varinha e luvas de princesa. Tudo em bom estado.",
    price: 3.99, originalPrice: 9.99,
    category: "ocasioes", subcategory: "acessorios-festa",
    size: "único", brand: "PRIMARK", condition: "bom", gender: "menina",
    images: ["https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
  {
    title: "Capa de Super-Herói Personalizável",
    description: "Capa de super-herói com máscaras removíveis. Várias cores. Como novo.",
    price: 4.99, originalPrice: 14.99,
    category: "ocasioes", subcategory: "acessorios-festa",
    size: "único", brand: "GENÉRICO", condition: "como-novo", gender: "unissexo",
    images: ["https://images.unsplash.com/photo-1594736797933-d0aa5e9c9b8a?w=400&h=400&fit=crop"],
    stock: 1, isReserved: false, createdAt: FieldValue.serverTimestamp()
  },
]

// ─── Contagem por categoria ───────────────────────────────────────────
const counts = {}
for (const p of products) {
  counts[p.category] = (counts[p.category] || 0) + 1
}

console.log(`\n📦 Total de produtos: ${products.length}`)
console.log('📊 Por categoria:')
for (const [cat, n] of Object.entries(counts)) {
  console.log(`   • ${cat}: ${n} produtos`)
}
console.log('')

async function seedProducts() {
  console.log("🚀 A adicionar produtos ao Firestore — Kid to Kid Braga...\n")

  const productsRef = db.collection("products")
  let success = 0
  let errors = 0

  for (const product of products) {
    try {
      const docRef = await productsRef.add(product)
      console.log(`✅ [${product.category}/${product.subcategory}] ${product.title} — ${docRef.id}`)
      success++
    } catch (error) {
      console.error(`❌ Erro: ${product.title} —`, error.message)
      errors++
    }
  }

  console.log(`\n✨ Concluído! ${success} produtos adicionados com sucesso.`)
  if (errors > 0) console.log(`⚠️  ${errors} erros encontrados.`)
  process.exit(0)
}

seedProducts()
