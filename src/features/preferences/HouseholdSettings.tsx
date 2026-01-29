import { useState } from 'react'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { useHouseholdStore } from '../../store/householdStore'

export function HouseholdSettings() {
  const { household, inviteCode, isEnabled, loading, error, createHousehold, joinHousehold, leaveHousehold, setError } =
    useHouseholdStore()
  const [showJoinInput, setShowJoinInput] = useState(false)
  const [showCreateInput, setShowCreateInput] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [copied, setCopied] = useState(false)

  if (!isEnabled) {
    return (
      <Card className="mb-4">
        <h3 className="font-medium mb-2">家庭共享</h3>
        <p className="text-sm text-[var(--color-text-secondary)]">
          需要設定 Firebase 才能使用共享功能
        </p>
      </Card>
    )
  }

  const handleCopyCode = async () => {
    if (inviteCode) {
      await navigator.clipboard.writeText(inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCreate = async () => {
    if (!inputValue.trim()) return
    const success = await createHousehold(inputValue.trim())
    if (success) {
      setInputValue('')
      setShowCreateInput(false)
    }
  }

  const handleJoin = async () => {
    if (!inputValue.trim()) return
    const success = await joinHousehold(inputValue.trim())
    if (success) {
      setInputValue('')
      setShowJoinInput(false)
    }
  }

  if (household) {
    return (
      <Card className="mb-4">
        <h3 className="font-medium mb-2">家庭共享</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-secondary)]">家庭名稱</span>
            <span className="font-medium">{household.name}</span>
          </div>

          {inviteCode && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-secondary)]">邀請碼</span>
              <button
                onClick={handleCopyCode}
                className="font-mono text-lg tracking-wider bg-gray-100 px-3 py-1 rounded"
              >
                {inviteCode}
              </button>
            </div>
          )}

          {copied && (
            <p className="text-sm text-[var(--color-success)] text-center">已複製！</p>
          )}

          <p className="text-xs text-[var(--color-text-secondary)]">
            共享採買清單和明日建議給家人
          </p>

          <Button
            variant="secondary"
            fullWidth
            onClick={leaveHousehold}
          >
            離開家庭
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="mb-4">
      <h3 className="font-medium mb-2">家庭共享</h3>
      <p className="text-sm text-[var(--color-text-secondary)] mb-4">
        與家人共享採買清單和明日建議
      </p>

      {error && (
        <p className="text-sm text-[var(--color-error)] mb-3">{error}</p>
      )}

      {showCreateInput ? (
        <div className="space-y-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="家庭名稱"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg"
          />
          <div className="flex gap-2">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                setShowCreateInput(false)
                setInputValue('')
                setError(null)
              }}
            >
              取消
            </Button>
            <Button
              fullWidth
              onClick={handleCreate}
              disabled={loading || !inputValue.trim()}
            >
              {loading ? '建立中...' : '建立'}
            </Button>
          </div>
        </div>
      ) : showJoinInput ? (
        <div className="space-y-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.toUpperCase())}
            placeholder="輸入邀請碼"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg font-mono text-center tracking-wider"
            maxLength={6}
          />
          <div className="flex gap-2">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                setShowJoinInput(false)
                setInputValue('')
                setError(null)
              }}
            >
              取消
            </Button>
            <Button
              fullWidth
              onClick={handleJoin}
              disabled={loading || inputValue.length < 6}
            >
              {loading ? '加入中...' : '加入'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setShowJoinInput(true)}
          >
            加入家庭
          </Button>
          <Button
            fullWidth
            onClick={() => setShowCreateInput(true)}
          >
            建立家庭
          </Button>
        </div>
      )}
    </Card>
  )
}
