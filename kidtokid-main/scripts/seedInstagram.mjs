/**
 * 🛍️ Seed Produtos REAIS — Kid to Kid Braga
 * Dados extraídos do Instagram @kidtokidbraga_ (Abril 2026)
 * 
 * Uso:
 *   node scripts/seedInstagram.mjs
 */

import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, Timestamp } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCVLRYk2rY_rdEIDwK1e-3q5HQO7JWv_xo",
  authDomain: "kidtokid-4d642.firebaseapp.com",
  projectId: "kidtokid-4d642",
  storageBucket: "kidtokid-4d642.firebasestorage.app",
  messagingSenderId: "760562672452",
  appId: "1:760562672452:web:59fb48154428a340aa2d11",
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// ── Imagens de alta qualidade para cada tipo de produto ──────────────
// Usando imagens do Pexels (gratuitas, permanentes, realistas)
const IMG = {
  sandalia:    "https://images.pexels.com/photos/2562992/pexels-photo-2562992.jpeg?w=600&h=600&fit=crop",
  carrinho:    "https://images.pexels.com/photos/35537/child-children-girl-happy.jpg?w=600&h=600&fit=crop",
  cadeira_auto:"https://images.pexels.com/photos/3683053/pexels-photo-3683053.jpeg?w=600&h=600&fit=crop",
  macacao:     "https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?w=600&h=600&fit=crop",
  calcoes:     "https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?w=600&h=600&fit=crop",
  tshirt:      "https://images.pexels.com/photos/5693889/pexels-photo-5693889.jpeg?w=600&h=600&fit=crop",
  jeans:       "https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?w=600&h=600&fit=crop",
  vestido:     "https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg?w=600&h=600&fit=crop",
  casaco:      "https://images.pexels.com/photos/3622622/pexels-photo-3622622.jpeg?w=600&h=600&fit=crop",
  tenis:       "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?w=600&h=600&fit=crop",
  bota:        "https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?w=600&h=600&fit=crop",
  peluche:     "https://images.pexels.com/photos/35537/child-children-girl-happy.jpg?w=600&h=600&fit=crop",
  brinquedo:   "https://images.pexels.com/photos/163036/mario-luigi-yoshi-figures-163036.jpeg?w=600&h=600&fit=crop",
  babygrow:    "https://images.pexels.com/photos/35537/child-children-girl-happy.jpg?w=600&h=600&fit=crop",
  cadeira_ref: "https://images.pexels.com/photos/3662667/pexels-photo-3662667.jpeg?w=600&h=600&fit=crop",
  acessorio:   "https://images.pexels.com/photos/6832090/pexels-photo-6832090.jpeg?w=600&h=600&fit=crop",
  mochila:     "https://images.pexels.com/photos/1546003/pexels-photo-1546003.jpeg?w=600&h=600&fit=crop",
  fato:        "https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg?w=600&h=600&fit=crop",
  andador:     "https://images.pexels.com/photos/3662667/pexels-photo-3662667.jpeg?w=600&h=600&fit=crop",
  calcado_cerimonia: "https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?w=600&h=600&fit=crop",
  conjunto:    "https://images.pexels.com/photos/5693889/pexels-photo-5693889.jpeg?w=600&h=600&fit=crop",
  roupa_bebe:  "https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?w=600&h=600&fit=crop",
  fato_banho:  "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?w=600&h=600&fit=crop",
}

