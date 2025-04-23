const admin = require('firebase-admin');
const products = require('../data/products.json');
const { generateProductDescription } = require('../utils/descriptionGenerator');

const serviceAccount = require('../service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function deleteAllProducts() {
  const productsRef = db.collection('products');
  const snapshot = await productsRef.get();
  const batch = db.batch();
  
  snapshot.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
  console.log('Successfully deleted all existing products');
}

async function uploadNewProducts() {
  const batch = db.batch();
  const collection = db.collection('products');

  products.forEach(product => {
    product.description = generateProductDescription(product);
    
    const docRef = collection.doc(product.barcode);
    batch.set(docRef, product);
  });

  await batch.commit();
  console.log('Successfully uploaded new products');
}

async function main() {
  try {
    console.log('Starting product data refresh...');
    
    // Step 1: Delete existing products
    await deleteAllProducts();
    
    // Step 2: Upload new products
    await uploadNewProducts();
    
    console.log('All operations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during data refresh:', error);
    process.exit(1);
  }
}

main();