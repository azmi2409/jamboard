## 1. Phase 1: Project Setup

- [x] 1.1 Initialize Vite + React + TypeScript project in `/Users/azmi/Privates/jamboard`.
- [x] 1.2 Install and configure Tailwind CSS, PostCSS, and Autoprefixer.
- [x] 1.3 Install runtime dependencies: `roughjs`, `yjs`, `y-websocket`, `idb`.
- [x] 1.4 Scaffold `src/App.tsx`, `src/components/Canvas.tsx`, `src/components/Toolbar.tsx`, and `src/index.css`.
- [x] 1.5 Verify the dev server starts and the toolbar renders over a full-screen canvas.

## 2. Phase 2: Canvas Fundamentals

- [x] 2.1 Implement `src/canvas/engine.ts` with device-pixel-ratio scaling and `requestAnimationFrame` render loop.
- [x] 2.2 Implement viewport transform (pan and zoom) in `src/canvas/engine.ts`.
- [x] 2.3 Define `CanvasElement` and `Viewport` types in `src/canvas/types.ts`.
- [x] 2.4 Implement `src/canvas/render.ts` to draw rectangle, ellipse, arrow, line, freehand, and text using `roughjs`.
- [x] 2.5 Implement tool state and pointer event handling for drawing tools in `src/canvas/tools.ts`.
- [x] 2.6 Verify pan, zoom, and each drawing tool produce visible, correctly placed shapes.

## 3. Phase 3: Object Interaction & Auto-Save

- [x] 3.1 Implement hit-testing for rectangle, ellipse, line, arrow, freehand, text, and image elements.
- [x] 3.2 Implement selection outline and resize handles in `src/canvas/interactions.ts`.
- [x] 3.3 Implement drag-to-move and resize-handle logic.
- [x] 3.4 Implement Delete/Backspace key handler to remove selected elements.
- [x] 3.5 Implement `src/state/localDb.ts` using `idb` to save and load the serialized element array.
- [x] 3.6 Wire debounced auto-save hook (`src/hooks/useAutoSave.ts`) to canvas state changes.
- [x] 3.7 Verify select, move, resize, delete work, and that reload restores the canvas.

## 4. Phase 4: Collaboration

- [x] 4.1 Initialize `Y.Doc` and `Y.Array<CanvasElement>` in `src/state/yjsDoc.ts`.
- [x] 4.2 Integrate `y-websocket` provider and bind the Yjs array to local React state.
- [x] 4.3 Implement awareness handling in `src/state/awareness.ts` for user name, color, and cursor position.
- [x] 4.4 Render remote cursors with name/color using `src/components/Cursor.tsx`.
- [x] 4.5 Verify two browser windows sync shapes and cursor movements in real time.

## 5. Phase 5: AI Generation Feature

- [x] 5.1 Implement `src/components/PromptBar.tsx` with Cmd/Ctrl+K toggle and UI button trigger.
- [x] 5.2 Define `src/ai/aiService.ts` interface with `generateComponent(prompt, center)`.
- [x] 5.3 Implement `src/ai/mockGenerator.ts` returning grouped vector shapes or a placeholder image after a delay.
- [x] 5.4 Show a loading indicator on the canvas at the current viewport center during generation.
- [x] 5.5 Insert generated elements into the canvas state and render them as interactive nodes.
- [x] 5.6 Verify the prompt flow, mock output placement, and that generated nodes can be selected, moved, and resized.
