import rough from 'roughjs'
import type { CanvasElement, Point, Viewport } from './types.ts'
import { getConnectionPoints } from './geometry.ts'

const DEFAULT_COLORS = {
  stroke: '#1e1e1e',
  background: 'transparent',
}

const GRID_SIZE = 20

export function renderGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  viewport: Viewport,
) {
  ctx.save()
  ctx.setTransform(
    viewport.zoom,
    0,
    0,
    viewport.zoom,
    viewport.x,
    viewport.y,
  )

  const startX = Math.floor(-viewport.x / viewport.zoom / GRID_SIZE) * GRID_SIZE
  const startY = Math.floor(-viewport.y / viewport.zoom / GRID_SIZE) * GRID_SIZE
  const endX = startX + (width / viewport.zoom) + GRID_SIZE * 2
  const endY = startY + (height / viewport.zoom) + GRID_SIZE * 2

  ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)'
  ctx.lineWidth = 1 / viewport.zoom
  ctx.beginPath()

  for (let x = startX; x <= endX; x += GRID_SIZE) {
    ctx.moveTo(x, startY)
    ctx.lineTo(x, endY)
  }

  for (let y = startY; y <= endY; y += GRID_SIZE) {
    ctx.moveTo(startX, y)
    ctx.lineTo(endX, y)
  }

  ctx.stroke()
  ctx.restore()
}

export function renderElements(
  ctx: CanvasRenderingContext2D,
  rc: ReturnType<typeof rough.canvas>,
  elements: CanvasElement[],
  viewport: Viewport,
) {
  ctx.save()
  ctx.setTransform(
    viewport.zoom,
    0,
    0,
    viewport.zoom,
    viewport.x,
    viewport.y,
  )

  for (const element of elements) {
    renderElement(ctx, rc, element)
  }

  ctx.restore()
}

function renderElement(
  ctx: CanvasRenderingContext2D,
  rc: ReturnType<typeof rough.canvas>,
  element: CanvasElement,
) {
  const seed = element.seed ?? 1
  const stroke = element.strokeColor || DEFAULT_COLORS.stroke
  const fill = element.backgroundColor || DEFAULT_COLORS.background
  const strokeWidth = element.strokeWidth ?? 2
  const roughness = element.roughness ?? 1

  switch (element.type) {
    case 'rectangle':
    case 'image':
    case 'group':
      rc.rectangle(element.x, element.y, element.width, element.height, {
        seed,
        stroke,
        fill,
        fillStyle: 'solid',
        strokeWidth,
        roughness,
      })
      if (element.type === 'image' && element.src) {
        const img = new Image()
        img.src = element.src
        if (img.complete) {
          ctx.drawImage(img, element.x, element.y, element.width, element.height)
        }
      }
      break
    case 'ellipse':
      rc.ellipse(
        element.x + element.width / 2,
        element.y + element.height / 2,
        element.width,
        element.height,
        {
          seed,
          stroke,
          fill,
          fillStyle: 'solid',
          strokeWidth,
          roughness,
        },
      )
      break
    case 'line':
      rc.line(
        element.x,
        element.y,
        element.x + element.width,
        element.y + element.height,
        {
          seed,
          stroke,
          strokeWidth,
          roughness,
        },
      )
      break
    case 'arrow': {
      const start: Point = { x: element.x, y: element.y }
      const end: Point = {
        x: element.x + element.width,
        y: element.y + element.height,
      }
      rc.line(start.x, start.y, end.x, end.y, {
        seed,
        stroke,
        strokeWidth,
        roughness,
      })
      drawArrowhead(ctx, start, end, stroke, strokeWidth)
      break
    }
    case 'freehand':
      if (element.points && element.points.length > 1) {
        rc.linearPath(
          element.points.map((p) => [p.x, p.y]),
          {
            seed,
            stroke,
            strokeWidth,
            roughness,
          },
        )
      }
      break
    case 'text':
      if (element.text) {
        ctx.save()
        ctx.font = `${Math.max(16, element.height || 24)}px system-ui`
        ctx.fillStyle = stroke
        ctx.textBaseline = 'top'
        ctx.fillText(element.text, element.x, element.y)
        ctx.restore()
      }
      break
  }
}

