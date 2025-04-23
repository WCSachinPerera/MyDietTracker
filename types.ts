export interface Product {
    barcode: string;
    name: string;
    description?: string;
    brand?: string;
    is_organic?: boolean;
    certifications?: string[];
    artificial_additives?: string[];
    weight_g?: number;
    nova_group?: number;
    nova_description?: string;
    ingredients: string[];
    nutrients: {
      energy_kcal: number;
      protein_g: number;
      carbs_g: number;
      sugars_g: number;
      fat_g: number;
      saturated_fat_g: number;
      sodium_mg: number;
      fiber_g?: number;
      calcium_mg?: number;
    };
    allergens: string[];
    categories?: string[];
    image_url?: string;
    health_score?: string; // Added by update script
  }