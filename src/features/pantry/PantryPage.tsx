import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { Chip } from '../../components/Chip'
import { Button } from '../../components/Button'
import { SearchInput } from '../../components/SearchInput'
import { TomorrowSection } from '../../components/TomorrowSection'
import { usePantryStore } from '../../store/pantryStore'
import { getIngredientsByCategory, categoryLabels, searchIngredients, getIngredientById } from '../../data/ingredients'
import type { Ingredient } from '../../types'

const categoryOrder: Ingredient['category'][] = ['protein', 'vegetable', 'grain', 'seasoning', 'dairy', 'other']

export function PantryPage() {
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const { toggle, isSelected, getState } = usePantryStore()
  const selectedIngredients = usePantryStore(useShallow(state =>
    state.pantryItems.map(item => item.ingredientId)
  ))

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
            <h1 className="text-2xl font-semibold mb-1">冰箱裡有什麼？</h1>
            <p className="text-[var(--color-text-secondary)]">標記食材狀態，避免浪費</p>
          </div>
          <button
            onClick={() => navigate('/preferences')}
            className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            aria-label="設定"
          >
            ⚙
          </button>
        </div>
      </div>

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
              {searchResults.map((ing) => (
                <Chip
                  key={ing.id}
                  label={ing.nameZh}
                  selected={isSelected(ing.id)}
                  onClick={() => toggle(ing.id)}
                  state={getState(ing.id)}
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
                  {items.map((ing) => (
                    <Chip
                      key={ing.id}
                      label={ing.nameZh}
                      selected={isSelected(ing.id)}
                      onClick={() => toggle(ing.id)}
                      state={getState(ing.id)}
                    />
                  ))}
                </div>
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
