export interface ProductNutrients {
  energy_kcal: number;
  protein_g: number;
  carbs_g: number;
  sugars_g: number;
  fat_g: number;
  saturated_fat_g: number;
  sodium_mg: number;
  fiber_g?: number;
  calcium_mg?: number;
}

export interface Product {
  nutrients: ProductNutrients;
  ingredients: string[];
  allergens: string[];
}

/**
* Calculates a health score based on nutritional values and ingredients
* @param product - The product to analyze
* @returns Letter grade from A (healthiest) to E (least healthy)
*/
export const calculateHealthScore = (product: Product): string => {
  let negativePoints = 0;

  // Energy (1.5 points per 100kcal over 400)
  negativePoints += Math.max(0, Math.floor((product.nutrients.energy_kcal - 400) / 100) * 1.5);

  // Sugars (2 points per 5g over 20g)
  negativePoints += Math.max(0, Math.floor((product.nutrients.sugars_g - 20) / 5) * 2);

  // Saturated Fat (2 points per 2g over 5g)
  negativePoints += Math.max(0, Math.floor((product.nutrients.saturated_fat_g - 5) / 2) * 2);

  // Sodium (1.5 points per 100mg over 600mg)
  negativePoints += Math.max(0, Math.floor((product.nutrients.sodium_mg - 600) / 100)) * 1.5;

  let positivePoints = 0;

  // Protein (2 points per 5g, max 10 points)
  positivePoints += Math.min(Math.floor(product.nutrients.protein_g / 5) * 2, 10);

  // Fiber (3 points per 2g, max 9 points)
  if (product.nutrients.fiber_g) {
      positivePoints += Math.min(Math.floor(product.nutrients.fiber_g / 2) * 3, 9);
  }

  // Ingredient Analysis
  const naturalKeywords = ['natural', 'organic', 'whole', 'unprocessed'];
  const artificialKeywords = ['artificial', 'flavorings', 'emulsifier', 'preservative'];

  const naturalCount = product.ingredients.filter(ing =>
      naturalKeywords.some(keyword => ing.toLowerCase().includes(keyword))
  ).length;

  const artificialCount = product.ingredients.filter(ing =>
      artificialKeywords.some(keyword => ing.toLowerCase().includes(keyword))
  ).length;

  positivePoints += naturalCount * 3;
  negativePoints += artificialCount * 5;

  const totalScore = positivePoints - negativePoints;

  if (totalScore >= 10) return 'A';
  if (totalScore >= 0) return 'B';
  if (totalScore >= -8) return 'C';
  if (totalScore >= -15) return 'D';
  return 'E';
};

/**
* Returns the raw numeric health score
* @param product - The product to analyze
* @returns Numeric score (positive = healthy, negative = unhealthy)
*/
export const calculateNumericHealthScore = (product: Product): number => {
  let negativePoints = 0;
  negativePoints += Math.max(0, Math.floor((product.nutrients.energy_kcal - 400) / 100));
  negativePoints += Math.max(0, Math.floor((product.nutrients.sugars_g - 20) / 5));
  negativePoints += Math.max(0, Math.floor((product.nutrients.saturated_fat_g - 5) / 2));
  negativePoints += Math.max(0, Math.floor((product.nutrients.sodium_mg - 600) / 100));

  let positivePoints = 0;
  positivePoints += Math.min(Math.floor(product.nutrients.protein_g / 5), 5);
  if (product.nutrients.fiber_g) {
      positivePoints += Math.min(Math.floor(product.nutrients.fiber_g / 2), 5);
  }
  if (product.nutrients.calcium_mg) {
      positivePoints += Math.max(0, Math.floor((product.nutrients.calcium_mg - 100) / 50));
  }

  const additiveKeywords = ['emulsifier', 'flavor', 'preservative', 'color', 'stabilizer'];
  const additives = product.ingredients.filter(ingredient =>
      additiveKeywords.some(keyword => ingredient.toLowerCase().includes(keyword))
  );
  const deductions = additives.length + product.allergens.length;

  return positivePoints - (negativePoints + deductions);
};

/**
* Returns the color code for a given health score grade
* @param grade - The health score grade (A to E)
* @returns Hex color code
*/
export const getHealthScoreColor = (grade: string): string => {
  switch (grade) {
      case 'A': return '#27AE60'; 
      case 'B': return '#2D9CDB'; 
      case 'C': return '#F2C94C'; 
      case 'D': return '#F56918'; 
      case 'E': return '#E55050'; 
      default: return '#2D3436'; 
  }
};