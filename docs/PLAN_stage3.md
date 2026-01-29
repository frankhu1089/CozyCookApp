# Stage 3: Plan With Confidence

## Implementation Phases

### Phase 1: Recipe History Store
New store to track completed recipes (required for tomorrow suggestions)

**Files:**
- `src/types/index.ts` - add `RecipeCompletion` type
- `src/store/recipeHistoryStore.ts` - new store (persisted)
- `src/features/suggestions/SuggestionsPage.tsx` - record completion on confirm

```typescript
interface RecipeCompletion {
  id: string
  recipeId: string
  recipeTitle: string
  cookedAt: number
  servings: 'small' | 'large'
  ingredientsUsed: string[]
}
```

### Phase 2: Tomorrow Suggestions
Generate 1-3 recipes prioritizing `low` ingredients

**Files:**
- `src/types/index.ts` - add `TomorrowSuggestion` type
- `src/store/tomorrowSuggestionsStore.ts` - new store
- `src/services/tomorrowSuggestions.ts` - generation logic
- `api/tomorrow-suggestions.ts` - new API endpoint (optional)

**Algorithm:**
1. Filter recipes using `low` state ingredients → high priority
2. Recent successful recipes → medium priority
3. Quick recipes ≤30min → low priority
4. Return top 1-3

### Phase 3: Home Page UI
Add Tomorrow Section to PantryPage

**Files:**
- `src/components/TomorrowSection.tsx` - card section
- `src/components/TomorrowCard.tsx` - single suggestion card
- `src/features/pantry/PantryPage.tsx` - integrate section above ingredients

**UI:**
```
📅 明天你可以直接煮：
┌─────────────────────────┐
│ 🍳 番茄蛋麵             │
│ 原因：番茄可能快用完    │
│ [看詳情]                │
└─────────────────────────┘
```

### Phase 4: Ingredient Priority Hints
Chip already shows state colors. Add text hints in UI.

**Files:**
- `src/features/pantry/PantryPage.tsx` - show "建議優先用掉" for `low` items

### Phase 5: Semi-auto Deduction (Opt-in)
Confirm before updating states (existing flow, minor enhance)

**Files:**
- `src/components/DeductionPrompt.tsx` - show proposed changes
- `src/features/suggestions/SuggestionsPage.tsx` - use DeductionPrompt

**Flow:**
1. User clicks "照建議煮了"
2. Show: "蛋: plenty → some, 番茄: low → empty"
3. User confirms/skips
4. Update pantry states

### Phase 6: Family Sharing (Firebase Real-time)
Real-time sync of shopping list + tomorrow suggestions

**Files:**
- `src/types/index.ts` - add `Household`, `SharedData` types
- `src/store/householdStore.ts` - new store
- `src/services/firebase.ts` - Firebase init + sync helpers
- `src/features/preferences/HouseholdSettings.tsx` - UI
- `package.json` - add `firebase` dependency

**Setup:**
1. Create Firebase project (Firestore)
2. Add env var `VITE_FIREBASE_CONFIG`
3. Sync: `shoppingStore` + `tomorrowSuggestionsStore` to Firestore
4. Household join via invite code

### Phase 7: Notifications (Should Have)
Morning reminder, default OFF

**Files:**
- `src/store/preferencesStore.ts` - add `notificationsEnabled`
- Preferences UI toggle

---

## File Summary

| File | Action |
|------|--------|
| `src/types/index.ts` | Add RecipeCompletion, TomorrowSuggestion, Household |
| `src/store/recipeHistoryStore.ts` | New |
| `src/store/tomorrowSuggestionsStore.ts` | New |
| `src/store/householdStore.ts` | New |
| `src/services/tomorrowSuggestions.ts` | New |
| `src/components/TomorrowSection.tsx` | New |
| `src/components/TomorrowCard.tsx` | New |
| `src/components/DeductionPrompt.tsx` | New |
| `src/features/pantry/PantryPage.tsx` | Add TomorrowSection |
| `src/features/suggestions/SuggestionsPage.tsx` | Record history, DeductionPrompt |
| `api/tomorrow-suggestions.ts` | New (optional) |

---

## Verification
1. `npm run build` - no type errors
2. Complete a recipe → appears in history
3. Open PantryPage → see tomorrow suggestions
4. Mark ingredient as `low` → see priority hint
5. "照建議煮了" → see deduction prompt → confirm → states update

---

## Decisions Made

| Question | Decision |
|----------|----------|
| History retention | 30 days |
| Generation timing | App open only (when stale >12h) |
| Sharing | Firebase real-time sync |
| Empty ingredients | Show with warning "需補貨" |

---

## Notes

- Firebase adds ~100KB bundle size, requires project setup
- History auto-cleanup via store action on app init
- Tomorrow suggestions cached, regenerate if >12h old
