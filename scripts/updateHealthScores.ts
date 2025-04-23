import admin from 'firebase-admin';
import { calculateHealthScore } from '../utils/healthScoreCalculator';
import serviceAccount from '../service-account-key.json';
import type { Product } from '../types';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
});

const db = admin.firestore();

async function updateAllHealthScores() {
  const productsRef = db.collection('products');
  const snapshot = await productsRef.get();
  
  let batch = db.batch();
  let count = 0;

  // Use traditional loop instead of forEach for async operations
  for (let i = 0; i < snapshot.docs.length; i++) {
    const doc = snapshot.docs[i];
    const product = doc.data() as Product; // Type assertion here
    
    const healthScore = calculateHealthScore(product);
    
    batch.update(doc.ref, { 
      health_score: healthScore,
      health_score_updated: admin.firestore.FieldValue.serverTimestamp() 
    });

    // Commit in batches of 500
    if (++count % 500 === 0) {
      await batch.commit();
      batch = db.batch(); // Reassign to new batch
    }
  }

  // Commit remaining documents
  if (count % 500 !== 0) {
    await batch.commit();
  }
  console.log(`Updated ${count} products`);
}

updateAllHealthScores()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });