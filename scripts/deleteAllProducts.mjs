// Script para apagar todos os produtos do Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCVLRYk2rY_rdEIDwK1e-3q5HQO7JWv_xo",
  authDomain: "kidtokid-4d642.firebaseapp.com",
  projectId: "kidtokid-4d642",
  storageBucket: "kidtokid-4d642.firebasestorage.app",
  messagingSenderId: "760562672452",
  appId: "1:760562672452:web:59fb48154428a340aa2d11",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteAllProducts() {
  console.log('🔄 A carregar produtos...');
  
  const productsRef = collection(db, 'products');
  const snapshot = await getDocs(productsRef);
  
  console.log(`📦 Encontrados ${snapshot.docs.length} produtos`);
  
  if (snapshot.docs.length === 0) {
    console.log('✅ Não há produtos para apagar!');
    process.exit(0);
  }
  
  console.log('🗑️ A apagar produtos...');
  
  let deleted = 0;
  for (const docSnapshot of snapshot.docs) {
    await deleteDoc(doc(db, 'products', docSnapshot.id));
    deleted++;
    process.stdout.write(`\r🗑️ Apagados: ${deleted}/${snapshot.docs.length}`);
  }
  
  console.log('\n✅ Todos os produtos foram apagados com sucesso!');
  process.exit(0);
}

deleteAllProducts().catch((error) => {
  console.error('❌ Erro:', error);
  process.exit(1);
});
