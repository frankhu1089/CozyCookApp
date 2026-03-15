import { useState, useMemo } from 'react'
import { Button } from './Button'
import { ingredients } from '../data/ingredients'
import { getConsumptionLevel } from '../data/consumptionDefaults'
import { inferNewState, type ServingSize } from '../services/stateInference'
import type { Suggestion, PantryItem, IngredientState } from '../types'

export interface StateChange {
  ingredientId: string
  ingredientName: string
  fromState: IngredientState
  toState: IngredientState
}

interface PostCookSheetProps {
  recipe: Suggestion
  pantryItems: PantryItem[]
  onConfirm: (servings: ServingSize, changes: StateChange[]) => void
  onSkip: () => void
}

const stateLabels: Record<IngredientState, string> = {
  plenty: '充足',
  some: '還有',
  low: '快沒了',
  empty: '用完了',
  unknown: '不確定',
}

export function PostCookSheet({ recipe, pantryItems, onConfirm, onSkip }: PostCookSheetProps) {
  const [servings, setServings] = useState<ServingSize>('1-2')

  const changes = useMemo<StateChange[]>(() => {
    const result: StateChange[] = []
    for (const ingredientName of recipe.matchedIngredients) {
      const ingredient = ingredients.find(i => i.nameZh === ingredientName)
      if (!ingredient) continue
      const pantryItem = pantryItems.find(p => p.ingredientId === ingredient.id)
      if (!pantryItem) continue
      const consumption = getConsumptionLevel(ingredient.id, ingredient.category, recipe.consumptionProfile)
      const newState = inferNewState(pantryItem.state, consumption, servings)
      if (newState !== pantryItem.state) {
        result.push({
          ingredientId: ingredient.id,
          ingredientName: ingredient.nameZh,
          fromState: pantryItem.state,
          toState: newState,
        })
      }
    }
    return result
  }, [recipe, pantryItems, servings])

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-end" onClick={onSkip}>
      <div
        className="bg-[var(--color-surface)] w-full p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        <h3 className="text-lg font-semibold mb-4">✅ 煮完了？更新冰箱</h3>

        {/* Serving size toggle */}
        <div className="flex gap-2 mb-4">
          {(['1-2', '3-4'] as ServingSize[]).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setServings(s)}
              className={`flex-1 py-2 text-sm font-medium border ${
                servings === s
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : 'text-[var(--color-text-primary)] border-gray-200'
              }`}
            >
              {s === '1-2' ? '1–2 人份' : '3–4 人份'}
            </button>
          ))}
        </div>

        {/* State changes preview */}
        {changes.length > 0 ? (
          <div className="mb-4 space-y-2 max-h-[180px] overflow-y-auto">
            {changes.map(change => (
              <div
                key={change.ingredientId}
                className="flex items-center justify-between px-3 py-2 bg-[var(--color-background)]"
              >
                <span className="text-sm font-medium">{change.ingredientName}</span>
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {stateLabels[change.fromState]} → {stateLabels[change.toState]}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">食材狀態不變</p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onSkip}>
            跳過
          </Button>
          <Button fullWidth onClick={() => onConfirm(servings, changes)}>
            確認更新
          </Button>
        </div>
      </div>
    </div>
  )
}
