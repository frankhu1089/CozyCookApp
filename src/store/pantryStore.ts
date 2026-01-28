import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PantryState {
  selectedIngredients: string[]
  toggle: (id: string) => void
  add: (id: string) => void
  remove: (id: string) => void
  clear: () => void
  isSelected: (id: string) => boolean
}

export const usePantryStore = create<PantryState>()(
  persist(
    (set, get) => ({
      selectedIngredients: [],
      toggle: (id) =>
        set((state) => ({
          selectedIngredients: state.selectedIngredients.includes(id)
            ? state.selectedIngredients.filter((i) => i !== id)
            : [...state.selectedIngredients, id],
        })),
      add: (id) =>
        set((state) => ({
          selectedIngredients: state.selectedIngredients.includes(id)
            ? state.selectedIngredients
            : [...state.selectedIngredients, id],
        })),
      remove: (id) =>
        set((state) => ({
          selectedIngredients: state.selectedIngredients.filter((i) => i !== id),
        })),
      clear: () => set({ selectedIngredients: [] }),
      isSelected: (id) => get().selectedIngredients.includes(id),
    }),
    { name: 'pantry-storage' }
  )
)
