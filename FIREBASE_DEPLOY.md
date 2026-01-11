# 🚀 Firebase Deploy Commands - Kid to Kid

## Configuração Inicial

```powershell
# 1. Instalar Firebase CLI globalmente
npm install -g firebase-tools

# 2. Login no Firebase
firebase login

# 3. Verificar projeto
firebase projects:list

# 4. Selecionar projeto (se necessário)
firebase use kidtokid-4d642
```

## Deploy de Regras

```powershell
# Deploy das regras do Firestore
firebase deploy --only firestore:rules

# Deploy das regras do Storage
firebase deploy --only storage

# Deploy dos índices do Firestore
firebase deploy --only firestore:indexes

# Deploy de tudo
firebase deploy --only firestore,storage
```

## Verificar Status

```powershell
# Ver regras ativas
firebase firestore:rules:list

# Ver índices
firebase firestore:indexes

# Ver configuração do projeto
firebase apps:list
```

## Backup Manual

```powershell
# Exportar base de dados
gcloud firestore export gs://kidtokid-4d642-backups/manual/backup-$(Get-Date -Format "yyyy-MM-dd")

# Importar base de dados
gcloud firestore import gs://kidtokid-4d642-backups/manual/backup-2026-01-11
```

## Emuladores Locais

```powershell
# Iniciar emuladores
firebase emulators:start

# Iniciar emuladores com dados de seed
firebase emulators:start --import=./seed-data

# Exportar dados dos emuladores
firebase emulators:export ./seed-data
```
