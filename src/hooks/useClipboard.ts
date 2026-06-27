import { useCallback, useRef } from 'react'
import type { CanvasElement } from '../canvas/types.ts'
import { generateId } from '../canvas/math.ts'

const PASTE_OFFSET = 20

export function useClipboard(
  elements: CanvasElement[],
  selectedIds: Set<string>,
  onElementsChange: (elements: CanvasElement[]) => void,
) {
  const clipboardRef = useRef<CanvasElement[]>([])

  const copy = useCallback(() => {
    const selected = elements.filter((el) => selectedIds.has(el.id))
    clipboardRef.current = selected
  }, [elements, selectedIds])

  const paste = useCallback(() => {
    if (clipboardRef.current.length === 0) return []

    const idMap = new Map<string, string>()
    const newElements = clipboardRef.current.map((el) => {
      const newId = generateId()
      idMap.set(el.id, newId)
      return {
        ...el,
        id: newId,
        x: el.x + PASTE_OFFSET,
        y: el.y + PASTE_OFFSET,
        version: 1,
        groupChildren: el.groupChildren?.map((childId) => idMap.get(childId) || childId),
      }
    })

    const allElements = [...elements, ...newElements]
    onElementsChange(allElements)

    const newIds = new Set(newElements.map((el) => el.id))
    return Array.from(newIds)
  }, [elements, onElementsChange])

  const cut = useCallback(() => {
    copy()
    const remaining = elements.filter((el) => !selectedIds.has(el.id))
    onElementsChange(remaining)
    return []
  }, [copy, elements, selectedIds, onElementsChange])

  return { copy, paste, cut }
}
