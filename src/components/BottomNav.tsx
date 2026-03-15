import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: '冰箱', icon: '🥬' },
  { to: '/suggestions', label: '建議', icon: '🍳' },
  { to: '/shopping', label: '清單', icon: '🛒' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
      <div className="flex h-14">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 text-xs
              ${isActive
                ? 'text-[var(--color-primary)]'
                : 'text-[var(--color-text-secondary)]'
              }`
            }
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
