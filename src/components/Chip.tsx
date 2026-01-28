interface ChipProps {
  label: string
  selected?: boolean
  onClick?: () => void
}

export function Chip({ label, selected = false, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        px-3 py-1.5 rounded-full text-sm font-medium
        transition-all active:scale-95
        ${selected
          ? 'bg-[var(--color-primary)] text-white'
          : 'bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-gray-200'
        }
      `}
    >
      {label}
    </button>
  )
}
