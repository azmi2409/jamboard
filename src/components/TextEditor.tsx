import { useEffect, useRef } from 'react'

interface TextEditorProps {
  text: string
  x: number
  y: number
  width: number
  height: number
  fontSize?: number
  color?: string
  viewport: { x: number; y: number; zoom: number }
  onSubmit: (text: string) => void
  onCancel: () => void
}

export default function TextEditor({
  text,
  x,
  y,
  width,
  height,
  fontSize = 24,
  color = '#1e1e1e',
  viewport,
  onSubmit,
  onCancel,
}: TextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (el) {
      el.focus()
      el.select()
    }
  }, [])

  const screenX = x * viewport.zoom + viewport.x
  const screenY = y * viewport.zoom + viewport.y
  const screenWidth = width * viewport.zoom
  const screenHeight = height * viewport.zoom
  const screenFontSize = fontSize * viewport.zoom

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      onCancel()
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit(e.currentTarget.value)
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    onSubmit(e.currentTarget.value)
  }

  return (
    <textarea
      ref={textareaRef}
      defaultValue={text}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className="absolute resize-none overflow-hidden border-2 border-blue-500 bg-white/90 outline-none backdrop-blur-sm"
      style={{
        left: screenX,
        top: screenY,
        width: Math.max(screenWidth, 80),
        height: Math.max(screenHeight, 32),
        fontSize: screenFontSize,
        color,
        fontFamily: 'system-ui, sans-serif',
        lineHeight: 1.2,
        padding: '4px',
        borderRadius: '4px',
        zIndex: 50,
      }}
    />
  )
}
