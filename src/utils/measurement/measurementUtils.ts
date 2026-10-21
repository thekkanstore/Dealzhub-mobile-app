/**
 * Category-Driven Product Measurement and Sizing Utilities for DealzHub Mobile
 */

export const STANDARD_CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size'];
export const STANDARD_FOOTWEAR_SIZES = ['UK 5', 'UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'Euro 38', 'Euro 39', 'Euro 40', 'Euro 41'];

export interface MeasurementUnit {
  value: string;
  label: string;
  type: 'count' | 'weight' | 'volume';
}

export const ALL_MEASUREMENT_UNITS: MeasurementUnit[] = [
  { value: 'pcs', label: 'Pieces (pcs)', type: 'count' },
  { value: 'pair', label: 'Pairs (pair)', type: 'count' },
  { value: 'pack', label: 'Pack', type: 'count' },
  { value: 'kg', label: 'Kilogram (kg)', type: 'weight' },
  { value: 'g', label: 'Gram (g)', type: 'weight' },
  { value: 'ltr', label: 'Liter (ltr)', type: 'volume' },
  { value: 'ml', label: 'Milliliter (ml)', type: 'volume' },
  { value: 'quantity', label: 'Quantity', type: 'count' },
];

export interface CategoryProfile {
  hasMeasurementOptions: boolean;
  type: string;
  supportsSizes: boolean;
  sizeType?: string;
  presetSizes?: string[];
  allowedUnits: string[];
  defaultUnit: string;
  allowFractionalWeight: boolean;
  allowWeightOptions: boolean;
  suggestedWeights?: string[];
}

export const CATEGORY_PROFILES: Record<string, CategoryProfile> = {
  'apparel': {
    hasMeasurementOptions: true,
    type: 'apparel',
    supportsSizes: true,
    sizeType: 'clothing',
    presetSizes: STANDARD_CLOTHING_SIZES,
    allowedUnits: ['pcs', 'pack'],
    defaultUnit: 'pcs',
    allowFractionalWeight: false,
    allowWeightOptions: false,
  },
  'fashion and accessories': {
    hasMeasurementOptions: true,
    type: 'apparel',
    supportsSizes: true,
    sizeType: 'clothing',
    presetSizes: STANDARD_CLOTHING_SIZES,
    allowedUnits: ['pcs', 'pair', 'pack'],
    defaultUnit: 'pcs',
    allowFractionalWeight: false,
    allowWeightOptions: false,
  },
  'grocery': {
    hasMeasurementOptions: true,
    type: 'grocery_weight',
    supportsSizes: false,
    allowedUnits: ['kg', 'g', 'pack', 'pcs'],
    defaultUnit: 'kg',
    allowFractionalWeight: true,
    allowWeightOptions: true,
    suggestedWeights: ['100g', '250g', '500g', '1kg', '2kg', '5kg'],
  },
  'spices': {
    hasMeasurementOptions: true,
    type: 'grocery_weight',
    supportsSizes: false,
    allowedUnits: ['g', 'kg', 'pack', 'pcs'],
    defaultUnit: 'g',
    allowFractionalWeight: true,
    allowWeightOptions: true,
    suggestedWeights: ['50g', '100g', '250g', '500g', '1kg'],
  },
  'meat, fish, egg': {
    hasMeasurementOptions: true,
    type: 'grocery_weight',
    supportsSizes: false,
    allowedUnits: ['kg', 'g', 'pack', 'pcs'],
    defaultUnit: 'kg',
    allowFractionalWeight: true,
    allowWeightOptions: true,
    suggestedWeights: ['250g', '500g', '1kg', '2kg'],
  },
  'food & beverages': {
    hasMeasurementOptions: true,
    type: 'liquid_or_weight',
    supportsSizes: false,
    allowedUnits: ['ltr', 'ml', 'kg', 'g', 'pack', 'pcs'],
    defaultUnit: 'ltr',
    allowFractionalWeight: true,
    allowWeightOptions: true,
    suggestedWeights: ['250ml', '500ml', '1L', '2L', '500g', '1kg'],
  },
  'beauty': {
    hasMeasurementOptions: true,
    type: 'liquid_or_weight',
    supportsSizes: false,
    allowedUnits: ['ml', 'g', 'pcs', 'pack'],
    defaultUnit: 'pcs',
    allowFractionalWeight: true,
    allowWeightOptions: true,
    suggestedWeights: ['30ml', '50ml', '100ml', '200ml', '50g', '100g'],
  },
  'wellness': {
    hasMeasurementOptions: true,
    type: 'liquid_or_weight',
    supportsSizes: false,
    allowedUnits: ['g', 'kg', 'ml', 'ltr', 'pack', 'pcs'],
    defaultUnit: 'g',
    allowFractionalWeight: true,
    allowWeightOptions: true,
    suggestedWeights: ['100g', '250g', '500g', '1kg'],
  },
};

export function getCategoryMeasurementProfile(category: any): CategoryProfile {
  if (!category) {
    return {
      hasMeasurementOptions: false,
      type: 'none',
      supportsSizes: false,
      allowedUnits: ['pcs'],
      defaultUnit: 'pcs',
      allowFractionalWeight: false,
      allowWeightOptions: false,
      presetSizes: [],
    };
  }

  const rawName = (typeof category === 'string' ? category : (category.name || category.key || '')).trim().toLowerCase();

  if (CATEGORY_PROFILES[rawName]) {
    return CATEGORY_PROFILES[rawName];
  }

  if (/shoe|footwear|sneaker|sandal|slipper|boot/.test(rawName)) {
    return {
      hasMeasurementOptions: true,
      type: 'apparel',
      sizeType: 'footwear',
      supportsSizes: true,
      allowedUnits: ['pair', 'pcs', 'pack'],
      defaultUnit: 'pair',
      allowFractionalWeight: false,
      allowWeightOptions: false,
      presetSizes: STANDARD_FOOTWEAR_SIZES,
    };
  }

  if (/clothing|dress|apparel|shirt|pant|tshirt|saree|suit|jeans|cloth/.test(rawName)) {
    return CATEGORY_PROFILES['apparel'];
  }

  if (/liquid|oil|milk|dairy|beverage|juice|drink/.test(rawName)) {
    return CATEGORY_PROFILES['food & beverages'];
  }

  if (/grocery|supermarket|fruit|vegetable|meat|fish|spice|grain|rice|dal|wheat|flour|food|bakery/.test(rawName)) {
    return CATEGORY_PROFILES['grocery'];
  }

  return {
    hasMeasurementOptions: false,
    type: 'standard',
    supportsSizes: false,
    allowedUnits: ['pcs'],
    defaultUnit: 'pcs',
    allowFractionalWeight: false,
    allowWeightOptions: false,
    presetSizes: [],
  };
}

export function normalizeMeasurement(value: number | string, unit: string): number {
  const num = typeof value === 'number' ? value : parseFloat(value) || 0;
  const u = (unit || '').toLowerCase();
  if (u === 'kg' || u === 'ltr') {
    return num * 1000;
  }
  return num;
}

export function calculateScaledPrice(
  basePrice: number | string,
  baseUnit = 'pcs',
  baseUnitValue: number | string = 1,
  targetValue: number | string = 1,
  targetUnit = 'pcs',
): number {
  const price = typeof basePrice === 'number' ? basePrice : parseFloat(basePrice) || 0;
  if (!price) return 0;

  const bUnit = (baseUnit || 'pcs').toLowerCase();
  const tUnit = (targetUnit || bUnit).toLowerCase();

  const isWeight = (bUnit === 'kg' || bUnit === 'g') && (tUnit === 'kg' || tUnit === 'g');
  const isVolume = (bUnit === 'ltr' || bUnit === 'ml') && (tUnit === 'ltr' || tUnit === 'ml');

  if (isWeight || isVolume) {
    const baseNormalized = normalizeMeasurement(baseUnitValue, bUnit);
    const targetNormalized = normalizeMeasurement(targetValue, tUnit);
    if (baseNormalized > 0) {
      const scaled = (targetNormalized / baseNormalized) * price;
      return Math.round(scaled * 100) / 100;
    }
  }

  const mult = typeof targetValue === 'number' ? targetValue : parseFloat(targetValue) || 1;
  return Math.round(price * mult * 100) / 100;
}

export function normalizeUnitAlias(rawUnit?: string, defaultUnit = 'g'): string {
  if (!rawUnit) return defaultUnit;
  const u = rawUnit.toLowerCase().trim();
  if (['g', 'gm', 'gms', 'gram', 'grams'].includes(u)) return 'g';
  if (['kg', 'kgs', 'kilo', 'kilos', 'kilogram', 'kilograms'].includes(u)) return 'kg';
  if (['l', 'ltr', 'ltrs', 'litre', 'litres', 'liter', 'liters'].includes(u)) return 'ltr';
  if (['ml', 'mls', 'milliliter', 'milliliters'].includes(u)) return 'ml';
  if (['pcs', 'pc', 'piece', 'pieces'].includes(u)) return 'pcs';
  if (['pack', 'packs', 'packet', 'packets', 'pkt'].includes(u)) return 'pack';
  return u;
}

export interface WeightOption {
  value: number;
  unit: string;
  label: string;
}

export function parseWeightOption(str: any, defaultUnit = 'g'): WeightOption | null {
  if (!str) return null;
  const cleaned = String(str).trim();

  const fracMatch = cleaned.match(/^(\d+)\/(\d+)\s*([a-zA-Z]+)?$/);
  if (fracMatch) {
    const num = parseFloat(fracMatch[1]);
    const den = parseFloat(fracMatch[2]);
    const value = den > 0 ? num / den : 1;
    const unit = normalizeUnitAlias(fracMatch[3] || defaultUnit, defaultUnit);
    return {
      value,
      unit,
      label: `${value}${unit}`,
    };
  }

  const match = cleaned.match(/^([\d.]+)\s*([a-zA-Z]+)?$/);
  if (match) {
    const value = parseFloat(match[1]);
    const rawUnit = match[2];
    let unit: string;
    if (rawUnit) {
      unit = normalizeUnitAlias(rawUnit, defaultUnit);
    } else {
      const d = normalizeUnitAlias(defaultUnit, 'g');
      if (['kg', 'g'].includes(d)) {
        unit = value >= 50 ? 'g' : 'kg';
      } else if (['ltr', 'ml'].includes(d)) {
        unit = value >= 50 ? 'ml' : 'ltr';
      } else {
        unit = d;
      }
    }
    return {
      value,
      unit,
      label: `${value}${unit}`,
    };
  }

  return {
    value: 1,
    unit: normalizeUnitAlias(defaultUnit, 'pcs'),
    label: cleaned,
  };
}

export function getProductWeightOptions(product: any): WeightOption[] {
  if (!product) return [];

  if (product.weightOptions && Array.isArray(product.weightOptions) && product.weightOptions.length > 0) {
    return product.weightOptions
      .map((opt: any) => parseWeightOption(opt, product.unit || 'g'))
      .filter((opt: any): opt is WeightOption => Boolean(opt));
  }

  const isWeightOrVolume = ['kg', 'g', 'ltr', 'ml'].includes((product.unit || '').toLowerCase());
  if (isWeightOrVolume && product.unitValue) {
    const val = parseFloat(product.unitValue) || 1;
    return [
      {
        value: val,
        unit: product.unit,
        label: `${val}${product.unit}`,
      },
    ];
  }

  return [];
}
