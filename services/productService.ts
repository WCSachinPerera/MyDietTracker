import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { app } from '../firebaseConfig';
import type { Product } from '../types';

const db = getFirestore(app);
const storage = getStorage(app);

// Define the ranking order (Best to Worst)
const HEALTH_RANK = ['A', 'B', 'C', 'D', 'E']; 

export const getAlternatives = async (scannedProduct: Product) => {
  try {
    const currentScore = scannedProduct.health_score || 'E';
    const currentRank = HEALTH_RANK.indexOf(currentScore);

    if (currentRank === -1) return [];

    // Fetch all products in the same category
    const productsRef = collection(db, 'products');
    const q = query(
      productsRef,
      where('categories', 'array-contains-any', scannedProduct.categories || [])
    );

    const snapshot = await getDocs(q);

    let alternatives = await Promise.all(
      snapshot.docs
        .filter(doc => doc.id !== scannedProduct.barcode) // Exclude scanned product
        .map(async (doc) => {
          const data = doc.data();
          let image_url = data.image_url;

          if (image_url) {
            try {
              const storageRef = ref(storage, image_url);
              image_url = await getDownloadURL(storageRef);
            } catch (error) {
              console.warn('Image load error:', error);
              image_url = undefined;
            }
          }

          return {
            ...data,
            barcode: doc.id,
            image_url,
            name: data.name,
            ingredients: data.ingredients,
            nutrients: data.nutrients,
            allergens: data.allergens,
            health_score: data.health_score,
            categories: data.categories
          } as Product;
        })
    );

    // better scores & same score
    let betterAlternatives = alternatives.filter(p => HEALTH_RANK.indexOf(p.health_score!) < currentRank);
    let sameScoreAlternatives = alternatives.filter(p => p.health_score === currentScore);

    // Sort: Better scores first
    betterAlternatives.sort((a, b) => HEALTH_RANK.indexOf(a.health_score!) - HEALTH_RANK.indexOf(b.health_score!));
    sameScoreAlternatives.sort((a, b) => a.name.localeCompare(b.name));
    let finalAlternatives = [...betterAlternatives, ...sameScoreAlternatives].slice(0, 3);

    return finalAlternatives;
  } catch (error) {
    console.error('Alternative fetch error:', error);
    return [];
  }
};