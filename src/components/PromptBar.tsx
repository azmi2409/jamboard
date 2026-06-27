import { useEffect, useState, useRef } from 'react'

interface PromptBarProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (prompt: string) => void
}

export default function PromptBar({ isOpen, onClose, onSubmit }: PromptBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')

  useEffect(() => {
    if (isOpen) {
      setValue('')
      inputRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isModifier = e.metaKey || e.ctrlKey
      if (isModifier && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (isOpen) {
          onClose()
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    setValue('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/20 pt-32"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl"
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="text-lg">✨</span>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Describe a UI component or image..."
            className="flex-1 bg-transparent text-base text-neutral-900 placeholder-neutral-400 outline-none"
          />
          <button
            type="submit"
            disabled={!value.trim()}
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40"
          >
            Generate
          </button>
        </div>
        <div className="border-t border-neutral-100 bg-neutral-50 px-4 py-2 text-xs text-neutral-500">
          Press Enter to generate · Escape to close
        </div>
      </form>
    </div>
  )
}