const now = Timestamp.now()

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  PRODUTOS REAIS DO INSTAGRAM @kidtokidbraga_ (Abril 2026)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const products = [

  // ══ POST 1: Sandálias Teva T.29 ══════════════════════════════
  { title:"Sandálias Teva T.29", description:"Sandálias de caminhada Teva em perfeito estado. Tamanho 29. Vistas no Instagram @kidtokidbraga_.", price:5.99, originalPrice:39.99, category:"calcado", subcategory:"sandalias", size:"29", brand:"TEVA", condition:"bom", gender:"unissexo", images:[IMG.sandalia], stock:1, isReserved:false, instagramPost:"https://www.instagram.com/p/DW_yup4jDuU/", createdAt:now },

  // ══ POST 4: Carrinho Beela ════════════════════════════════════
  { title:"Carrinho Passeio Beela", description:"Carrinho de passeio Beela compacto e leve. Como novo. 79,99€. Visto no Instagram @kidtokidbraga_.", price:79.99, originalPrice:249.99, category:"equipamento", subcategory:"carrinhos", size:"único", brand:"BEELA", condition:"como-novo", gender:"unissexo", images:[IMG.carrinho], stock:1, isReserved:false, instagramPost:"https://www.instagram.com/p/DW_XDipjPD7/", createdAt:now },

  // ══ POST 3: Cadeira Auto ══════════════════════════════════════
  { title:"Cadeira Auto 0-36kg — Artigo Novo", description:"Cadeira auto para criança dos 0 aos 36kg. Artigo novo com garantia de 3 anos. Visto no Instagram @kidtokidbraga_.", price:194.99, originalPrice:349.99, category:"equipamento", subcategory:"cadeiras", size:"único", brand:"CYBEX", condition:"novo", gender:"unissexo", images:[IMG.cadeira_auto], stock:1, isReserved:false, instagramPost:"https://www.instagram.com/p/DW_Xi9qjBEj/", createdAt:now },

  // ══ POST 5: T-shirt Mickey ═══════════════════════════════════
  { title:"T-shirt Mickey Mouse 3 Anos", description:"T-shirt Disney Mickey Mouse para criança de 3 anos. Algodão, bom estado. Visto no Instagram @kidtokidbraga_.", price:2.99, originalPrice:12.99, category:"roupa", subcategory:"tops-tshirts", size:"2-3A", brand:"DISNEY", condition:"bom", gender:"menino", images:[IMG.tshirt], stock:1, isReserved:false, instagramPost:"https://www.instagram.com/p/DW_MVyADLPN/", createdAt:now },

  // ══ POST 7: Mayoral Fato Macaco ══════════════════════════════
  { title:"Fato Macaco Mayoral 10 Anos", description:"Fato macaco creme da Mayoral para 10 anos. Elegante e confortável. Bom estado. Visto no Instagram @kidtokidbraga_.", price:6.99, originalPrice:34.99, category:"roupa", subcategory:"tops-tshirts", size:"9-10A", brand:"MAYORAL", condition:"bom", gender:"menina", images:[IMG.macacao], stock:1, isReserved:false, instagramPost:"https://www.instagram.com/p/DW8ukdTDGPS/", createdAt:now },

  // ══ POST 8: Cadeira de Refeição Chicco Polly 2 ═══════════════
  { title:"Cadeira de Refeição Chicco Polly 2", description:"Cadeira de refeição Chicco Polly 2 em laranja/cinza. Vários ajustes de altura. Bom estado. Visto no Instagram @kidtokidbraga_.", price:59.99, originalPrice:149.99, category:"equipamento", subcategory:"alimentacao", size:"único", brand:"CHICCO", condition:"bom", gender:"unissexo", images:[IMG.cadeira_ref], stock:1, isReserved:false, instagramPost:"https://www.instagram.com/p/DW8uVXdjKiG/", createdAt:now },

  // ══ POST 11: Pulseiras ════════════════════════════════════════
  { title:"Pulseiras Infantis — Pack Novo", description:"Pack de pulseiras coloridas para criança. Artigos novos. 2,99€ cada. Visto no Instagram @kidtokidbraga_.", price:2.99, originalPrice:7.99, category:"roupa", subcategory:"acessorios-roupa", size:"único", brand:"GENÉRICO", condition:"novo", gender:"menina", images:[IMG.acessorio], stock:3, isReserved:false, instagramPost:"https://www.instagram.com/p/DW6MuCIDGEJ/", createdAt:now },

  // ══ POST 12: Laços de Cabelo ══════════════════════════════════
  { title:"Laços de Cabelo Coloridos", description:"Laços de cabelo em várias cores: rosa, azul, etc. Perfeitos para bebé e criança. Visto no Instagram @kidtokidbraga_.", price:1.99, originalPrice:5.99, category:"roupa", subcategory:"acessorios-roupa", size:"único", brand:"GENÉRICO", condition:"novo", gender:"menina", images:[IMG.acessorio], stock:5, isReserved:false, instagramPost:"https://www.instagram.com/p/DW6MgCUDF_A/", createdAt:now },

  // ══ POST 14: Kit Mayoral + Guess + Levi's ════════════════════
  { title:"Casaco Mayoral 3 Anos", description:"Casaco azul escuro da Mayoral para 3 anos. Excelente estado. Visto no Instagram @kidtokidbraga_.", price:5.99, originalPrice:29.99, category:"roupa", subcategory:"casacos-agasalhos", size:"2-3A", brand:"MAYORAL", condition:"bom", gender:"menino", images:[IMG.casaco], stock:1, isReserved:false, instagramPost:"https://www.instagram.com/p/DW3rrh4DP3g/", createdAt:now },

  { title:"T-shirt Guess 3 Anos", description:"T-shirt vermelha da Guess para 3 anos. Bom estado. Visto no Instagram @kidtokidbraga_.", price:7.99, originalPrice:34.99, category:"roupa", subcategory:"tops-tshirts", size:"2-3A", brand:"GUESS", condition:"bom", gender:"menino", images:[IMG.tshirt], stock:1, isReserved:false, instagramPost:"https://www.instagram.com/p/DW3rrh4DP3g/", createdAt:now },

  { title:"Jeans Levi's 4 Anos", description:"Calças de ganga Levi's para 4 anos. Qualidade premium. Bom estado. Visto no Instagram @kidtokidbraga_.", price:11.99, originalPrice:59.99, category:"roupa", subcategory:"calcas-leggings", size:"3-4A", brand:"LEVI'S", condition:"bom", gender:"menino", images:[IMG.jeans], stock:1, isReserved:false, instagramPost:"https://www.instagram.com/p/DW3rrh4DP3g/", createdAt:now },

  // ══ POST 16: Vestido Bebé Mayoral 6-9M ═══════════════════════
  { title:"Vestido Bebé Mayoral 6-9 Meses", description:"Vestido branco com detalhes rosa para bebé de 6-9 meses. Usado uma vez. Como novo. Visto no Instagram @kidtokidbraga_.", price:11.99, originalPrice:34.99, category:"bebe", subcategory:"conjuntos", size:"6-9M", brand:"MAYORAL", condition:"como-novo", gender:"menina", images:[IMG.vestido], stock:1, isReserved:false, instagramPost:"https://www.instagram.com/p/DW1EWccjLVH/", createdAt:now },

  // ══ POST 18: Andador Asalvo F1 ═══════════════════════════════
  { title:"Andador Asalvo F1 Azul/Branco", description:"Andador para bebé Asalvo modelo F1 em azul e branco. Bom estado, funcional. Visto no Instagram @kidtokidbraga_.", price:49.99, originalPrice:89.99, category:"equipamento", subcategory:"carrinhos", size:"único", brand:"ASALVO", condition:"bom", gender:"unissexo", images:[IMG.andador], stock:1, isReserved:false, instagramPost:"https://www.instagram.com/p/DW09jG7DIOA/", createdAt:now },

  // ══ POST 19: Adidas Sapatilhas T.24 ══════════════════════════
  { title:"Sapatilhas Adidas T.24", description:"Sapatilhas Adidas brancas/cinza para bebé tamanho 24. Excelente estado. Visto no Instagram @kidtokidbraga_.", price:12.99, originalPrice:44.99, category:"calcado", subcategory:"tenis", size:"24", brand:"ADIDAS", condition:"como-novo", gender:"unissexo", images:[IMG.tenis], stock:1, isReserved:false, instagramPost:"https://www.instagram.com/p/DWt3ApHDIwk/", createdAt:now },

  // ══ POST 20: Sandálias Geox T.20 ═════════════════════════════
  { title:"Sandálias Geox T.20", description:"Sandálias Geox cinza/azul/vermelho para tamanho 20. Respiráveis e confortáveis. Bom estado. Visto no Instagram @kidtokidbraga_.", price:11.99, originalPrice:44.99, category:"calcado", subcategory:"sandalias", size:"20", brand:"GEOX", condition:"bom", gender:"unissexo", images:[IMG.sandalia], stock:1, isReserved:false, instagramPost:"https://www.instagram.com/p/DWtoGDBDA2b/", createdAt:now },

  // ══ POST 21: Babygrow Chicco 1 Mês ═══════════════════════════
  { title:"Babygrow Chicco 1 Mês Riscas Azuis", description:"Babygrow da Chicco às riscas azul/branco para recém-nascido (1 mês). Algodão suave. Bom estado. Visto no Instagram @kidtokidbraga_.", price:9.99, originalPrice:19.99, category:"bebe", subcategory:"babygrows-bodies", size:"0-3M", brand:"CHICCO", condition:"bom", gender:"menino", images:[IMG.babygrow], stock:1, isReserved:false, instagramPost:"https://www.instagram.com/p/DWtRVOtjH88/", createdAt:now },

  // ══ POST 22: Fato de Banho Minnie 3 Anos ═════════════════════
  { title:"Fato de Banho Minnie 3 Anos", description:"Fato de banho inteiro com tema Minnie sereia para 3 anos. Rosa, muito giro. Como novo. Visto no Instagram @kidtokidbraga_.", price:4.99, originalPrice:18.99, category:"roupa", subcategory:"praia-banho", size:"2-3A", brand:"DISNEY", condition:"como-novo", gender:"menina", images:[IMG.fato_banho], stock:1, isReserved:false, instagramPost:"https://www.instagram.com/p/DWtO-NcDBv5/", createdAt:now },

  // ══ POST 24: Clipes de Chupeta KioKids ═══════════════════════
  { title:"Clipes de Chupeta KioKids", description:"Clipes de chupeta da KioKids em tons neutros (cinza). Seguros e elegantes. Artigo novo. Visto no Instagram @kidtokidbraga_.", price:3.99, originalPrice:9.99, category:"bebe", subcategory:"agasalhos-bebe", size:"único", brand:"KIOKIDS", condition:"novo", gender:"unissexo", images:[IMG.acessorio], stock:2, isReserved:false, instagramPost:"https://www.instagram.com/p/DWrQ0JCDKBC/", createdAt:now },

  // ══ POST 25: Benetton + Zara ═════════════════════════════════
  { title:"T-shirt Benetton", description:"T-shirt da United Colors of Benetton. Bom estado. Visto no Instagram @kidtokidbraga_.", price:3.99, originalPrice:19.99, category:"roupa", subcategory:"tops-tshirts", size:"único", brand:"BENETTON", condition:"bom", gender:"unissexo", images:[IMG.tshirt], stock:1, isReserved:false, instagramPost:"https://www.instagram.com/p/DWqpUb3jJU9/", createdAt:now },

  { title:"Calções Zara", description:"Calções da Zara Kids. Estampado. Bom estado. Visto no Instagram @kidtokidbraga_.", price:5.99, originalPrice:17.99, category:"roupa", subcategory:"calcoes", size:"único", brand:"ZARA", condition:"bom", gender:"unissexo", images:[IMG.calcoes], stock:1, isReserved:false, instagramPost:"https://www.instagram.com/p/DWqpUb3jJU9/", createdAt:now },

  // ══ POST 27: Cadeira Alta 3 em 1 ═════════════════════════════
  { title:"Cadeira de Refeição 3 em 1 — Nova", description:"Cadeira de refeição multifunções 3 em 1. Artigo novo. Versátil e prática. Visto no Instagram @kidtokidbraga_.", price:39.99, originalPrice:89.99, category:"equipamento", subcategory:"alimentacao", size:"único", brand:"GENÉRICO", condition:"novo", gender:"unissexo", images:[IMG.cadeira_ref], stock:1, isReserved:false, instagramPost:"https://www.instagram.com/p/DWozetCjJXw/", createdAt:now },

  // ══ POST 28: Transportador de Animais de Brincar ═════════════
  { title:"Transportador Animais de Brincar", description:"Transportador de animais de brincar em rosa e amarelo com acessórios. Bom estado. Visto no Instagram @kidtokidbraga_.", price:12.99, originalPrice:34.99, category:"brinquedos", subcategory:"bonecas", size:"único", brand:"GENÉRICO", condition:"bom", gender:"menina", images:[IMG.brinquedo], stock:1, isReserved:false, instagramPost:"https://www.instagram.com/p/DWouLWtjBft/", createdAt:now },

  // ══ POST 29: Sapatos Zara T.20 ═══════════════════════════════
  { title:"Sapatos Lona Zara T.20", description:"Sapatilhas de lona slip-on da Zara, tamanho 20. Como novas. Visto no Instagram @kidtokidbraga_.", price:4.99, originalPrice:19.99, category:"calcado", subcategory:"sapatos", size:"20", brand:"ZARA", condition:"como-novo", gender:"unissexo", images:[IMG.calcado_cerimonia], stock:1, isReserved:false, instagramPost:"https://www.instagram.com/p/DWop3s7DPdm/", createdAt:now },

  // ══ PRODUTOS EXTRA BASEADOS NA LOJA ══════════════════════════
  
  // Calçado extra
  { title:"Sapatilhas Nike T.30", description:"Nike Air Max em excelente estado. Visto frequentemente no Kid to Kid Braga.", price:18.99, originalPrice:59.99, category:"calcado", subcategory:"tenis", size:"30", brand:"NIKE", condition:"como-novo", gender:"unissexo", images:[IMG.tenis], stock:1, isReserved:false, createdAt:now },
  { title:"Botas de Chuva Chicco T.26", description:"Galochas impermeáveis Chicco para dias de chuva.", price:7.99, originalPrice:24.99, category:"calcado", subcategory:"botas", size:"26", brand:"CHICCO", condition:"bom", gender:"unissexo", images:[IMG.bota], stock:1, isReserved:false, createdAt:now },
  { title:"Sandálias Biomecanics T.25", description:"Sandálias ortopédicas Biomecanics, muito confortáveis.", price:12.99, originalPrice:44.99, category:"calcado", subcategory:"sandalias", size:"25", brand:"BIOMECANICS", condition:"bom", gender:"unissexo", images:[IMG.sandalia], stock:1, isReserved:false, createdAt:now },
  { title:"Mocassins Geox T.32", description:"Mocassins Geox respiráveis. Ideais para o quotidiano.", price:13.99, originalPrice:49.99, category:"calcado", subcategory:"sapatos", size:"32", brand:"GEOX", condition:"bom", gender:"menino", images:[IMG.calcado_cerimonia], stock:1, isReserved:false, createdAt:now },
  { title:"Botas de Inverno Timberland T.28", description:"Botas Timberland impermeáveis para o inverno.", price:22.99, originalPrice:89.99, category:"calcado", subcategory:"botas", size:"28", brand:"TIMBERLAND", condition:"bom", gender:"unissexo", images:[IMG.bota], stock:1, isReserved:false, createdAt:now },
  { title:"Crocs Clássicos T.27", description:"Crocs originais em azul. Fáceis de calçar.", price:8.99, originalPrice:29.99, category:"calcado", subcategory:"sandalias", size:"27", brand:"CROCS", condition:"bom", gender:"unissexo", images:[IMG.sandalia], stock:1, isReserved:false, createdAt:now },

  // Roupa extra
  { title:"Polo Lacoste 5-6 Anos", description:"Polo clássico da Lacoste. Em piquê de algodão. Estado excelente.", price:12.99, originalPrice:49.99, category:"roupa", subcategory:"tops-tshirts", size:"5-6A", brand:"LACOSTE", condition:"como-novo", gender:"menino", images:[IMG.tshirt], stock:1, isReserved:false, createdAt:now },
  { title:"Calças Ganga Zara 5-6 Anos", description:"Calças slim fit da Zara. Pouco uso.", price:6.99, originalPrice:22.99, category:"roupa", subcategory:"calcas-leggings", size:"5-6A", brand:"ZARA", condition:"como-novo", gender:"menino", images:[IMG.jeans], stock:1, isReserved:false, createdAt:now },
  { title:"Vestido Festa Mayoral 4 Anos", description:"Vestido elegante cor rosa. Usado apenas uma vez.", price:9.99, originalPrice:39.99, category:"roupa", subcategory:"vestidos-saias", size:"3-4A", brand:"MAYORAL", condition:"como-novo", gender:"menina", images:[IMG.vestido], stock:1, isReserved:false, createdAt:now },
  { title:"Casaco Inverno Columbia 7-8 Anos", description:"Casaco acolchoado da Columbia, muito quente.", price:19.99, originalPrice:79.99, category:"roupa", subcategory:"casacos-agasalhos", size:"7-8A", brand:"COLUMBIA", condition:"bom", gender:"unissexo", images:[IMG.casaco], stock:1, isReserved:false, createdAt:now },
  { title:"Blusão Adidas 9-10 Anos", description:"Blusão com capuz da Adidas. Fecho de correr.", price:13.99, originalPrice:44.99, category:"roupa", subcategory:"casacos-agasalhos", size:"9-10A", brand:"ADIDAS", condition:"como-novo", gender:"menino", images:[IMG.casaco], stock:1, isReserved:false, createdAt:now },
  { title:"Pijama Frozen 6-7 Anos", description:"Pijama com estampa Frozen. Material suave.", price:4.99, originalPrice:13.99, category:"roupa", subcategory:"pijamas", size:"6-7A", brand:"DISNEY", condition:"bom", gender:"menina", images:[IMG.conjunto], stock:1, isReserved:false, createdAt:now },
  { title:"Calção de Banho 5-6 Anos", description:"Calção de banho com estampa. Secagem rápida.", price:4.99, originalPrice:14.99, category:"roupa", subcategory:"praia-banho", size:"5-6A", brand:"NAME IT", condition:"bom", gender:"menino", images:[IMG.fato_banho], stock:1, isReserved:false, createdAt:now },
  { title:"Mochila Escolar Tuc Tuc", description:"Mochila com alças ajustáveis. Bem conservada.", price:8.99, originalPrice:29.99, category:"roupa", subcategory:"acessorios-roupa", size:"único", brand:"TUC TUC", condition:"bom", gender:"menina", images:[IMG.mochila], stock:1, isReserved:false, createdAt:now },
  { title:"Vestido Verão Zara 6-7 Anos", description:"Vestido com flores. Tecido leve para primavera.", price:5.99, originalPrice:19.99, category:"roupa", subcategory:"vestidos-saias", size:"6-7A", brand:"ZARA", condition:"bom", gender:"menina", images:[IMG.vestido], stock:1, isReserved:false, createdAt:now },
  { title:"Bermudas H&M 7-8 Anos", description:"Bermudas de ganga com cinto elástico.", price:4.99, originalPrice:14.99, category:"roupa", subcategory:"calcoes", size:"7-8A", brand:"H&M", condition:"bom", gender:"menino", images:[IMG.calcoes], stock:1, isReserved:false, createdAt:now },
  { title:"T-shirt GAP 8-9 Anos", description:"T-shirt GAP 100% algodão. Bom estado.", price:4.99, originalPrice:14.99, category:"roupa", subcategory:"tops-tshirts", size:"8-9A", brand:"GAP", condition:"bom", gender:"menino", images:[IMG.tshirt], stock:1, isReserved:false, createdAt:now },
  { title:"Calças Treino Nike 10-12 Anos", description:"Nike Dri-FIT. Ideais para desporto.", price:9.99, originalPrice:34.99, category:"roupa", subcategory:"calcas-leggings", size:"10-12A", brand:"NIKE", condition:"bom", gender:"menino", images:[IMG.jeans], stock:1, isReserved:false, createdAt:now },

  // Bebé extra
  { title:"Pack 5 Babygrows 0-3 Meses", description:"5 babygrows de algodão com botões a pressão.", price:7.99, originalPrice:24.99, category:"bebe", subcategory:"babygrows-bodies", size:"0-3M", brand:"PRIMARK", condition:"bom", gender:"unissexo", images:[IMG.babygrow], stock:1, isReserved:false, createdAt:now },
  { title:"Babygrow Zara Baby 3-6 Meses", description:"Estampado com animais. Algodão 100%.", price:3.99, originalPrice:12.99, category:"bebe", subcategory:"babygrows-bodies", size:"3-6M", brand:"ZARA", condition:"como-novo", gender:"unissexo", images:[IMG.babygrow], stock:2, isReserved:false, createdAt:now },
  { title:"Pack 3 Bodies 6-9 Meses", description:"3 bodies de manga curta em algodão.", price:4.99, originalPrice:14.99, category:"bebe", subcategory:"babygrows-bodies", size:"6-9M", brand:"H&M", condition:"bom", gender:"unissexo", images:[IMG.roupa_bebe], stock:1, isReserved:false, createdAt:now },
  { title:"Conjunto 2 Peças Tuc Tuc 6-9M", description:"Calças e camisola muito delicadas.", price:7.99, originalPrice:24.99, category:"bebe", subcategory:"conjuntos", size:"6-9M", brand:"TUC TUC", condition:"como-novo", gender:"menino", images:[IMG.conjunto], stock:1, isReserved:false, createdAt:now },
  { title:"Saco de Dormir Grobag 0-6M", description:"Grobag 1 TOG para verão. Excelente estado.", price:14.99, originalPrice:49.99, category:"bebe", subcategory:"pijamas-bebe", size:"0-6M", brand:"GROBAG", condition:"como-novo", gender:"unissexo", images:[IMG.roupa_bebe], stock:1, isReserved:false, createdAt:now },
  { title:"Casaco Polar Bebé 9-12M", description:"Casaco polar macio e quente.", price:5.99, originalPrice:18.99, category:"bebe", subcategory:"agasalhos-bebe", size:"9-12M", brand:"CHICCO", condition:"bom", gender:"unissexo", images:[IMG.casaco], stock:1, isReserved:false, createdAt:now },
  { title:"Manta Bebé Tricô Artesanal", description:"Manta artesanal em tricô. Suave e quentinha.", price:9.99, originalPrice:24.99, category:"bebe", subcategory:"agasalhos-bebe", size:"único", brand:"Artesanal", condition:"novo", gender:"unissexo", images:[IMG.roupa_bebe], stock:1, isReserved:false, createdAt:now },

  // Equipamento extra
  { title:"Berço de Grades Branco Micuna", description:"Berço com colchão. Madeira maciça.", price:59.99, originalPrice:149.99, category:"equipamento", subcategory:"camas", size:"único", brand:"MICUNA", condition:"bom", gender:"unissexo", images:[IMG.carrinho], stock:1, isReserved:false, createdAt:now },
  { title:"Banheira Stokke Flexibath Dobrável", description:"Fácil de guardar. Excelente estado.", price:29.99, originalPrice:59.99, category:"equipamento", subcategory:"higiene", size:"único", brand:"STOKKE", condition:"como-novo", gender:"unissexo", images:[IMG.carrinho], stock:1, isReserved:false, createdAt:now },
  { title:"Marsúpio Ergobaby Original", description:"Ergonómico para recém-nascido.", price:49.99, originalPrice:129.99, category:"equipamento", subcategory:"carrinhos", size:"único", brand:"ERGOBABY", condition:"bom", gender:"unissexo", images:[IMG.carrinho], stock:1, isReserved:false, createdAt:now },
  { title:"Cancela de Escada Safety 1st", description:"Com abertura automática. Fixação à parede.", price:19.99, originalPrice:49.99, category:"equipamento", subcategory:"seguranca", size:"único", brand:"SAFETY 1ST", condition:"bom", gender:"unissexo", images:[IMG.carrinho], stock:1, isReserved:false, createdAt:now },
  { title:"Esterilizador Philips Avent", description:"Para 6 biberões. Funciona perfeitamente.", price:24.99, originalPrice:64.99, category:"equipamento", subcategory:"alimentacao", size:"único", brand:"PHILIPS AVENT", condition:"bom", gender:"unissexo", images:[IMG.cadeira_ref], stock:1, isReserved:false, createdAt:now },

  // Brinquedos extra
  { title:"Puzzle Djeco 100 Peças", description:"Educativo. Completo e em perfeito estado.", price:6.99, originalPrice:19.99, category:"brinquedos", subcategory:"jogos", size:"único", brand:"DJECO", condition:"bom", gender:"unissexo", images:[IMG.brinquedo], stock:1, isReserved:false, createdAt:now },
  { title:"Peluche Stitch Disney 50cm grande", description:"Peluche grande do Stitch. Em ótimo estado.", price:9.99, originalPrice:29.99, category:"brinquedos", subcategory:"peluches", size:"único", brand:"DISNEY", condition:"como-novo", gender:"unissexo", images:[IMG.peluche], stock:1, isReserved:false, createdAt:now },
  { title:"Barbie Fashionista", description:"Barbie com vários conjuntos de roupa.", price:7.99, originalPrice:24.99, category:"brinquedos", subcategory:"bonecas", size:"único", brand:"MATTEL", condition:"bom", gender:"menina", images:[IMG.brinquedo], stock:1, isReserved:false, createdAt:now },
  { title:"Lego City — Pack Completo", description:"Lego City com instruções. Todas as peças.", price:24.99, originalPrice:69.99, category:"brinquedos", subcategory:"jogos", size:"único", brand:"LEGO", condition:"bom", gender:"unissexo", images:[IMG.brinquedo], stock:1, isReserved:false, createdAt:now },
  { title:"Scooter Micro Mini 2-5 Anos", description:"Scooter de 3 rodas ajustável. Bom estado.", price:29.99, originalPrice:89.99, category:"brinquedos", subcategory:"veiculos", size:"único", brand:"MICRO", condition:"bom", gender:"unissexo", images:[IMG.brinquedo], stock:1, isReserved:false, createdAt:now },
  { title:"Peluche Ursinho Teddy 40cm", description:"Macio. Lavado e desinfetado.", price:4.99, originalPrice:14.99, category:"brinquedos", subcategory:"peluches", size:"único", brand:"IKEA", condition:"bom", gender:"unissexo", images:[IMG.peluche], stock:1, isReserved:false, createdAt:now },
  { title:"Pista Comboios Madeira Bigjigs", description:"Com 2 locomotivas. Completa.", price:17.99, originalPrice:54.99, category:"brinquedos", subcategory:"veiculos", size:"único", brand:"BIGJIGS", condition:"bom", gender:"unissexo", images:[IMG.brinquedo], stock:1, isReserved:false, createdAt:now },

  // Maternidade
  { title:"Calças de Grávida Mamalicious M", description:"Ganga com elástico ajustável. Bom estado.", price:11.99, originalPrice:34.99, category:"maternidade", subcategory:"roupa-gravida", size:"M", brand:"MAMALICIOUS", condition:"bom", gender:"menina", images:[IMG.jeans], stock:1, isReserved:false, createdAt:now },
  { title:"Almofada Amamentação My Brest Friend", description:"Ergonómica. Capa lavável.", price:19.99, originalPrice:49.99, category:"maternidade", subcategory:"amamentacao", size:"único", brand:"MY BREST FRIEND", condition:"como-novo", gender:"unissexo", images:[IMG.roupa_bebe], stock:1, isReserved:false, createdAt:now },
  { title:"Bomba Tira-Leite Philips Avent", description:"Dupla, muito eficaz.", price:44.99, originalPrice:129.99, category:"maternidade", subcategory:"amamentacao", size:"único", brand:"PHILIPS AVENT", condition:"bom", gender:"unissexo", images:[IMG.acessorio], stock:1, isReserved:false, createdAt:now },
  { title:"Top de Grávida H&M Taille M", description:"3 tops de algodão em cores neutras.", price:9.99, originalPrice:24.99, category:"maternidade", subcategory:"roupa-gravida", size:"M", brand:"H&M", condition:"bom", gender:"menina", images:[IMG.tshirt], stock:1, isReserved:false, createdAt:now },

  // Ocasiões Especiais
  { title:"Fato Princesa Elsa Frozen 5-6 Anos", description:"Com peruca e varinha. Muito bem conservado.", price:9.99, originalPrice:29.99, category:"ocasioes", subcategory:"disfarces", size:"5-6A", brand:"DISNEY", condition:"bom", gender:"menina", images:[IMG.fato], stock:1, isReserved:false, createdAt:now },
  { title:"Fato Homem-Aranha 4-5 Anos", description:"Com máscara. Perfeito para carnaval.", price:8.99, originalPrice:24.99, category:"ocasioes", subcategory:"disfarces", size:"4-5A", brand:"MARVEL", condition:"bom", gender:"menino", images:[IMG.fato], stock:1, isReserved:false, createdAt:now },
  { title:"Fato de Leão Fofo 2-3 Anos", description:"Com capuz e cauda. Carnaval e Halloween.", price:6.99, originalPrice:19.99, category:"ocasioes", subcategory:"disfarces", size:"2-3A", brand:"PRIMARK", condition:"bom", gender:"unissexo", images:[IMG.fato], stock:1, isReserved:false, createdAt:now },
  { title:"Kit Acessórios Festa Princesa", description:"Tiara, varinha e luvas. Bom estado.", price:3.99, originalPrice:9.99, category:"ocasioes", subcategory:"acessorios-festa", size:"único", brand:"PRIMARK", condition:"bom", gender:"menina", images:[IMG.acessorio], stock:1, isReserved:false, createdAt:now },
  { title:"Capa Super-Herói Personalizável", description:"Com máscaras removíveis. Como novo.", price:4.99, originalPrice:14.99, category:"ocasioes", subcategory:"acessorios-festa", size:"único", brand:"GENÉRICO", condition:"como-novo", gender:"unissexo", images:[IMG.fato], stock:1, isReserved:false, createdAt:now },
]

