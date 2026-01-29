import type { TomorrowSuggestion } from '../types'
import { Card } from './Card'

interface TomorrowCardProps {
  suggestion: TomorrowSuggestion
  onClick: () => void
}

const priorityStyles = {
  high: 'border-l-4 border-l-orange-500',
  medium: 'border-l-4 border-l-blue-500',
  low: 'border-l-4 border-l-gray-300',
}

export function TomorrowCard({ suggestion, onClick }: TomorrowCardProps) {
  const { suggestion: recipe, reason, priority } = suggestion

  return (
    <Card
      className={`${priorityStyles[priority]} min-w-[200px]`}
      onClick={onClick}
    >
      <h3 className="font-semibold mb-1 truncate">{recipe.title}</h3>
      <p className="text-xs text-[var(--color-text-secondary)] mb-2">
        {recipe.cuisine} • {recipe.timeMinutes}分鐘
      </p>
      <p className="text-xs text-orange-600">{reason}</p>
    </Card>
  )
}
