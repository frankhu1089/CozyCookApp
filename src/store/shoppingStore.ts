import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ShoppingItem } from '../types'
import { subscribeToShoppingList, updateShoppingList } from '../services/firebase'

// Track sync state outside of Zustand (not persisted)
let _householdId: string | null = null
let _unsubscribe: (() => void) | null = null

interface ShoppingState {
  items: ShoppingItem[]
  addItem: (item: Omit<ShoppingItem, 'id' | 'checked'>) => void
  addItems: (items: Omit<ShoppingItem, 'id' | 'checked'>[]) => void
  toggleItem: (id: string) => void
  removeItem: (id: string) => void
  clearChecked: () => void
  clearAll: () => void
  // Firebase sync
  setItems: (items: ShoppingItem[]) => void
  syncWithFirebase: (householdId: string) => void
  stopSync: () => void
}

// Helper to push items to Firebase if synced
const pushToFirebase = (items: ShoppingItem[]) => {
  if (_householdId) {
    updateShoppingList(_householdId, items)
  }
}

export const useShoppingStore = create<ShoppingState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          if (state.items.some((i) => i.ingredientId === item.ingredientId)) {
            return state
          }
          const newItems = [
            ...state.items,
            { ...item, id: crypto.randomUUID(), checked: false },
          ]
          pushToFirebase(newItems)
          return { items: newItems }
        })
      },

      addItems: (items) => {
        set((state) => {
          const newItems = items.filter(
            (item) => !state.items.some((i) => i.ingredientId === item.ingredientId)
          )
          const allItems = [
            ...state.items,
            ...newItems.map((item) => ({
              ...item,
              id: crypto.randomUUID(),
              checked: false,
            })),
          ]
          pushToFirebase(allItems)
          return { items: allItems }
        })
      },

      toggleItem: (id) => {
        set((state) => {
          const newItems = state.items.map((item) =>
            item.id === id ? { ...item, checked: !item.checked } : item
          )
          pushToFirebase(newItems)
          return { items: newItems }
        })
      },

      removeItem: (id) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== id)
          pushToFirebase(newItems)
          return { items: newItems }
        })
      },

      clearChecked: () => {
        set((state) => {
          const newItems = state.items.filter((item) => !item.checked)
          pushToFirebase(newItems)
          return { items: newItems }
        })
      },

      clearAll: () => {
        pushToFirebase([])
        set({ items: [] })
      },

      // Set items from Firebase (without pushing back)
      setItems: (items) => set({ items }),

      // Start syncing with Firebase household
      syncWithFirebase: (householdId) => {
        // Stop any existing sync
        if (_unsubscribe) {
          _unsubscribe()
        }

        _householdId = householdId

        // Subscribe to Firebase changes
        const unsub = subscribeToShoppingList(householdId, (items) => {
          // Only update if different from current (avoid loops)
          const current = get().items
          if (JSON.stringify(items) !== JSON.stringify(current)) {
            set({ items })
          }
        })

        if (unsub) {
          _unsubscribe = unsub
        }
      },

      // Stop syncing
      stopSync: () => {
        if (_unsubscribe) {
          _unsubscribe()
          _unsubscribe = null
        }
        _householdId = null
      },
    }),
    { name: 'shopping-storage' }
  )
)
