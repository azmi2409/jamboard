import type { CanvasElement, Point, Tool } from './types.ts'
import { generateId, normalizeRect } from './math.ts'

export function createElement(
  tool: Exclude<Tool, 'select'>,
  start: Point,
  end: Point,
  options: { text?: string; points?: Point[]; roughness?: number } = {},
): CanvasElement {
  const id = generateId()
  const base = {
    id,
    strokeColor: '#1e1e1e',
    backgroundColor: 'transparent',
    strokeWidth: 2,
    roughness: options.roughness ?? 1,
    seed: Math.floor(Math.random() * 2 ** 31),
    version: 1,
  }

  switch (tool) {
    case 'text':
      return {
        ...base,
        type: 'text',
        x: start.x,
        y: start.y,
        width: 200,
        height: 24,
        text: options.text || 'Text',
      }
    case 'freehand':
      return {
        ...base,
        type: 'freehand',
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        points: options.points || [start],
      }
    case 'rectangle':
    case 'ellipse': {
      const rect = normalizeRect(start.x, start.y, end.x, end.y)
      return {
        ...base,
        type: tool,
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      }
    }
    case 'line':
    case 'arrow':
      return {
        ...base,
        type: tool,
        x: start.x,
        y: start.y,
        width: end.x - start.x,
        height: end.y - start.y,
      }
  }
}

export function updateElement(
  element: CanvasElement,
  start: Point,
  end: Point,
): CanvasElement {
  switch (element.type) {
    case 'rectangle':
    case 'ellipse': {
      const rect = normalizeRect(start.x, start.y, end.x, end.y)
      return { ...element, x: rect.x, y: rect.y, width: rect.width, height: rect.height }
    }
    case 'line':
    case 'arrow':
      return {
        ...element,
        x: start.x,
        y: start.y,
        width: end.x - start.x,
        height: end.y - start.y,
      }
    case 'freehand':
      return {
        ...element,
        points: [...(element.points || []), end],
      }
    default:
      return element
  }
}

export function moveElement(element: CanvasElement, delta: Point): CanvasElement {
  const moved = {
    ...element,
    x: element.x + delta.x,
    y: element.y + delta.y,
  }
  if (element.type === 'freehand' && element.points) {
    moved.points = element.points.map((p) => ({ x: p.x + delta.x, y: p.y + delta.y }))
  }
  return moved
}

export function resizeElement(
  element: CanvasElement,
  handle: string,
  delta: Point,
): CanvasElement {
  let { x, y, width, height } = element
  switch (handle) {
    case 'nw':
      x += delta.x
      y += delta.y
      width -= delta.x
      height -= delta.y
      break
    case 'ne':
      y += delta.y
      width += delta.x
      height -= delta.y
      break
    case 'sw':
      x += delta.x
      width -= delta.x
      height += delta.y
      break
    case 'se':
      width += delta.x
      height += delta.y
      break
  }
  return { ...element, x, y, width: Math.max(1, width), height: Math.max(1, height) }
}
