import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { usePantryStore } from '../store/pantryStore'
import { usePreferencesStore } from '../store/preferencesStore'
import { useRecipeHistoryStore } from '../store/recipeHistoryStore'
import { useTomorrowSuggestionsStore } from '../store/tomorrowSuggestionsStore'
import { useSuggestionsStore } from '../store/suggestionsStore'
import { generateTomorrowSuggestions } from '../services/tomorrowSuggestions'
import { TomorrowCard } from './TomorrowCard'
import { CardSkeleton } from './Skeleton'

export function TomorrowSection() {
  const navigate = useNavigate()
  const pantryItems = usePantryStore((state) => state.pantryItems)
  const preferences = usePreferencesStore()
  const getRecentCompletions = useRecipeHistoryStore((state) => state.getRecentCompletions)
  const { setSuggestions: setMainSuggestions } = useSuggestionsStore()

  const { suggestions, loading, error, setSuggestions, setLoading, setError, isStale } =
    useTomorrowSuggestionsStore(
      useShallow((state) => ({
        suggestions: state.suggestions,
        loading: state.loading,
        error: state.error,
        setSuggestions: state.setSuggestions,
        setLoading: state.setLoading,
        setError: state.setError,
        isStale: state.isStale,
      }))
    )

  useEffect(() => {
    // Only generate if stale and we have pantry items
    if (!isStale() || pantryItems.length === 0) return

    const generate = async () => {
      setLoading(true)
      try {
        const results = await generateTomorrowSuggestions({
          pantryItems,
          recentCompletions: getRecentCompletions(7),
          preferences,
        })
        setSuggestions(results)
      } catch (err) {
        console.error('Failed to generate tomorrow suggestions:', err)
        setError('無法產生建議')
      }
    }

    generate()
  }, [pantryItems, preferences, isStale, getRecentCompletions, setLoading, setSuggestions, setError])

  // Don't show if no pantry items
  if (pantryItems.length === 0) return null

  // Don't show if loading and no cached suggestions
  if (loading && suggestions.length === 0) {
    return (
      <div className="mb-6">
        <h2 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">
          正在想你明天可以煮什麼...
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          <div className="min-w-[200px]">
            <CardSkeleton />
          </div>
        </div>
      </div>
    )
  }

  // Don't show if no suggestions
  if (suggestions.length === 0) return null

  const handleCardClick = (suggestion: typeof suggestions[0]) => {
    // Set the suggestion in the main store and navigate
    setMainSuggestions([suggestion.suggestion])
    navigate('/suggestions')
  }

  return (
    <div className="mb-6">
      <h2 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">
        明天你可以直接煮
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
        {suggestions.map((s) => (
          <TomorrowCard
            key={s.id}
            suggestion={s}
            onClick={() => handleCardClick(s)}
          />
        ))}
      </div>
      {error && (
        <p className="text-xs text-[var(--color-error)] mt-1">{error}</p>
      )}
    </div>
  )
}
