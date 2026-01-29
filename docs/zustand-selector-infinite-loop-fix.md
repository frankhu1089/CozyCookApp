# Zustand Selector Infinite Loop Fix

## The Problem

The app was stuck in an infinite re-render loop, causing a blank screen.

```tsx
// This selector was the culprit
export const selectSelectedIngredients = (state: PantryState) =>
  state.pantryItems.map((item) => item.ingredientId)

// Used like this
const selectedIngredients = usePantryStore(selectSelectedIngredients)
```

## Why It Happens

### Zustand's Default Behavior

Zustand uses **reference equality** (`===`) to determine if state changed:

```tsx
const prevResult = selector(prevState)
const nextResult = selector(nextState)

if (prevResult !== nextResult) {
  // Trigger re-render
}
```

### The Trap: `.map()` Creates New Arrays

Every time the selector runs, `.map()` creates a **new array object**:

```tsx
[1, 2, 3] === [1, 2, 3]  // false! Different references
```

Even if the contents are identical, they're different objects in memory.

### The Infinite Loop Sequence

```
1. Component renders
2. Selector runs → returns new array (reference A)
3. Zustand compares: undefined !== A → triggers re-render
4. Component renders again
5. Selector runs → returns new array (reference B)
6. Zustand compares: A !== B → triggers re-render
7. Repeat forever...
```

## The Solution: `useShallow`

`useShallow` from `zustand/react/shallow` performs **shallow comparison** instead of reference equality:

```tsx
import { useShallow } from 'zustand/react/shallow'

const selectedIngredients = usePantryStore(useShallow(state =>
  state.pantryItems.map(item => item.ingredientId)
))
```

### How Shallow Comparison Works

```tsx
// Reference equality (default)
[1, 2, 3] === [1, 2, 3]  // false

// Shallow equality (useShallow)
shallowEqual([1, 2, 3], [1, 2, 3])  // true
// Compares: arr1.length === arr2.length && arr1[0] === arr2[0] && ...
```

Now the loop breaks:

```
1. Component renders
2. Selector runs → returns [id1, id2]
3. Zustand shallow compares: undefined vs [id1, id2] → re-render
4. Component renders again
5. Selector runs → returns [id1, id2] (new array, same contents)
6. Zustand shallow compares: [id1, id2] ≈ [id1, id2] → NO re-render
7. Loop stops!
```

## When to Use `useShallow`

Use it when your selector returns:
- Arrays (from `.map()`, `.filter()`, etc.)
- Objects (from spreading `{ ...state.something }`)

Don't need it when returning:
- Primitives (strings, numbers, booleans)
- The same object reference from state

## Alternative Solutions

### 1. Memoize the Selector Result

Store the derived array in the state itself:

```tsx
// In store
selectedIds: string[]  // Pre-computed, updated when pantryItems changes
```

### 2. Use `useMemo` in Component

```tsx
const pantryItems = usePantryStore(state => state.pantryItems)
const selectedIngredients = useMemo(
  () => pantryItems.map(item => item.ingredientId),
  [pantryItems]
)
```

### 3. Custom Equality Function

```tsx
const selectedIngredients = usePantryStore(
  state => state.pantryItems.map(item => item.ingredientId),
  (a, b) => a.length === b.length && a.every((v, i) => v === b[i])
)
```

`useShallow` is the cleanest solution for most cases.

## Key Takeaways

1. **Selectors run on every render** - be careful what they return
2. **New references trigger re-renders** - even with identical contents
3. **Use `useShallow`** for derived arrays/objects
4. **Test after changes** - infinite loops cause blank screens with no obvious error
