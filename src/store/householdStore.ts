import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Household } from '../types'
import {
  initFirebase,
  isFirebaseEnabled,
  createHousehold as createHouseholdFb,
  joinHousehold as joinHouseholdFb,
  getHousehold as getHouseholdFb,
} from '../services/firebase'

interface HouseholdState {
  household: Household | null
  inviteCode: string | null
  isEnabled: boolean
  loading: boolean
  error: string | null
  // Actions
  initialize: () => void
  createHousehold: (name: string) => Promise<boolean>
  joinHousehold: (code: string) => Promise<boolean>
  leaveHousehold: () => void
  setError: (error: string | null) => void
}

export const useHouseholdStore = create<HouseholdState>()(
  persist(
    (set, get) => ({
      household: null,
      inviteCode: null,
      isEnabled: false,
      loading: false,
      error: null,

      initialize: () => {
        const enabled = initFirebase()
        set({ isEnabled: enabled })

        // If we have a stored household ID, fetch the latest data
        const { household } = get()
        if (enabled && household?.id) {
          getHouseholdFb(household.id).then((data) => {
            if (data) {
              set({
                household: {
                  id: data.id,
                  name: data.name,
                  members: [],
                  createdAt: data.createdAt,
                },
                inviteCode: data.inviteCode,
              })
            }
          })
        }
      },

      createHousehold: async (name: string) => {
        if (!isFirebaseEnabled()) {
          set({ error: 'Firebase 尚未設定' })
          return false
        }

        set({ loading: true, error: null })

        const result = await createHouseholdFb(name)
        if (!result) {
          set({ loading: false, error: '建立家庭失敗' })
          return false
        }

        set({
          household: {
            id: result.id,
            name,
            members: [],
            createdAt: Date.now(),
          },
          inviteCode: result.inviteCode,
          loading: false,
        })

        return true
      },

      joinHousehold: async (code: string) => {
        if (!isFirebaseEnabled()) {
          set({ error: 'Firebase 尚未設定' })
          return false
        }

        set({ loading: true, error: null })

        const householdId = await joinHouseholdFb(code)
        if (!householdId) {
          set({ loading: false, error: '找不到這個邀請碼' })
          return false
        }

        const data = await getHouseholdFb(householdId)
        if (!data) {
          set({ loading: false, error: '無法載入家庭資料' })
          return false
        }

        set({
          household: {
            id: data.id,
            name: data.name,
            members: [],
            createdAt: data.createdAt,
          },
          inviteCode: data.inviteCode,
          loading: false,
        })

        return true
      },

      leaveHousehold: () => {
        set({
          household: null,
          inviteCode: null,
          error: null,
        })
      },

      setError: (error) => set({ error }),
    }),
    {
      name: 'household-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        household: state.household,
        inviteCode: state.inviteCode,
      }),
    }
  )
)
