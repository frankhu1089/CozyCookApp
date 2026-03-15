import { useState, useRef, useEffect } from 'react'
import type { IngredientState } from '../types'

interface ChipProps {
  label: string
  selected?: boolean
  onClick?: () => void
  onStateChange?: (state: IngredientState) => void
  onRemove?: () => void
  onDowngrade?: () => void
  state?: IngredientState
}

const stateOptions: { value: IngredientState; label: string }[] = [
  { value: 'plenty', label: '充足' },
  { value: 'some', label: '還有' },
  { value: 'low', label: '快沒了' },
  { value: 'empty', label: '用完' },
]

// State label shown inline on the chip
const stateInlineLabel: Record<IngredientState, string> = {
  plenty: '充足',
  some: '還有',
  low: '快沒了',
  empty: '用完',
  unknown: '',
}

export function Chip({ label, selected = false, onClick, onStateChange, onRemove, onDowngrade, state }: ChipProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pickerOpen) return
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [pickerOpen])

  const handleChipClick = () => {
    if (!selected) {
      onClick?.()
    } else {
      setPickerOpen(prev => !prev)
    }
  }

  const handleStateSelect = (newState: IngredientState) => {
    onStateChange?.(newState)
    setPickerOpen(false)
  }

  const handleRemove = () => {
    onRemove?.()
    setPickerOpen(false)
  }

  const inlineLabel = selected && state && state !== 'unknown' ? stateInlineLabel[state] : ''

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        type="button"
        onClick={handleChipClick}
        className={`
          px-3 py-1.5 text-sm font-medium
          transition-all active:scale-95
          ${selected
            ? 'bg-[var(--color-primary)] text-white'
            : 'bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-gray-200'
          }
        `}
      >
        {label}
        {inlineLabel && (
          <span className="ml-1.5 text-xs opacity-75">{inlineLabel}</span>
        )}
        {selected && (
          <span className="ml-1 text-xs opacity-60">▾</span>
        )}
      </button>

      {pickerOpen && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-[var(--color-surface)] border border-gray-200 min-w-[110px] shadow-sm">
          {stateOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleStateSelect(opt.value)}
              className={`
                w-full text-left px-3 py-2 text-sm hover:bg-gray-50
                ${state === opt.value
                  ? 'font-semibold text-[var(--color-primary)]'
                  : 'text-[var(--color-text-primary)]'
                }
              `}
            >
              {state === opt.value ? '✓ ' : ''}{opt.label}
            </button>
          ))}
          <div className="border-t border-gray-100" />
          <button
            type="button"
            onClick={() => { onDowngrade?.(); setPickerOpen(false) }}
            className="w-full text-left px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-gray-50"
          >
            ↓ 用了一些
          </button>
          <div className="border-t border-gray-100" />
          <button
            type="button"
            onClick={handleRemove}
            className="w-full text-left px-3 py-2 text-sm text-[var(--color-error)] hover:bg-gray-50"
          >
            ✕ 移除
          </button>
        </div>
      )}
    </div>
  )
}
