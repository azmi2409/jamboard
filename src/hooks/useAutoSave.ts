import { useEffect, useRef } from 'react'
import type { CanvasElement } from '../canvas/types.ts'
import { saveCanvas } from '../state/localDb.ts'

const DEBOUNCE_MS = 500

export function useAutoSave(elements: CanvasElement[]) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedRef = useRef<string>('')

  useEffect(() => {
    const serialized = JSON.stringify(elements)
    if (serialized === lastSavedRef.current) return

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      saveCanvas(elements).then(() => {
        lastSavedRef.current = serialized
      })
    }, DEBOUNCE_MS)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [elements])
}
