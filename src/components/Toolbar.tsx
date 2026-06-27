import type { Tool } from '../canvas/types.ts'
import {
  MousePointer2,
  Square,
  Circle,
  ArrowRight,
  Minus,
  Pencil,
  Type,
  Sparkles,
  Pen,
  PenLine,
  FilePlus,
  LayoutGrid,
} from 'lucide-react'

interface ToolbarProps {
  activeTool: Tool
  roughness: number
  onSelectTool: (tool: Tool) => void
  onRoughnessChange: (roughness: number) => void
  onNew: () => void
  onAIButtonClick: () => void
}

const tools: { id: Tool; label: string; icon: React.ComponentType<{ className?: string; size?: number }>; shortcut?: string }[] = [
  { id: 'select', label: 'Select', icon: MousePointer2, shortcut: 'V' },
  { id: 'rectangle', label: 'Rectangle', icon: Square, shortcut: 'R' },
  { id: 'ellipse', label: 'Ellipse', icon: Circle, shortcut: 'E' },
  { id: 'arrow', label: 'Arrow', icon: ArrowRight, shortcut: 'A' },
  { id: 'line', label: 'Line', icon: Minus, shortcut: 'L' },
  { id: 'freehand', label: 'Draw', icon: Pencil, shortcut: 'D' },
  { id: 'text', label: 'Text', icon: Type, shortcut: 'T' },
]

export default function Toolbar({ activeTool, roughness, onSelectTool, onRoughnessChange, onNew, onAIButtonClick }: ToolbarProps) {
  return (
    <div className="absolute top-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-neutral-200 bg-white/95 p-1.5 shadow-lg backdrop-blur-sm">
      <div className="flex items-center gap-2 px-2 py-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-yellow-400 to-orange-500">
          <LayoutGrid className="h-4 w-4 text-white" />
        </div>
        <span className="hidden text-sm font-bold text-neutral-800 sm:inline">Jamboard</span>
      </div>
      <div className="mx-1 h-6 w-px bg-neutral-200" />
      <button
        type="button"
        onClick={onNew}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
        title="New Canvas"
      >
        <FilePlus className="h-4 w-4" size={16} />
        <span className="hidden sm:inline">New</span>
      </button>
      <div className="mx-1 h-6 w-px bg-neutral-200" />
      {tools.map((t) => {
        const Icon = t.icon
        const isActive = activeTool === t.id
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelectTool(t.id)}
            className={[
              'flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
            ].join(' ')}
            title={`${t.label} (${t.shortcut})`}
          >
            <Icon className="h-4 w-4" size={16} />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        )
      })}
      <div className="mx-1 h-6 w-px bg-neutral-200" />
      <button
        type="button"
        onClick={() => onRoughnessChange(roughness === 0 ? 1 : 0)}
        className={[
          'flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
          roughness === 0
            ? 'bg-neutral-900 text-white'
            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
        ].join(' ')}
        title={roughness === 0 ? 'Fine (click for rough)' : 'Rough (click for fine)'}
      >
        {roughness === 0 ? <PenLine className="h-4 w-4" size={16} /> : <Pen className="h-4 w-4" size={16} />}
        <span className="hidden sm:inline">{roughness === 0 ? 'Fine' : 'Rough'}</span>
      </button>
      <div className="mx-1 h-6 w-px bg-neutral-200" />
      <button
        type="button"
        onClick={onAIButtonClick}
        className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 py-2 text-sm font-medium text-white hover:opacity-90"
        title="AI Generate (Cmd/Ctrl + K)"
      >
        <Sparkles className="h-4 w-4" size={16} />
        <span className="hidden sm:inline">AI</span>
      </button>
    </div>
  )
}
