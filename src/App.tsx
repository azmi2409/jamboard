import { useState, useRef, useEffect } from 'react'
import Canvas from './components/Canvas.tsx'
import Toolbar from './components/Toolbar.tsx'
import PromptBar from './components/PromptBar.tsx'
import CursorsOverlay from './components/CursorsOverlay.tsx'
import { useCollaboration } from './hooks/useCollaboration.ts'
import { useAIGeneration } from './hooks/useAIGeneration.ts'
import type { Tool } from './canvas/types.ts'

function App() {
  const [tool, setTool] = useState<Tool>('select')
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
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const handlePromptSubmit = async (prompt: string) => {
    await generate(prompt)
  }

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-neutral-50">
      <Toolbar
        activeTool={tool}
        onSelectTool={setTool}
        onAIButtonClick={() => setIsPromptOpen(true)}
      />
      <Canvas
        tool={tool}
        elements={elements}
        onChange={updateElements}
        onViewportChange={setViewport}
        onCursorMove={updateCursor}
        generatingIds={generatingIds}
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
