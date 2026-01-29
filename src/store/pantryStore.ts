import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { PantryItem, IngredientState } from '../types'

interface PantryState {
  pantryItems: PantryItem[]
  // Actions
  toggle: (id: string) => void
  add: (id: string) => void
  remove: (id: string) => void
  clear: () => void
  isSelected: (id: string) => boolean
  updateState: (ingredientId: string, state: IngredientState) => void
  getState: (ingredientId: string) => IngredientState
  // For backward compatibility
  selectedIngredients: string[]
}

// Migration: convert old format to new format
interface OldPantryStorage {
  state: { selectedIngredients?: string[] }
}

function migrateFromOldFormat(storedValue: unknown): PantryItem[] {
  const oldData = storedValue as OldPantryStorage
  if (oldData?.state?.selectedIngredients && Array.isArray(oldData.state.selectedIngredients)) {
    return oldData.state.selectedIngredients.map((id: string) => ({
      ingredientId: id,
      state: 'unknown' as IngredientState,
      lastUpdatedAt: Date.now(),
    }))
  }
  return []
}

export const usePantryStore = create<PantryState>()(
  persist(
    (set, get) => ({
      pantryItems: [],

      // Computed for backward compatibility
      get selectedIngredients() {
        return get().pantryItems.map((item) => item.ingredientId)
      },

      toggle: (id) =>
        set((state) => {
          const exists = state.pantryItems.some((item) => item.ingredientId === id)
          if (exists) {
            return {
              pantryItems: state.pantryItems.filter((item) => item.ingredientId !== id),
            }
          }
          return {
            pantryItems: [
              ...state.pantryItems,
              { ingredientId: id, state: 'unknown', lastUpdatedAt: Date.now() },
            ],
          }
        }),

      add: (id) =>
        set((state) => {
          const exists = state.pantryItems.some((item) => item.ingredientId === id)
          if (exists) return state
          return {
            pantryItems: [
              ...state.pantryItems,
              { ingredientId: id, state: 'unknown', lastUpdatedAt: Date.now() },
            ],
          }
        }),

      remove: (id) =>
        set((state) => ({
          pantryItems: state.pantryItems.filter((item) => item.ingredientId !== id),
        })),

      clear: () => set({ pantryItems: [] }),

      isSelected: (id) => get().pantryItems.some((item) => item.ingredientId === id),

      updateState: (ingredientId, newState) =>
        set((state) => ({
          pantryItems: state.pantryItems.map((item) =>
            item.ingredientId === ingredientId
              ? { ...item, state: newState, lastUpdatedAt: Date.now() }
              : item
          ),
        })),

      getState: (ingredientId) => {
        const item = get().pantryItems.find((item) => item.ingredientId === ingredientId)
        return item?.state ?? 'unknown'
      },
    }),
    {
      name: 'pantry-storage',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState, version) => {
        if (version === 0 || version === undefined) {
          // Migrate from old format
          const raw = localStorage.getItem('pantry-storage')
          if (raw) {
            try {
              const parsed = JSON.parse(raw)
              const migratedItems = migrateFromOldFormat(parsed)
              if (migratedItems.length > 0) {
                return { pantryItems: migratedItems }
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
        return persistedState as PantryState
      },
      partialize: (state) => ({
        pantryItems: state.pantryItems,
      }),
    }
  )
)
