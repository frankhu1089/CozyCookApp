import type { IngredientState, ConsumptionLevel } from '../types'

export type ServingSize = '1-2' | '3-4'

// State ordering for decrement calculations
const STATE_ORDER: IngredientState[] = ['plenty', 'some', 'low', 'empty']

function decrementState(current: IngredientState, steps: number): IngredientState {
  if (current === 'unknown' || current === 'empty') {
    return current
  }

  const currentIndex = STATE_ORDER.indexOf(current)
  const newIndex = Math.min(currentIndex + steps, STATE_ORDER.length - 1)
  return STATE_ORDER[newIndex]
}

/**
 * Infer new ingredient state after cooking
 *
 * Rule table:
 * consumption | 1-2人 | 3-4人
 * low         | same  | -1
 * medium      | -1    | -2
 * high        | -2    | empty
 */
export function inferNewState(
  currentState: IngredientState,
  consumption: ConsumptionLevel,
  servings: ServingSize
): IngredientState {
  if (currentState === 'unknown') {
    // For unknown state, assume "some" and apply rules
    return inferNewState('some', consumption, servings)
  }

  if (currentState === 'empty') {
    return 'empty'
  }

  let decrementSteps: number

  if (consumption === 'low') {
    decrementSteps = servings === '1-2' ? 0 : 1
  } else if (consumption === 'medium') {
    decrementSteps = servings === '1-2' ? 1 : 2
  } else {
    // high consumption
    decrementSteps = servings === '1-2' ? 2 : 3 // 3 = goes to empty
  }

  return decrementState(currentState, decrementSteps)
}
