# 🔥 Configuração do Firebase para Kid to Kid

Este guia explica como configurar o Firebase para o projeto Kid to Kid.

## 📋 Passo 1: Criar Projeto no Firebase

1. Aceda a [Firebase Console](https://console.firebase.google.com/)
2. Clique em **"Adicionar projeto"** ou **"Create a project"**
3. Nome do projeto: `kidtokid` (ou outro nome à sua escolha)
4. Desative o Google Analytics (opcional)
5. Clique em **"Criar projeto"**

## 📱 Passo 2: Registar a Aplicação Web

1. No painel do projeto, clique no ícone **Web** (`</>`)
2. Nome da app: `Kid to Kid Web`
3. **NÃO** marque "Firebase Hosting" por agora
4. Clique em **"Registar app"**
5. **IMPORTANTE:** Copie as credenciais que aparecem:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "kidtokid-xxxxx.firebaseapp.com",
  projectId: "kidtokid-xxxxx",
  storageBucket: "kidtokid-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## 🔐 Passo 3: Configurar Variáveis de Ambiente

1. Copie o ficheiro `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Preencha o ficheiro `.env` com as suas credenciais:
   ```env
   VITE_FIREBASE_API_KEY=AIza...
   VITE_FIREBASE_AUTH_DOMAIN=kidtokid-xxxxx.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=kidtokid-xxxxx
   VITE_FIREBASE_STORAGE_BUCKET=kidtokid-xxxxx.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```

## 🔒 Passo 4: Ativar Autenticação

1. No Firebase Console, vá a **Authentication** > **Sign-in method**
2. Ative os seguintes métodos:
   - **Email/Password**: Clique e ative
   - **Google**: Clique, ative, e configure o email de suporte

## 🗄️ Passo 5: Configurar Firestore Database

1. Vá a **Firestore Database** > **Create database**
2. Escolha **"Start in production mode"**
3. Selecione a localização: `europe-west1` (Bélgica) ou outra próxima
4. Clique em **"Enable"**

### Configurar Regras de Segurança

1. Vá a **Firestore Database** > **Rules**
2. Substitua o conteúdo pelas regras do ficheiro `firestore.rules`:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Produtos - leitura pública, escrita autenticada
    match /products/{productId} {
      allow read: if true;
      allow create, update, delete: if isAuthenticated();
    }
    
    // Utilizadores - apenas o próprio
    match /users/{userId} {
      allow read, create, update: if isAuthenticated() && isOwner(userId);
      allow delete: if false;
    }
    
    // Encomendas - apenas o próprio utilizador
    match /orders/{orderId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update: if isAuthenticated();
      allow delete: if false;
    }
    
    // Favoritos
    match /favorites/{favoriteId} {
      allow read, create, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
  }
}
```

3. Clique em **"Publish"**

### Criar Índices

Para algumas consultas, pode precisar de criar índices. Vá a **Firestore Database** > **Indexes** e adicione:

| Coleção | Campos | Query scope |
|---------|--------|-------------|
| products | category ASC, createdAt DESC | Collection |
| products | gender ASC, createdAt DESC | Collection |
| orders | userId ASC, createdAt DESC | Collection |

## 📦 Passo 6: Configurar Storage

1. Vá a **Storage** > **Get started**
2. Escolha **"Start in production mode"**
3. Selecione a mesma localização do Firestore
4. Clique em **"Done"**

### Configurar Regras de Storage

1. Vá a **Storage** > **Rules**
2. Substitua pelas regras do ficheiro `storage.rules`:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isImageType() {
      return request.resource.contentType.matches('image/.*');
    }
    
    function isValidSize() {
      return request.resource.size < 5 * 1024 * 1024; // 5MB
    }
    
    // Imagens de produtos
    match /products/{productId}/{fileName} {
      allow read: if true;
      allow write: if isAuthenticated() && isImageType() && isValidSize();
      allow delete: if isAuthenticated();
    }
    
    // Avatares
    match /avatars/{userId} {
      allow read: if true;
      allow write: if isAuthenticated() && request.auth.uid == userId && isImageType() && isValidSize();
      allow delete: if isAuthenticated() && request.auth.uid == userId;
    }
  }
}
```

3. Clique em **"Publish"**

## 🚀 Passo 7: Popular a Base de Dados (Opcional)

Para adicionar produtos de teste, pode usar a função `seedProducts`:

```typescript
import { seedProducts } from "@/src/scripts/seedDatabase"

// Adicionar 10 produtos por categoria
await seedProducts(10)
```

## 📁 Estrutura de Ficheiros Firebase

```
src/
├── lib/
│   └── firebase.ts          # Configuração Firebase
├── services/
│   ├── productService.ts    # CRUD de produtos
│   ├── authService.ts       # Autenticação
│   ├── orderService.ts      # Gestão de encomendas
│   └── storageService.ts    # Upload de imagens
├── contexts/
│   └── AuthContext.tsx      # Context de autenticação
├── hooks/
│   └── useProducts.ts       # Hooks para produtos
└── scripts/
    └── seedDatabase.ts      # Popular base de dados
```

## 🔧 Como Usar

### Autenticação

```typescript
import { useAuth } from "@/src/contexts/AuthContext"

function LoginPage() {
  const { login, register, loginWithGoogle, logout, user } = useAuth()
  
  // Login com email/password
  await login("email@exemplo.com", "password123")
  
  // Registar novo utilizador
  await register("email@exemplo.com", "password123", "Nome")
  
  // Login com Google
  await loginWithGoogle()
  
  // Logout
  await logout()
}
```

### Produtos

```typescript
import { useProducts, useProduct, useProductsByCategory } from "@/src/hooks/useProducts"

// Todos os produtos
const { products, loading, error } = useProducts()

// Produto por ID
const { product } = useProduct("produto-id")

// Produtos por categoria
const { products } = useProductsByCategory("menina")
```

### Adicionar Produtos

```typescript
import { addProduct, updateProduct, deleteProduct } from "@/src/services/productService"

// Adicionar
const productId = await addProduct({
  title: "Vestido Floral",
  brand: "Zara Kids",
  price: 15.99,
  // ... outros campos
})

// Atualizar
await updateProduct(productId, { price: 12.99 })

// Eliminar
await deleteProduct(productId)
```

## ⚠️ Notas Importantes

1. **Nunca faça commit do ficheiro `.env`** - já está no `.gitignore`
2. **Em produção**, restrinja as regras de segurança conforme necessário
3. **Para pesquisa avançada**, considere usar [Algolia](https://algolia.com) ou [Typesense](https://typesense.org)
4. **Backups**: Configure backups automáticos no Firebase Console

## 🆘 Problemas Comuns

### "Firebase: Error (auth/configuration-not-found)"
- Verifique se as credenciais no `.env` estão corretas
- Confirme que a app web está registada no Firebase Console

### "Missing or insufficient permissions"
- Verifique as regras do Firestore
- Confirme que o utilizador está autenticado

### "Storage: User does not have permission"
- Verifique as regras do Storage
- Confirme que está a enviar uma imagem válida (< 5MB)

---

📧 Precisa de ajuda? Abra uma issue no GitHub!
