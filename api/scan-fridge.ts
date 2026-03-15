import type { VercelRequest, VercelResponse } from '@vercel/node'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

interface ScanResult {
  ingredientId: string
  nameZh: string
  suggestedState: 'plenty' | 'some' | 'low'
  confidence: 'high' | 'medium' | 'low'
}

interface RequestBody {
  imageBase64: string
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
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `你是冰箱掃描助理。分析冰箱照片，只回報以下已知食材清單中你看到的食材：${ingredientList}。對每個可見食材，估計大約剩餘量：plenty（充足）、some（還有一些）、low（快沒了）。若不確定某食材的量，使用 some。只回報你確定看到的食材，不要猜測。回傳 JSON 格式。`,
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

    const data = await response.json() as {
      choices: [{ message: { content: string } }]
    }
    const content = data.choices[0]?.message?.content
    if (!content) throw new Error('No content')

    const parsed = JSON.parse(content) as {
      detected: { nameZh: string; suggestedState: string; confidence: string }[]
    }

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
  return knownIngredients.slice(0, 3).map((ing, i) => ({
    ingredientId: ing.id,
    nameZh: ing.nameZh,
    suggestedState: (['some', 'low', 'plenty'] as const)[i % 3],
    confidence: 'medium' as const,
  }))
}
