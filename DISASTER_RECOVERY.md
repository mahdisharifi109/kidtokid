# 🔄 Disaster Recovery - Kid to Kid

## 📋 Índice
1. [Estratégia de Backup](#estratégia-de-backup)
2. [Backup Automático](#backup-automático)
3. [Backup Manual](#backup-manual)
4. [Restauração](#restauração)
5. [Monitorização](#monitorização)
6. [Plano de Contingência](#plano-de-contingência)

---

## 🛡️ Estratégia de Backup

### Níveis de Proteção

| Nível | Frequência | Retenção | Tipo |
|-------|------------|----------|------|
| **Hot** | Tempo real | N/A | Replicação automática Firebase |
| **Warm** | Diário | 30 dias | Export programado |
| **Cold** | Semanal | 1 ano | Backup completo GCS |

### Dados Críticos

1. **Firestore Database**
   - Produtos
   - Utilizadores
   - Encomendas
   - Favoritos

2. **Firebase Storage**
   - Imagens de produtos
   - Avatares de utilizadores
   - Documentos

3. **Firebase Authentication**
   - Contas de utilizadores
   - Métodos de login

---

## 🔧 Backup Automático

### 1. Configurar Backups Programados no Firebase

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Selecionar projeto
firebase use kidtokid-4d642
```

### 2. Exportar Firestore (Cloud Console)

1. Aceder a [Firebase Console](https://console.firebase.google.com/project/kidtokid-4d642)
2. Ir a **Firestore Database** → **Backups**
3. Configurar **Schedule Backup**:
   - Frequência: Diária
   - Hora: 03:00 (horário de baixo tráfego)
   - Retenção: 30 dias
   - Bucket: `gs://kidtokid-4d642-backups`

### 3. Script de Backup Automático

Criar Cloud Function para backup:

```javascript
// functions/src/backup.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Firestore } = require('@google-cloud/firestore');

const firestore = new Firestore();
const bucket = 'gs://kidtokid-4d642-backups';

exports.scheduledBackup = functions.pubsub
  .schedule('0 3 * * *') // Todos os dias às 3h
  .timeZone('Europe/Lisbon')
  .onRun(async (context) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const exportPath = `${bucket}/firestore/${timestamp}`;
    
    try {
      await firestore.exportDocuments({
        outputUriPrefix: exportPath,
        collectionIds: ['products', 'users', 'orders', 'categories']
      });
      console.log(`Backup successful: ${exportPath}`);
      return { success: true, path: exportPath };
    } catch (error) {
      console.error('Backup failed:', error);
      throw error;
    }
  });
```

---

## 📤 Backup Manual

### Exportar Firestore via CLI

```bash
# Exportar toda a base de dados
gcloud firestore export gs://kidtokid-4d642-backups/manual/$(date +%Y-%m-%d)

# Exportar coleções específicas
gcloud firestore export gs://kidtokid-4d642-backups/manual/$(date +%Y-%m-%d) \
  --collection-ids=products,orders,users
```

### Exportar Storage

```bash
# Sincronizar Storage para backup local
gsutil -m rsync -r gs://kidtokid-4d642.appspot.com ./backup/storage/

# Ou para outro bucket
gsutil -m rsync -r gs://kidtokid-4d642.appspot.com gs://kidtokid-4d642-backups/storage/
```

### Exportar Authentication

```bash
# Exportar utilizadores
firebase auth:export users.json --format=json --project kidtokid-4d642
```

---

## 🔄 Restauração

### Restaurar Firestore

```bash
# Listar backups disponíveis
gsutil ls gs://kidtokid-4d642-backups/firestore/

# Restaurar de um backup específico
gcloud firestore import gs://kidtokid-4d642-backups/firestore/2026-01-10
```

### Restaurar Storage

```bash
# Restaurar ficheiros
gsutil -m rsync -r gs://kidtokid-4d642-backups/storage/ gs://kidtokid-4d642.appspot.com
```

### Restaurar Authentication

```bash
# Importar utilizadores
firebase auth:import users.json --project kidtokid-4d642
```

---

## 📊 Monitorização

### Alertas Configurados

1. **Backup Falhou**
   - Canal: Email + Slack
   - Ação: Notificar equipa técnica

2. **Espaço de Backup > 80%**
   - Canal: Email
   - Ação: Limpar backups antigos

3. **Tempo de Restauração > 1 hora**
   - Canal: Email + SMS
   - Ação: Escalar para equipa

### Dashboard de Monitorização

Aceder em: [Firebase Console > Usage](https://console.firebase.google.com/project/kidtokid-4d642/usage)

---

## 🚨 Plano de Contingência

### Cenário 1: Perda de Dados Parcial

**Sintomas:** Alguns documentos em falta
**RTO:** 30 minutos
**RPO:** 24 horas

**Passos:**
1. Identificar documentos em falta
2. Restaurar do último backup
3. Verificar integridade
4. Notificar utilizadores afetados

### Cenário 2: Corrupção de Base de Dados

**Sintomas:** Dados inconsistentes
**RTO:** 2 horas
**RPO:** 24 horas

**Passos:**
1. Parar aplicação (modo manutenção)
2. Exportar estado atual (evidência)
3. Restaurar backup completo
4. Validar dados
5. Retomar operações
6. Post-mortem

### Cenário 3: Eliminação Acidental de Coleção

**Sintomas:** Coleção vazia
**RTO:** 1 hora
**RPO:** 24 horas

**Passos:**
1. Identificar coleção afetada
2. Restaurar apenas essa coleção
3. Verificar relações/referências
4. Reindexar se necessário

### Cenário 4: Falha Total do Projeto

**Sintomas:** Projeto inacessível
**RTO:** 4 horas
**RPO:** 24 horas

**Passos:**
1. Contactar suporte Firebase
2. Criar novo projeto Firebase
3. Importar backups
4. Atualizar configurações da app
5. Deploy de emergência
6. Comunicar aos utilizadores

---

## 📞 Contactos de Emergência

| Função | Nome | Contacto |
|--------|------|----------|
| Admin Firebase | [Nome] | [Email] |
| Suporte Google Cloud | - | https://cloud.google.com/support |
| Dev Lead | [Nome] | [Email] |

---

## ✅ Checklist Mensal

- [ ] Verificar backups automáticos a funcionar
- [ ] Testar restauração de amostra
- [ ] Rever espaço de armazenamento
- [ ] Atualizar documentação se necessário
- [ ] Verificar alertas configurados
- [ ] Simular cenário de disaster recovery (trimestral)

---

## 📝 Histórico de Incidentes

| Data | Tipo | Descrição | Resolução | Tempo |
|------|------|-----------|-----------|-------|
| - | - | Sem incidentes registados | - | - |

---

*Última atualização: Janeiro 2026*
