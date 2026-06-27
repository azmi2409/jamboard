import { useEffect, useRef, useState, useCallback } from 'react'
import rough from 'roughjs'
import type { CanvasElement, Point, Tool, Viewport } from '../canvas/types.ts'
import { screenToCanvas, clamp } from '../canvas/math.ts'
import { createElement, updateElement, moveElement, resizeElement } from '../canvas/tools.ts'
import { renderElements, renderSelection, renderGrid } from '../canvas/render.ts'
import { hitTestElement, getElementBounds } from '../canvas/geometry.ts'
import { useAutoSave } from '../hooks/useAutoSave.ts'
import { useHistory } from '../hooks/useHistory.ts'
import { useClipboard } from '../hooks/useClipboard.ts'
import { loadCanvas } from '../state/localDb.ts'
import TextEditor from './TextEditor.tsx'

interface CanvasProps {
  tool: Tool
  roughness?: number
  elements?: CanvasElement[]
  viewport?: Viewport
  onChange?: (elements: CanvasElement[]) => void
  onToolChange?: (tool: Tool) => void
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
  roughness = 1,
  elements: externalElements,
  viewport: externalViewport,
  onChange,
  onToolChange,
  onViewportChange,
  onCursorMove,
  generatingIds,
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const needsRenderRef = useRef(true)

  const { elements, push, set, undo, redo } = useHistory(externalElements || [])
  const [viewport, setViewport] = useState<Viewport>(externalViewport || { x: 0, y: 0, zoom: 1 })
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const { copy, paste, cut } = useClipboard(elements, selectedIds, push)
  const [pan, setPan] = useState<PanState>(DEFAULT_PAN)
  const [editingText, setEditingText] = useState<{
    elementId: string
    text: string
  } | null>(null)
  const [selectionRect, setSelectionRect] = useState<{
    x: number
    y: number
    width: number
    height: number
  } | null>(null)
  const spaceRef = useRef(false)

  useAutoSave(elements)

