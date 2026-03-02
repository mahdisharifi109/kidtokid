/**
 * 🔐 Script para tornar um utilizador admin
 * 
 * Este script usa o Firebase Admin SDK para definir custom claims,
 * que são verificados pelas regras de segurança do Firestore.
 * 
 * Pré-requisitos:
 *   1. Ter o ficheiro da service account do Firebase:
 *      - Ir a Firebase Console > Project Settings > Service Accounts
 *      - Clicar em "Generate new private key"
 *      - Guardar o ficheiro como scripts/serviceAccountKey.json
 * 
 *   2. Instalar dependências:
 *      cd scripts && npm install firebase-admin
 * 
 * Uso:
 *   node scripts/makeAdmin.mjs EMAIL_DO_UTILIZADOR
 * 
 * Exemplo:
 *   node scripts/makeAdmin.mjs mahdisharifi4561@gmail.com
 */

import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { readFileSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const serviceAccountPath = join(__dirname, 'serviceAccountKey.json')

// Verificar se o ficheiro existe
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

const app = initializeApp({
    credential: cert(serviceAccount)
})

const authAdmin = getAuth(app)
const db = getFirestore(app)

async function makeAdmin(email) {
    if (!email) {
        console.error('❌ Por favor, fornece um email!')
        console.log('\n📖 Uso: node scripts/makeAdmin.mjs EMAIL')
        console.log('   Exemplo: node scripts/makeAdmin.mjs admin@kidtokid.pt\n')
        process.exit(1)
    }

    console.log(`\n🔍 A procurar utilizador com email: ${email}...\n`)

    try {
        // Procurar o utilizador no Firebase Auth
        const userRecord = await authAdmin.getUserByEmail(email.toLowerCase())

        console.log(`✅ Utilizador encontrado!`)
        console.log(`   📧 Email: ${userRecord.email}`)
        console.log(`   👤 Nome: ${userRecord.displayName || 'N/A'}`)
        console.log(`   🔑 UID: ${userRecord.uid}`)

        // Verificar claims atuais
        const currentClaims = userRecord.customClaims || {}
        if (currentClaims.admin === true) {
            console.log(`\n⚠️ Este utilizador já tem o custom claim 'admin'!`)
        }

        // 1. Definir custom claims no Firebase Auth (usado pelas regras do Firestore)
        await authAdmin.setCustomUserClaims(userRecord.uid, {
            ...currentClaims,
            admin: true
        })
        console.log(`\n✅ Custom claim 'admin: true' definido no Firebase Auth`)

        // 2. Também atualizar o documento no Firestore
        const userRef = db.collection('users').doc(userRecord.uid)
        const userDoc = await userRef.get()
        
        if (userDoc.exists) {
            await userRef.update({ role: 'admin' })
            console.log(`✅ Campo 'role: admin' atualizado no Firestore`)
        } else {
            console.log(`⚠️ Documento do utilizador não encontrado no Firestore (apenas Auth atualizado)`)
        }

        console.log(`\n🎉 Sucesso! ${email} agora é ADMIN!\n`)
        console.log(`⚠️ IMPORTANTE: O utilizador precisa de fazer logout e login novamente`)
        console.log(`   para que os custom claims sejam aplicados.\n`)
        console.log(`🔗 Painel de administração:`)
        console.log(`   http://localhost:3000/admin`)
        console.log(`   https://kidtokid-4d642.web.app/admin\n`)

    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            console.error(`❌ Utilizador não encontrado com email: ${email}`)
            console.log('\n💡 Certifica-te que:')
            console.log('   1. O utilizador já se registou no site')
            console.log('   2. O email está correto\n')
        } else {
            console.error('❌ Erro:', error.message)
        }
        process.exit(1)
    }

    process.exit(0)
}

// Obter email dos argumentos
const email = process.argv[2]
makeAdmin(email)
