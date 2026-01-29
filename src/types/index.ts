export interface Ingredient {
  id: string
  name: string
  nameZh: string
  category: 'protein' | 'vegetable' | 'grain' | 'dairy' | 'seasoning' | 'other'
}

export type IngredientState = 'plenty' | 'some' | 'low' | 'empty' | 'unknown'

export type ConsumptionLevel = 'low' | 'medium' | 'high'

export interface PantryItem {
  ingredientId: string
  state: IngredientState
  lastUpdatedAt: number
}

export interface Preferences {
  cuisines: ('CN' | 'JP' | 'mixed')[]
  maxTime: 15 | 30 | 60
  dietFlags: string[]
  excludedIngredients: string[]
  notificationsEnabled?: boolean
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
  consumptionProfile?: Record<string, ConsumptionLevel>
}

export interface ShoppingItem {
  id: string
  ingredientId: string
  name: string
  category: string
  checked: boolean
}

// Stage 3: Recipe History
export interface RecipeCompletion {
  id: string
  recipeId: string
  recipeTitle: string
  cookedAt: number
  servings: '1-2' | '3-4'
  ingredientsUsed: string[] // ingredientIds
}

// Stage 3: Tomorrow Suggestions
export interface TomorrowSuggestion {
  id: string
  suggestion: Suggestion
  reason: string
  priority: 'high' | 'medium' | 'low'
  generatedAt: number
}

// Stage 3: Household Sharing
export interface Household {
  id: string
  name: string
  members: HouseholdMember[]
  createdAt: number
}

export interface HouseholdMember {
  id: string
  name: string
  role: 'owner' | 'member'
}
