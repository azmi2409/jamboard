import type { Tool } from '../canvas/types.ts'

interface ToolbarProps {
  activeTool: Tool
  onSelectTool: (tool: Tool) => void
  onAIButtonClick: () => void
}

const tools: { id: Tool; label: string; shortcut?: string }[] = [
  { id: 'select', label: 'Select', shortcut: 'V' },
  { id: 'rectangle', label: 'Rectangle', shortcut: 'R' },
  { id: 'ellipse', label: 'Ellipse', shortcut: 'E' },
  { id: 'arrow', label: 'Arrow', shortcut: 'A' },
  { id: 'line', label: 'Line', shortcut: 'L' },
  { id: 'freehand', label: 'Draw', shortcut: 'D' },
  { id: 'text', label: 'Text', shortcut: 'T' },
]

export default function Toolbar({ activeTool, onSelectTool, onAIButtonClick }: ToolbarProps) {
  return (
    <div className="absolute top-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-lg border border-neutral-200 bg-white/90 p-1.5 shadow-md backdrop-blur-sm">
      {tools.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onSelectTool(t.id)}
          className={[
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            activeTool === t.id
              ? 'bg-neutral-900 text-white'
              : 'text-neutral-700 hover:bg-neutral-100',
          ].join(' ')}
          title={`${t.label} (${t.shortcut})`}
        >
          {t.label}
        </button>
      ))}
      <div className="mx-1 h-5 w-px bg-neutral-200" />
      <button
        type="button"
        onClick={onAIButtonClick}
        className="rounded-md bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
        title="AI Generate (Cmd/Ctrl + K)"
      >
        AI
      </button>
    </div>
  )
}
