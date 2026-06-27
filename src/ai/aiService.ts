import type { CanvasElement, Point } from '../canvas/types.ts'

export interface AIGenerationRequest {
  prompt: string
  center: Point
}

export interface AIGenerationResult {
  elements: CanvasElement[]
}

export type AIGenerator = (
  request: AIGenerationRequest,
) => Promise<AIGenerationResult>

export async function generateComponent(
  request: AIGenerationRequest,
  generator: AIGenerator,
): Promise<AIGenerationResult> {
  return generator(request)
}
