import type { CanvasElement } from '../canvas/types.ts'
import type { AIGenerationRequest, AIGenerationResult } from './aiService.ts'
import { generateId } from '../canvas/math.ts'

const DELAY_MS = 1200

function makeRect(
  x: number,
  y: number,
  width: number,
  height: number,
  options: Partial<CanvasElement> = {},
): CanvasElement {
  return {
    id: generateId(),
    type: 'rectangle',
    x,
    y,
    width,
    height,
    strokeColor: options.strokeColor ?? '#1e1e1e',
    backgroundColor: options.backgroundColor ?? 'transparent',
    strokeWidth: options.strokeWidth ?? 2,
    roughness: options.roughness ?? 1,
    seed: Math.floor(Math.random() * 2 ** 31),
    version: 1,
    ...options,
  } as CanvasElement
}

function makeText(
  x: number,
  y: number,
  width: number,
  height: number,
  text: string,
): CanvasElement {
  return {
    id: generateId(),
    type: 'text',
    x,
    y,
    width,
    height,
    text,
    strokeColor: '#1e1e1e',
    strokeWidth: 2,
    roughness: 1,
    seed: Math.floor(Math.random() * 2 ** 31),
    version: 1,
  }
}

export const mockGenerator = async (
  request: AIGenerationRequest,
): Promise<AIGenerationResult> => {
  await new Promise((resolve) => setTimeout(resolve, DELAY_MS))

  const center = request.center
  const width = 320
  const height = 220
  const x = center.x - width / 2
  const y = center.y - height / 2

  const prompt = request.prompt.toLowerCase()

  if (prompt.includes('login') || prompt.includes('signin') || prompt.includes('sign in')) {
    return {
      elements: [
        makeRect(x, y, width, height, { backgroundColor: '#ffffff' }),
        makeText(x + 20, y + 20, 200, 28, 'Login'),
        makeRect(x + 20, y + 60, width - 40, 36, { backgroundColor: '#f3f4f6' }),
        makeText(x + 28, y + 68, 200, 20, 'Email'),
        makeRect(x + 20, y + 110, width - 40, 36, { backgroundColor: '#f3f4f6' }),
        makeText(x + 28, y + 118, 200, 20, 'Password'),
        makeRect(x + 20, y + 160, width - 40, 40, { backgroundColor: '#3b82f6', strokeColor: '#3b82f6' }),
        makeText(x + width / 2 - 28, y + 170, 80, 20, 'Sign In'),
      ],
    }
  }

  if (prompt.includes('button')) {
    return {
      elements: [
        makeRect(x + 60, y + 80, 200, 60, { backgroundColor: '#3b82f6', strokeColor: '#3b82f6' }),
        makeText(x + 110, y + 100, 120, 22, 'Click Me'),
      ],
    }
  }

  if (prompt.includes('card')) {
    return {
      elements: [
        makeRect(x, y, width, height, { backgroundColor: '#ffffff' }),
        makeRect(x + 20, y + 20, width - 40, 80, { backgroundColor: '#e5e7eb' }),
        makeText(x + 20, y + 120, 200, 22, 'Card Title'),
        makeText(x + 20, y + 150, 260, 18, 'This is a generated card component.'),
      ],
    }
  }

  return {
    elements: [
      makeRect(x, y, width, height, { backgroundColor: '#f3f4f6' }),
      makeText(x + 20, y + 20, 280, 24, request.prompt),
      makeRect(x + 20, y + 60, width - 40, 40, { backgroundColor: '#ffffff' }),
      makeRect(x + 20, y + 120, width - 40, 40, { backgroundColor: '#ffffff' }),
      makeRect(x + 20, y + 160, width - 40, 40, { backgroundColor: '#3b82f6', strokeColor: '#3b82f6' }),
    ],
  }
}
