import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore"

// Configuração do Firebase - Kid to Kid
const firebaseConfig = {
  apiKey: "AIzaSyCVLRYk2rY_rdEIDwK1e-3q5HQO7JWv_xo",
  authDomain: "kidtokid-4d642.firebaseapp.com",
  projectId: "kidtokid-4d642",
  storageBucket: "kidtokid-4d642.firebasestorage.app",
  messagingSenderId: "760562672452",
  appId: "1:760562672452:web:59fb48154428a340aa2d11",
  measurementId: "G-GC27W9RBF5"
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Produtos REAIS do Kid to Kid Telheiras - 1 de cada categoria
const products = [
  // BABYGROWS - Bebé
  {
    title: "Babygrow (0-3 Meses)",
    description: "Babygrow confortável para recém-nascido, em algodão macio. Ideal para o dia a dia do bebé.",
    price: 3.99,
    originalPrice: 12.99,
    category: "babygrows",
    subcategory: "0-6-meses",
    size: "0-3M",
    brand: "Diversas",
    condition: "good",
    gender: "unisex",
    images: ["https://images.unsplash.com/photo-1522771930-78c8c8e54e87?w=400&h=400&fit=crop"],
    stock: 5,
    isReserved: false,
    createdAt: Timestamp.now()
  },
  // ROUPA MENINA - Vestido
  {
    title: "Vestido MAYORAL (2 Anos)",
    description: "Vestido elegante da marca Mayoral, perfeito para ocasiões especiais ou uso diário.",
    price: 7.99,
    originalPrice: 29.99,
    category: "menina",
    subcategory: "vestidos",
    size: "2 Anos",
    brand: "MAYORAL",
    condition: "good",
    gender: "menina",
    images: ["https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400&h=400&fit=crop"],
    stock: 1,
    isReserved: false,
    createdAt: Timestamp.now()
  },
  // ROUPA MENINO - Calças
  {
    title: "Calças de Ganga JACADDI (4 Anos)",
    description: "Calças de ganga de qualidade premium da marca Jacaddi. Resistentes e confortáveis.",
    price: 8.99,
    originalPrice: 39.99,
    category: "menino",
    subcategory: "calcas",
    size: "4 Anos",
    brand: "JACADDI",
    condition: "good",
    gender: "menino",
    images: ["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=400&fit=crop"],
    stock: 1,
    isReserved: false,
    createdAt: Timestamp.now()
  },
  // CALÇADO - Sapatilhas
  {
    title: "Sapatilhas NIKE (nº28)",
    description: "Sapatilhas Nike em excelente estado. Ideais para crianças ativas que gostam de correr e brincar.",
    price: 17.99,
    originalPrice: 54.99,
    category: "calcado",
    subcategory: "sapatilhas",
    size: "28",
    brand: "NIKE",
    condition: "good",
    gender: "unisex",
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop"],
    stock: 1,
    isReserved: false,
    createdAt: Timestamp.now()
  },
  // BRINQUEDOS - Boneca
  {
    title: "Nancy NANCY",
    description: "Boneca Nancy clássica em bom estado. Perfeita para brincar e colecionar.",
    price: 9.99,
    originalPrice: 29.99,
    category: "brinquedos",
    subcategory: "bonecas",
    size: "único",
    brand: "NANCY",
    condition: "good",
    gender: "menina",
    images: ["https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&h=400&fit=crop"],
    stock: 1,
    isReserved: false,
    createdAt: Timestamp.now()
  },
  // PUERICULTURA - Banheira
  {
    title: "Banheira BEBEJOU",
    description: "Banheira de bebé da marca Bebejou, design moderno e ergonómico para maior conforto do bebé.",
    price: 64.99,
    originalPrice: 129.99,
    category: "puericultura",
    subcategory: "banho",
    size: "único",
    brand: "BEBEJOU",
    condition: "good",
    gender: "unisex",
    images: ["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop"],
    stock: 1,
    isReserved: false,
    createdAt: Timestamp.now()
  },
  // ACESSÓRIOS - Mochila
  {
    title: "Mochila Lanidor",
    description: "Mochila infantil da Lanidor, com design apelativo e compartimentos práticos.",
    price: 11.99,
    originalPrice: 34.99,
    category: "acessorios",
    subcategory: "mochilas",
    size: "único",
    brand: "LANIDOR",
    condition: "good",
    gender: "unisex",
    images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop"],
    stock: 1,
    isReserved: false,
    createdAt: Timestamp.now()
  },
  // EQUIPAMENTOS - Bubble Nest
  {
    title: "Bubble Nest Chicco",
    description: "Bubble Nest da Chicco, ideal para relaxamento e brincadeira do bebé. Estrutura segura e confortável.",
    price: 44.99,
    originalPrice: 99.99,
    category: "equipamentos",
    subcategory: "outros",
    size: "único",
    brand: "CHICCO",
    condition: "good",
    gender: "unisex",
    images: ["https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop"],
    stock: 1,
    isReserved: false,
    createdAt: Timestamp.now()
  }
]

async function seedProducts() {
  console.log("🚀 A adicionar produtos ao Firestore...\n")
  
  const productsRef = collection(db, "products")
  
  for (const product of products) {
    try {
      const docRef = await addDoc(productsRef, product)
      console.log(`✅ ${product.title} - ID: ${docRef.id}`)
    } catch (error) {
      console.error(`❌ Erro ao adicionar ${product.title}:`, error)
    }
  }
  
  console.log("\n✨ Produtos adicionados com sucesso!")
  process.exit(0)
}

seedProducts()