function drawArrowhead(
  ctx: CanvasRenderingContext2D,
  start: Point,
  end: Point,
  color: string,
  size: number,
) {
  const angle = Math.atan2(end.y - start.y, end.x - start.x)
  const arrowLength = Math.max(10, size * 4)
  const arrowAngle = Math.PI / 6

  ctx.save()
  ctx.fillStyle = color
  ctx.translate(end.x, end.y)
  ctx.rotate(angle)
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(-arrowLength, -arrowLength * Math.tan(arrowAngle))
  ctx.lineTo(-arrowLength, arrowLength * Math.tan(arrowAngle))
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

export function renderSelection(
  ctx: CanvasRenderingContext2D,
  element: CanvasElement,
  viewport: Viewport,
) {
  const bounds = getBounds(element)
  const padding = 4
  const handleSize = 8

  ctx.save()
  ctx.setTransform(
    viewport.zoom,
    0,
    0,
    viewport.zoom,
    viewport.x,
    viewport.y,
  )

  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 1 / viewport.zoom
  ctx.setLineDash([5, 5])
  ctx.strokeRect(
    bounds.x - padding,
    bounds.y - padding,
    bounds.width + padding * 2,
    bounds.height + padding * 2,
  )
  ctx.setLineDash([])

  const half = handleSize / 2
  const handles = [
    { x: bounds.x, y: bounds.y },
    { x: bounds.x + bounds.width, y: bounds.y },
    { x: bounds.x, y: bounds.y + bounds.height },
    { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
  ]

  ctx.fillStyle = '#ffffff'
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 1 / viewport.zoom
  for (const h of handles) {
    ctx.fillRect(h.x - half, h.y - half, handleSize, handleSize)
    ctx.strokeRect(h.x - half, h.y - half, handleSize, handleSize)
  }

  ctx.restore()
}

function getBounds(element: CanvasElement) {
  if (element.type === 'freehand' && element.points) {
    const xs = element.points.map((p) => p.x)
    const ys = element.points.map((p) => p.y)
    return {
      x: Math.min(...xs),
      y: Math.min(...ys),
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys),
    }
  }
  return {
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
  }
}

export function renderConnectionPoints(
  ctx: CanvasRenderingContext2D,
  elements: CanvasElement[],
  viewport: Viewport,
  excludeId?: string,
) {
  ctx.save()
  ctx.setTransform(
    viewport.zoom,
    0,
    0,
    viewport.zoom,
    viewport.x,
    viewport.y,
  )

  const pointRadius = 5 / viewport.zoom

  for (const element of elements) {
    if (element.id === excludeId) continue
    if (element.type === 'arrow' || element.type === 'line' || element.type === 'freehand' || element.type === 'text') continue

    const points = getConnectionPoints(element)
    for (const pt of points) {
      ctx.beginPath()
      ctx.arc(pt.x, pt.y, pointRadius, 0, Math.PI * 2)
      ctx.fillStyle = '#3b82f6'
      ctx.fill()
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 1.5 / viewport.zoom
      ctx.stroke()
    }
  }

  ctx.restore()
}

export function renderSnapIndicator(
  ctx: CanvasRenderingContext2D,
  point: Point,
  viewport: Viewport,
) {
  ctx.save()
  ctx.setTransform(
    viewport.zoom,
    0,
    0,
    viewport.zoom,
    viewport.x,
    viewport.y,
  )

  const radius = 8 / viewport.zoom
  ctx.beginPath()
  ctx.arc(point.x, point.y, radius, 0, Math.PI * 2)
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 2 / viewport.zoom
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(point.x, point.y, 3 / viewport.zoom, 0, Math.PI * 2)
  ctx.fillStyle = '#3b82f6'
  ctx.fill()

  ctx.restore()
}
