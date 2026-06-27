import type { CanvasElement, Point } from './types.ts'

export function normalizeRect(x1: number, y1: number, x2: number, y2: number) {
  const x = Math.min(x1, x2)
  const y = Math.min(y1, y2)
  const width = Math.abs(x2 - x1)
  const height = Math.abs(y2 - y1)
  return { x, y, width, height }
}

export function pointNearLine(
  point: Point,
  a: Point,
  b: Point,
  threshold = 8,
): boolean {
  const ab = { x: b.x - a.x, y: b.y - a.y }
  const ap = { x: point.x - a.x, y: point.y - a.y }
  const abLen2 = ab.x * ab.x + ab.y * ab.y
  if (abLen2 === 0) {
    const dx = point.x - a.x
    const dy = point.y - a.y
    return Math.sqrt(dx * dx + dy * dy) <= threshold
  }
  const t = Math.max(0, Math.min(1, (ap.x * ab.x + ap.y * ab.y) / abLen2))
  const closest = { x: a.x + t * ab.x, y: a.y + t * ab.y }
  const dx = point.x - closest.x
  const dy = point.y - closest.y
  return Math.sqrt(dx * dx + dy * dy) <= threshold
}

export function pointNearFreehand(
  point: Point,
  points: Point[],
  threshold = 8,
): boolean {
  for (let i = 0; i < points.length - 1; i++) {
    if (pointNearLine(point, points[i], points[i + 1], threshold)) {
      return true
    }
  }
  return false
}

export function pointInRect(
  point: Point,
  x: number,
  y: number,
  width: number,
  height: number,
  tolerance = 0,
): boolean {
  return (
    point.x >= x - tolerance &&
    point.x <= x + width + tolerance &&
    point.y >= y - tolerance &&
    point.y <= y + height + tolerance
  )
}

export function hitTestElement(
  point: Point,
  element: CanvasElement,
  tolerance = 8,
): boolean {
  switch (element.type) {
    case 'rectangle':
    case 'image':
    case 'group':
      return pointInRect(point, element.x, element.y, element.width, element.height, tolerance)
    case 'ellipse': {
      const cx = element.x + element.width / 2
      const cy = element.y + element.height / 2
      const rx = element.width / 2 + tolerance
      const ry = element.height / 2 + tolerance
      if (rx === 0 || ry === 0) return false
      const dx = point.x - cx
      const dy = point.y - cy
      return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1
    }
    case 'line':
    case 'arrow': {
      const start: Point = { x: element.x, y: element.y }
      const end: Point = {
        x: element.x + element.width,
        y: element.y + element.height,
      }
      return pointNearLine(point, start, end, tolerance)
    }
    case 'freehand':
      return element.points ? pointNearFreehand(point, element.points, tolerance) : false
    case 'text':
      return pointInRect(point, element.x, element.y, element.width, element.height, tolerance)
    default:
      return false
  }
}

export function getElementBounds(element: CanvasElement) {
  if (element.type === 'freehand' && element.points) {
    const xs = element.points.map((p) => p.x)
    const ys = element.points.map((p) => p.y)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
  }
  return { x: element.x, y: element.y, width: element.width, height: element.height }
}
