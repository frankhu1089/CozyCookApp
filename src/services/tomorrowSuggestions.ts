import type { PantryItem, TomorrowSuggestion, RecipeCompletion, Preferences } from '../types'
import { getIngredientById } from '../data/ingredients'
import { fetchSuggestions } from './suggestions'

interface TomorrowRequest {
  pantryItems: PantryItem[]
  recentCompletions: RecipeCompletion[]
  preferences: Preferences
}

export async function generateTomorrowSuggestions(
  request: TomorrowRequest
): Promise<TomorrowSuggestion[]> {
  const { pantryItems, recentCompletions, preferences } = request

  // Get ingredient names, excluding empty ones (but marking them)
  const lowIngredients: string[] = []
  const emptyIngredients: string[] = []
  const availableIngredients: string[] = []

  for (const item of pantryItems) {
    const ingredient = getIngredientById(item.ingredientId)
    if (!ingredient) continue

    if (item.state === 'empty') {
      emptyIngredients.push(ingredient.nameZh)
    } else {
      availableIngredients.push(ingredient.nameZh)
      if (item.state === 'low') {
        lowIngredients.push(ingredient.nameZh)
      }
    }
  }

  const urgentIngredients: string[] = pantryItems
    .filter(item => item.urgent)
    .map(item => getIngredientById(item.ingredientId)?.nameZh)
    .filter((n): n is string => !!n)

  if (availableIngredients.length === 0) {
    return []
  }

  // Fetch base suggestions
  const suggestions = await fetchSuggestions({
    ingredients: availableIngredients,
    preferences: {
      cuisine: preferences.cuisines[0] || 'mixed',
      maxTime: preferences.maxTime,
      dietFlags: preferences.dietFlags,
    },
  })

  // Score and rank suggestions for tomorrow
  const scored = suggestions.map((suggestion) => {
    let score = 0
    let reason = ''
    let priority: TomorrowSuggestion['priority'] = 'low'

    // Priority 0: urgent (expiring soon) — highest priority
    const usesUrgent = suggestion.matchedIngredients.filter((ing) =>
      urgentIngredients.includes(ing)
    )
    if (usesUrgent.length > 0) {
      score += 150 * usesUrgent.length
      reason = `⚡ ${usesUrgent[0]}快過期了`
      priority = 'high'
    }

    // Priority 1: Uses low-state ingredients
    const usesLow = suggestion.matchedIngredients.filter((ing) =>
      lowIngredients.includes(ing)
    )
    if (usesLow.length > 0) {
      score += 100 * usesLow.length
      reason = `${usesLow[0]}可能快用完`
      priority = 'high'
    }

    // Priority 2: Recently cooked successfully
    const recentlyCooked = recentCompletions.find(
      (c) => c.recipeTitle === suggestion.title
    )
    if (recentlyCooked && !reason) {
      score += 50
      reason = '最近煮過，輕車熟路'
      priority = 'medium'
    }

    // Priority 3: Quick recipes (≤30 min)
    if (suggestion.timeMinutes <= 30) {
      score += 20
      if (!reason) {
        reason = `${suggestion.timeMinutes}分鐘快速完成`
        priority = 'medium'
      }
    }

    // Penalty: Needs empty ingredients
    const needsEmpty = suggestion.missingIngredients.some((ing) =>
      emptyIngredients.includes(ing)
    )
    if (needsEmpty) {
      score -= 200
      if (suggestion.status === 'near-miss') {
        reason = '需補貨：' + suggestion.missingIngredients.join('、')
      }
    }

    // Default reason if none set
    if (!reason) {
      reason = suggestion.status === 'doable' ? '食材齊全' : '只差一點材料'
    }

    return {
      suggestion,
      score,
      reason,
      priority,
    }
  })

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score)

  // Take top 3, but only doable or near-miss with positive score
  const top = scored
    .filter((s) => s.score > -100) // Exclude heavily penalized
    .slice(0, 3)

  return top.map((item) => ({
    id: crypto.randomUUID(),
    suggestion: item.suggestion,
    reason: item.reason,
    priority: item.priority,
    generatedAt: Date.now(),
  }))
}
