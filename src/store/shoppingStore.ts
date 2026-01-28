import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ShoppingItem } from '../types'

interface ShoppingState {
  items: ShoppingItem[]
  addItem: (item: Omit<ShoppingItem, 'id' | 'checked'>) => void
  addItems: (items: Omit<ShoppingItem, 'id' | 'checked'>[]) => void
  toggleItem: (id: string) => void
  removeItem: (id: string) => void
  clearChecked: () => void
  clearAll: () => void
}

export const useShoppingStore = create<ShoppingState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          if (state.items.some((i) => i.ingredientId === item.ingredientId)) {
            return state
          }
          return {
            items: [
              ...state.items,
              { ...item, id: crypto.randomUUID(), checked: false },
            ],
          }
        }),
      addItems: (items) =>
        set((state) => {
          const newItems = items.filter(
            (item) => !state.items.some((i) => i.ingredientId === item.ingredientId)
          )
          return {
            items: [
              ...state.items,
              ...newItems.map((item) => ({
                ...item,
                id: crypto.randomUUID(),
                checked: false,
              })),
            ],
          }
        }),
      toggleItem: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, checked: !item.checked } : item
          ),
        })),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      clearChecked: () =>
        set((state) => ({
          items: state.items.filter((item) => !item.checked),
        })),
      clearAll: () => set({ items: [] }),
    }),
    { name: 'shopping-storage' }
  )
)
