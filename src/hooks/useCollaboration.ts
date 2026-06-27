import { useEffect, useState, useRef, useCallback } from 'react'
import type { CanvasElement, Point, Viewport } from '../canvas/types.ts'
import { getCollaborationDoc } from '../state/yjsDoc.ts'
import { setupAwareness, type UserAwareness } from '../state/awareness.ts'

interface UseCollaborationOptions {
  enabled?: boolean
  viewport: Viewport
}

export function useCollaboration({ enabled = true, viewport }: UseCollaborationOptions) {
  const [elements, setElements] = useState<CanvasElement[]>([])
  const [cursors, setCursors] = useState<UserAwareness[]>([])
  const collabRef = useRef<ReturnType<typeof getCollaborationDoc> | null>(null)
  const awarenessRef = useRef<ReturnType<typeof setupAwareness> | null>(null)

  useEffect(() => {
    if (!enabled) return

    const collab = getCollaborationDoc()
    collabRef.current = collab

    const updateElements = () => {
      setElements(collab.elements.toArray())
    }

    const updateCursors = () => {
      if (awarenessRef.current) {
        setCursors(awarenessRef.current.getRemoteCursors())
      }
    }

    collab.elements.observe(updateElements)
    updateElements()

    awarenessRef.current = setupAwareness(collab.awareness)
    collab.awareness.on('change', updateCursors)
    updateCursors()

    return () => {
      collab.elements.unobserve(updateElements)
      collab.awareness.off('change', updateCursors)
    }
  }, [enabled])

  const updateElements = useCallback((next: CanvasElement[]) => {
    const collab = collabRef.current
    if (!collab) return

    collab.doc.transact(() => {
      collab.elements.delete(0, collab.elements.length)
      collab.elements.push(next)
    })
  }, [])

  const updateCursor = useCallback(
    (screenPoint: Point) => {
      if (!awarenessRef.current) return
      const canvasPoint = {
        x: (screenPoint.x - viewport.x) / viewport.zoom,
        y: (screenPoint.y - viewport.y) / viewport.zoom,
      }
      awarenessRef.current.updateCursor(canvasPoint)
    },
    [viewport],
  )

  return { elements, updateElements, cursors, updateCursor }
}