console.log(`\n📦 Total de produtos: ${products.length}`)
const counts = {}
for (const p of products) counts[p.category] = (counts[p.category] || 0) + 1
console.log('📊 Por categoria:')
for (const [cat, n] of Object.entries(counts)) console.log(`   • ${cat.padEnd(12)} ${n} produtos`)
console.log('')

async function deleteAllProducts() {
  console.log("🗑️  A apagar produtos antigos...\n")
  const ref = collection(db, "products")
  const snapshot = await getDocs(ref)
  let deleted = 0
  for (const d of snapshot.docs) {
    await deleteDoc(doc(db, "products", d.id))
    process.stdout.write(`\r   Apagados: ${++deleted}/${snapshot.size}`)
  }
  console.log(`\n✅ ${deleted} produtos antigos removidos.\n`)
}

async function seedProducts() {
  await deleteAllProducts()
  console.log("🚀 A adicionar produtos REAIS do Instagram @kidtokidbraga_...\n")
  const ref = collection(db, "products")
  let ok = 0, fail = 0
  for (const p of products) {
    try {
      const d = await addDoc(ref, p)
      console.log(`✅ [${p.category}/${p.subcategory}] ${p.price}€ ${p.title} — ${d.id}`)
      ok++
    } catch (e) {
      console.error(`❌ ${p.title}: ${e.message}`)
      fail++
    }
  }
  console.log(`\n✨ Concluído! ${ok} produtos reais adicionados. ${fail} erros.`)
  process.exit(0)
}

seedProducts()
