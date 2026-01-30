import { useShoppingStore } from '../../store/shoppingStore'
import { usePantryStore } from '../../store/pantryStore'
import { Button } from '../../components/Button'

export function ShoppingPage() {
  const { items, toggleItem, removeItem, clearChecked, clearAll } = useShoppingStore()
  const restockFromShopping = usePantryStore((state) => state.restockFromShopping)

  const groupedItems = items.reduce((acc, item) => {
    const cat = item.category || '其他'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {} as Record<string, typeof items>)

  const handleCopy = () => {
    const text = items
      .filter(i => !i.checked)
      .map(i => `☐ ${i.name}`)
      .join('\n')

    navigator.clipboard.writeText(text || '清單是空的')
    alert('已複製到剪貼簿！')
  }

  const handleBought = () => {
    const checkedIds = items
      .filter(i => i.checked)
      .map(i => i.ingredientId)

    if (checkedIds.length > 0) {
      restockFromShopping(checkedIds)
      clearChecked()
    }
  }

  if (items.length === 0) {
    return (
      <div className="px-4 pt-6 pb-20 flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-6xl mb-4">🛒</p>
        <p className="text-[var(--color-text-secondary)] text-center">
          採買清單是空的
        </p>
        <p className="text-sm text-[var(--color-text-secondary)] text-center mt-2">
          從建議頁面加入缺少的食材
        </p>
      </div>
    )
  }

  return (
    <div className="px-4 pt-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">採買清單</h1>
        <Button size="sm" variant="secondary" onClick={handleCopy}>
          📋 複製
        </Button>
      </div>

      {/* Grouped Items */}
      {Object.entries(groupedItems).map(([category, categoryItems]) => (
        <section key={category} className="mb-4">
          <h2 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            {category}
          </h2>
          <div className="bg-[var(--color-surface)] rounded-xl overflow-hidden">
            {categoryItems.map((item, idx) => (
              <div
                key={item.id}
                className={`flex items-center p-3 ${
                  idx !== categoryItems.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className={`w-6 h-6 rounded border-2 mr-3 flex items-center justify-center
                    ${item.checked
                      ? 'bg-[var(--color-success)] border-[var(--color-success)] text-white'
                      : 'border-gray-300'
                    }`}
                >
                  {item.checked && '✓'}
                </button>
                <span className={item.checked ? 'line-through text-[var(--color-text-secondary)]' : ''}>
                  {item.name}
                </span>
                <button
                  onClick={() => removeItem(item.id)}
                  className="ml-auto text-[var(--color-text-secondary)] hover:text-[var(--color-error)] p-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Actions */}
      <div className="flex gap-2 mt-6">
        <Button
          variant="primary"
          fullWidth
          onClick={handleBought}
          disabled={!items.some(i => i.checked)}
        >
          ✅ 已買回
        </Button>
        <Button
          variant="secondary"
          onClick={clearChecked}
          disabled={!items.some(i => i.checked)}
        >
          🗑
        </Button>
        <Button
          variant="ghost"
          onClick={clearAll}
        >
          全清
        </Button>
      </div>
    </div>
  )
}
