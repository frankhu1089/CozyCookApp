import { useState } from 'react'
import { Button } from './Button'
import type { ServingSize } from '../services/stateInference'

interface ServingPromptProps {
  onConfirm: (servings: ServingSize) => void
  onSkip: () => void
}

export function ServingPrompt({ onConfirm, onSkip }: ServingPromptProps) {
  const [selected, setSelected] = useState<ServingSize>('1-2')

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-[var(--color-surface)] rounded-2xl p-6 w-full max-w-sm">
        <h3 className="text-lg font-semibold mb-4 text-center">
          你這道大概煮了幾人份？
        </h3>

        <div className="space-y-3 mb-6">
          <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="servings"
              value="1-2"
              checked={selected === '1-2'}
              onChange={() => setSelected('1-2')}
              className="w-4 h-4 text-[var(--color-primary)]"
            />
            <span>1–2 人</span>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="servings"
              value="3-4"
              checked={selected === '3-4'}
              onChange={() => setSelected('3-4')}
              className="w-4 h-4 text-[var(--color-primary)]"
            />
            <span>3–4 人</span>
          </label>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onSkip}>
            跳過
          </Button>
          <Button fullWidth onClick={() => onConfirm(selected)}>
            更新冰箱狀態
          </Button>
        </div>
      </div>
    </div>
  )
}
