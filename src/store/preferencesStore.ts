import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Preferences } from '../types'

interface PreferencesState extends Preferences {
  setCuisines: (cuisines: Preferences['cuisines']) => void
  setMaxTime: (time: Preferences['maxTime']) => void
  toggleDietFlag: (flag: string) => void
  addExcluded: (id: string) => void
  removeExcluded: (id: string) => void
  toggleNotifications: () => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      cuisines: ['mixed'],
      maxTime: 30,
      dietFlags: [],
      excludedIngredients: [],
      notificationsEnabled: false,
      setCuisines: (cuisines) => set({ cuisines }),
      setMaxTime: (maxTime) => set({ maxTime }),
      toggleDietFlag: (flag) =>
        set((state) => ({
          dietFlags: state.dietFlags.includes(flag)
            ? state.dietFlags.filter((f) => f !== flag)
            : [...state.dietFlags, flag],
        })),
      addExcluded: (id) =>
        set((state) => ({
          excludedIngredients: state.excludedIngredients.includes(id)
            ? state.excludedIngredients
            : [...state.excludedIngredients, id],
        })),
      removeExcluded: (id) =>
        set((state) => ({
          excludedIngredients: state.excludedIngredients.filter((i) => i !== id),
        })),
      toggleNotifications: () =>
        set((state) => ({
          notificationsEnabled: !state.notificationsEnabled,
        })),
    }),
    { name: 'preferences-storage' }
  )
)
