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
  // Batch restock: set multiple ingredients to 'plenty'
  restockFromShopping: (ingredientIds: string[]) => void
  downgradeState: (ingredientId: string) => void
  setUrgent: (ingredientId: string, urgent: boolean) => void
  isUrgent: (ingredientId: string) => boolean
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
              { ingredientId: id, state: 'some', lastUpdatedAt: Date.now() },
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
              { ingredientId: id, state: 'some', lastUpdatedAt: Date.now() },
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

      restockFromShopping: (ingredientIds) =>
        set((state) => {
          const now = Date.now()
          // Update existing items to 'plenty', add new ones
          const existingIds = new Set(state.pantryItems.map(i => i.ingredientId))
          const updatedItems = state.pantryItems.map((item) =>
            ingredientIds.includes(item.ingredientId)
              ? { ...item, state: 'plenty' as IngredientState, lastUpdatedAt: now }
              : item
          )
          // Add new items that weren't in pantry
          const newItems = ingredientIds
            .filter(id => !existingIds.has(id))
            .map(id => ({
              ingredientId: id,
              state: 'plenty' as IngredientState,
              lastUpdatedAt: now,
            }))
          return { pantryItems: [...updatedItems, ...newItems] }
        }),

      setUrgent: (ingredientId, urgent) =>
        set((state) => ({
          pantryItems: state.pantryItems.map((item) =>
            item.ingredientId === ingredientId
              ? { ...item, urgent, lastUpdatedAt: Date.now() }
              : item
          ),
        })),

      isUrgent: (ingredientId) => {
        const item = get().pantryItems.find((item) => item.ingredientId === ingredientId)
        return item?.urgent ?? false
      },

      downgradeState: (ingredientId) =>
        set((state) => {
          const downgrade: Record<IngredientState, IngredientState> = {
            plenty: 'some',
            some: 'low',
            low: 'empty',
            empty: 'empty',
            unknown: 'low',
          }
          return {
            pantryItems: state.pantryItems.map((item) =>
              item.ingredientId === ingredientId
                ? { ...item, state: downgrade[item.state], lastUpdatedAt: Date.now() }
                : item
            ),
          }
        }),
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
