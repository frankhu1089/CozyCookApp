import type { TomorrowSuggestion } from '../types'
import { Card } from './Card'

interface TomorrowCardProps {
  suggestion: TomorrowSuggestion
  onClick: () => void
}

export function TomorrowCard({ suggestion, onClick }: TomorrowCardProps) {
  const { suggestion: recipe, reason } = suggestion

  return (
    <Card
      className="min-w-[200px]"
      onClick={onClick}
    >
      <p className="text-xs text-[var(--color-primary)] mb-1">{reason}</p>
      <h3 className="font-semibold mb-1 truncate">{recipe.title}</h3>
      <p className="text-xs text-[var(--color-text-secondary)]">
        {recipe.cuisine} • {recipe.timeMinutes}分鐘
      </p>
    </Card>
  )
}
