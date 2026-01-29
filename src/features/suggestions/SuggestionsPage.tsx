import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { CardSkeleton } from '../../components/Skeleton'
import { ServingPrompt } from '../../components/ServingPrompt'
import { usePantryStore } from '../../store/pantryStore'
import { usePreferencesStore } from '../../store/preferencesStore'
import { useSuggestionsStore } from '../../store/suggestionsStore'
import { useShoppingStore } from '../../store/shoppingStore'
import { getIngredientById, ingredients } from '../../data/ingredients'
import { getConsumptionLevel } from '../../data/consumptionDefaults'
import { fetchSuggestions } from '../../services/suggestions'
import { inferNewState, type ServingSize } from '../../services/stateInference'
import type { Suggestion } from '../../types'

export function SuggestionsPage() {
  const navigate = useNavigate()
  const { pantryItems, updateState } = usePantryStore()
  const selectedIngredients = usePantryStore(useShallow(state =>
    state.pantryItems.map(item => item.ingredientId)
  ))
  const preferences = usePreferencesStore()
  const { suggestions, loading, error, setSuggestions, setLoading, setError } = useSuggestionsStore()
  const { addItems } = useShoppingStore()
  const [selectedRecipe, setSelectedRecipe] = useState<Suggestion | null>(null)
  const [showServingPrompt, setShowServingPrompt] = useState(false)
  const [completingRecipe, setCompletingRecipe] = useState<Suggestion | null>(null)

  const selectedNames = selectedIngredients
    .map(id => getIngredientById(id)?.nameZh)
    .filter(Boolean)
    .join(', ')

  useEffect(() => {
    if (selectedIngredients.length === 0) return

    const loadSuggestions = async () => {
      setLoading(true)
      setError(null)

      try {
        const ingredientNames = selectedIngredients
          .map(id => getIngredientById(id)?.nameZh)
          .filter((n): n is string => !!n)

        const results = await fetchSuggestions({
          ingredients: ingredientNames,
          preferences: {
            cuisine: preferences.cuisines[0] || 'mixed',
            maxTime: preferences.maxTime,
            dietFlags: preferences.dietFlags,
          },
        })
        setSuggestions(results)
      } catch (err) {
        console.error(err)
        setError('抱歉，想不出來... 再試一次？')
      } finally {
        setLoading(false)
      }
    }

    loadSuggestions()
  }, [selectedIngredients, preferences.cuisines, preferences.maxTime, preferences.dietFlags])

  const doable = suggestions.filter(s => s.status === 'doable')
  const nearMiss = suggestions.filter(s => s.status === 'near-miss')

  const handleAddToShopping = (suggestion: Suggestion) => {
    const items = suggestion.missingIngredients.map(name => ({
      ingredientId: name,
      name,
      category: '其他',
    }))
    addItems(items)
  }

  const handleMarkComplete = (recipe: Suggestion) => {
    setCompletingRecipe(recipe)
    setShowServingPrompt(true)
  }

  const handleServingConfirm = (servings: ServingSize) => {
    if (!completingRecipe) return

    // Update state for each matched ingredient in the pantry
    for (const ingredientName of completingRecipe.matchedIngredients) {
      // Find ingredient by Chinese name
      const ingredient = ingredients.find(i => i.nameZh === ingredientName)
      if (!ingredient) continue

      // Check if it's in our pantry
      const pantryItem = pantryItems.find(p => p.ingredientId === ingredient.id)
      if (!pantryItem) continue

      const currentState = pantryItem.state
      const consumption = getConsumptionLevel(
        ingredient.id,
        ingredient.category,
        completingRecipe.consumptionProfile
      )
      const newState = inferNewState(currentState, consumption, servings)

      updateState(ingredient.id, newState)
    }

    // Clean up
    setShowServingPrompt(false)
    setCompletingRecipe(null)
    setSelectedRecipe(null)
  }

  const handleServingSkip = () => {
    setShowServingPrompt(false)
    setCompletingRecipe(null)
    setSelectedRecipe(null)
  }

  if (selectedIngredients.length === 0) {
    return (
      <div className="px-4 pt-6 pb-20 flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-6xl mb-4">🥬</p>
        <p className="text-[var(--color-text-secondary)] text-center mb-4">
          先選一些食材吧！
        </p>
        <Button onClick={() => navigate('/')}>
          去選食材
        </Button>
      </div>
    )
  }

  return (
    <div className="px-4 pt-6 pb-20">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-semibold mb-1">根據你的食材...</h1>
        <p className="text-sm text-[var(--color-text-secondary)] truncate">
          ← {selectedNames}
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          <p className="text-center text-[var(--color-text-secondary)] py-4">
            🤔 正在思考你的晚餐...
          </p>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-8">
          <p className="text-[var(--color-error)] mb-4">{error}</p>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            再試一次
          </Button>
        </div>
      )}

      {/* Results */}
      {!loading && !error && (
        <>
          {/* Doable */}
          {doable.length > 0 && (
            <section className="mb-6">
              <h2 className="text-sm font-medium text-[var(--color-success)] mb-3 flex items-center gap-1">
                ✅ 立即可做 ({doable.length})
              </h2>
              <div className="space-y-3">
                {doable.map((s) => (
                  <SuggestionCard
                    key={s.id}
                    suggestion={s}
                    onSelect={() => setSelectedRecipe(s)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Near-miss */}
          {nearMiss.length > 0 && (
            <section className="mb-6">
              <h2 className="text-sm font-medium text-[var(--color-warning)] mb-3 flex items-center gap-1">
                🛒 只差一點 ({nearMiss.length})
              </h2>
              <div className="space-y-3">
                {nearMiss.map((s) => (
                  <SuggestionCard
                    key={s.id}
                    suggestion={s}
                    onSelect={() => setSelectedRecipe(s)}
                    onAddToShopping={() => handleAddToShopping(s)}
                  />
                ))}
              </div>
            </section>
          )}

          {doable.length === 0 && nearMiss.length === 0 && (
            <div className="text-center py-8">
              <p className="text-4xl mb-4">🤷</p>
              <p className="text-[var(--color-text-secondary)]">
                這些食材搭配有點難... 試試加點蛋白質？
              </p>
            </div>
          )}
        </>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <RecipeModal
          suggestion={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onAddToShopping={() => handleAddToShopping(selectedRecipe)}
          onMarkComplete={() => handleMarkComplete(selectedRecipe)}
        />
      )}

      {/* Serving Size Prompt */}
      {showServingPrompt && (
        <ServingPrompt
          onConfirm={handleServingConfirm}
          onSkip={handleServingSkip}
        />
      )}
    </div>
  )
}

function SuggestionCard({
  suggestion,
  onSelect,
  onAddToShopping,
}: {
  suggestion: Suggestion
  onSelect: () => void
  onAddToShopping?: () => void
}) {
  return (
    <Card className="relative">
      <div onClick={onSelect}>
        <h3 className="font-semibold mb-1">{suggestion.title}</h3>
        <p className="text-sm text-[var(--color-text-secondary)] mb-2">
          {suggestion.cuisine} • {suggestion.timeMinutes}分鐘 • {
            suggestion.difficulty === 'easy' ? '簡單' :
            suggestion.difficulty === 'medium' ? '中等' : '困難'
          }
        </p>
        <div className="flex flex-wrap gap-1 mb-2">
          {suggestion.matchedIngredients.slice(0, 4).map((ing) => (
            <span key={ing} className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
              ✓{ing}
            </span>
          ))}
          {suggestion.missingIngredients.slice(0, 2).map((ing) => (
            <span key={ing} className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">
              ✗{ing}
            </span>
          ))}
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        {onAddToShopping && suggestion.missingIngredients.length > 0 && (
          <Button size="sm" variant="secondary" onClick={onAddToShopping}>
            加入清單
          </Button>
        )}
        <Button size="sm" onClick={onSelect}>
          做這道 →
        </Button>
      </div>
    </Card>
  )
}

function RecipeModal({
  suggestion,
  onClose,
  onAddToShopping,
  onMarkComplete,
}: {
  suggestion: Suggestion
  onClose: () => void
  onAddToShopping: () => void
  onMarkComplete: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={onClose}>
      <div
        className="bg-[var(--color-surface)] w-full rounded-t-2xl p-4 pb-8 max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        <h2 className="text-xl font-semibold mb-1">{suggestion.title}</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          {suggestion.cuisine} • {suggestion.timeMinutes}分鐘 • 2人份
        </p>

        {/* Ingredients */}
        <section className="mb-4">
          <h3 className="font-medium mb-2">📝 材料</h3>
          <ul className="text-sm space-y-1">
            {suggestion.matchedIngredients.map((ing) => (
              <li key={ing} className="flex items-center gap-2">
                <span className="text-[var(--color-success)]">✓</span> {ing}
              </li>
            ))}
            {suggestion.missingIngredients.map((ing) => (
              <li key={ing} className="flex items-center gap-2 text-[var(--color-error)]">
                <span>✗</span> {ing}
              </li>
            ))}
          </ul>
        </section>

        {/* Steps */}
        <section className="mb-6">
          <h3 className="font-medium mb-2">🍳 做法（簡要）</h3>
          <ol className="text-sm space-y-2">
            {suggestion.steps.map((step, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-[var(--color-text-secondary)]">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <div className="space-y-3">
          <Button fullWidth onClick={onMarkComplete}>
            ✅ 完成這道菜
          </Button>
          {suggestion.missingIngredients.length > 0 && (
            <Button fullWidth variant="secondary" onClick={onAddToShopping}>
              🛒 加入缺的到清單
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
