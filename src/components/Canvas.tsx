import { useEffect, useRef, useState, useCallback } from 'react'
import rough from 'roughjs'
import type { CanvasElement, Point, Tool, Viewport } from '../canvas/types.ts'
import { screenToCanvas, clamp } from '../canvas/math.ts'
import { createElement, updateElement, moveElement, resizeElement } from '../canvas/tools.ts'
import { renderElements, renderSelection, renderGrid } from '../canvas/render.ts'
import { hitTestElement, getElementBounds } from '../canvas/geometry.ts'
import { useAutoSave } from '../hooks/useAutoSave.ts'
import { loadCanvas } from '../state/localDb.ts'

interface CanvasProps {
  tool: Tool
  elements?: CanvasElement[]
  onChange?: (elements: CanvasElement[]) => void
  onViewportChange?: (viewport: Viewport) => void
  onCursorMove?: (point: Point) => void
  generatingIds?: Set<string>
}

const HANDLE_SIZE = 8
const MIN_DRAG_DISTANCE = 4
const MIN_ZOOM = 0.05
const MAX_ZOOM = 5

interface PanState {
  isPanning: boolean
  panStart: Point
  viewportStart: Viewport
}

const DEFAULT_PAN: PanState = {
  isPanning: false,
  panStart: { x: 0, y: 0 },
  viewportStart: { x: 0, y: 0, zoom: 1 },
}

