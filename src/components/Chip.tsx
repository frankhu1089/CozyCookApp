import type { IngredientState } from '../types'

interface ChipProps {
  label: string
  selected?: boolean
  onClick?: () => void
  state?: IngredientState
}

const stateColors: Record<IngredientState, string> = {
  plenty: 'bg-green-500',
  some: 'bg-yellow-500',
  low: 'bg-orange-500',
  empty: 'bg-red-500',
  unknown: 'bg-gray-400',
}

const stateLabels: Record<IngredientState, string> = {
  plenty: '充足',
  some: '還有',
  low: '快沒了',
  empty: '用完了',
  unknown: '',
}

export function Chip({ label, selected = false, onClick, state }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative px-3 py-1.5 rounded-full text-sm font-medium
        transition-all active:scale-95
        ${selected
          ? 'bg-[var(--color-primary)] text-white'
          : 'bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-gray-200'
        }
      `}
      title={state && state !== 'unknown' ? stateLabels[state] : undefined}
    >
      {label}
      {selected && state && state !== 'unknown' && (
        <span
          className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${stateColors[state]} border-2 border-white`}
        />
      )}
    </button>
  )
}
