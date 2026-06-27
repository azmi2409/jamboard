import { useState, useCallback, useRef } from 'react'
import type { CanvasElement, Point, Viewport } from '../canvas/types.ts'
import { generateComponent } from '../ai/aiService.ts'
import { mockGenerator } from '../ai/mockGenerator.ts'

interface UseAIGenerationOptions {
  elements: CanvasElement[]
  viewport: Viewport
  containerSize: { width: number; height: number }
  onElementsChange: (elements: CanvasElement[]) => void
}

export interface AIGenerationState {
  isGenerating: boolean
  generate: (prompt: string) => Promise<void>
  generatingIds: Set<string>
}

export function useAIGeneration({
  elements,
  viewport,
  containerSize,
  onElementsChange,
}: UseAIGenerationOptions): AIGenerationState {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set())

  const center: Point = {
    x: (containerSize.width / 2 - viewport.x) / viewport.zoom,
    y: (containerSize.height / 2 - viewport.y) / viewport.zoom,
  }

  const centerRef = useRef<Point>(center)
  centerRef.current = center

  const generate = useCallback(
    async (prompt: string) => {
      if (isGenerating) return
      setIsGenerating(true)

      const currentCenter = centerRef.current
      const loadingElement: CanvasElement = {
        id: `ai-loading-${Date.now()}`,
        type: 'rectangle',
        x: currentCenter.x - 60,
        y: currentCenter.y - 20,
        width: 120,
        height: 40,
        strokeColor: '#3b82f6',
        backgroundColor: '#eff6ff',
        strokeWidth: 2,
        roughness: 1,
        seed: 1,
        version: 1,
      }
      setGeneratingIds(new Set([loadingElement.id]))

      const next = [...elements, loadingElement]
      onElementsChange(next)

      try {
        const result = await generateComponent({ prompt, center: currentCenter }, mockGenerator)
        const withoutLoading = next.filter((el) => el.id !== loadingElement.id)
        onElementsChange([...withoutLoading, ...result.elements])
      } finally {
        setIsGenerating(false)
        setGeneratingIds(new Set())
      }
    },
    [elements, isGenerating, onElementsChange],
  )

  return { isGenerating, generate, generatingIds }
}
