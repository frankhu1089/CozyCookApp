import { usePreferencesStore } from '../../store/preferencesStore'

const cuisineOptions = [
  { value: 'CN', label: '中式' },
  { value: 'JP', label: '日式' },
  { value: 'mixed', label: '都可以' },
] as const

const timeOptions = [15, 30, 60] as const

const dietOptions = [
  { value: 'lowOil', label: '少油' },
  { value: 'vegetarian', label: '素食' },
  { value: 'lowCarb', label: '無澱粉' },
]

export function PreferencesPage() {
  const {
    cuisines,
    maxTime,
    dietFlags,
    setCuisines,
    setMaxTime,
    toggleDietFlag,
  } = usePreferencesStore()

  const currentCuisine = cuisines[0] || 'mixed'

  return (
    <div className="px-4 pt-6 pb-20">
      <h1 className="text-2xl font-semibold mb-6">料理偏好</h1>

      {/* Cuisine */}
      <section className="mb-6">
        <h2 className="text-sm font-medium text-[var(--color-text-secondary)] mb-3">
          料理風格
        </h2>
        <div className="flex gap-2">
          {cuisineOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setCuisines([opt.value])}
              className={`
                flex-1 py-2.5 rounded-lg text-sm font-medium transition-all
                ${currentCuisine === opt.value
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-gray-200'
                }
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Time */}
      <section className="mb-6">
        <h2 className="text-sm font-medium text-[var(--color-text-secondary)] mb-3">
          可用時間
        </h2>
        <div className="flex gap-2">
          {timeOptions.map((time) => (
            <button
              key={time}
              onClick={() => setMaxTime(time)}
              className={`
                flex-1 py-2.5 rounded-lg text-sm font-medium transition-all
                ${maxTime === time
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-gray-200'
                }
              `}
            >
              {time}分鐘
            </button>
          ))}
        </div>
      </section>

      {/* Diet Flags */}
      <section className="mb-6">
        <h2 className="text-sm font-medium text-[var(--color-text-secondary)] mb-3">
          飲食限制（可多選）
        </h2>
        <div className="flex flex-wrap gap-2">
          {dietOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => toggleDietFlag(opt.value)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${dietFlags.includes(opt.value)
                  ? 'bg-[var(--color-secondary)] text-white'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-gray-200'
                }
              `}
            >
              {dietFlags.includes(opt.value) ? '✓ ' : ''}{opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Info */}
      <div className="bg-[var(--color-surface)] rounded-xl p-4 border border-gray-100">
        <p className="text-sm text-[var(--color-text-secondary)]">
          💡 設定會自動儲存，下次開啟時會保留你的偏好。
        </p>
      </div>
    </div>
  )
}
