import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { Chip } from '../../components/Chip'
import { Button } from '../../components/Button'
import { SearchInput } from '../../components/SearchInput'
import { TomorrowSection } from '../../components/TomorrowSection'
import { AlertZone } from '../../components/AlertZone'
import { usePantryStore } from '../../store/pantryStore'
import { getIngredientsByCategory, categoryLabels, searchIngredients, getIngredientById } from '../../data/ingredients'
import type { Ingredient } from '../../types'

const categoryOrder: Ingredient['category'][] = ['protein', 'vegetable', 'grain', 'seasoning', 'dairy', 'other']

const urgencyOrder: Record<string, number> = {
  low: 0,
  empty: 1,
  some: 2,
  plenty: 3,
  unknown: 4,
}

type PantryItem = { ingredientId: string; lastUpdatedAt: number }

function getFridgeStatus(items: PantryItem[], now: number): {
  isStale: boolean
  text: string | null
} {
  if (items.length === 0) return { isStale: false, text: null }
  const latestUpdate = Math.max(...items.map(i => i.lastUpdatedAt))
  const diffDays = Math.floor((now - latestUpdate) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return { isStale: false, text: '今天更新' }
  if (diffDays === 1) return { isStale: false, text: '昨天更新' }
  if (diffDays < 4) return { isStale: false, text: `${diffDays} 天前更新` }
  return { isStale: true, text: `已 ${diffDays} 天未更新` }
}

export function PantryPage() {
  const [search, setSearch] = useState('')
  const [now] = useState(() => Date.now())
  const navigate = useNavigate()
  const { toggle, isSelected, getState, updateState, remove, downgradeState, isUrgent, setUrgent } = usePantryStore()

  const sortByUrgency = (items: Ingredient[]) =>
    [...items].sort((a, b) => {
      const scoreA = isUrgent(a.id) ? -1 : (urgencyOrder[getState(a.id)] ?? 4)
      const scoreB = isUrgent(b.id) ? -1 : (urgencyOrder[getState(b.id)] ?? 4)
      return scoreA - scoreB
    })

  const selectedIngredients = usePantryStore(useShallow(state =>
    state.pantryItems.map(item => item.ingredientId)
  ))
  const pantryItems = usePantryStore(state => state.pantryItems)
  const fridgeStatus = getFridgeStatus(pantryItems, now)

  const grouped = getIngredientsByCategory()
  const searchResults = search ? searchIngredients(search) : null

  const handleSubmit = () => {
    if (selectedIngredients.length > 0) {
      navigate('/suggestions')
    }
  }

  return (
    <div className="pb-32">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold mb-1">
              {fridgeStatus.isStale ? '該更新冰箱了' : '冰箱裡有什麼？'}
            </h1>
            <p className="text-[var(--color-text-secondary)]">
              {fridgeStatus.isStale ? '點選食材更新狀態' : '標記食材狀態，避免浪費'}
            </p>
            {fridgeStatus.text && (
              <p className="text-xs text-[var(--color-text-secondary)] mt-1 font-mono">
                {fridgeStatus.text}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate('/scan')}
              className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              aria-label="掃描冰箱"
            >
              📷
            </button>
            <button
              onClick={() => navigate('/preferences')}
              className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              aria-label="設定"
            >
              ⚙
            </button>
          </div>
        </div>
      </div>

      {/* Alert Zone */}
      <AlertZone />

      {/* Tomorrow Suggestions */}
      <div className="px-4">
        <TomorrowSection />
      </div>

      {/* Search */}
      <div className="px-4 mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="搜尋食材..."
        />
      </div>

      {/* Search Results or Categories */}
      <div className="px-4">
        {searchResults ? (
          <div className="mb-4">
            <h2 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              搜尋結果 ({searchResults.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {sortByUrgency(searchResults).map((ing) => (
                <Chip
                  key={ing.id}
                  label={ing.nameZh}
                  selected={isSelected(ing.id)}
                  onClick={() => toggle(ing.id)}
                  onStateChange={(newState) => updateState(ing.id, newState)}
                  onRemove={() => remove(ing.id)}
                  onDowngrade={() => downgradeState(ing.id)}
                  state={getState(ing.id)}
                  urgent={isUrgent(ing.id)}
                  onUrgentToggle={() => setUrgent(ing.id, !isUrgent(ing.id))}
                />
              ))}
              {searchResults.length === 0 && (
                <p className="text-[var(--color-text-secondary)] text-sm">找不到「{search}」</p>
              )}
            </div>
          </div>
        ) : (
          categoryOrder.map((cat) => {
            const items = grouped[cat]
            if (!items?.length) return null
            return (
              <div key={cat} className="mb-4">
                <h2 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  {categoryLabels[cat]}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {sortByUrgency(items).map((ing) => (
                    <Chip
                      key={ing.id}
                      label={ing.nameZh}
                      selected={isSelected(ing.id)}
                      onClick={() => toggle(ing.id)}
                      onStateChange={(newState) => updateState(ing.id, newState)}
                      onRemove={() => remove(ing.id)}
                      onDowngrade={() => downgradeState(ing.id)}
                      state={getState(ing.id)}
                      urgent={isUrgent(ing.id)}
                      onUrgentToggle={() => setUrgent(ing.id, !isUrgent(ing.id))}
                    />
                  ))}
                </div>
                {sortByUrgency(items).some(ing => isSelected(ing.id) && getState(ing.id) === 'unknown') && (
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    點選已選的食材來設定狀態
                  </p>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-14 left-0 right-0 bg-[var(--color-background)] border-t border-gray-200 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-[var(--color-text-secondary)]">
            已選擇 ({selectedIngredients.length}):
          </span>
          <span className="text-sm truncate max-w-[60%]">
            {selectedIngredients.map(id => getIngredientById(id)?.nameZh).filter(Boolean).join(', ') || '尚未選擇'}
          </span>
        </div>
        <Button
          fullWidth
          size="lg"
          onClick={handleSubmit}
          disabled={selectedIngredients.length === 0}
        >
          找可以做的菜 →
        </Button>
      </div>
    </div>
  )
}
