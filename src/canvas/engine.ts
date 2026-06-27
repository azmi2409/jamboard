import type { CanvasElement, Point, Viewport } from './types.ts'

export interface EngineState {
  elements: CanvasElement[]
  viewport: Viewport
  selectedIds: Set<string>
  isPanning: boolean
  panStart: Point
  viewportStart: Viewport
}

export const DEFAULT_VIEWPORT: Viewport = { x: 0, y: 0, zoom: 1 }

export function createEngineState(initialElements: CanvasElement[] = []): EngineState {
  return {
    elements: initialElements,
    viewport: { ...DEFAULT_VIEWPORT },
    selectedIds: new Set(),
    isPanning: false,
    panStart: { x: 0, y: 0 },
    viewportStart: { ...DEFAULT_VIEWPORT },
  }
}
