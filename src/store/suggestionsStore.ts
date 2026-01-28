import { create } from 'zustand'
import type { Suggestion } from '../types'

interface SuggestionsState {
  suggestions: Suggestion[]
  loading: boolean
  error: string | null
  setSuggestions: (suggestions: Suggestion[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clear: () => void
}

export const useSuggestionsStore = create<SuggestionsState>((set) => ({
  suggestions: [],
  loading: false,
  error: null,
  setSuggestions: (suggestions) => set({ suggestions, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  clear: () => set({ suggestions: [], error: null }),
}))
