import { useCallback, useRef, useState } from 'react'
import type { CanvasElement } from '../canvas/types.ts'

const MAX_HISTORY = 100

export function useHistory(initialElements: CanvasElement[] = []) {
  const [elements, setElements] = useState<CanvasElement[]>(initialElements)
  const elementsRef = useRef<CanvasElement[]>(initialElements)
  const historyRef = useRef<CanvasElement[][]>([initialElements])
  const indexRef = useRef(0)

  const push = useCallback((newElements: CanvasElement[] | ((prev: CanvasElement[]) => CanvasElement[])) => {
    const next = typeof newElements === 'function' ? newElements(elementsRef.current) : newElements
    elementsRef.current = next
    setElements(next)
    const idx = indexRef.current
    historyRef.current = historyRef.current.slice(0, idx + 1)
    historyRef.current.push(next)
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current.shift()
    } else {
      indexRef.current++
    }
  }, [])

  const set = useCallback((newElements: CanvasElement[] | ((prev: CanvasElement[]) => CanvasElement[])) => {
    const next = typeof newElements === 'function' ? newElements(elementsRef.current) : newElements
    elementsRef.current = next
    setElements(next)
  }, [])

  const undo = useCallback(() => {
    if (indexRef.current <= 0) return false
    indexRef.current--
    const prev = historyRef.current[indexRef.current]
    elementsRef.current = prev
    setElements(prev)
    return true
  }, [])

  const redo = useCallback(() => {
    if (indexRef.current >= historyRef.current.length - 1) return false
    indexRef.current++
    const next = historyRef.current[indexRef.current]
    elementsRef.current = next
    setElements(next)
    return true
  }, [])

  const canUndo = indexRef.current > 0
  const canRedo = indexRef.current < historyRef.current.length - 1

  return { elements, push, set, undo, redo, canUndo, canRedo }
}
