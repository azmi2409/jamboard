## Why

We need a web-based infinite canvas whiteboard that supports free-form drawing, real-time multiplayer collaboration, and AI-assisted UI generation. Existing tools like Excalidraw provide the drawing experience but lack built-in AI generation, while AI design tools do not offer a collaborative whiteboard canvas. This project fills that gap with a single, extensible TypeScript/React application.

## What Changes

- Initialize a Vite + React + TypeScript project with Tailwind CSS.
- Build a native HTML5 Canvas rendering engine with pan, zoom, and hand-drawn shape rendering via `roughjs`.
- Add drawing tools: Select, Rectangle, Ellipse, Arrow, Line, Freehand Draw, and Text.
- Implement selection, move, resize, and delete interactions for canvas elements.
- Add debounced local auto-save to IndexedDB using the `idb` library, with hydration on load.
- Integrate `Yjs` and `y-websocket` for real-time shared canvas state and live multiplayer cursors.
- Build a Google Stitch-like AI prompt interface (Cmd/Ctrl+K or UI button) with a swappable mock generation service that places results on the canvas as interactive nodes.
- Structure implementation in five verified phases with confirmation checkpoints.

## Capabilities

### New Capabilities

- `canvas-engine`: Infinite pan/zoom canvas, drawing tools, and optimized rendering loop.
- `object-interaction`: Select, move, resize, and delete canvas elements.
- `local-auto-save`: Debounced persistence and hydration from IndexedDB.
- `real-time-collaboration`: Shared state via Yjs/WebSocket and live remote cursors.
- `ai-generation`: Prompt-driven mock UI/image generation placed as interactive canvas nodes.

### Modified Capabilities

- None

## Impact

- New React/Vite frontend in `/src`.
- New canvas engine, state management, and AI service modules.
- New runtime dependencies: `roughjs`, `yjs`, `y-websocket`, `idb`.
- New dev dependencies: Vite, TypeScript, Tailwind CSS, PostCSS, Autoprefixer.
- No existing APIs or systems affected; this is a green-field application.
