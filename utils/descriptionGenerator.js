function generateProductDescription(product) {
    const parts = [];
    
    // 1. Base processing info
    parts.push(`${product.nova_description} product.`);
  
    // 2. Cocoa butter analysis
    const cocoaButterKeywords = ['cocoa butter', 'cocoa mass', 'cocoa liquor'];
    const alternativeFatKeywords = [
      'vegetable fat', 'palm oil', 'cocoa butter substitute',
      'cocoa derivatives', 'compound chocolate', 'cocoa-flavored',
      'vegetable fats', 'cocoa alternatives', 'cocoa substitute', 'Cocoa-flavored compounds'
    ];
    
    // Detect real cocoa
    const hasRealCocoa = product.ingredients.some(ingredient => 
      cocoaButterKeywords.some(keyword => 
        ingredient.toLowerCase().includes(keyword.toLowerCase()))
    );
  
    // Detect fat alternatives
    const fatAlternatives = product.ingredients
      .filter(ingredient => 
        alternativeFatKeywords.some(keyword => 
          ingredient.toLowerCase().includes(keyword.toLowerCase()))
      )
      .map(item => 
        item.replace(/\(.*?\)/g, '') // Remove parentheses
           .replace(/,?\s?etc\.?/gi, '') // Remove "etc"
           .trim()
      )
      .filter((value, index, self) => self.indexOf(value) === index); // Unique values
  
    if(hasRealCocoa) {
      parts.push(`Contains genuine cocoa ingredients.`);
    }
    if(fatAlternatives.length > 0) {
      parts.push(`Uses cocoa alternatives: ${fatAlternatives.join(', ').toLowerCase()}.`);
    }
  
    // 3. Sweetener analysis
    const sugarAlternatives = [
      'maltitol', 'isomalt', 'sucralose', 'polyols', 'stevia',
      'aspartame', 'saccharin', 'xylitol', 'erythritol', 'sorbitol'
    ];
    
    const sweetenerItems = product.ingredients
      .filter(ingredient =>
        sugarAlternatives.some(keyword => 
          ingredient.toLowerCase().includes(keyword.toLowerCase()))
      )
      .map(item => item.split('(')[0].trim()) // Keep only main ingredient name
      .filter((value, index, self) => self.indexOf(value) === index);
  
    if(sweetenerItems.length > 0) {
      parts.push(`Sweetened with: ${sweetenerItems.join(', ')}.`);
    }
  
    // 4. Organic status
    if (product.is_organic) {
      parts.push(`Certified organic ingredients.`);
    }
  
    // 5. Natural ingredients detection
    const naturalKeywords = ['natural', 'organic', 'whole', 'pure', 'unprocessed'];
    const naturalIngredients = product.ingredients.filter(ingredient =>
      naturalKeywords.some(keyword => 
        ingredient.toLowerCase().includes(keyword))
    );
  
    if (naturalIngredients.length > 0) {
      const uniqueNatural = [...new Set(naturalIngredients)]; // Remove duplicates
      parts.push(`Contains natural components: ${uniqueNatural.join(', ').toLowerCase()}.`);
    }
  
    // 6. Artificial additives
    if (product.artificial_additives.length > 0) {
      const additives = product.artificial_additives
        .map(item => item.replace(/_/g, ' ')) // Convert underscores to spaces
        .join(', ');
      parts.push(`Contains artificial additives: ${additives}.`);
    }
  
    // 7. Certifications
    if (product.certifications.length > 0) {
      parts.push(`Certifications: ${product.certifications.join(', ')}.`);
    }
  
    // 8. Allergen warning
    if (product.allergens.length > 0) {
      parts.push(`Allergens present: ${product.allergens.join(', ')}.`);
    }
  
    // 9. Nutritional highlights
    const nutrients = product.nutrients;
    const highlights = [];
    
    if (nutrients.sugars_g > 30) {
      highlights.push(`high sugar content (${nutrients.sugars_g}g)`);
    } else if (nutrients.sugars_g < 5) {
      highlights.push(`low sugar (${nutrients.sugars_g}g)`);
    }
  
    if (nutrients.fiber_g >= 5) {
      highlights.push(`high fiber (${nutrients.fiber_g}g)`);
    }
  
    if (nutrients.saturated_fat_g > 15) {
      highlights.push(`high saturated fat (${nutrients.saturated_fat_g}g)`);
    }
  
    if (highlights.length > 0) {
      parts.push(`Nutritional notes: ${highlights.join(', ')}.`);
    }
  
    // Final cleanup and return
    return parts.join(' ')
      .replace(/\s+/g, ' ') // Remove extra spaces
      .replace(/ ,/g, ',') // Fix space-before-comma
      .trim();
  }
  
  module.exports = { generateProductDescription };