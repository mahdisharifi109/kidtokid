# 📊 Firebase Usage & Monitoring - Kid to Kid

## 📋 Índice
1. [Quotas e Limites](#quotas-e-limites)
2. [Monitorização de Uso](#monitorização-de-uso)
3. [Otimização de Custos](#otimização-de-custos)
4. [Alertas](#alertas)
5. [Relatórios](#relatórios)

---

## 🔢 Quotas e Limites

### Plano Spark (Gratuito)

| Serviço | Limite Diário | Limite Mensal |
|---------|---------------|---------------|
| **Firestore Leituras** | 50,000 | 1,500,000 |
| **Firestore Escritas** | 20,000 | 600,000 |
| **Firestore Eliminações** | 20,000 | 600,000 |
| **Storage** | 5 GB total | 5 GB |
| **Storage Downloads** | 1 GB/dia | 30 GB |
| **Authentication** | Ilimitado | Ilimitado |
| **Hosting** | 10 GB | 360 GB |

### Plano Blaze (Pay-as-you-go) - Recomendado para Produção

| Serviço | Preço |
|---------|-------|
| **Firestore Leituras** | $0.06 / 100,000 |
| **Firestore Escritas** | $0.18 / 100,000 |
| **Firestore Armazenamento** | $0.18 / GB / mês |
| **Storage** | $0.026 / GB / mês |
| **Storage Downloads** | $0.12 / GB |

---

## 📈 Monitorização de Uso

### Dashboard Principal

Aceder em: [Firebase Console > Usage](https://console.firebase.google.com/project/kidtokid-4d642/usage)

### Métricas Chave (KPIs)

#### Firestore
```
📊 Leituras/dia
📊 Escritas/dia
📊 Eliminações/dia
📊 Armazenamento total
📊 Índices ativos
```

#### Storage
```
📊 Espaço utilizado
📊 Bandwidth usado
📊 Ficheiros totais
📊 Ficheiros por tipo
```

#### Authentication
```
📊 Utilizadores registados
📊 Logins/dia
📊 Novos registos/semana
📊 Métodos de autenticação
```

### Script de Monitorização

```javascript
// src/utils/usageMonitor.ts
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

export async function getCollectionStats() {
  const collections = ['products', 'users', 'orders', 'categories', 'favorites'];
  const stats: Record<string, number> = {};
  
  for (const col of collections) {
    const snapshot = await getCountFromServer(collection(db, col));
    stats[col] = snapshot.data().count;
  }
  
  return stats;
}

export async function logUsageStats() {
  const stats = await getCollectionStats();
  console.table(stats);
  
  // Opcional: Enviar para analytics
  // await addDoc(collection(db, 'analytics'), {
  //   type: 'usage_stats',
  //   data: stats,
  //   timestamp: new Date()
  // });
  
  return stats;
}
```

---

## 💰 Otimização de Custos

### 1. Reduzir Leituras

```typescript
// ❌ Mau: Buscar todos os produtos
const products = await getDocs(collection(db, 'products'));

// ✅ Bom: Paginação
const products = await getDocs(
  query(collection(db, 'products'), limit(20))
);

// ✅ Melhor: Cache local
const cachedProducts = localStorage.getItem('products');
if (cachedProducts && !isExpired) {
  return JSON.parse(cachedProducts);
}
```

### 2. Usar Índices Compostos

```json
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "products",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

### 3. Desnormalizar Dados

```typescript
// ❌ Mau: Múltiplas leituras
const order = await getDoc(doc(db, 'orders', orderId));
const products = await Promise.all(
  order.data().productIds.map(id => getDoc(doc(db, 'products', id)))
);

// ✅ Bom: Dados embebidos
const order = await getDoc(doc(db, 'orders', orderId));
// order.data().products já contém dados necessários
```

### 4. Otimizar Imagens

```typescript
// Comprimir antes de upload
async function compressImage(file: File): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = await createImageBitmap(file);
  
  // Redimensionar para max 800px
  const maxSize = 800;
  const ratio = Math.min(maxSize / img.width, maxSize / img.height);
  canvas.width = img.width * ratio;
  canvas.height = img.height * ratio;
  
  ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
  
  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(blob!), 'image/webp', 0.8);
  });
}
```

### 5. Implementar Cache

```typescript
// src/lib/cache.ts
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  
  if (Date.now() - entry.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
}

export function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}
```

---

## 🔔 Alertas

### Configurar Alertas no Firebase Console

1. Ir a [Firebase Console > Usage](https://console.firebase.google.com/project/kidtokid-4d642/usage)
2. Clicar em **Set budget alerts**
3. Configurar:

| Alerta | Threshold | Ação |
|--------|-----------|------|
| Uso 50% | 50% do orçamento | Email |
| Uso 80% | 80% do orçamento | Email + Slack |
| Uso 100% | 100% do orçamento | Email + SMS |

### Alertas de Performance

```javascript
// Cloud Function para monitorizar
exports.usageAlert = functions.pubsub
  .schedule('0 */6 * * *') // A cada 6 horas
  .onRun(async () => {
    const stats = await getUsageStats();
    
    // Alerta se leituras > 80% do limite diário
    if (stats.reads > 40000) {
      await sendAlert({
        type: 'usage_warning',
        message: `Leituras Firestore: ${stats.reads}/50000`,
        level: 'warning'
      });
    }
    
    // Alerta se storage > 4GB
    if (stats.storage > 4 * 1024 * 1024 * 1024) {
      await sendAlert({
        type: 'storage_warning',
        message: `Storage: ${(stats.storage / 1024 / 1024 / 1024).toFixed(2)}GB/5GB`,
        level: 'warning'
      });
    }
  });
```

---

## 📑 Relatórios

### Relatório Semanal

```typescript
// src/scripts/weeklyReport.ts
export async function generateWeeklyReport() {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  
  const report = {
    period: {
      start: startDate.toISOString(),
      end: new Date().toISOString()
    },
    products: {
      total: await getCount('products'),
      new: await getNewCount('products', startDate),
      byCategory: await getProductsByCategory()
    },
    orders: {
      total: await getCount('orders'),
      new: await getNewCount('orders', startDate),
      revenue: await getWeeklyRevenue(startDate)
    },
    users: {
      total: await getCount('users'),
      new: await getNewCount('users', startDate),
      active: await getActiveUsers(startDate)
    },
    usage: {
      reads: await getFirestoreReads(),
      writes: await getFirestoreWrites(),
      storage: await getStorageUsed()
    }
  };
  
  return report;
}
```

### Dashboard de Analytics

Implementar em `/admin/analytics`:

```tsx
// src/pages/AdminAnalyticsPage.tsx
export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    loadStats();
  }, []);
  
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <StatCard title="Produtos" value={stats?.products} />
      <StatCard title="Utilizadores" value={stats?.users} />
      <StatCard title="Encomendas" value={stats?.orders} />
      <StatCard title="Receita" value={stats?.revenue} format="currency" />
      
      <div className="col-span-4">
        <UsageChart data={stats?.usage} />
      </div>
    </div>
  );
}
```

---

## 📊 Estimativa de Custos Mensais

### Cenário: Loja Média (1000 produtos, 500 utilizadores/mês)

| Serviço | Uso Estimado | Custo |
|---------|--------------|-------|
| Firestore Leituras | ~500,000 | $0.30 |
| Firestore Escritas | ~50,000 | $0.09 |
| Firestore Storage | ~1 GB | $0.18 |
| Storage Files | ~5 GB | $0.13 |
| Storage Bandwidth | ~20 GB | $2.40 |
| **TOTAL** | | **~$3.10/mês** |

### Cenário: Loja Grande (10,000 produtos, 5000 utilizadores/mês)

| Serviço | Uso Estimado | Custo |
|---------|--------------|-------|
| Firestore Leituras | ~5,000,000 | $3.00 |
| Firestore Escritas | ~500,000 | $0.90 |
| Firestore Storage | ~5 GB | $0.90 |
| Storage Files | ~50 GB | $1.30 |
| Storage Bandwidth | ~200 GB | $24.00 |
| **TOTAL** | | **~$30.10/mês** |

---

## ✅ Checklist de Otimização

- [ ] Implementar paginação em todas as listas
- [ ] Adicionar cache local (localStorage/IndexedDB)
- [ ] Comprimir imagens antes de upload
- [ ] Usar índices compostos para queries frequentes
- [ ] Configurar alertas de orçamento
- [ ] Desnormalizar dados quando apropriado
- [ ] Implementar lazy loading de imagens
- [ ] Monitorizar queries lentas
- [ ] Limpar dados antigos/não utilizados

---

*Última atualização: Janeiro 2026*
