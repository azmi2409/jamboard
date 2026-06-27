import type { UserAwareness } from '../state/awareness.ts'

interface CursorsOverlayProps {
  cursors: UserAwareness[]
  viewport: { x: number; y: number; zoom: number }
}

export default function CursorsOverlay({ cursors, viewport }: CursorsOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {cursors.map((cursor) => {
        const screenX = cursor.x * viewport.zoom + viewport.x
        const screenY = cursor.y * viewport.zoom + viewport.y
        return (
          <div
            key={cursor.id}
            className="absolute flex items-start gap-1"
            style={{
              left: screenX,
              top: screenY,
              transform: 'translate(2px, 2px)',
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              style={{ color: cursor.color }}
              className="drop-shadow-sm"
            >
              <path
                d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.45.45 0 0 0 .32-.77L6.18 2.86a.5.5 0 0 0-.68.35Z"
                fill="currentColor"
                stroke="white"
                strokeWidth="1.5"
              />
            </svg>
            <span
              className="mt-3 rounded px-1.5 py-0.5 text-xs font-medium text-white shadow-sm"
              style={{ backgroundColor: cursor.color }}
            >
              {cursor.name}
            </span>
          </div>
        )
      })}
    </div>
  )
}
