import { usePreferencesStore } from '../../store/preferencesStore'
import { HouseholdSettings } from './HouseholdSettings'

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
    notificationsEnabled,
    setCuisines,
    setMaxTime,
    toggleDietFlag,
    toggleNotifications,
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

      {/* Notifications */}
      <section className="mb-6">
        <h2 className="text-sm font-medium text-[var(--color-text-secondary)] mb-3">
          提醒通知
        </h2>
        <label className="flex items-center justify-between p-4 bg-[var(--color-surface)] rounded-xl cursor-pointer">
          <div>
            <span className="font-medium">每日建議提醒</span>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              早上提醒你今天可以煮什麼
            </p>
          </div>
          <button
            onClick={toggleNotifications}
            className={`
              relative w-12 h-6 rounded-full transition-colors
              ${notificationsEnabled ? 'bg-[var(--color-primary)]' : 'bg-gray-300'}
            `}
          >
            <span
              className={`
                absolute top-1 w-4 h-4 bg-white rounded-full transition-transform
                ${notificationsEnabled ? 'left-7' : 'left-1'}
              `}
            />
          </button>
        </label>
      </section>

      {/* Household Sharing */}
      <section className="mb-6">
        <h2 className="text-sm font-medium text-[var(--color-text-secondary)] mb-3">
          家庭共享
        </h2>
        <HouseholdSettings />
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
