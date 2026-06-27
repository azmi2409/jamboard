import { useState, useRef, useEffect, useCallback } from 'react'
import Canvas from './components/Canvas.tsx'
import Toolbar from './components/Toolbar.tsx'
import PromptBar from './components/PromptBar.tsx'
import CursorsOverlay from './components/CursorsOverlay.tsx'
import ZoomControl from './components/ZoomControl.tsx'
import { useCollaboration } from './hooks/useCollaboration.ts'
import { useAIGeneration } from './hooks/useAIGeneration.ts'
import { clamp } from './canvas/math.ts'
import type { Tool } from './canvas/types.ts'

const MIN_ZOOM = 0.05
const MAX_ZOOM = 5

function App() {
  const [tool, setTool] = useState<Tool>('select')
  const [roughness, setRoughness] = useState(1)
  const [isPromptOpen, setIsPromptOpen] = useState(false)
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 })
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  const { elements, updateElements, cursors, updateCursor } = useCollaboration({
    enabled: true,
    viewport,
  })

  const { isGenerating, generate, generatingIds } = useAIGeneration({
    elements,
    viewport,
    containerSize,
    onElementsChange: updateElements,
  })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const resize = () => {
      setContainerSize({ width: el.clientWidth, height: el.clientHeight })
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsPromptOpen((prev) => !prev)
        return
      }

      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      const key = e.key.toLowerCase()
      const toolMap: Record<string, Tool> = {
        v: 'select',
        r: 'rectangle',
        e: 'ellipse',
        a: 'arrow',
        l: 'line',
        d: 'freehand',
        t: 'text',
      }
      if (toolMap[key]) {
        setTool(toolMap[key])
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const handlePromptSubmit = async (prompt: string) => {
    await generate(prompt)
  }

  const handleNew = () => {
    updateElements([])
  }

  const handleZoomIn = useCallback(() => {
    setViewport((prev) => ({
      ...prev,
      zoom: clamp(prev.zoom * 1.2, MIN_ZOOM, MAX_ZOOM),
    }))
  }, [])

  const handleZoomOut = useCallback(() => {
    setViewport((prev) => ({
      ...prev,
      zoom: clamp(prev.zoom * 0.8, MIN_ZOOM, MAX_ZOOM),
    }))
  }, [])

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-neutral-50">
      <Toolbar
        activeTool={tool}
        roughness={roughness}
        onSelectTool={setTool}
        onRoughnessChange={setRoughness}
        onNew={handleNew}
        onAIButtonClick={() => setIsPromptOpen(true)}
      />
      <Canvas
        tool={tool}
        roughness={roughness}
        elements={elements}
        viewport={viewport}
        onChange={updateElements}
        onToolChange={setTool}
        onViewportChange={setViewport}
        onCursorMove={updateCursor}
        generatingIds={generatingIds}
      />
      <ZoomControl
        zoom={viewport.zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />
      <CursorsOverlay cursors={cursors} viewport={viewport} />
      <PromptBar
        isOpen={isPromptOpen}
        onClose={() => setIsPromptOpen(false)}
        onSubmit={handlePromptSubmit}
      />
      {isGenerating && (
        <div className="absolute bottom-4 right-4 rounded-md bg-neutral-900 px-3 py-1.5 text-sm text-white shadow-md">
          Generating...
        </div>
      )}
    </div>
  )
}

export default App
