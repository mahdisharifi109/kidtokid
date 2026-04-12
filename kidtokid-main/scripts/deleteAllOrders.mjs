// Script para apagar todas as encomendas do Firebase
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

async function deleteAllOrders() {
  console.log('🔄 A carregar encomendas...');
  
  const ordersRef = collection(db, 'orders');
  const snapshot = await getDocs(ordersRef);
  
  console.log(`📦 Encontradas ${snapshot.docs.length} encomendas`);
  
  if (snapshot.docs.length === 0) {
    console.log('✅ Não há encomendas para apagar!');
    process.exit(0);
  }
  
  console.log('🗑️ A apagar encomendas...');
  
  let deleted = 0;
  for (const docSnapshot of snapshot.docs) {
    await deleteDoc(doc(db, 'orders', docSnapshot.id));
    deleted++;
    process.stdout.write(`\r🗑️ Apagadas: ${deleted}/${snapshot.docs.length}`);
  }
  
  console.log('\n✅ Todas as encomendas foram apagadas com sucesso!');
  process.exit(0);
}

deleteAllOrders().catch((error) => {
  console.error('❌ Erro:', error);
  process.exit(1);
});
