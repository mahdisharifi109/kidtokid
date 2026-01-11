/**
 * Script para popular a base de dados Firebase Kid to Kid
 * Executa com: node scripts/seedFirebase.cjs
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, writeBatch, doc, Timestamp } = require('firebase/firestore');

// Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCVLRYk2rY_rdEIDwK1e-3q5HQO7JWv_xo",
  authDomain: "kidtokid-4d642.firebaseapp.com",
  projectId: "kidtokid-4d642",
  storageBucket: "kidtokid-4d642.firebasestorage.app",
  messagingSenderId: "760562672452",
  appId: "1:760562672452:web:59fb48154428a340aa2d11",
  measurementId: "G-GC27W9RBF5"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ========================================
// DADOS DAS CATEGORIAS
// ========================================
const CATEGORIES = [
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
];

// ========================================
// DADOS DE PRODUTOS
// ========================================
const BRANDS = [
  "Zara Kids", "H&M", "Mayoral", "Chicco", "Zippy", "Gocco", "Mango Kids",
  "Gap Kids", "Next", "Benetton", "Petit Bateau", "Boboli", "Tuc Tuc"
];

const SIZES = {
  bebe: ["0-1M", "0-3M", "3-6M", "6-9M", "9-12M", "12-18M", "18-24M"],
  crianca: ["2A", "3A", "4A", "5A", "6A", "7A", "8A", "9A", "10A", "12A"],
  calcado: ["18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32"]
};

const CONDITIONS = ["new", "good", "used"];
const SEASONS = ["Primavera/Verão", "Outono/Inverno", "Todo o ano"];
const COLORS = ["Rosa", "Azul", "Branco", "Preto", "Vermelho", "Verde", "Amarelo", "Bege", "Cinzento", "Marinho"];

// Produtos por categoria
const PRODUCTS_DATA = {
  menina: [
    { type: "Vestido casual", subcategory: "Vestidos" },
    { type: "Vestido festa", subcategory: "Vestidos" },
    { type: "Calças ganga", subcategory: "Calças" },
    { type: "Leggings", subcategory: "Calças" },
    { type: "Saia plissada", subcategory: "Saias" },
    { type: "Saia tutu", subcategory: "Saias" },
    { type: "T-shirt manga curta", subcategory: "T-shirts" },
    { type: "Camisola malha", subcategory: "Camisolas" },
    { type: "Sweatshirt", subcategory: "Camisolas" },
    { type: "Casaco inverno", subcategory: "Casacos" },
    { type: "Conjunto 2 peças", subcategory: "Conjuntos" },
    { type: "Pijama verão", subcategory: "Pijamas" }
  ],
  menino: [
    { type: "Calças ganga", subcategory: "Calças" },
    { type: "Calças chino", subcategory: "Calças" },
    { type: "Calções cargo", subcategory: "Calções" },
    { type: "T-shirt manga curta", subcategory: "T-shirts" },
    { type: "Polo", subcategory: "T-shirts" },
    { type: "Camisa xadrez", subcategory: "Camisas" },
    { type: "Sweatshirt", subcategory: "Camisolas" },
    { type: "Hoodie", subcategory: "Camisolas" },
    { type: "Casaco inverno", subcategory: "Casacos" },
    { type: "Blusão", subcategory: "Casacos" },
    { type: "Fato treino", subcategory: "Conjuntos" },
    { type: "Pijama inverno", subcategory: "Pijamas" }
  ],
  babygrows: [
    { type: "Babygrow manga comprida", subcategory: "Babygrows" },
    { type: "Babygrow manga curta", subcategory: "Babygrows" },
    { type: "Body manga comprida", subcategory: "Bodies" },
    { type: "Body manga curta", subcategory: "Bodies" },
    { type: "Pijama 1 peça", subcategory: "Pijamas bebé" },
    { type: "Conjunto saída maternidade", subcategory: "Conjuntos bebé" }
  ],
  calcado: [
    { type: "Ténis desportivos", subcategory: "Ténis" },
    { type: "Ténis casual", subcategory: "Ténis" },
    { type: "Sapatos clássicos", subcategory: "Sapatos" },
    { type: "Sandálias casual", subcategory: "Sandálias" },
    { type: "Botas inverno", subcategory: "Botas" },
    { type: "Pantufas quentes", subcategory: "Pantufas" }
  ],
  brinquedos: [
    { type: "Boneca bebé", subcategory: "Bonecas" },
    { type: "Carro telecomandado", subcategory: "Carros" },
    { type: "Puzzle", subcategory: "Jogos" },
    { type: "Jogo tabuleiro", subcategory: "Jogos" },
    { type: "Peluche grande", subcategory: "Peluches" },
    { type: "Lego", subcategory: "Construção" },
    { type: "Bicicleta", subcategory: "Exterior" }
  ],
  equipamentos: [
    { type: "Carrinho passeio", subcategory: "Carrinhos" },
    { type: "Cadeira auto grupo 1", subcategory: "Cadeiras Auto" },
    { type: "Berço viagem", subcategory: "Berços" },
    { type: "Cadeira alta", subcategory: "Cadeiras Refeição" },
    { type: "Espreguiçadeira", subcategory: "Parques" }
  ],
  puericultura: [
    { type: "Bomba leite", subcategory: "Amamentação" },
    { type: "Esterilizador", subcategory: "Amamentação" },
    { type: "Biberão", subcategory: "Alimentação" },
    { type: "Babete", subcategory: "Alimentação" },
    { type: "Banheira bebé", subcategory: "Higiene" },
    { type: "Barreira escadas", subcategory: "Segurança" }
  ],
  maternidade: [
    { type: "Calças grávida", subcategory: "Roupa Grávida" },
    { type: "Vestido grávida", subcategory: "Roupa Grávida" },
    { type: "Top amamentação", subcategory: "Amamentação" },
    { type: "Soutien amamentação", subcategory: "Amamentação" }
  ],
  agasalhos: [
    { type: "Casaco acolchoado", subcategory: "Casacos Inverno" },
    { type: "Parka", subcategory: "Casacos Inverno" },
    { type: "Polar com capuz", subcategory: "Polares" },
    { type: "Colete acolchoado", subcategory: "Coletes" },
    { type: "Conjunto inverno", subcategory: "Gorros e Luvas" }
  ],
  praia: [
    { type: "Fato banho inteiro", subcategory: "Fatos Banho" },
    { type: "Calções banho", subcategory: "Fatos Banho" },
    { type: "T-shirt UV", subcategory: "Proteção Solar" },
    { type: "Chapéu praia", subcategory: "Proteção Solar" },
    { type: "Toalha praia", subcategory: "Acessórios" }
  ],
  carnaval: [
    { type: "Fato princesa", subcategory: "Fatos Completos" },
    { type: "Fato super-herói", subcategory: "Fatos Completos" },
    { type: "Fato animal", subcategory: "Fatos Completos" },
    { type: "Máscara", subcategory: "Acessórios" }
  ],
  acessorios: [
    { type: "Boné", subcategory: "Chapéus" },
    { type: "Mochila escola", subcategory: "Mochilas" },
    { type: "Lancheira", subcategory: "Mochilas" },
    { type: "Óculos sol", subcategory: "Outros" }
  ]
};

// Funções auxiliares
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePrice(category) {
  const ranges = {
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
  };
  const [min, max] = ranges[category] || [4.99, 19.99];
  return Math.floor(Math.random() * (max - min) + min) + 0.99;
}

function getSize(category) {
  if (category === "babygrows") return randomItem(SIZES.bebe);
  if (category === "calcado") return randomItem(SIZES.calcado);
  if (["brinquedos", "equipamentos", "puericultura"].includes(category)) return "Único";
  return randomItem([...SIZES.bebe, ...SIZES.crianca]);
}

function generateProduct(category, productData, index) {
  const condition = randomItem(CONDITIONS);
  const price = generatePrice(category);
  const hasDiscount = Math.random() > 0.65;
  const brand = randomItem(BRANDS);
  const color = randomItem(COLORS);
  const size = getSize(category);
  
  let gender = "unisex";
  if (category === "menina") gender = "menina";
  else if (category === "menino") gender = "menino";
  
  const title = `${productData.type} ${brand} (${size})`;
  
  return {
    title,
    brand,
    price,
    originalPrice: hasDiscount ? Math.floor(price * 1.4) + 0.99 : null,
    size,
    condition,
    images: [`/placeholder.svg?height=400&width=400&query=${encodeURIComponent(productData.type)}`],
    category,
    subcategory: productData.subcategory,
    gender,
    color,
    season: randomItem(SEASONS),
    stock: Math.random() > 0.15 ? 1 : 0,
    isReserved: false,
    description: `${productData.type} de qualidade da marca ${brand}. Em ${condition === "new" ? "estado novo" : condition === "good" ? "bom estado" : "estado usado"}. Tamanho ${size}.`,
    createdAt: Timestamp.fromDate(new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000))
  };
}

// ========================================
// FUNÇÃO PRINCIPAL DE SEED
// ========================================
async function seedDatabase() {
  console.log("🚀 Iniciando seed da base de dados Kid to Kid...\n");
  console.log("📦 Projeto Firebase: kidtokid-4d642\n");
  
  try {
    // 1. Adicionar Categorias
    console.log("📂 A adicionar categorias...");
    const categoriesRef = collection(db, "categories");
    const catBatch = writeBatch(db);
    
    for (const category of CATEGORIES) {
      const docRef = doc(categoriesRef, category.id);
      catBatch.set(docRef, category);
    }
    
    await catBatch.commit();
    console.log(`   ✅ ${CATEGORIES.length} categorias adicionadas!\n`);
    
    // 2. Adicionar Produtos
    console.log("🛍️ A adicionar produtos...");
    const productsRef = collection(db, "products");
    let totalProducts = 0;
    
    for (const [category, products] of Object.entries(PRODUCTS_DATA)) {
      // Quantidade de produtos por categoria
      const counts = {
        menina: 50, menino: 40, babygrows: 30, calcado: 35,
        brinquedos: 25, equipamentos: 15, puericultura: 20,
        maternidade: 15, agasalhos: 25, praia: 15, carnaval: 12, acessorios: 18
      };
      
      const count = counts[category] || 20;
      const batch = writeBatch(db);
      
      for (let i = 0; i < count; i++) {
        const productData = products[i % products.length];
        const product = generateProduct(category, productData, i);
        const docRef = doc(productsRef);
        batch.set(docRef, product);
      }
      
      await batch.commit();
      totalProducts += count;
      console.log(`   📦 ${category}: ${count} produtos`);
    }
    
    console.log(`\n   ✅ Total: ${totalProducts} produtos adicionados!\n`);
    
    // Resumo
    console.log("═══════════════════════════════════════════");
    console.log("✅ BASE DE DADOS POPULADA COM SUCESSO!");
    console.log("═══════════════════════════════════════════");
    console.log(`📂 Categorias: ${CATEGORIES.length}`);
    console.log(`🛍️ Produtos: ${totalProducts}`);
    console.log("");
    console.log("🔗 Ver no Firebase Console:");
    console.log("   https://console.firebase.google.com/project/kidtokid-4d642/firestore");
    console.log("");
    
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Erro ao popular base de dados:", error);
    process.exit(1);
  }
}

// Executar
seedDatabase();
