import type { VercelRequest, VercelResponse } from '@vercel/node'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

interface RequestBody {
  ingredients: string[]
  preferences: {
    cuisine: 'CN' | 'JP' | 'mixed'
    maxTime: number
    dietFlags: string[]
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { ingredients, preferences } = req.body as RequestBody

  if (!ingredients || ingredients.length === 0) {
    return res.status(400).json({ error: 'No ingredients provided' })
  }

  // If no API key, return mock data for development
  if (!OPENAI_API_KEY) {
    return res.json({ suggestions: getMockSuggestions(ingredients, preferences) })
  }

  try {
    const prompt = buildPrompt(ingredients, preferences)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `你是一個實用的家常料理助理，專精中式和日式料理。
根據使用者提供的食材，推薦適合的料理。
回傳 JSON 格式，包含 suggestions 陣列。
每個 suggestion 包含：id, title, cuisine, timeMinutes, difficulty, matchedIngredients, missingIngredients, steps, status。
status 為 "doable"（所有食材都有）或 "near-miss"（缺1-2種）。
steps 簡潔扼要，3-5步。`,
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('No content in response')
    }

    const parsed = JSON.parse(content)
    return res.json(parsed)
  } catch (error) {
    console.error('Error:', error)
    // Fallback to mock data on error
    return res.json({ suggestions: getMockSuggestions(ingredients, preferences) })
  }
}

function buildPrompt(ingredients: string[], preferences: RequestBody['preferences']) {
  const cuisineMap = {
    CN: '中式',
    JP: '日式',
    mixed: '中式或日式',
  }

  return `
我有這些食材：${ingredients.join('、')}

偏好：
- 料理風格：${cuisineMap[preferences.cuisine]}
- 最長時間：${preferences.maxTime} 分鐘
${preferences.dietFlags.length > 0 ? `- 飲食限制：${preferences.dietFlags.join('、')}` : ''}

請推薦 3-5 道料理，優先推薦「立即可做」(status: doable) 的菜色，再推薦「只差一點」(status: near-miss) 的菜色。

回傳格式：
{
  "suggestions": [
    {
      "id": "unique-id",
      "title": "料理名稱",
      "cuisine": "日式",
      "timeMinutes": 25,
      "difficulty": "easy",
      "matchedIngredients": ["雞腿", "蛋"],
      "missingIngredients": [],
      "steps": ["步驟1", "步驟2", "步驟3"],
      "status": "doable"
    }
  ]
}
`
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getMockSuggestions(ingredients: string[], _preferences: RequestBody['preferences']) {
  const hasEgg = ingredients.some(i => i.includes('蛋'))
  const hasChicken = ingredients.some(i => i.includes('雞'))
  const hasVegetable = ingredients.some(i =>
    i.includes('菜') || i.includes('蔥') || i.includes('蘿蔔')
  )

  const suggestions = []

  if (hasChicken && hasEgg) {
    suggestions.push({
      id: '1',
      title: '親子丼',
      cuisine: '日式',
      timeMinutes: 25,
      difficulty: 'easy',
      matchedIngredients: ingredients.filter(i => i.includes('雞') || i.includes('蛋')),
      missingIngredients: ['洋蔥', '醬油', '味醂'],
      steps: [
        '洋蔥切絲，雞腿切塊',
        '熱鍋下油，炒洋蔥至軟',
        '加雞肉炒至變色',
        '加醬油、味醂、高湯煮5分鐘',
        '淋上打散的蛋，蓋鍋悶1分鐘',
      ],
      status: 'near-miss' as const,
    })
  }

  if (hasVegetable && hasEgg) {
    suggestions.push({
      id: '2',
      title: '青菜炒蛋',
      cuisine: '中式',
      timeMinutes: 10,
      difficulty: 'easy',
      matchedIngredients: ingredients.filter(i => i.includes('蛋') || i.includes('菜')),
      missingIngredients: [],
      steps: [
        '青菜洗淨切段',
        '蛋打散加少許鹽',
        '熱鍋下油，炒蛋至半熟盛起',
        '同鍋炒青菜，加入蛋拌炒',
        '調味後起鍋',
      ],
      status: 'doable' as const,
    })
  }

  if (hasChicken) {
    suggestions.push({
      id: '3',
      title: '照燒雞腿',
      cuisine: '日式',
      timeMinutes: 30,
      difficulty: 'medium',
      matchedIngredients: ingredients.filter(i => i.includes('雞')),
      missingIngredients: ['味醂', '清酒'],
      steps: [
        '雞腿用叉子戳洞，幫助入味',
        '熱鍋，雞皮朝下煎至金黃',
        '翻面煎熟',
        '加入醬油、味醂、糖，收汁',
        '切片裝盤',
      ],
      status: 'near-miss' as const,
    })
  }

  // Always add a simple suggestion
  suggestions.push({
    id: '4',
    title: '蒜炒時蔬',
    cuisine: '中式',
    timeMinutes: 10,
    difficulty: 'easy',
    matchedIngredients: ingredients.slice(0, 2),
    missingIngredients: [],
    steps: [
      '蔬菜洗淨切好',
      '蒜頭切末',
      '熱鍋下油爆香蒜末',
      '下蔬菜大火快炒',
      '加鹽調味即可',
    ],
    status: 'doable' as const,
  })

  return suggestions
}
