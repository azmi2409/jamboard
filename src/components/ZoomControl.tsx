import { Minus, Plus } from 'lucide-react'

interface ZoomControlProps {
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
}

export default function ZoomControl({ zoom, onZoomIn, onZoomOut, onReset }: ZoomControlProps) {
  const percentage = Math.round(zoom * 100)

  return (
    <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1 rounded-xl border border-neutral-200 bg-white/95 p-1.5 shadow-lg backdrop-blur-sm">
      <button
        type="button"
        onClick={onZoomOut}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
        title="Zoom Out"
      >
        <Minus className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onReset}
        className="min-w-[50px] cursor-pointer rounded-lg px-1 py-1 text-center text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
        title="Reset Zoom"
      >
        {percentage}%
      </button>
      <button
        type="button"
        onClick={onZoomIn}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
        title="Zoom In"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}