  const loadedRef = useRef(false)
  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true
    let cancelled = false
    loadCanvas().then((saved) => {
      if (saved && !cancelled && elements.length === 0) {
        set(saved)
      }
    })
    return () => {
      cancelled = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (externalViewport) {
      setViewport(externalViewport)
    }
  }, [externalViewport])

  const drawingRef = useRef<{
    active: boolean
    element?: CanvasElement
    startCanvas: Point
    lastCanvas: Point
    mode?: 'draw' | 'move' | 'resize' | 'select'
    resizeHandle?: string
  }>({
    active: false,
    startCanvas: { x: 0, y: 0 },
    lastCanvas: { x: 0, y: 0 },
  })

  const prevElementsRef = useRef<CanvasElement[]>(elements)
  const lastMouseDownRef = useRef<Point | null>(null)
  useEffect(() => {
    if (externalElements) {
      const same =
        externalElements.length === prevElementsRef.current.length &&
        externalElements.every(
          (el, i) => el.id === prevElementsRef.current[i]?.id,
        )
      if (!same) {
        prevElementsRef.current = externalElements
        set(externalElements)
        needsRenderRef.current = true
      }
    }
  }, [externalElements, set])

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

    if (selectionRect) {
      ctx.save()
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)'
      const screenX = selectionRect.x * viewport.zoom + viewport.x
      const screenY = selectionRect.y * viewport.zoom + viewport.y
      const screenW = selectionRect.width * viewport.zoom
      const screenH = selectionRect.height * viewport.zoom
      ctx.fillRect(screenX, screenY, screenW, screenH)
      ctx.strokeRect(screenX, screenY, screenW, screenH)
      ctx.restore()
    }

    needsRenderRef.current = false
  }, [elements, viewport, selectedIds, generatingIds, selectionRect])

  useEffect(() => {
    needsRenderRef.current = true
    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(renderFrame)
    }
  }, [elements, viewport, selectedIds, generatingIds, selectionRect, renderFrame])

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

  const handlePointerDown = useCallback(
    (e: PointerEvent) => {
      if (editingText) {
        return
      }
      e.preventDefault()
      const canvasEl = canvasRef.current
      if (canvasEl) canvasEl.setPointerCapture(e.pointerId)

      const screenPoint = { x: e.clientX, y: e.clientY }
      lastMouseDownRef.current = screenPoint
      const point = getCanvasPoint(screenPoint)

      if (e.button === 1 || (e.button === 0 && e.shiftKey) || spaceRef.current) {
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
            startCanvas: point,
            lastCanvas: point,
            mode: handle ? 'resize' : 'move',
            resizeHandle: handle,
          }
          setSelectedIds(new Set([hit.id]))
        } else {
          setSelectedIds(new Set())
          drawingRef.current = {
            active: true,
            startCanvas: point,
            lastCanvas: point,
            mode: 'select',
          }
          setSelectionRect({ x: point.x, y: point.y, width: 0, height: 0 })
        }
      } else {
        const newElement = createElement(tool, point, point, { roughness })
        drawingRef.current = {
          active: true,
          element: newElement,
          startCanvas: point,
          lastCanvas: point,
          mode: 'draw',
        }
        set((prev) => [...prev, newElement])
        setSelectedIds(new Set())
      }
    },
    [elements, getCanvasPoint, tool, viewport, roughness, set, editingText],
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

      if (tool === 'select' && !drawingRef.current.active) {
        const canvasEl = canvasRef.current
        if (canvasEl) {
          let cursor = 'default'
          for (const id of selectedIds) {
            const el = elements.find((e) => e.id === id)
            if (el) {
              const bounds = getElementBounds(el)
              const handle = getResizeHandle(point, bounds)
              if (handle) {
                cursor = handle === 'nw' || handle === 'se' ? 'nwse-resize' : 'nesw-resize'
                break
              }
            }
          }
          canvasEl.style.cursor = cursor
        }
      }

      const draw = drawingRef.current
      if (!draw.active) return

      if (draw.mode === 'select') {
        const startX = draw.startCanvas.x
        const startY = draw.startCanvas.y
        setSelectionRect({
          x: Math.min(startX, point.x),
          y: Math.min(startY, point.y),
          width: Math.abs(point.x - startX),
          height: Math.abs(point.y - startY),
        })
        return
      }

      if (!draw.element) return

      if (draw.mode === 'draw') {
        const updated = updateElement(draw.element, draw.startCanvas, point)
        draw.element = updated
        draw.lastCanvas = point
        set((prev) => prev.map((el) => (el.id === updated.id ? updated : el)))
      } else if (draw.mode === 'move') {
        const delta = { x: point.x - draw.startCanvas.x, y: point.y - draw.startCanvas.y }
        const updated = moveElement(draw.element, delta)
        draw.element = updated
        draw.startCanvas = point
        draw.lastCanvas = point
        set((prev) => prev.map((el) => (el.id === updated.id ? updated : el)))
      } else if (draw.mode === 'resize' && draw.resizeHandle) {
        const delta = { x: point.x - draw.startCanvas.x, y: point.y - draw.startCanvas.y }
        const updated = resizeElement(draw.element, draw.resizeHandle, delta)
        draw.element = updated
        draw.startCanvas = point
        draw.lastCanvas = point
        set((prev) => prev.map((el) => (el.id === updated.id ? updated : el)))
      }
    },
    [set, getCanvasPoint, onCursorMove, pan, tool, selectedIds, elements],
  )

  const handlePointerUp = useCallback(
    (e: PointerEvent) => {
      const canvasEl = canvasRef.current
      if (canvasEl) canvasEl.releasePointerCapture(e.pointerId)

      const draw = drawingRef.current
      if (draw.active && draw.mode === 'select' && selectionRect) {
        const selected = elements.filter((el) => {
          const bounds = getElementBounds(el)
          return (
            bounds.x >= selectionRect.x &&
            bounds.y >= selectionRect.y &&
            bounds.x + bounds.width <= selectionRect.x + selectionRect.width &&
            bounds.y + bounds.height <= selectionRect.y + selectionRect.height
          )
        })
        if (selected.length > 0) {
          setSelectedIds(new Set(selected.map((el) => el.id)))
        }
      } else if (draw.active && draw.element && draw.mode === 'draw') {
        const dx = draw.lastCanvas.x - draw.startCanvas.x
        const dy = draw.lastCanvas.y - draw.startCanvas.y
        if (Math.sqrt(dx * dx + dy * dy) < MIN_DRAG_DISTANCE) {
          push((prev) => prev.filter((el) => el.id !== draw.element!.id))
        } else {
          const finalElement = draw.element
          push((prev) => {
            const exists = prev.some((el) => el.id === finalElement.id)
            if (exists) {
              return prev.map((el) => (el.id === finalElement.id ? finalElement : el))
            }
            return [...prev, finalElement]
          })
          setSelectedIds(new Set([draw.element.id]))
          onToolChange?.('select')
        }
      } else if (draw.active && draw.element && (draw.mode === 'move' || draw.mode === 'resize')) {
        const finalElement = draw.element
        push((prev) => prev.map((el) => (el.id === finalElement.id ? finalElement : el)))
      }

      drawingRef.current = {
        active: false,
        startCanvas: { x: 0, y: 0 },
        lastCanvas: { x: 0, y: 0 },
      }
      setSelectionRect(null)
      setPan(DEFAULT_PAN)
    },
    [push, selectionRect, elements, onToolChange],
  )

  const handleDoubleClick = useCallback(
    (e: MouseEvent) => {
      const screenPoint = { x: e.clientX, y: e.clientY }
      const lastDown = lastMouseDownRef.current
      if (lastDown) {
        const dx = screenPoint.x - lastDown.x
        const dy = screenPoint.y - lastDown.y
        if (Math.sqrt(dx * dx + dy * dy) > MIN_DRAG_DISTANCE) return
      }
      const point = getCanvasPoint(screenPoint)
      const hit = [...elements].reverse().find((el) => hitTestElement(point, el))

      if (hit) {
        if (hit.type === 'text') {
          setEditingText({ elementId: hit.id, text: hit.text || '' })
        } else {
          const bounds = getElementBounds(hit)
          const newText: CanvasElement = {
            id: `text-${Date.now()}`,
            type: 'text',
            x: bounds.x + 10,
            y: bounds.y + bounds.height / 2 - 12,
            width: Math.max(bounds.width - 20, 60),
            height: 24,
            text: '',
            strokeColor: '#1e1e1e',
            strokeWidth: 2,
            roughness,
            seed: Math.floor(Math.random() * 2 ** 31),
            version: 1,
          }
          push((prev) => [...prev, newText])
          setEditingText({ elementId: newText.id, text: '' })
        }
      } else {
        const newText: CanvasElement = {
          id: `text-${Date.now()}`,
          type: 'text',
          x: point.x - 60,
          y: point.y - 12,
          width: 120,
          height: 24,
          text: '',
          strokeColor: '#1e1e1e',
          strokeWidth: 2,
          roughness,
          seed: Math.floor(Math.random() * 2 ** 31),
          version: 1,
        }
        push((prev) => [...prev, newText])
        setEditingText({ elementId: newText.id, text: '' })
      }
    },
    [elements, getCanvasPoint, roughness, push],
  )

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault()
      const screenPoint = { x: e.clientX, y: e.clientY }

      if (e.ctrlKey || e.metaKey) {
        const canvasPoint = getCanvasPoint(screenPoint)
        const zoomFactor = e.deltaY > 0 ? 0.95 : 1.05
        setViewport((prev) => {
          const newZoom = clamp(prev.zoom * zoomFactor, MIN_ZOOM, MAX_ZOOM)
          const newX = screenPoint.x - canvasPoint.x * newZoom
          const newY = screenPoint.y - canvasPoint.y * newZoom
          return { ...prev, x: newX, y: newY, zoom: newZoom }
        })
      } else {
        setViewport((prev) => ({
          ...prev,
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }))
      }
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
    canvas.addEventListener('dblclick', handleDoubleClick)

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      canvas.removeEventListener('wheel', handleWheel)
      canvas.removeEventListener('dblclick', handleDoubleClick)
    }
  }, [handlePointerDown, handlePointerMove, handlePointerUp, handleWheel, handleDoubleClick])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !editingText) {
        spaceRef.current = true
        const canvasEl = canvasRef.current
        if (canvasEl) canvasEl.style.cursor = 'grab'
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spaceRef.current = false
        const canvasEl = canvasRef.current
        if (canvasEl) canvasEl.style.cursor = tool === 'select' ? 'default' : 'crosshair'
      }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [editingText, tool])

  const commitText = useCallback(
    (text: string) => {
      if (!editingText) return
      push((prev) =>
        prev.map((el) =>
          el.id === editingText.elementId
            ? { ...el, text, version: el.version + 1 }
            : el,
        ),
      )
      setEditingText(null)
    },
    [editingText, push],
  )

  const cancelText = useCallback(() => {
    if (!editingText) return
    push((prev) => prev.filter((el) => el.id !== editingText.elementId || el.text))
    setEditingText(null)
  }, [editingText, push])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (editingText) return

      const isMod = e.metaKey || e.ctrlKey

      if (isMod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
        return
      }
      if (isMod && e.key === 'z' && e.shiftKey) {
        e.preventDefault()
        redo()
        return
      }
      if (isMod && e.key === 'y') {
        e.preventDefault()
        redo()
        return
      }
      if (isMod && e.key === 'c') {
        e.preventDefault()
        copy()
        return
      }
      if (isMod && e.key === 'v') {
        e.preventDefault()
        const pastedIds = paste()
        if (pastedIds.length > 0) setSelectedIds(new Set(pastedIds))
        return
      }
      if (isMod && e.key === 'x') {
        e.preventDefault()
        const cutIds = cut()
        if (cutIds.length > 0) setSelectedIds(new Set(cutIds))
        return
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        push((prev) => prev.filter((el) => !selectedIds.has(el.id)))
        setSelectedIds(new Set())
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedIds, editingText, push, undo, redo, copy, paste, cut])

  const editingElement = editingText
    ? elements.find((el) => el.id === editingText.elementId)
    : null

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className={`block h-full w-full touch-none ${tool === 'select' ? 'cursor-default' : 'cursor-crosshair'}`}
      />
      {editingText && editingElement && (
        <TextEditor
          text={editingText.text}
          x={editingElement.x}
          y={editingElement.y}
          width={editingElement.width}
          height={editingElement.height}
          fontSize={24}
          color={editingElement.strokeColor}
          viewport={viewport}
          onSubmit={commitText}
          onCancel={cancelText}
        />
      )}
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
