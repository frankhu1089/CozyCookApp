export interface Ingredient {
  id: string
  name: string
  nameZh: string
  category: 'protein' | 'vegetable' | 'grain' | 'dairy' | 'seasoning' | 'other'
}

export interface PantryItem {
  ingredientId: string
  quantity?: number
  unit?: string
}

export interface Preferences {
  cuisines: ('CN' | 'JP' | 'mixed')[]
  maxTime: 15 | 30 | 60
  dietFlags: string[]
  excludedIngredients: string[]
}

export interface Suggestion {
  id: string
  title: string
  cuisine: string
  timeMinutes: number
  difficulty: 'easy' | 'medium' | 'hard'
  matchedIngredients: string[]
  missingIngredients: string[]
  steps: string[]
  status: 'doable' | 'near-miss'
}

export interface ShoppingItem {
  id: string
  ingredientId: string
  name: string
  category: string
  checked: boolean
}
