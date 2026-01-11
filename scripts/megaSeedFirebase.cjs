/**
 * 🚀 MEGA SEED - Base de Dados Completa Kid to Kid
 * Baseado na estrutura do site kidtokidonline.pt
 * 
 * Executa com: node scripts/megaSeedFirebase.cjs
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, writeBatch, doc, Timestamp, deleteDoc, getDocs } = require('firebase/firestore');

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ========================================
// 🏷️ MARCAS REAIS (Mais de 50 marcas)
// ========================================
const BRANDS = {
  premium: [
    "Burberry Kids", "Gucci Kids", "Ralph Lauren", "Tommy Hilfiger Kids", 
    "Jacadi Paris", "Bonpoint", "Tartine et Chocolat", "Petit Bateau",
    "Il Gufo", "Armani Junior", "Kenzo Kids"
  ],
  popular: [
    "Zara Kids", "H&M", "Mango Kids", "Mayoral", "Chicco", "Zippy",
    "Benetton", "Gap Kids", "Next", "Gocco", "Orchestra", "Okaïdi",
    "Du Pareil Au Même", "Sergent Major", "Catimini", "Boboli",
    "Tuc Tuc", "Neck & Neck", "Knot", "Lanidor Kids", "Laranjinha"
  ],
  acessivel: [
    "Primark", "C&A", "Kiabi", "Vertbaudet", "Prenatal", "Lidl Kids",
    "Auchan", "Pingo Doce Baby", "Continente Kids", "Tex", "In Extenso"
  ],
  desportivo: [
    "Nike Kids", "Adidas Kids", "Puma Kids", "New Balance Kids",
    "Reebok Kids", "Converse Kids", "Vans Kids", "Geox", "Skechers Kids"
  ],
  brinquedos: [
    "Fisher-Price", "Chicco", "Clementoni", "Lego", "Playmobil", 
    "Hasbro", "Mattel", "VTech", "Imaginarium", "Djeco", "Haba"
  ],
  equipamentos: [
    "Chicco", "Bebé Confort", "Cybex", "Joie", "Bugaboo", "Stokke",
    "Inglesina", "Jané", "Brevi", "Cam", "Peg Perego", "Babyzen"
  ]
};

// ========================================
// 📏 TAMANHOS POR FAIXA ETÁRIA
// ========================================
const SIZES = {
  recem_nascido: ["Prematuro", "RN", "0M", "1M"],
  bebe_pequeno: ["0-1M", "0-3M", "1-3M", "3M"],
  bebe: ["3-6M", "6M", "6-9M", "9M", "9-12M", "12M"],
  bebe_grande: ["12-18M", "18M", "18-24M", "24M"],
  crianca_pequena: ["2A", "2-3A", "3A", "3-4A"],
  crianca: ["4A", "4-5A", "5A", "5-6A", "6A", "6-7A", "7A"],
  crianca_grande: ["8A", "8-10A", "9A", "10A", "10-12A"],
  pre_adolescente: ["12A", "12-14A", "14A", "14-16A", "16A"],
  calcado_bebe: ["16", "17", "18", "19", "20", "21"],
  calcado_crianca: ["22", "23", "24", "25", "26", "27", "28", "29"],
  calcado_grande: ["30", "31", "32", "33", "34", "35", "36", "37", "38"],
  maternidade: ["XS", "S", "M", "L", "XL", "XXL", "36", "38", "40", "42", "44"]
};

// ========================================
// 🎨 CORES E PADRÕES
// ========================================
const COLORS = {
  basicas: ["Branco", "Preto", "Cinzento", "Bege", "Cru", "Creme"],
  menina: ["Rosa", "Rosa Claro", "Rosa Velho", "Fúcsia", "Coral", "Salmão", "Lilás", "Roxo", "Lavanda"],
  menino: ["Azul", "Azul Marinho", "Azul Claro", "Azul Bebé", "Verde", "Verde Escuro", "Bordeaux"],
  neutras: ["Amarelo", "Laranja", "Vermelho", "Verde Menta", "Turquesa", "Mostarda", "Terracota"],
  padroes: ["Riscas", "Xadrez", "Flores", "Estrelas", "Animais", "Bolinhas", "Camuflado", "Tie-dye", "Tropical", "Geométrico"]
};

// ========================================
// 📂 CATEGORIAS COM SUBCATEGORIAS COMPLETAS
// ========================================
const CATEGORIES_DATA = {
  menina: {
    id: "menina",
    name: "Roupa Menina",
    icon: "👧",
    color: "#FF69B4",
    description: "Roupa de menina dos 0 aos 14 anos",
    subcategorias: [
      {
        name: "Vestidos",
        tipos: ["Vestido casual", "Vestido festa", "Vestido verão", "Vestido inverno", "Vestido cerimónia", "Vestido florido", "Vestido ganga", "Vestido malha"]
      },
      {
        name: "Calças",
        tipos: ["Calças ganga", "Leggings", "Calças tecido", "Calças fato treino", "Calças bombazine", "Jeggings", "Calças palazzo"]
      },
      {
        name: "Saias",
        tipos: ["Saia plissada", "Saia tutu", "Saia ganga", "Saia rodada", "Saia midi", "Saia com suspensórios"]
      },
      {
        name: "Calções",
        tipos: ["Calções ganga", "Calções algodão", "Calções desportivos", "Shorts", "Calções com folhos"]
      },
      {
        name: "T-shirts e Tops",
        tipos: ["T-shirt manga curta", "T-shirt manga comprida", "Top alças", "Blusa", "Túnica", "Cropped top"]
      },
      {
        name: "Camisolas",
        tipos: ["Camisola malha", "Sweatshirt", "Hoodie", "Cardigan", "Camisola gola alta", "Polar"]
      },
      {
        name: "Casacos",
        tipos: ["Casaco inverno", "Blusão", "Parka", "Impermeável", "Colete", "Sobretudo", "Trench coat", "Blazer"]
      },
      {
        name: "Conjuntos",
        tipos: ["Conjunto 2 peças", "Conjunto 3 peças", "Fato treino", "Conjunto vestido", "Conjunto saia"]
      },
      {
        name: "Pijamas",
        tipos: ["Pijama verão", "Pijama inverno", "Camisa de dormir", "Roupão"]
      },
      {
        name: "Roupa Interior",
        tipos: ["Cuecas pack", "Soutien", "Camisola interior", "Meias pack"]
      }
    ]
  },
  menino: {
    id: "menino",
    name: "Roupa Menino",
    icon: "👦",
    color: "#4169E1",
    description: "Roupa de menino dos 0 aos 14 anos",
    subcategorias: [
      {
        name: "Calças",
        tipos: ["Calças ganga", "Calças chino", "Calças fato treino", "Calças cargo", "Calças bombazine", "Calças slim"]
      },
      {
        name: "Calções",
        tipos: ["Calções ganga", "Calções cargo", "Calções desportivos", "Bermudas", "Calções banho"]
      },
      {
        name: "T-shirts",
        tipos: ["T-shirt manga curta", "T-shirt manga comprida", "Polo", "T-shirt estampada", "T-shirt básica"]
      },
      {
        name: "Camisas",
        tipos: ["Camisa casual", "Camisa xadrez", "Camisa linho", "Camisa ganga", "Camisa social"]
      },
      {
        name: "Camisolas",
        tipos: ["Camisola malha", "Sweatshirt", "Hoodie", "Cardigan", "Camisola V", "Polar"]
      },
      {
        name: "Casacos",
        tipos: ["Casaco inverno", "Blusão", "Parka", "Impermeável", "Colete", "Bomber", "Blusão ganga"]
      },
      {
        name: "Conjuntos",
        tipos: ["Conjunto 2 peças", "Conjunto 3 peças", "Fato treino", "Conjunto formal"]
      },
      {
        name: "Pijamas",
        tipos: ["Pijama verão", "Pijama inverno", "Roupão"]
      },
      {
        name: "Roupa Interior",
        tipos: ["Boxers pack", "Cuecas pack", "Camisola interior", "Meias pack"]
      }
    ]
  },
  babygrows: {
    id: "babygrows",
    name: "Babygrows",
    icon: "👶",
    color: "#98D8C8",
    description: "Babygrows e bodies para bebé",
    subcategorias: [
      {
        name: "Babygrows",
        tipos: ["Babygrow manga comprida", "Babygrow manga curta", "Babygrow atoalhado", "Babygrow veludo", "Babygrow algodão"]
      },
      {
        name: "Bodies",
        tipos: ["Body manga comprida", "Body manga curta", "Body alças", "Body cruzado", "Body envelope"]
      },
      {
        name: "Pijamas Bebé",
        tipos: ["Pijama 1 peça", "Pijama 2 peças", "Saco de dormir"]
      },
      {
        name: "Conjuntos Bebé",
        tipos: ["Conjunto 2 peças", "Conjunto 3 peças", "Conjunto saída maternidade", "Conjunto hospital"]
      },
      {
        name: "Calças Bebé",
        tipos: ["Calças malha", "Calças ganga bebé", "Leggings bebé", "Calças com pé"]
      },
      {
        name: "Casacos Bebé",
        tipos: ["Casaco tricot", "Casaco polar", "Casaco acolchoado", "Ninho bebé"]
      }
    ]
  },
  calcado: {
    id: "calcado",
    name: "Calçado",
    icon: "👟",
    color: "#DEB887",
    description: "Calçado infantil do 16 ao 38",
    subcategorias: [
      {
        name: "Ténis",
        tipos: ["Ténis desportivos", "Ténis casual", "Ténis luzes", "Ténis velcro", "Ténis running", "Ténis skate"]
      },
      {
        name: "Sapatos",
        tipos: ["Sapatos clássicos", "Mocassins", "Sapatos cerimónia", "Sapatos escola", "Sapatos Oxford"]
      },
      {
        name: "Sandálias",
        tipos: ["Sandálias casual", "Sandálias praia", "Sandálias desportivas", "Chinelos", "Havaianas"]
      },
      {
        name: "Botas",
        tipos: ["Botas inverno", "Botas chuva", "Botins", "Botas camurça", "Botas pelo", "Botas montanha"]
      },
      {
        name: "Sapatilhas",
        tipos: ["Sapatilhas lona", "Slip-on", "Alpargatas", "Sapatilhas bailarina"]
      },
      {
        name: "Pantufas",
        tipos: ["Pantufas quentes", "Pantufas personagens", "Pantufas antiderrapantes"]
      },
      {
        name: "Bebé",
        tipos: ["Sapatinhos bebé", "Pantufas bebé", "Primeiros passos"]
      }
    ]
  },
  brinquedos: {
    id: "brinquedos",
    name: "Brinquedos",
    icon: "🧸",
    color: "#FFD700",
    description: "Brinquedos para todas as idades",
    subcategorias: [
      {
        name: "Bonecas",
        tipos: ["Boneca bebé", "Barbie", "Boneca de pano", "Acessórios boneca", "Casa de bonecas", "LOL Surprise"]
      },
      {
        name: "Carros e Veículos",
        tipos: ["Carro telecomandado", "Pista carros", "Carros miniatura", "Hot Wheels", "Comboios"]
      },
      {
        name: "Jogos",
        tipos: ["Jogo tabuleiro", "Puzzle", "Jogo educativo", "Jogo memória", "Jogo cartas", "Jogo estratégia"]
      },
      {
        name: "Peluches",
        tipos: ["Peluche pequeno", "Peluche grande", "Peluche personagem", "Squishmallows"]
      },
      {
        name: "Construção",
        tipos: ["Lego", "Lego Duplo", "Blocos", "Construção magnética", "Playmobil"]
      },
      {
        name: "Exterior",
        tipos: ["Bicicleta", "Trotinete", "Bola", "Brinquedos areia", "Patins", "Skate"]
      },
      {
        name: "Musicais",
        tipos: ["Instrumento musical", "Brinquedo sons", "Piano", "Guitarra criança"]
      },
      {
        name: "Educativos",
        tipos: ["Livros interativos", "Tablet educativo", "Microscópio", "Kit ciências"]
      }
    ]
  },
  equipamentos: {
    id: "equipamentos",
    name: "Equipamentos",
    icon: "🍼",
    color: "#87CEEB",
    description: "Carrinhos, cadeiras auto e berços",
    subcategorias: [
      {
        name: "Carrinhos",
        tipos: ["Carrinho passeio", "Carrinho duplo", "Carrinho guarda-chuva", "Carrinho trio", "Carrinho 3 em 1", "Buggy"]
      },
      {
        name: "Cadeiras Auto",
        tipos: ["Ovo", "Cadeira grupo 0+", "Cadeira grupo 1", "Cadeira grupo 2/3", "Cadeira isofix", "Assento elevatório"]
      },
      {
        name: "Berços",
        tipos: ["Berço madeira", "Berço viagem", "Alcofa", "Mini berço", "Berço colecho", "Moisés"]
      },
      {
        name: "Cadeiras Refeição",
        tipos: ["Cadeira alta", "Cadeira portátil", "Assento elevatório refeição", "Cadeira evolutiva"]
      },
      {
        name: "Parques",
        tipos: ["Parque bebé", "Espreguiçadeira", "Baloiço bebé", "Jumper", "Centro de atividades"]
      },
      {
        name: "Transporte",
        tipos: ["Marsúpio", "Porta-bebé", "Mochila transporte", "Anel sling", "Wrap"]
      }
    ]
  },
  puericultura: {
    id: "puericultura",
    name: "Puericultura",
    icon: "🧴",
    color: "#DDA0DD",
    description: "Artigos de puericultura",
    subcategorias: [
      {
        name: "Amamentação",
        tipos: ["Bomba leite elétrica", "Bomba leite manual", "Esterilizador", "Aquecedor biberões", "Almofada amamentação", "Discos amamentação"]
      },
      {
        name: "Alimentação",
        tipos: ["Biberão", "Tetina", "Chupeta", "Babete", "Kit papa", "Copo aprendizagem", "Prato ventosa", "Talheres bebé"]
      },
      {
        name: "Higiene",
        tipos: ["Banheira bebé", "Muda fraldas", "Kit higiene", "Termómetro", "Corta unhas bebé", "Aspirador nasal"]
      },
      {
        name: "Segurança",
        tipos: ["Barreira escadas", "Protetor tomadas", "Protetor cantos", "Intercomunicador", "Câmara vigilância", "Trava portas"]
      },
      {
        name: "Passeio",
        tipos: ["Saco carrinho", "Sombrinha carrinho", "Rede mosquiteira", "Protetor chuva", "Organizador carrinho"]
      }
    ]
  },
  maternidade: {
    id: "maternidade",
    name: "Maternidade",
    icon: "🤰",
    color: "#FFC0CB",
    description: "Roupa para grávidas e amamentação",
    subcategorias: [
      {
        name: "Roupa Grávida",
        tipos: ["Calças grávida", "Vestido grávida", "T-shirt grávida", "Jeans grávida", "Saia grávida", "Casaco grávida"]
      },
      {
        name: "Amamentação",
        tipos: ["Top amamentação", "Soutien amamentação", "Vestido amamentação", "Pijama amamentação", "Camisa amamentação"]
      },
      {
        name: "Shapewear",
        tipos: ["Cinta pós-parto", "Cuecas grávida", "Meia de descanso", "Faixa abdominal"]
      },
      {
        name: "Acessórios Grávida",
        tipos: ["Almofada gravidez", "Creme anti-estrias", "Cinto segurança grávida"]
      }
    ]
  },
  agasalhos: {
    id: "agasalhos",
    name: "Agasalhos",
    icon: "🧥",
    color: "#CD853F",
    description: "Casacos e roupa de inverno",
    subcategorias: [
      {
        name: "Casacos Inverno",
        tipos: ["Casaco acolchoado", "Parka", "Duffel coat", "Sobretudo", "Casaco penas", "Casaco impermeável"]
      },
      {
        name: "Polares",
        tipos: ["Polar liso", "Polar com capuz", "Polar fecho", "Meia polar"]
      },
      {
        name: "Coletes",
        tipos: ["Colete acolchoado", "Colete malha", "Colete penas", "Colete polar"]
      },
      {
        name: "Gorros e Luvas",
        tipos: ["Gorro", "Luvas", "Cachecol", "Conjunto inverno", "Gola", "Tapa orelhas"]
      }
    ]
  },
  praia: {
    id: "praia",
    name: "Praia",
    icon: "🏖️",
    color: "#00CED1",
    description: "Roupa e acessórios de praia",
    subcategorias: [
      {
        name: "Fatos Banho",
        tipos: ["Fato banho inteiro", "Bikini", "Calções banho", "Fralda piscina", "Fato banho UV"]
      },
      {
        name: "Proteção Solar",
        tipos: ["T-shirt UV", "Fato UV completo", "Chapéu praia", "Chapéu legionário", "Óculos sol"]
      },
      {
        name: "Acessórios Praia",
        tipos: ["Toalha praia", "Saco praia", "Bóias", "Óculos natação", "Braçadeiras", "Balde praia"]
      }
    ]
  },
  carnaval: {
    id: "carnaval",
    name: "Carnaval / Halloween",
    icon: "🎭",
    color: "#FF6347",
    description: "Fatos de carnaval e halloween",
    subcategorias: [
      {
        name: "Fatos Princesa",
        tipos: ["Fato Elsa", "Fato Cinderela", "Fato Bela", "Fato Rapunzel", "Fato Moana", "Fato princesa genérico"]
      },
      {
        name: "Super-Heróis",
        tipos: ["Fato Homem-Aranha", "Fato Batman", "Fato Super-Homem", "Fato Capitão América", "Fato Iron Man"]
      },
      {
        name: "Animais",
        tipos: ["Fato leão", "Fato urso", "Fato coelho", "Fato joaninha", "Fato abelha", "Fato dinossauro"]
      },
      {
        name: "Profissões",
        tipos: ["Fato bombeiro", "Fato polícia", "Fato médico", "Fato astronauta", "Fato pirata"]
      },
      {
        name: "Halloween",
        tipos: ["Fato bruxa", "Fato vampiro", "Fato esqueleto", "Fato abóbora", "Fato fantasma", "Fato zombie"]
      },
      {
        name: "Acessórios",
        tipos: ["Máscara", "Peruca", "Chapéu carnaval", "Varinha", "Capa", "Coroa", "Asas"]
      }
    ]
  },
  acessorios: {
    id: "acessorios",
    name: "Acessórios",
    icon: "🎒",
    color: "#9370DB",
    description: "Mochilas, chapéus e acessórios",
    subcategorias: [
      {
        name: "Chapéus",
        tipos: ["Boné", "Chapéu sol", "Gorro fino", "Boina", "Chapéu bucket"]
      },
      {
        name: "Mochilas",
        tipos: ["Mochila escola", "Mochila passeio", "Lancheira", "Estojo", "Mochila rodas"]
      },
      {
        name: "Bijuteria",
        tipos: ["Pulseira", "Colar", "Gancho cabelo", "Fita cabelo", "Brincos", "Elásticos pack"]
      },
      {
        name: "Outros",
        tipos: ["Óculos sol", "Guarda-chuva", "Carteira", "Relógio", "Cinto", "Suspensórios"]
      }
    ]
  }
};

// ========================================
// 📝 DESCRIÇÕES DETALHADAS
// ========================================
const DESCRIPTIONS = {
  vestido: [
    "Vestido elegante em tecido de alta qualidade. Perfeito para ocasiões especiais. Detalhe em laço na cintura.",
    "Vestido casual e confortável, ideal para o dia a dia. Tecido macio e respirável, fácil de lavar.",
    "Vestido florido com detalhes encantadores. Saia rodada que a sua princesa vai adorar.",
    "Vestido de festa com tule e brilhos. Perfeito para aniversários e eventos especiais.",
    "Vestido em algodão orgânico, muito suave na pele. Design clássico e intemporal."
  ],
  calcas: [
    "Calças confortáveis com cintura ajustável. Perfeitas para o dia a dia na escola.",
    "Calças ganga de qualidade com elasticidade para maior conforto. Lavagem suave.",
    "Calças resistentes e duráveis com bolsos funcionais. Ideais para brincar.",
    "Leggings super macias em algodão stretch. Confortáveis para todo o dia.",
    "Calças chino elegantes, perfeitas para ocasiões mais formais ou escola."
  ],
  camisola: [
    "Camisola quentinha em malha de qualidade. Ideal para os dias mais frios de inverno.",
    "Sweatshirt com capuz em felpa macia. Com bolso canguru muito prático.",
    "Camisola com design moderno e estampado divertido. Em excelente estado.",
    "Hoodie super confortável em algodão. Perfeito para o regresso às aulas.",
    "Cardigan elegante em tricot fino. Versátil para várias ocasiões."
  ],
  casaco: [
    "Casaco de inverno quente e aconchegante. Enchimento em penas, muito leve.",
    "Parka impermeável com capuz amovível. Protege do frio e da chuva.",
    "Blusão desportivo com forro interior. Ideal para atividades ao ar livre.",
    "Casaco acolchoado com fecho e bolsos. Design unissexo muito versátil.",
    "Sobretudo elegante em lã. Perfeito para ocasiões mais formais."
  ],
  calcado: [
    "Ténis confortáveis e leves com sola antiderrapante. Fáceis de calçar.",
    "Botas de inverno impermeáveis com forro quente. Perfeitas para dias de chuva.",
    "Sapatos clássicos em pele. Ideais para ocasiões especiais ou escola.",
    "Sandálias confortáveis com fecho ajustável. Perfeitas para o verão.",
    "Sapatilhas em lona resistente. Design intemporal e versátil."
  ],
  brinquedo: [
    "Brinquedo em excelente estado, praticamente como novo. Muito pouco utilizado.",
    "Brinquedo educativo que estimula a criatividade. Completo com todas as peças.",
    "Brinquedo de marca de qualidade. Proporciona horas de diversão garantida.",
    "Jogo completo com manual de instruções. Ideal para toda a família.",
    "Brinquedo seguro e certificado. Recomendado para a faixa etária indicada."
  ],
  equipamento: [
    "Equipamento em muito bom estado, funciona perfeitamente. Inclui manual.",
    "Equipamento de marca reconhecida. Seguro e prático para o dia a dia.",
    "Equipamento pouco utilizado, muito bem conservado. Com todos os acessórios.",
    "Equipamento ergonómico e seguro. Testado e aprovado pelas normas europeias.",
    "Equipamento versátil que acompanha o crescimento do bebé."
  ],
  babygrow: [
    "Babygrow em algodão 100% muito suave na pele do bebé. Molas práticas.",
    "Body de qualidade com abertura envelope. Fácil de vestir e despir.",
    "Conjunto de bebé adorável com detalhes bordados. Perfeito para presente.",
    "Babygrow atoalhado muito quentinho. Ideal para as noites frias.",
    "Pijama de bebé em algodão orgânico. Certificado OEKO-TEX."
  ],
  generico: [
    "Artigo em bom estado de conservação. Qualidade Kid to Kid garantida.",
    "Artigo de segunda mão em excelente condição. Verificado e higienizado.",
    "Artigo bem cuidado, pronto a usar. Ótima relação qualidade-preço.",
    "Artigo com pouco uso, muito bem estimado. Vale a pena conferir.",
    "Artigo de qualidade a preço acessível. Segunda mão sustentável."
  ]
};

// ========================================
// 💰 PREÇOS POR CATEGORIA E CONDIÇÃO
// ========================================
const PRICE_RANGES = {
  menina: { new: [8.99, 34.99], good: [4.99, 19.99], used: [2.99, 12.99] },
  menino: { new: [8.99, 34.99], good: [4.99, 19.99], used: [2.99, 12.99] },
  babygrows: { new: [5.99, 19.99], good: [2.99, 12.99], used: [1.99, 7.99] },
  calcado: { new: [12.99, 44.99], good: [7.99, 29.99], used: [4.99, 17.99] },
  brinquedos: { new: [5.99, 89.99], good: [3.99, 49.99], used: [1.99, 29.99] },
  equipamentos: { new: [49.99, 349.99], good: [29.99, 199.99], used: [19.99, 129.99] },
  puericultura: { new: [7.99, 89.99], good: [4.99, 49.99], used: [2.99, 29.99] },
  maternidade: { new: [9.99, 49.99], good: [5.99, 29.99], used: [3.99, 17.99] },
  agasalhos: { new: [14.99, 59.99], good: [8.99, 34.99], used: [4.99, 19.99] },
  praia: { new: [6.99, 29.99], good: [3.99, 17.99], used: [2.99, 11.99] },
  carnaval: { new: [9.99, 39.99], good: [5.99, 24.99], used: [3.99, 14.99] },
  acessorios: { new: [4.99, 34.99], good: [2.99, 19.99], used: [1.99, 11.99] }
};

// ========================================
// 🛠️ FUNÇÕES AUXILIARES
// ========================================
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomItems(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generatePrice(category, condition) {
  const range = PRICE_RANGES[category]?.[condition] || [4.99, 19.99];
  const [min, max] = range;
  const price = Math.random() * (max - min) + min;
  return Math.floor(price) + 0.99;
}

function getSize(category) {
  const sizeMap = {
    babygrows: [...SIZES.recem_nascido, ...SIZES.bebe_pequeno, ...SIZES.bebe, ...SIZES.bebe_grande],
    calcado: [...SIZES.calcado_bebe, ...SIZES.calcado_crianca, ...SIZES.calcado_grande],
    maternidade: SIZES.maternidade,
    brinquedos: ["Único"],
    equipamentos: ["Único"],
    puericultura: ["Único"],
    carnaval: [...SIZES.crianca_pequena, ...SIZES.crianca, ...SIZES.crianca_grande]
  };
  
  const sizes = sizeMap[category] || [
    ...SIZES.bebe, ...SIZES.bebe_grande, 
    ...SIZES.crianca_pequena, ...SIZES.crianca, 
    ...SIZES.crianca_grande, ...SIZES.pre_adolescente
  ];
  
  return randomItem(sizes);
}

function getBrand(category) {
  const brandMap = {
    brinquedos: [...BRANDS.brinquedos, ...BRANDS.popular.slice(0, 5)],
    equipamentos: BRANDS.equipamentos,
    calcado: [...BRANDS.desportivo, ...BRANDS.popular.slice(0, 8)]
  };
  
  const brands = brandMap[category] || [...BRANDS.premium, ...BRANDS.popular, ...BRANDS.acessivel];
  return randomItem(brands);
}

function getColor(category, gender) {
  let colors = [...COLORS.basicas, ...COLORS.neutras];
  
  if (gender === "menina") {
    colors = [...colors, ...COLORS.menina];
  } else if (gender === "menino") {
    colors = [...colors, ...COLORS.menino];
  }
  
  if (Math.random() > 0.7) {
    colors = [...colors, ...COLORS.padroes];
  }
  
  return randomItem(colors);
}

function getDescription(category, tipo, condition, brand) {
  let descriptions = DESCRIPTIONS.generico;
  
  const tipoLower = tipo.toLowerCase();
  if (tipoLower.includes("vestido")) descriptions = DESCRIPTIONS.vestido;
  else if (tipoLower.includes("calças") || tipoLower.includes("legging")) descriptions = DESCRIPTIONS.calcas;
  else if (tipoLower.includes("camisola") || tipoLower.includes("sweat") || tipoLower.includes("hoodie")) descriptions = DESCRIPTIONS.camisola;
  else if (tipoLower.includes("casaco") || tipoLower.includes("parka") || tipoLower.includes("blusão")) descriptions = DESCRIPTIONS.casaco;
  else if (tipoLower.includes("ténis") || tipoLower.includes("bota") || tipoLower.includes("sapato") || tipoLower.includes("sandália")) descriptions = DESCRIPTIONS.calcado;
  else if (category === "brinquedos") descriptions = DESCRIPTIONS.brinquedo;
  else if (category === "equipamentos") descriptions = DESCRIPTIONS.equipamento;
  else if (category === "babygrows") descriptions = DESCRIPTIONS.babygrow;
  
  const conditionText = condition === "new" 
    ? " Artigo novo, nunca usado." 
    : condition === "good" 
    ? " Em muito bom estado de conservação." 
    : " Apresenta sinais normais de uso, mas em boas condições.";
  
  return randomItem(descriptions) + conditionText + ` Marca: ${brand}.`;
}

function generateProduct(category, subcategory, tipo, index) {
  const conditions = ["new", "good", "good", "good", "used", "used"]; // Mais produtos "good"
  const condition = randomItem(conditions);
  const brand = getBrand(category);
  const size = getSize(category);
  
  let gender = "unisex";
  if (category === "menina") gender = "menina";
  else if (category === "menino") gender = "menino";
  else if (["babygrows", "calcado"].includes(category) && Math.random() > 0.3) {
    gender = Math.random() > 0.5 ? "menina" : "menino";
  }
  
  const color = getColor(category, gender);
  const price = generatePrice(category, condition);
  const hasDiscount = Math.random() > 0.6;
  
  // Gerar título realista
  let title = `${tipo} ${brand}`;
  if (!["Único"].includes(size)) {
    title += ` - Tam. ${size}`;
  }
  if (color && !COLORS.padroes.includes(color) && Math.random() > 0.5) {
    title = `${tipo} ${color} ${brand} - Tam. ${size}`;
  }
  
  const seasons = ["Primavera/Verão", "Outono/Inverno", "Todo o ano"];
  let season = randomItem(seasons);
  
  // Ajustar estação baseado no tipo
  const tipoLower = tipo.toLowerCase();
  if (tipoLower.includes("verão") || tipoLower.includes("praia") || tipoLower.includes("banho")) {
    season = "Primavera/Verão";
  } else if (tipoLower.includes("inverno") || tipoLower.includes("polar") || tipoLower.includes("acolchoado")) {
    season = "Outono/Inverno";
  }
  
  // Gerar data de criação nos últimos 90 dias
  const daysAgo = Math.floor(Math.random() * 90);
  const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  
  // Featured products (10% de probabilidade)
  const isFeatured = Math.random() > 0.9;
  
  // Tags para pesquisa
  const tags = [category, subcategory, brand, size, condition, gender, color, season].filter(Boolean);
  
  return {
    title,
    brand,
    price,
    originalPrice: hasDiscount ? Math.floor(price * (1.3 + Math.random() * 0.3)) + 0.99 : null,
    size,
    condition,
    images: [
      `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(tipo + " " + brand)}`,
      `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(tipo + " criança")}`,
      `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(tipo + " " + color)}`
    ],
    category,
    subcategory,
    tipo,
    gender,
    color,
    season,
    stock: Math.random() > 0.1 ? 1 : 0,
    isReserved: Math.random() > 0.95,
    isFeatured,
    description: getDescription(category, tipo, condition, brand),
    tags,
    views: Math.floor(Math.random() * 500),
    createdAt: Timestamp.fromDate(createdAt),
    updatedAt: Timestamp.fromDate(new Date())
  };
}

// ========================================
// 🚀 FUNÇÃO PRINCIPAL DE SEED
// ========================================
async function megaSeedDatabase() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("🚀 MEGA SEED - Base de Dados Completa Kid to Kid");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("📦 Projeto: kidtokid-4d642\n");
  
  try {
    // 1. Limpar dados existentes
    console.log("🧹 A limpar dados existentes...");
    const productsRef = collection(db, "products");
    const categoriesRef = collection(db, "categories");
    
    const existingProducts = await getDocs(productsRef);
    const existingCategories = await getDocs(categoriesRef);
    
    if (existingProducts.size > 0 || existingCategories.size > 0) {
      console.log(`   Encontrados ${existingProducts.size} produtos e ${existingCategories.size} categorias`);
      
      // Eliminar em batches
      const deleteSize = 400;
      for (let i = 0; i < existingProducts.docs.length; i += deleteSize) {
        const batch = writeBatch(db);
        existingProducts.docs.slice(i, i + deleteSize).forEach(d => batch.delete(d.ref));
        await batch.commit();
      }
      
      for (const d of existingCategories.docs) {
        await deleteDoc(d.ref);
      }
      console.log("   ✅ Dados anteriores eliminados!\n");
    }
    
    // 2. Adicionar Categorias
    console.log("📂 A adicionar categorias...");
    const catBatch = writeBatch(db);
    
    for (const [key, data] of Object.entries(CATEGORIES_DATA)) {
      const docRef = doc(categoriesRef, data.id);
      catBatch.set(docRef, {
        id: data.id,
        name: data.name,
        icon: data.icon,
        color: data.color,
        description: data.description,
        subcategorias: data.subcategorias.map(s => s.name),
        ordem: Object.keys(CATEGORIES_DATA).indexOf(key),
        createdAt: Timestamp.fromDate(new Date())
      });
    }
    
    await catBatch.commit();
    console.log(`   ✅ ${Object.keys(CATEGORIES_DATA).length} categorias adicionadas!\n`);
    
    // 3. Adicionar Produtos
    console.log("🛍️ A adicionar produtos...\n");
    
    const productCounts = {
      menina: 150,
      menino: 120,
      babygrows: 80,
      calcado: 100,
      brinquedos: 70,
      equipamentos: 50,
      puericultura: 60,
      maternidade: 40,
      agasalhos: 70,
      praia: 45,
      carnaval: 35,
      acessorios: 50
    };
    
    let totalProducts = 0;
    const stats = {};
    
    for (const [categoryId, categoryData] of Object.entries(CATEGORIES_DATA)) {
      const count = productCounts[categoryId] || 30;
      let categoryTotal = 0;
      
      // Distribuir produtos por subcategorias
      const productsPerSubcat = Math.ceil(count / categoryData.subcategorias.length);
      
      for (const subcat of categoryData.subcategorias) {
        const batch = writeBatch(db);
        const subcatProducts = Math.min(productsPerSubcat, count - categoryTotal);
        
        for (let i = 0; i < subcatProducts && categoryTotal < count; i++) {
          const tipo = subcat.tipos[i % subcat.tipos.length];
          const product = generateProduct(categoryId, subcat.name, tipo, categoryTotal);
          const docRef = doc(productsRef);
          batch.set(docRef, product);
          categoryTotal++;
        }
        
        await batch.commit();
      }
      
      stats[categoryId] = categoryTotal;
      totalProducts += categoryTotal;
      console.log(`   📦 ${categoryData.name}: ${categoryTotal} produtos`);
    }
    
    // 4. Adicionar configurações do site
    console.log("\n⚙️ A adicionar configurações...");
    const settingsRef = collection(db, "settings");
    
    await writeBatch(db)
      .set(doc(settingsRef, "general"), {
        siteName: "Kid to Kid Online",
        siteDescription: "Compramos & Vendemos o que deixou de servir aos seus filhos",
        currency: "EUR",
        currencySymbol: "€",
        freeShippingThreshold: 60,
        reducedShippingThreshold: 39.99,
        reducedShippingCost: 3.99,
        standardShippingCost: 5.99,
        updatedAt: Timestamp.fromDate(new Date())
      })
      .set(doc(settingsRef, "contact"), {
        email: "info@kidtokid.pt",
        phone: "+351 XXX XXX XXX",
        address: "Lisboa, Portugal",
        facebook: "https://www.facebook.com/k2ktelheiras",
        instagram: "https://www.instagram.com/kidtokid_telheiras/",
        updatedAt: Timestamp.fromDate(new Date())
      })
      .set(doc(settingsRef, "banners"), {
        home: [
          { title: "Portes Grátis", subtitle: "Em compras superiores a €60,00 para Portugal Continental" },
          { title: "Nova Coleção", subtitle: "Chegaram novidades de Outono/Inverno" },
          { title: "Carnaval", subtitle: "Os melhores fatos para os mais pequenos" }
        ],
        updatedAt: Timestamp.fromDate(new Date())
      })
      .commit();
    
    console.log("   ✅ Configurações adicionadas!\n");
    
    // 5. Resumo Final
    console.log("═══════════════════════════════════════════════════════════");
    console.log("✅ BASE DE DADOS POPULADA COM SUCESSO!");
    console.log("═══════════════════════════════════════════════════════════\n");
    
    console.log("📊 RESUMO:");
    console.log("─────────────────────────────────────────");
    console.log(`📂 Categorias: ${Object.keys(CATEGORIES_DATA).length}`);
    console.log(`🛍️ Produtos: ${totalProducts}`);
    console.log(`⚙️ Configurações: 3 documentos`);
    console.log("─────────────────────────────────────────\n");
    
    console.log("📦 PRODUTOS POR CATEGORIA:");
    console.log("─────────────────────────────────────────");
    for (const [cat, count] of Object.entries(stats)) {
      const emoji = CATEGORIES_DATA[cat]?.icon || "📦";
      console.log(`${emoji} ${CATEGORIES_DATA[cat]?.name || cat}: ${count}`);
    }
    console.log("─────────────────────────────────────────\n");
    
    console.log("🔗 Ver no Firebase Console:");
    console.log("   https://console.firebase.google.com/project/kidtokid-4d642/firestore\n");
    
    process.exit(0);
    
  } catch (error) {
    console.error("\n❌ Erro ao popular base de dados:", error);
    process.exit(1);
  }
}

// Executar
megaSeedDatabase();
