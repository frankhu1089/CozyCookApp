import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { TomorrowSuggestion } from '../types'

const STALE_THRESHOLD_MS = 12 * 60 * 60 * 1000 // 12 hours

interface TomorrowSuggestionsState {
  suggestions: TomorrowSuggestion[]
  loading: boolean
  error: string | null
  lastGeneratedAt: number | null
  // Actions
  setSuggestions: (suggestions: TomorrowSuggestion[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  isStale: () => boolean
  clear: () => void
}

export const useTomorrowSuggestionsStore = create<TomorrowSuggestionsState>()(
  persist(
    (set, get) => ({
      suggestions: [],
      loading: false,
      error: null,
      lastGeneratedAt: null,

      setSuggestions: (suggestions) =>
        set({
          suggestions,
          lastGeneratedAt: Date.now(),
          loading: false,
          error: null,
        }),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error, loading: false }),

      isStale: () => {
        const { lastGeneratedAt } = get()
        if (!lastGeneratedAt) return true
        return Date.now() - lastGeneratedAt > STALE_THRESHOLD_MS
      },

      clear: () =>
        set({
          suggestions: [],
          lastGeneratedAt: null,
          error: null,
        }),
    }),
    {
      name: 'tomorrow-suggestions-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        suggestions: state.suggestions,
        lastGeneratedAt: state.lastGeneratedAt,
      }),
    }
  )
)
