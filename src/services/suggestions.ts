import type { Suggestion } from '../types'

interface SuggestionsRequest {
  ingredients: string[]
  preferences: {
    cuisine: 'CN' | 'JP' | 'mixed'
    maxTime: number
    dietFlags: string[]
    excludedIngredients?: string[]
  }
}

export async function fetchSuggestions(request: SuggestionsRequest): Promise<Suggestion[]> {
  // In development without API, use mock data
  if (import.meta.env.DEV && !import.meta.env.VITE_USE_API) {
    await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate loading
    return getMockSuggestions(request.ingredients, request.preferences)
  }

  const res = await fetch('/api/suggestions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!res.ok) {
    throw new Error('Failed to fetch suggestions')
  }

  const data = await res.json()
  return data.suggestions || []
}

function getMockSuggestions(ingredients: string[], preferences: SuggestionsRequest['preferences']): Suggestion[] {
  const hasEgg = ingredients.some(i => i.includes('蛋'))
  const hasChicken = ingredients.some(i => i.includes('雞'))
  const hasVegetable = ingredients.some(i =>
    i.includes('菜') || i.includes('蔥') || i.includes('蘿蔔') || i.includes('洋蔥')
  )
  const hasPork = ingredients.some(i => i.includes('豬'))
  const hasTofu = ingredients.some(i => i.includes('豆腐'))

  const suggestions: Suggestion[] = []

  // 親子丼
  if (hasChicken && hasEgg) {
    suggestions.push({
      id: '1',
      title: '親子丼',
      cuisine: '日式',
      timeMinutes: 25,
      difficulty: 'easy',
      matchedIngredients: ['雞腿', '蛋'],
      missingIngredients: ['洋蔥'],
      steps: [
        '洋蔥切絲，雞腿切塊',
        '熱鍋下油，炒洋蔥至軟',
        '加雞肉炒至變色',
        '加醬油、味醂、高湯煮5分鐘',
        '淋上打散的蛋，蓋鍋悶1分鐘',
      ],
      status: ingredients.some(i => i.includes('洋蔥')) ? 'doable' : 'near-miss',
    })
  }

  // 青菜炒蛋
  if (hasVegetable && hasEgg) {
    suggestions.push({
      id: '2',
      title: '青菜炒蛋',
      cuisine: '中式',
      timeMinutes: 10,
      difficulty: 'easy',
      matchedIngredients: ['蛋', '青菜'],
      missingIngredients: [],
      steps: [
        '青菜洗淨切段',
        '蛋打散加少許鹽',
        '熱鍋下油，炒蛋至半熟盛起',
        '同鍋炒青菜，加入蛋拌炒',
        '調味後起鍋',
      ],
      status: 'doable',
    })
  }

  // 照燒雞腿
  if (hasChicken) {
    suggestions.push({
      id: '3',
      title: '照燒雞腿',
      cuisine: '日式',
      timeMinutes: 30,
      difficulty: 'medium',
      matchedIngredients: ['雞腿'],
      missingIngredients: ['味醂'],
      steps: [
        '雞腿用叉子戳洞，幫助入味',
        '熱鍋，雞皮朝下煎至金黃',
        '翻面煎熟',
        '加入醬油、味醂、糖，收汁',
        '切片裝盤',
      ],
      status: 'near-miss',
    })
  }

  // 番茄炒蛋
  if (hasEgg && ingredients.some(i => i.includes('番茄'))) {
    suggestions.push({
      id: '4',
      title: '番茄炒蛋',
      cuisine: '中式',
      timeMinutes: 15,
      difficulty: 'easy',
      matchedIngredients: ['蛋', '番茄'],
      missingIngredients: [],
      steps: [
        '番茄切塊，蛋打散',
        '熱鍋下油，炒蛋至半熟盛起',
        '同鍋炒番茄出汁',
        '加入蛋、糖、鹽調味',
        '拌勻後起鍋',
      ],
      status: 'doable',
    })
  }

  // 紅燒肉
  if (hasPork) {
    suggestions.push({
      id: '5',
      title: '紅燒肉',
      cuisine: '中式',
      timeMinutes: 60,
      difficulty: 'medium',
      matchedIngredients: ['五花肉'],
      missingIngredients: ['冰糖'],
      steps: [
        '五花肉切塊，冷水下鍋汆燙',
        '熱鍋炒糖色',
        '下肉塊炒至上色',
        '加醬油、料酒、水燉煮40分鐘',
        '大火收汁即可',
      ],
      status: 'near-miss',
    })
  }

  // 麻婆豆腐
  if (hasTofu) {
    suggestions.push({
      id: '6',
      title: '麻婆豆腐',
      cuisine: '中式',
      timeMinutes: 20,
      difficulty: 'easy',
      matchedIngredients: ['豆腐'],
      missingIngredients: ingredients.some(i => i.includes('絞肉')) ? [] : ['豬絞肉'],
      steps: [
        '豆腐切塊，用熱水燙過',
        '熱鍋炒香絞肉',
        '加入豆瓣醬炒出紅油',
        '加水和豆腐燉煮',
        '勾芡，撒上蔥花和花椒粉',
      ],
      status: ingredients.some(i => i.includes('絞肉')) ? 'doable' : 'near-miss',
    })
  }

  // 蒜炒時蔬 (always available)
  if (hasVegetable) {
    suggestions.push({
      id: '7',
      title: '蒜炒時蔬',
      cuisine: '中式',
      timeMinutes: 10,
      difficulty: 'easy',
      matchedIngredients: ingredients.filter(i =>
        i.includes('菜') || i.includes('蘿蔔') || i.includes('花椰')
      ),
      missingIngredients: [],
      steps: [
        '蔬菜洗淨切好',
        '蒜頭切末',
        '熱鍋下油爆香蒜末',
        '下蔬菜大火快炒',
        '加鹽調味即可',
      ],
      status: 'doable',
    })
  }

  // Filter by preferences
  let filtered = suggestions

  if (preferences.cuisine !== 'mixed') {
    const cuisineMap: Record<string, string> = { CN: '中式', JP: '日式' }
    const targetCuisine = cuisineMap[preferences.cuisine]
    if (targetCuisine) {
      filtered = filtered.filter(s => s.cuisine === targetCuisine)
    }
  }

  filtered = filtered.filter(s => s.timeMinutes <= preferences.maxTime)

  // Filter by excluded ingredients
  const excluded = preferences.excludedIngredients || []
  if (excluded.length > 0) {
    filtered = filtered.filter(s => {
      const allIngredients = [...s.matchedIngredients, ...s.missingIngredients]
      return !allIngredients.some(ing =>
        excluded.some(ex => ing.includes(ex) || ex.includes(ing))
      )
    })
  }

  // Sort: doable first, then by time
  filtered.sort((a, b) => {
    if (a.status === 'doable' && b.status !== 'doable') return -1
    if (a.status !== 'doable' && b.status === 'doable') return 1
    return a.timeMinutes - b.timeMinutes
  })

  return filtered.slice(0, 6)
}
