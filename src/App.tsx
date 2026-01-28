import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { BottomNav } from './components/BottomNav'
import { PantryPage } from './features/pantry/PantryPage'
import { PreferencesPage } from './features/preferences/PreferencesPage'
import { SuggestionsPage } from './features/suggestions/SuggestionsPage'
import { ShoppingPage } from './features/shopping/ShoppingPage'

export default function App() {
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
