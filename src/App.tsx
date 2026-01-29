import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { BottomNav } from './components/BottomNav'
import { PantryPage } from './features/pantry/PantryPage'
import { PreferencesPage } from './features/preferences/PreferencesPage'
import { SuggestionsPage } from './features/suggestions/SuggestionsPage'
import { ShoppingPage } from './features/shopping/ShoppingPage'
import { useHouseholdStore } from './store/householdStore'
import { useRecipeHistoryStore } from './store/recipeHistoryStore'

export default function App() {
  const initializeHousehold = useHouseholdStore((state) => state.initialize)
  const cleanupHistory = useRecipeHistoryStore((state) => state.cleanup)

  useEffect(() => {
    // Initialize Firebase for household sharing
    initializeHousehold()
    // Cleanup old recipe history (30 days retention)
    cleanupHistory()
  }, [initializeHousehold, cleanupHistory])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[var(--color-background)]">
        <main className="pb-14">
          <Routes>
            <Route path="/" element={<PantryPage />} />
            <Route path="/preferences" element={<PreferencesPage />} />
            <Route path="/suggestions" element={<SuggestionsPage />} />
            <Route path="/shopping" element={<ShoppingPage />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}
