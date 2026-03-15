# Sprint 2 — Daily Habit + Photo Scanning Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the app worth opening every day — faster deductions, expiry pressure, better suggestions, and a photo-based fridge scan flow.

**Architecture:** All UI changes are isolated to existing components. The photo scan adds one new Vercel serverless function (`api/scan-fridge.ts`) following the exact pattern of `api/suggestions.ts`, plus a new `FridgeScanPage`. No new stores — the scan result flows into the existing `pantryStore.updateState`. The `urgent` flag extends `PantryItem` type with an optional boolean, backwards-compatible with persisted data.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Zustand (persist), Vercel serverless, OpenAI GPT-4o (vision). No test framework — verify with `npm run build && npm run lint` after each task.

**Worktree:** Create at `.worktrees/sprint2-daily-habit` on branch `feature/sprint2-daily-habit`

**Verification command:** `cd .worktrees/sprint2-daily-habit && npm run build && npm run lint`

---

## Quick Wins

### Task 1: Stale-State Headline Shift

**What:** When fridge data is 4+ days old, change the home screen headline from `冰箱裡有什麼？` to `該更新冰箱了` and subtitle to `上次更新超過 N 天`. Creates urgency without notifications.

**Files:**
- Modify: `src/features/pantry/PantryPage.tsx`

**Step 1: Update `getStalenessText` to return structured data**

`getStalenessText` currently returns `string | null`. Change it to return an object so the component can branch on staleness:

```tsx
// Replace the existing getStalenessText function (lines 25-32):
function getFridgeStatus(items: PantryItem[], now: number): {
  isStale: boolean
  text: string | null
} {
  if (items.length === 0) return { isStale: false, text: null }
  const latestUpdate = Math.max(...items.map(i => i.lastUpdatedAt))
  const diffDays = Math.floor((now - latestUpdate) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return { isStale: false, text: '今天更新' }
  if (diffDays === 1) return { isStale: false, text: '昨天更新' }
  if (diffDays < 4) return { isStale: false, text: `${diffDays} 天前更新` }
  return { isStale: true, text: `已 ${diffDays} 天未更新` }
}
```

**Step 2: Use `getFridgeStatus` in the component**

In the `PantryPage` component body, replace `[now]` usage:

```tsx
// After: const [now] = useState(() => Date.now())
const fridgeStatus = getFridgeStatus(pantryItems, now)
```

**Step 3: Update header to branch on `isStale`**

Replace the header h1 + p + staleness p block:

```tsx
<div>
  <h1 className="text-2xl font-semibold mb-1">
    {fridgeStatus.isStale ? '該更新冰箱了' : '冰箱裡有什麼？'}
  </h1>
  <p className="text-[var(--color-text-secondary)]">
    {fridgeStatus.isStale ? '點選食材更新狀態' : '標記食材狀態，避免浪費'}
  </p>
  {fridgeStatus.text && (
    <p className="text-xs text-[var(--color-text-secondary)] mt-1 font-mono">
      {fridgeStatus.text}
    </p>
  )}
</div>
```

**Step 4: Verify build**
```bash
npm run build && npm run lint
```

**Step 5: Commit**
```bash
git add src/features/pantry/PantryPage.tsx
git commit -m "pantry: stale headline shifts after 4 days without update"
```

---

### Task 2: Positive Empty State in AlertZone

**What:** When no items are `low` or `empty`, show `冰箱狀態良好` instead of rendering nothing. Makes the app feel alive even on good days.

**Files:**
- Modify: `src/components/AlertZone.tsx`

**Step 1: Read current AlertZone**

Current: returns `null` when `atRisk.length === 0`.

**Step 2: Replace the early return with a positive state**

```tsx
// BEFORE:
if (atRisk.length === 0) return null

// AFTER:
if (atRisk.length === 0) {
  // Only show positive state if user has pantry items
  if (pantryItems.length === 0) return null
  return (
    <div className="mx-4 mb-4 px-3 py-2">
      <p className="text-sm text-[var(--color-text-secondary)]">
        ✓ 冰箱狀態良好
      </p>
    </div>
  )
}
```

