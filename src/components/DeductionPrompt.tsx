import { Button } from './Button'
import type { IngredientState } from '../types'

interface StateChange {
  ingredientName: string
  fromState: IngredientState
  toState: IngredientState
}

interface DeductionPromptProps {
  changes: StateChange[]
  onConfirm: () => void
  onSkip: () => void
}

const stateLabels: Record<IngredientState, string> = {
  plenty: '充足',
  some: '還有',
  low: '快沒了',
  empty: '用完了',
  unknown: '不確定',
}

const stateColors: Record<IngredientState, string> = {
  plenty: 'text-green-600',
  some: 'text-yellow-600',
  low: 'text-orange-600',
  empty: 'text-red-600',
  unknown: 'text-gray-500',
}

export function DeductionPrompt({ changes, onConfirm, onSkip }: DeductionPromptProps) {
  if (changes.length === 0) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-[var(--color-surface)] rounded-2xl p-6 w-full max-w-sm">
        <h3 className="text-lg font-semibold mb-2 text-center">
          更新冰箱狀態
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] text-center mb-4">
          以下食材會更新：
        </p>

        <div className="space-y-2 mb-6 max-h-[200px] overflow-y-auto">
          {changes.map((change) => (
            <div
              key={change.ingredientName}
              className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
            >
              <span className="font-medium">{change.ingredientName}</span>
              <div className="flex items-center gap-2 text-sm">
                <span className={stateColors[change.fromState]}>
                  {stateLabels[change.fromState]}
                </span>
                <span className="text-gray-400">→</span>
                <span className={stateColors[change.toState]}>
                  {stateLabels[change.toState]}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onSkip}>
            跳過
          </Button>
          <Button fullWidth onClick={onConfirm}>
            確認更新
          </Button>
        </div>
      </div>
    </div>
  )
}