export default function Canvas({
  tool,
  elements: externalElements,
  onChange,
  onViewportChange,
  onCursorMove,
  generatingIds,
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const needsRenderRef = useRef(true)

  const [elements, setElements] = useState<CanvasElement[]>(externalElements || [])
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 })
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [pan, setPan] = useState<PanState>(DEFAULT_PAN)

  useAutoSave(elements)

  useEffect(() => {
    let cancelled = false
    loadCanvas().then((saved) => {
      if (saved && !cancelled && elements.length === 0) {
        setElements(saved)
      }
    })
    return () => {
      cancelled = true
    }
  }, [elements.length])

  const drawingRef = useRef<{
    active: boolean
    element?: CanvasElement
    startCanvas: Point
    lastCanvas: Point
    mode?: 'draw' | 'move' | 'resize'
    resizeHandle?: string
  }>({
    active: false,
    startCanvas: { x: 0, y: 0 },
    lastCanvas: { x: 0, y: 0 },
  })

  const prevElementsRef = useRef<CanvasElement[]>(elements)
  useEffect(() => {
    if (externalElements) {
      const same =
        externalElements.length === prevElementsRef.current.length &&
        externalElements.every(
          (el, i) => el.id === prevElementsRef.current[i]?.id,
        )
      if (!same) {
        prevElementsRef.current = externalElements
        setElements(externalElements)
        needsRenderRef.current = true
      }
    }
  }, [externalElements])

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    prevElementsRef.current = elements
    onChangeRef.current?.(elements)
  }, [elements])

  const prevViewportRef = useRef<Viewport>(viewport)
  const onViewportChangeRef = useRef(onViewportChange)
  onViewportChangeRef.current = onViewportChange

  useEffect(() => {
    if (
      viewport.x !== prevViewportRef.current.x ||
      viewport.y !== prevViewportRef.current.y ||
      viewport.zoom !== prevViewportRef.current.zoom
    ) {
      prevViewportRef.current = viewport
      onViewportChangeRef.current?.(viewport)
    }
  }, [viewport])

  const renderFrame = useCallback(() => {
    rafRef.current = null
    if (!needsRenderRef.current) return
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cssWidth = container.clientWidth
    const cssHeight = container.clientHeight

    if (canvas.width !== cssWidth || canvas.height !== cssHeight) {
      canvas.width = cssWidth
      canvas.height = cssHeight
      canvas.style.width = `${cssWidth}px`
      canvas.style.height = `${cssHeight}px`
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, cssWidth, cssHeight)
    ctx.fillStyle = '#f5f5f5'
    ctx.fillRect(0, 0, cssWidth, cssHeight)

    const rc = rough.canvas(canvas)
    renderGrid(ctx, cssWidth, cssHeight, viewport)
    renderElements(ctx, rc, elements, viewport)

    for (const element of elements) {
      if (selectedIds.has(element.id)) {
        renderSelection(ctx, element, viewport)
      }
      if (generatingIds?.has(element.id)) {
        renderGeneratingIndicator(ctx, element, viewport)
      }
    }

    needsRenderRef.current = false
  }, [elements, viewport, selectedIds, generatingIds])

  useEffect(() => {
    needsRenderRef.current = true
    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(renderFrame)
    }
  }, [elements, viewport, selectedIds, generatingIds, renderFrame])

  useEffect(() => {
    const handleResize = () => {
      needsRenderRef.current = true
      renderFrame()
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [renderFrame])

  const getCanvasPoint = useCallback(
    (screen: Point): Point => screenToCanvas(screen, viewport),
    [viewport],
  )

  const commitElement = useCallback(
    (element: CanvasElement) => {
      setElements((prev) => prev.map((el) => (el.id === element.id ? element : el)))
    },
    [],
  )

  const handlePointerDown = useCallback(
    (e: PointerEvent) => {
      e.preventDefault()
      const canvasEl = canvasRef.current
      if (canvasEl) canvasEl.setPointerCapture(e.pointerId)

      const screenPoint = { x: e.clientX, y: e.clientY }
      const point = getCanvasPoint(screenPoint)

      if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
        setPan({
          isPanning: true,
          panStart: screenPoint,
          viewportStart: { ...viewport },
        })
        return
      }

      if (tool === 'select') {
        const hit = [...elements].reverse().find((el) => hitTestElement(point, el))
        if (hit) {
          const bounds = getElementBounds(hit)
          const handle = getResizeHandle(point, bounds)
          drawingRef.current = {
            active: true,
            element: hit,
            startCanvas: handle ? point : { x: 0, y: 0 },
            lastCanvas: point,
            mode: handle ? 'resize' : 'move',
            resizeHandle: handle,
          }
          setSelectedIds(new Set([hit.id]))
        } else {
          setSelectedIds(new Set())
        }
      } else {
        const newElement = createElement(tool, point, point)
        drawingRef.current = {
          active: true,
          element: newElement,
          startCanvas: point,
          lastCanvas: point,
          mode: 'draw',
        }
        setElements((prev) => [...prev, newElement])
        setSelectedIds(new Set())
      }
    },
    [elements, getCanvasPoint, tool, viewport],
  )

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      const screenPoint = { x: e.clientX, y: e.clientY }
      onCursorMove?.(screenPoint)
      const point = getCanvasPoint(screenPoint)

      if (pan.isPanning) {
        const dx = screenPoint.x - pan.panStart.x
        const dy = screenPoint.y - pan.panStart.y
        const vs = pan.viewportStart
        setViewport((prev) => ({ ...prev, x: vs.x + dx, y: vs.y + dy }))
        return
      }

      const draw = drawingRef.current
      if (!draw.active || !draw.element) return

      if (draw.mode === 'draw') {
        const updated = updateElement(draw.element, draw.startCanvas, point)
        draw.element = updated
        draw.lastCanvas = point
        commitElement(updated)
      } else if (draw.mode === 'move') {
        const delta = { x: point.x - draw.startCanvas.x, y: point.y - draw.startCanvas.y }
        const updated = moveElement(draw.element, delta)
        draw.element = updated
        draw.lastCanvas = point
        commitElement(updated)
      } else if (draw.mode === 'resize' && draw.resizeHandle) {
        const delta = { x: point.x - draw.startCanvas.x, y: point.y - draw.startCanvas.y }
        const updated = resizeElement(draw.element, draw.resizeHandle, delta)
        draw.element = updated
        draw.lastCanvas = point
        commitElement(updated)
      }
    },
    [commitElement, getCanvasPoint, onCursorMove, pan],
  )

  const handlePointerUp = useCallback(
    (e: PointerEvent) => {
      const canvasEl = canvasRef.current
      if (canvasEl) canvasEl.releasePointerCapture(e.pointerId)

      const draw = drawingRef.current
      if (draw.active && draw.element && draw.mode === 'draw') {
        const dx = draw.lastCanvas.x - draw.startCanvas.x
        const dy = draw.lastCanvas.y - draw.startCanvas.y
        if (Math.sqrt(dx * dx + dy * dy) < MIN_DRAG_DISTANCE) {
          setElements((prev) => prev.filter((el) => el.id !== draw.element!.id))
        }
      }

      drawingRef.current = {
        active: false,
        startCanvas: { x: 0, y: 0 },
        lastCanvas: { x: 0, y: 0 },
      }
      setPan(DEFAULT_PAN)
    },
    [],
  )

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault()
      const screenPoint = { x: e.clientX, y: e.clientY }
      const canvasPoint = getCanvasPoint(screenPoint)
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
      setViewport((prev) => {
        const newZoom = clamp(prev.zoom * zoomFactor, MIN_ZOOM, MAX_ZOOM)
        const newX = screenPoint.x - canvasPoint.x * newZoom
        const newY = screenPoint.y - canvasPoint.y * newZoom
        return { ...prev, x: newX, y: newY, zoom: newZoom }
      })
    },
    [getCanvasPoint],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    canvas.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      canvas.removeEventListener('wheel', handleWheel)
    }
  }, [handlePointerDown, handlePointerMove, handlePointerUp, handleWheel])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        setElements((prev) => prev.filter((el) => !selectedIds.has(el.id)))
        setSelectedIds(new Set())
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedIds])

  return (
    <div ref={containerRef} className="w-full h-full">
      <canvas
        ref={canvasRef}
        className="block h-full w-full cursor-crosshair touch-none"
      />
    </div>
  )
}

function getResizeHandle(point: Point, bounds: { x: number; y: number; width: number; height: number }): string | undefined {
  const handles = [
    { name: 'nw', x: bounds.x, y: bounds.y },
    { name: 'ne', x: bounds.x + bounds.width, y: bounds.y },
    { name: 'sw', x: bounds.x, y: bounds.y + bounds.height },
    { name: 'se', x: bounds.x + bounds.width, y: bounds.y + bounds.height },
  ]
  for (const h of handles) {
    if (Math.abs(point.x - h.x) <= HANDLE_SIZE / 2 && Math.abs(point.y - h.y) <= HANDLE_SIZE / 2) {
      return h.name
    }
  }
  return undefined
}

function renderGeneratingIndicator(
  ctx: CanvasRenderingContext2D,
  element: CanvasElement,
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
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 2 / viewport.zoom
  ctx.setLineDash([4, 4])
  ctx.strokeRect(element.x - 2, element.y - 2, element.width + 4, element.height + 4)

  ctx.fillStyle = '#3b82f6'
  ctx.font = `${16 / viewport.zoom}px system-ui`
  ctx.textBaseline = 'top'
  ctx.fillText('Generating...', element.x, element.y - 20 / viewport.zoom)
  ctx.restore()
}