Note: intentionally minimal — no border, no background. Just a quiet line of text.

**Step 3: Verify build**
```bash
npm run build && npm run lint
```

**Step 4: Commit**
```bash
git add src/components/AlertZone.tsx
git commit -m "alert: show positive state when nothing is at risk"
```

---

## State Interactions

### Task 3: Quick Deduction (`↓ 用了一些`)

**What:** Add a "used some" shortcut to the chip state picker. Tap it → state degrades by one level (plenty→some, some→low, low→empty). Closes picker immediately. No confirmation needed.

Degradation table:
- `plenty` → `some`
- `some` → `low`
- `low` → `empty`
- `empty` → `empty` (no-op, stays)
- `unknown` → `low` (reasonable: if you used some, assume it's low now)

**Files:**
- Modify: `src/store/pantryStore.ts`
- Modify: `src/components/Chip.tsx`

**Step 1: Add `downgradeState` action to pantryStore**

In `src/store/pantryStore.ts`, add to the interface:
```tsx
downgradeState: (ingredientId: string) => void
```

Add the implementation inside `create`:
```tsx
downgradeState: (ingredientId) =>
  set((state) => {
    const downgrade: Record<string, IngredientState> = {
      plenty: 'some',
      some: 'low',
      low: 'empty',
      empty: 'empty',
      unknown: 'low',
    }
    return {
      pantryItems: state.pantryItems.map((item) =>
        item.ingredientId === ingredientId
          ? { ...item, state: downgrade[item.state] ?? 'low', lastUpdatedAt: Date.now() }
          : item
      ),
    }
  }),
```

**Step 2: Add `onDowngrade` prop to Chip**

In `src/components/Chip.tsx`, add to `ChipProps` interface:
```tsx
onDowngrade?: () => void
```

**Step 3: Add downgrade button to picker, above the divider**

Inside the `pickerOpen` block, after the `{stateOptions.map(...)}` block and before `<div className="border-t border-gray-100" />`, add:

```tsx
<div className="border-t border-gray-100" />
<button
  type="button"
  onClick={() => { onDowngrade?.(); setPickerOpen(false) }}
  className="w-full text-left px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-gray-50"
>
  ↓ 用了一些
</button>
```

So the picker order becomes: 4 state options → divider → ↓ 用了一些 → divider → ✕ 移除.

**Step 4: Wire up in PantryPage**

In `src/features/pantry/PantryPage.tsx`, add `downgradeState` to the store destructure:
```tsx
const { toggle, isSelected, getState, updateState, remove, downgradeState } = usePantryStore()
```

Add `onDowngrade` prop to both Chip render sites (search results + category list):
```tsx
onDowngrade={() => downgradeState(ing.id)}
```

**Step 5: Verify build**
```bash
npm run build && npm run lint
```

**Step 6: Commit**
```bash
git add src/store/pantryStore.ts src/components/Chip.tsx src/features/pantry/PantryPage.tsx
git commit -m "chip: add quick degrade shortcut '↓ 用了一些'"
```

---

### Task 4: Expiry-Pressure Flag (`⚡ 快過期`)

**What:** A boolean `urgent` flag on `PantryItem`. When set: chip shows ⚡ prefix, item sorts above even `low` items, tomorrow suggestions scoring gets +150. Toggle via the chip picker.

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/store/pantryStore.ts`
- Modify: `src/components/Chip.tsx`
- Modify: `src/features/pantry/PantryPage.tsx`
- Modify: `src/services/tomorrowSuggestions.ts`

**Step 1: Add `urgent` to `PantryItem` type**

In `src/types/index.ts`:
```tsx
// BEFORE:
export interface PantryItem {
  ingredientId: string
  state: IngredientState
  lastUpdatedAt: number
}

// AFTER:
export interface PantryItem {
  ingredientId: string
  state: IngredientState
  lastUpdatedAt: number
  urgent?: boolean  // optional — backwards compatible with persisted data
}
```

**Step 2: Add `setUrgent` and `isUrgent` to pantryStore**

In `src/store/pantryStore.ts`, add to the interface:
```tsx
setUrgent: (ingredientId: string, urgent: boolean) => void
isUrgent: (ingredientId: string) => boolean
```

Add implementations:
```tsx
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
```

**Step 3: Add `urgent` display and toggle to Chip**

In `src/components/Chip.tsx`, add `onUrgentToggle` and `urgent` props:
```tsx
interface ChipProps {
  // ... existing props ...
  urgent?: boolean
  onUrgentToggle?: () => void
}
```

Show ⚡ prefix on the chip label when urgent:
```tsx
// In the button content, before {label}:
{urgent && <span className="mr-1">⚡</span>}
```

Add toggle option at the bottom of the picker (after ↓ 用了一些, before ✕ 移除):
```tsx
<button
  type="button"
  onClick={() => { onUrgentToggle?.(); setPickerOpen(false) }}
  className="w-full text-left px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-gray-50"
>
  {urgent ? '✕ 取消快過期' : '⚡ 快過期'}
</button>
```

Full picker order: 4 state options → divider → ↓ 用了一些 → ⚡ 快過期 toggle → divider → ✕ 移除.

**Step 4: Update urgencyOrder in PantryPage to surface urgent items first**

In `src/features/pantry/PantryPage.tsx`, `urgencyOrder` is a `Record<string, number>`. The sort uses `getState(id)` to look up order. Urgent items need a different path.

Replace the `sortByUrgency` arrow function inside the component:

```tsx
// BEFORE:
const sortByUrgency = (items: Ingredient[]) =>
  [...items].sort((a, b) => (urgencyOrder[getState(a.id)] ?? 4) - (urgencyOrder[getState(b.id)] ?? 4))

// AFTER:
const sortByUrgency = (items: Ingredient[]) =>
  [...items].sort((a, b) => {
    const scoreA = isUrgent(a.id) ? -1 : (urgencyOrder[getState(a.id)] ?? 4)
    const scoreB = isUrgent(b.id) ? -1 : (urgencyOrder[getState(b.id)] ?? 4)
    return scoreA - scoreB
  })
```

Add `isUrgent, setUrgent` to the store destructure:
```tsx
const { toggle, isSelected, getState, updateState, remove, downgradeState, isUrgent, setUrgent } = usePantryStore()
```

Add `urgent` and `onUrgentToggle` props to both Chip render sites:
```tsx
urgent={isUrgent(ing.id)}
onUrgentToggle={() => setUrgent(ing.id, !isUrgent(ing.id))}
```

Also update `AlertZone.tsx` to include urgent items in `atRisk` filter:

In `src/components/AlertZone.tsx`, update the filter:
```tsx
// BEFORE:
const atRisk = pantryItems.filter(
  item => item.state === 'low' || item.state === 'empty'
)

// AFTER:
const atRisk = pantryItems.filter(
  item => item.state === 'low' || item.state === 'empty' || item.urgent
)
```

**Step 5: Wire urgent flag into tomorrow suggestions scoring**

In `src/services/tomorrowSuggestions.ts`, the function receives `pantryItems: PantryItem[]`. Extract urgent ingredient names at the top (alongside `lowIngredients`):

```tsx
// After the existing lowIngredients/emptyIngredients/availableIngredients loop, add:
const urgentIngredients: string[] = pantryItems
  .filter(item => item.urgent)
  .map(item => getIngredientById(item.ingredientId)?.nameZh)
  .filter((n): n is string => !!n)
```

In the scoring section, add after the Priority 1 block:
```tsx
// Priority 0: Uses urgent (expiring soon) ingredients — highest priority
const usesUrgent = suggestion.matchedIngredients.filter((ing) =>
  urgentIngredients.includes(ing)
)
if (usesUrgent.length > 0) {
  score += 150 * usesUrgent.length
  reason = `⚡ ${usesUrgent[0]}快過期了`
  priority = 'high'
}
```

Place this block BEFORE the existing Priority 1 (`usesLow`) block so it can override `reason` and `priority`.

**Step 6: Verify build**
```bash
npm run build && npm run lint
```

**Step 7: Commit**
```bash
git add src/types/index.ts src/store/pantryStore.ts src/components/Chip.tsx src/features/pantry/PantryPage.tsx src/components/AlertZone.tsx src/services/tomorrowSuggestions.ts
git commit -m "feat: add expiry-pressure flag with urgency sort and suggestion boost"
```

---

## Suggestion Improvements

### Task 5: "Uses Your X" Label on Suggestion Cards

**What:** When a suggestion uses ingredients that are `low`, `empty`, or `urgent` in your pantry, show `→ 可以用掉：X、Y` on the card. Makes the waste-prevention value immediately visible.

**Files:**
- Modify: `src/features/suggestions/SuggestionsPage.tsx`
- Modify: `src/components/TomorrowCard.tsx`

**Step 1: Compute at-risk ingredient names in SuggestionsPage**

In `SuggestionsPage.tsx`, `pantryItems` is already read from the store. Add a helper near the top of the component:

```tsx
// After: const { pantryItems, updateState } = usePantryStore()
const atRiskNames = new Set(
  pantryItems
    .filter(item => item.state === 'low' || item.state === 'empty' || item.urgent)
    .map(item => {
      const ing = ingredients.find(i => i.id === item.ingredientId)
      return ing?.nameZh
    })
    .filter(Boolean) as string[]
)
```

**Step 2: Add "uses your X" line to SuggestionCard**

`SuggestionCard` currently receives `suggestion` as a prop. Pass `atRiskNames` as well:

```tsx
// Update SuggestionCard props interface:
function SuggestionCard({
  suggestion,
  onSelect,
  onAddToShopping,
  atRiskNames,
}: {
  suggestion: Suggestion
  onSelect: () => void
  onAddToShopping?: () => void
  atRiskNames?: Set<string>
}) {
```

Inside `SuggestionCard`, after the metadata line and before the ingredient chips, add:

```tsx
{(() => {
  const usesAtRisk = suggestion.matchedIngredients.filter(ing => atRiskNames?.has(ing))
  return usesAtRisk.length > 0 ? (
    <p className="text-xs text-[var(--color-primary)] mb-2">
      → 可以用掉：{usesAtRisk.join('、')}
    </p>
  ) : null
})()}
```

Update both `SuggestionCard` call sites (doable and near-miss sections) to pass `atRiskNames`:
```tsx
<SuggestionCard
  key={s.id}
  suggestion={s}
  onSelect={() => setSelectedRecipe(s)}
  atRiskNames={atRiskNames}
/>
```

**Step 3: Add to TomorrowCard**

`TomorrowCard` receives a `TomorrowSuggestion` which has `suggestion.matchedIngredients` and `reason`. The `reason` field from the scoring engine already contains the at-risk info (e.g., `⚡ 菠菜快過期了` or `菠菜可能快用完`). Surface `reason` more prominently:

In `src/components/TomorrowCard.tsx`, move `reason` above the metadata line:

```tsx
// BEFORE:
<h3 className="font-semibold mb-1 truncate">{recipe.title}</h3>
<p className="text-xs text-[var(--color-text-secondary)] mb-2">
  {recipe.cuisine} • {recipe.timeMinutes}分鐘
</p>
<p className="text-xs text-orange-600">{reason}</p>

// AFTER:
<p className="text-xs text-[var(--color-primary)] mb-1">{reason}</p>
<h3 className="font-semibold mb-1 truncate">{recipe.title}</h3>
<p className="text-xs text-[var(--color-text-secondary)]">
  {recipe.cuisine} • {recipe.timeMinutes}分鐘
</p>
```

Also remove the `priorityStyles` border-left — it uses saturated blues and oranges which violate the design system's "jade is the only saturated color" rule. Replace with uniform styling:

```tsx
// BEFORE:
const priorityStyles = {
  high: 'border-l-4 border-l-orange-500',
  medium: 'border-l-4 border-l-blue-500',
  low: 'border-l-4 border-l-gray-300',
}
// className={`${priorityStyles[priority]} min-w-[200px]`}

// AFTER: remove priorityStyles entirely, use uniform className:
// className="min-w-[200px]"
```

**Step 4: Verify build**
```bash
npm run build && npm run lint
```

**Step 5: Commit**
```bash
git add src/features/suggestions/SuggestionsPage.tsx src/components/TomorrowCard.tsx
git commit -m "suggestions: show 'uses your X' label for at-risk ingredients"
```

---

### Task 6: Post-Cook Success Flash

**What:** After `handleDeductionConfirm` runs (fridge state updated), show a brief `冰箱已更新 ✓` overlay that fades out after 2 seconds. Closes the feedback loop.

**Files:**
- Modify: `src/features/suggestions/SuggestionsPage.tsx`

**Step 1: Add success state**

In `SuggestionsPage`, after the existing state declarations, add:
```tsx
const [showSuccess, setShowSuccess] = useState(false)
```

**Step 2: Trigger success after deduction confirm**

In `handleDeductionConfirm`, after `handleCleanup()`:
```tsx
// BEFORE (end of handleDeductionConfirm):
handleCleanup()

// AFTER:
handleCleanup()
setShowSuccess(true)
setTimeout(() => setShowSuccess(false), 2000)
```

**Step 3: Render the flash overlay**

At the bottom of the return JSX, before the closing `</div>`:
```tsx
{/* Post-cook success flash */}
{showSuccess && (
  <div className="fixed bottom-20 left-0 right-0 flex justify-center pointer-events-none z-50">
    <div className="bg-[var(--color-text-primary)] text-white text-sm px-4 py-2 opacity-90">
      冰箱已更新 ✓
    </div>
  </div>
)}
```

Note: `pointer-events-none` so it doesn't block taps. `bottom-20` clears the bottom nav.

**Step 4: Verify build**
```bash
npm run build && npm run lint
```

**Step 5: Commit**
```bash
git add src/features/suggestions/SuggestionsPage.tsx
git commit -m "suggestions: show success flash after post-cook state update"
```

---

## Photo Scanning

### Task 7: Vercel Serverless Function `api/scan-fridge.ts`

**What:** Accepts a base64-encoded JPEG image. Calls GPT-4o vision API with the list of known ingredients. Returns detected ingredients with suggested states. Falls back to mock data if no API key.

**Files:**
- Create: `api/scan-fridge.ts`

**Step 1: Read `api/suggestions.ts` to understand the pattern**

Already read above. The pattern: check `OPENAI_API_KEY`, call OpenAI, return JSON, fall back to mock.

**Step 2: Create `api/scan-fridge.ts`**

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

interface ScanResult {
  ingredientId: string
  nameZh: string
  suggestedState: 'plenty' | 'some' | 'low'
  confidence: 'high' | 'medium' | 'low'
}

interface RequestBody {
  imageBase64: string  // data URL: "data:image/jpeg;base64,..."
  knownIngredients: { id: string; nameZh: string }[]
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { imageBase64, knownIngredients } = req.body as RequestBody

  if (!imageBase64) {
    return res.status(400).json({ error: 'No image provided' })
  }

  if (!OPENAI_API_KEY) {
    return res.json({ detected: getMockScanResults(knownIngredients) })
  }

  const ingredientList = knownIngredients.map(i => i.nameZh).join('、')

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',  // Must use gpt-4o for vision (not mini)
        messages: [
          {
            role: 'system',
            content: `你是冰箱掃描助理。分析冰箱照片，只回報以下已知食材清單中你看到的食材：${ingredientList}。
對每個可見食材，估計大約剩餘量：plenty（充足）、some（還有一些）、low（快沒了）。
若不確定某食材的量，使用 some。
只回報你確定看到的食材，不要猜測。
回傳 JSON 格式。`,
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: imageBase64, detail: 'low' },
              },
              {
                type: 'text',
                text: '請分析這張冰箱照片，回傳你看到的食材清單。格式：{"detected": [{"nameZh": "食材名", "suggestedState": "some", "confidence": "high"}]}',
              },
            ],
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content
    if (!content) throw new Error('No content')

    const parsed = JSON.parse(content) as { detected: { nameZh: string; suggestedState: string; confidence: string }[] }

    // Match AI output nameZh against known ingredients
    const matched: ScanResult[] = parsed.detected
      .map(item => {
        const known = knownIngredients.find(k =>
          k.nameZh === item.nameZh ||
          k.nameZh.includes(item.nameZh) ||
          item.nameZh.includes(k.nameZh)
        )
        if (!known) return null
        return {
          ingredientId: known.id,
          nameZh: known.nameZh,
          suggestedState: (['plenty', 'some', 'low'].includes(item.suggestedState)
            ? item.suggestedState
            : 'some') as ScanResult['suggestedState'],
          confidence: (['high', 'medium', 'low'].includes(item.confidence)
            ? item.confidence
            : 'medium') as ScanResult['confidence'],
        }
      })
      .filter((r): r is ScanResult => r !== null)

    return res.json({ detected: matched })
  } catch (error) {
    console.error('Scan error:', error)
    return res.json({ detected: getMockScanResults(knownIngredients) })
  }
}

function getMockScanResults(knownIngredients: { id: string; nameZh: string }[]): ScanResult[] {
  // Return first 3 known ingredients as mock scan results
  return knownIngredients.slice(0, 3).map((ing, i) => ({
    ingredientId: ing.id,
    nameZh: ing.nameZh,
    suggestedState: (['some', 'low', 'plenty'] as const)[i % 3],
    confidence: 'medium' as const,
  }))
}
```

**Step 3: Verify build (TypeScript check)**
```bash
npm run build && npm run lint
```

**Step 4: Commit**
```bash
git add api/scan-fridge.ts
git commit -m "feat: add scan-fridge Vercel function with GPT-4o vision"
```

---

### Task 8: FridgeScan Component (Camera + Review UI)

**What:** A full-page component that:
1. Shows a camera capture button (mobile file input)
2. Resizes the image client-side before sending (max 1024px, JPEG 80%)
3. Calls `/api/scan-fridge`
4. Shows the review list with detected ingredients and editable states
5. On confirm, applies `updateState` for each confirmed item

**Files:**
- Create: `src/features/scan/FridgeScanPage.tsx`

**Step 1: Create `src/features/scan/FridgeScanPage.tsx`**

```tsx
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePantryStore } from '../../store/pantryStore'
import { ingredients } from '../../data/ingredients'
import type { IngredientState } from '../../types'

type ScanResult = {
  ingredientId: string
  nameZh: string
  suggestedState: 'plenty' | 'some' | 'low'
  confidence: 'high' | 'medium' | 'low'
  accepted: boolean
  chosenState: IngredientState
}

const stateOptions: { value: IngredientState; label: string }[] = [
  { value: 'plenty', label: '充足' },
  { value: 'some', label: '還有' },
  { value: 'low', label: '快沒了' },
  { value: 'empty', label: '用完' },
]

async function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const MAX = 1024
      const ratio = Math.min(MAX / img.width, MAX / img.height, 1)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * ratio)
      canvas.height = Math.round(img.height * ratio)
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('No canvas context')); return }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }
    img.onerror = reject
    img.src = url
  })
}

export function FridgeScanPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { updateState, add } = usePantryStore()
  const [scanning, setScanning] = useState(false)
  const [results, setResults] = useState<ScanResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [applied, setApplied] = useState(false)

  const knownIngredients = ingredients.map(i => ({ id: i.id, nameZh: i.nameZh }))

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setScanning(true)
    setError(null)
    setResults(null)

    try {
      const imageBase64 = await resizeImage(file)
      const res = await fetch('/api/scan-fridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, knownIngredients }),
      })
      if (!res.ok) throw new Error(`API error ${res.status}`)
      const data = await res.json() as { detected: ScanResult[] }

      setResults(
        data.detected.map(item => ({
          ...item,
          accepted: true,
          chosenState: item.suggestedState,
        }))
      )
    } catch (err) {
      console.error(err)
      setError('掃描失敗，請重試')
    } finally {
      setScanning(false)
    }
  }

  const handleApply = () => {
    if (!results) return
    const accepted = results.filter(r => r.accepted)
    for (const item of accepted) {
      add(item.ingredientId)  // ensures item is in pantry
      updateState(item.ingredientId, item.chosenState)
    }
    setApplied(true)
    setTimeout(() => navigate('/'), 1200)
  }

  if (applied) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <p className="text-4xl mb-4">✓</p>
        <p className="text-[var(--color-text-secondary)]">冰箱已更新</p>
      </div>
    )
  }

  return (
    <div className="px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/')}
          className="text-[var(--color-text-secondary)] text-sm"
        >
          ← 返回
        </button>
        <h1 className="text-xl font-semibold">掃描冰箱</h1>
      </div>

      {/* Camera trigger */}
      {!results && !scanning && (
        <div className="flex flex-col items-center gap-4 py-8">
          <p className="text-sm text-[var(--color-text-secondary)] text-center">
            拍一張冰箱照片，自動辨識食材
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-[var(--color-primary)] text-white text-sm font-medium"
          >
            📷 拍照掃描
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
          <p className="text-xs text-[var(--color-text-secondary)] text-center mt-2">
            照片不會被儲存，僅用於辨識食材
          </p>
        </div>
      )}

      {/* Scanning state */}
      {scanning && (
        <div className="flex flex-col items-center gap-3 py-12">
          <p className="text-[var(--color-text-secondary)]">辨識中...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-8">
          <p className="text-[var(--color-error)] mb-4">{error}</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-sm text-[var(--color-primary)]"
          >
            重試
          </button>
        </div>
      )}

      {/* Review list */}
      {results && (
        <>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            辨識到 {results.filter(r => r.accepted).length} 項食材，確認後套用
          </p>

          {results.length === 0 && (
            <p className="text-center py-8 text-[var(--color-text-secondary)]">
              沒有辨識到已知食材，請再試一次
            </p>
          )}

          <div className="space-y-2 mb-6">
            {results.map((item, idx) => (
              <div
                key={item.ingredientId}
                className={`flex items-center gap-3 p-3 border ${
                  item.accepted ? 'border-gray-200' : 'border-gray-100 opacity-40'
                }`}
              >
                {/* Accept toggle */}
                <button
                  onClick={() => setResults(prev => prev!.map((r, i) =>
                    i === idx ? { ...r, accepted: !r.accepted } : r
                  ))}
                  className={`w-5 h-5 border-2 flex items-center justify-center shrink-0 ${
                    item.accepted
                      ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                      : 'border-gray-300'
                  }`}
                >
                  {item.accepted && '✓'}
                </button>

                {/* Name */}
                <span className="flex-1 text-sm font-medium">{item.nameZh}</span>

                {/* Confidence indicator */}
                {item.confidence === 'low' && (
                  <span className="text-xs text-[var(--color-text-secondary)]">?</span>
                )}

                {/* State selector */}
                <select
                  value={item.chosenState}
                  disabled={!item.accepted}
                  onChange={e => setResults(prev => prev!.map((r, i) =>
                    i === idx ? { ...r, chosenState: e.target.value as IngredientState } : r
                  ))}
                  className="text-sm border border-gray-200 px-2 py-1 bg-[var(--color-surface)]"
                >
                  {stateOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="fixed bottom-14 left-0 right-0 bg-[var(--color-background)] border-t border-gray-200 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <div className="flex gap-3">
              <button
                onClick={() => { setResults(null); setError(null) }}
                className="flex-1 py-3 border border-gray-200 text-sm text-[var(--color-text-secondary)]"
              >
                重拍
              </button>
              <button
                onClick={handleApply}
                disabled={!results.some(r => r.accepted)}
                className="flex-1 py-3 bg-[var(--color-primary)] text-white text-sm font-medium disabled:opacity-40"
              >
                套用 ({results.filter(r => r.accepted).length})
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
```

**Step 2: Verify build**
```bash
npm run build && npm run lint
```

**Step 3: Commit**
```bash
git add src/features/scan/FridgeScanPage.tsx
git commit -m "feat: add FridgeScanPage with camera capture and review UI"
```

---

### Task 9: Wire FridgeScanPage into Router + Entry Point

**What:** Register `/scan` route in App.tsx. Add a 📷 camera icon button to PantryPage header (next to the ⚙ gear icon).

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/features/pantry/PantryPage.tsx`

**Step 1: Add route in App.tsx**

```tsx
// Add import:
import { FridgeScanPage } from './features/scan/FridgeScanPage'

// Add route inside <Routes>:
<Route path="/scan" element={<FridgeScanPage />} />
```

**Step 2: Add camera button to PantryPage header**

The header currently has: `[title + subtitle]` on the left, `[⚙]` on the right. Add `[📷]` next to the gear icon:

```tsx
// BEFORE:
<button
  onClick={() => navigate('/preferences')}
  className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
  aria-label="設定"
>
  ⚙
</button>

// AFTER:
<div className="flex items-center gap-1">
  <button
    onClick={() => navigate('/scan')}
    className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
    aria-label="掃描冰箱"
  >
    📷
  </button>
  <button
    onClick={() => navigate('/preferences')}
    className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
    aria-label="設定"
  >
    ⚙
  </button>
</div>
```

**Step 3: Verify build + lint**
```bash
npm run build && npm run lint
```

**Step 4: Commit**
```bash
git add src/App.tsx src/features/pantry/PantryPage.tsx
git commit -m "feat: wire scan route and add camera button to home header"
```

---

## Final Verification

**Step 1: Full build + lint**
```bash
npm run build && npm run lint
```

**Step 2: Manual smoke test**
```bash
vercel dev
# or
npm run dev
```

Checklist:
- [ ] Home headline shifts to `該更新冰箱了` when data is 4+ days stale
- [ ] `冰箱狀態良好` appears when no items are low/empty/urgent (and pantry is not empty)
- [ ] Chip picker shows `↓ 用了一些` — tap it → state degrades one level
- [ ] Chip picker shows `⚡ 快過期` toggle — tap it → ⚡ appears on chip, item sorts to top
- [ ] Urgent items appear in AlertZone even if state is `some`/`plenty`
- [ ] Suggestion cards show `→ 可以用掉：X、Y` for at-risk ingredients
- [ ] TomorrowCard shows reason first, not recipe title first
- [ ] Post-cook deduction → `冰箱已更新 ✓` flash appears and disappears
- [ ] 📷 button in home header navigates to `/scan`
- [ ] `/scan` page: tap 📷 拍照掃描 → file picker opens
- [ ] Dev (no API key): review list shows 3 mock items
- [ ] Uncheck an item → it greys out
- [ ] Change state via select → updates locally
- [ ] Tap 套用 → navigates back to home, items updated in pantry

**Step 3: Finishing**

Use `superpowers:finishing-a-development-branch` to merge or create PR.
