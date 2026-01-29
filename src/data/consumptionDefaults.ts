import type { ConsumptionLevel, Ingredient } from '../types'

// Default consumption levels by ingredient category
export const CONSUMPTION_BY_CATEGORY: Record<Ingredient['category'], ConsumptionLevel> = {
  protein: 'high',
  vegetable: 'medium',
  grain: 'medium',
  dairy: 'medium',
  seasoning: 'low',
  other: 'medium',
}

// Override for specific ingredients (optional fine-tuning)
export const CONSUMPTION_OVERRIDES: Record<string, ConsumptionLevel> = {
  // Proteins that are used in smaller amounts
  'egg': 'medium',
  'bacon': 'medium',

  // Vegetables used as aromatics (less consumption)
  'garlic': 'low',
  'ginger': 'low',
  'green-onion': 'low',
  'chili': 'low',
}

export function getConsumptionLevel(
  ingredientId: string,
  category: Ingredient['category'],
  recipeProfile?: Record<string, ConsumptionLevel>
): ConsumptionLevel {
  // Recipe-specific profile takes priority
  if (recipeProfile?.[ingredientId]) {
    return recipeProfile[ingredientId]
  }

  // Then check overrides
  if (CONSUMPTION_OVERRIDES[ingredientId]) {
    return CONSUMPTION_OVERRIDES[ingredientId]
  }

  // Fall back to category default
  return CONSUMPTION_BY_CATEGORY[category]
}
