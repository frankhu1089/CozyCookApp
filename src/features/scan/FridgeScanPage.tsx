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
      const data = await res.json() as { detected: Omit<ScanResult, 'accepted' | 'chosenState'>[] }

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
      add(item.ingredientId)
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
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/')}
          className="text-[var(--color-text-secondary)] text-sm"
        >
          ← 返回
        </button>
        <h1 className="text-xl font-semibold">掃描冰箱</h1>
      </div>

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

      {scanning && (
        <div className="flex flex-col items-center gap-3 py-12">
          <p className="text-[var(--color-text-secondary)]">辨識中...</p>
        </div>
      )}

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

                <span className="flex-1 text-sm font-medium">{item.nameZh}</span>

                {item.confidence === 'low' && (
                  <span className="text-xs text-[var(--color-text-secondary)]">?</span>
                )}

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
