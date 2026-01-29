import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { RecipeCompletion } from '../types'

const RETENTION_DAYS = 30
const MS_PER_DAY = 24 * 60 * 60 * 1000

interface RecipeHistoryState {
  completions: RecipeCompletion[]
  // Actions
  addCompletion: (completion: Omit<RecipeCompletion, 'id'>) => void
  removeCompletion: (id: string) => void
  getRecentCompletions: (days?: number) => RecipeCompletion[]
  cleanup: () => void
}

export const useRecipeHistoryStore = create<RecipeHistoryState>()(
  persist(
    (set, get) => ({
      completions: [],

      addCompletion: (completion) =>
        set((state) => ({
          completions: [
            ...state.completions,
            { ...completion, id: crypto.randomUUID() },
          ],
        })),

      removeCompletion: (id) =>
        set((state) => ({
          completions: state.completions.filter((c) => c.id !== id),
        })),

      getRecentCompletions: (days = 7) => {
        const cutoff = Date.now() - days * MS_PER_DAY
        return get().completions.filter((c) => c.cookedAt >= cutoff)
      },

      cleanup: () =>
        set((state) => {
          const cutoff = Date.now() - RETENTION_DAYS * MS_PER_DAY
          return {
            completions: state.completions.filter((c) => c.cookedAt >= cutoff),
          }
        }),
    }),
    {
      name: 'recipe-history-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        completions: state.completions,
      }),
    }
  )
)
