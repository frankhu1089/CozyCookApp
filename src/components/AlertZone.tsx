import { useNavigate } from 'react-router-dom'
import { usePantryStore } from '../store/pantryStore'
import { getIngredientById } from '../data/ingredients'

export function AlertZone() {
  const navigate = useNavigate()
  const pantryItems = usePantryStore(state => state.pantryItems)

  const atRisk = pantryItems.filter(
    item => item.state === 'low' || item.state === 'empty'
  )

  if (atRisk.length === 0) return null

  const names = atRisk
    .map(item => getIngredientById(item.ingredientId)?.nameZh)
    .filter(Boolean)
    .join('、')

  return (
    <div className="mx-4 mb-4 p-3 border border-orange-200 bg-orange-50">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            ⚠ 快用完了
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] truncate mt-0.5">
            {names}
          </p>
        </div>
        <button
          onClick={() => navigate('/suggestions')}
          className="shrink-0 text-sm font-medium text-[var(--color-primary)] whitespace-nowrap"
        >
          找菜色 →
        </button>
      </div>
    </div>
  )
}
