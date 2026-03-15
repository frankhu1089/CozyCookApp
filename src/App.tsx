import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { BottomNav } from './components/BottomNav'
import { PantryPage } from './features/pantry/PantryPage'
import { PreferencesPage } from './features/preferences/PreferencesPage'
import { SuggestionsPage } from './features/suggestions/SuggestionsPage'
import { ShoppingPage } from './features/shopping/ShoppingPage'
import { FridgeScanPage } from './features/scan/FridgeScanPage'
import { useHouseholdStore } from './store/householdStore'
import { useRecipeHistoryStore } from './store/recipeHistoryStore'
import { useShoppingStore } from './store/shoppingStore'

export default function App() {
  const initializeHousehold = useHouseholdStore((state) => state.initialize)
  const household = useHouseholdStore((state) => state.household)
  const cleanupHistory = useRecipeHistoryStore((state) => state.cleanup)
  const syncWithFirebase = useShoppingStore((state) => state.syncWithFirebase)
  const stopSync = useShoppingStore((state) => state.stopSync)

  useEffect(() => {
    // Initialize Firebase for household sharing
    initializeHousehold()
    // Cleanup old recipe history (30 days retention)
    cleanupHistory()
  }, [initializeHousehold, cleanupHistory])

  // Sync shopping list when household changes
  useEffect(() => {
    if (household?.id) {
      syncWithFirebase(household.id)
    } else {
      stopSync()
    }
    return () => stopSync()
  }, [household?.id, syncWithFirebase, stopSync])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[var(--color-background)]">
        <main className="pb-14">
          <Routes>
            <Route path="/" element={<PantryPage />} />
            <Route path="/preferences" element={<PreferencesPage />} />
            <Route path="/suggestions" element={<SuggestionsPage />} />
            <Route path="/shopping" element={<ShoppingPage />} />
            <Route path="/scan" element={<FridgeScanPage />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}
