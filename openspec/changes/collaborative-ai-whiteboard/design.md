## Context

This is a green-field project in an empty directory. We are building a single-page React application with a native HTML5 Canvas core. The canvas must feel like Excalidraw (infinite, pan/zoom, hand-drawn aesthetic) while adding real-time collaboration and AI generation features. The project will be developed in five verified phases.

## Goals / Non-Goals

**Goals:**
- Provide an infinite canvas with pan, zoom, and multiple drawing tools.
- Render shapes with a hand-drawn aesthetic via `roughjs`.
- Support selection, move, resize, and delete for all elements.
- Persist and hydrate canvas state from IndexedDB with debounced writes.
- Sync canvas state across clients in real time using Yjs over WebSocket.
- Display live remote cursors with user name and color.
- Offer a prompt-driven AI generation feature with a swappable service layer.
- Structure development in five testable phases with user confirmation checkpoints.

**Non-Goals:**
- Real AI model integration in the first pass (mock only).
- Authentication or user accounts.
- Mobile/touch optimization.
- Export to image or file formats.
- Undo/redo history.

## Decisions

- **React + Vite over Vanilla TS**: React provides component structure for toolbars, prompt overlays, and cursor rendering while keeping the canvas engine in plain TypeScript modules for performance.
- **Native HTML5 Canvas + `roughjs`**: Native Canvas gives full control over rendering and interaction; `roughjs` provides the Excalidraw-style sketchy look without building a custom renderer.
- **`Yjs` with `y-websocket`**: Yjs is the de-facto CRDT for collaborative text/state and integrates cleanly with a JSON-shaped element array. `y-websocket` provides plug-and-play multiplayer sync.
- **IndexedDB via `idb` over `localStorage`**: IndexedDB handles larger serialized canvas states and supports structured data; `idb` simplifies the async API.
- **Single `Y.Array<CanvasElement>` as source of truth**: Each canvas element is a plain serializable object stored in a Yjs array. Local React state mirrors the Yjs array for rendering.
- **Mock AI service behind a clean interface**: The AI module exposes `generateComponent(prompt, center)` returning a promise of canvas elements. Swapping to a real API only requires replacing this function.
- **Live cursors via Yjs Awareness**: Cursor positions and user metadata are shared through Yjs awareness, separate from the element array.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Public `y-websocket` server unavailable or slow | Document how to run a local `y-websocket` server; default provider points to a public demo server for quick testing. |
| Canvas performance degrades with many elements | Use `requestAnimationFrame`, batch rendering, and consider spatial partitioning in future iterations. Initial target is 500 elements at 60 FPS. |
| IndexedDB quota exceeded | Keep snapshots bounded; future iteration can add export/clear options. |
| AI service latency/prompt injection | Mock service has fixed latency; real API integration will validate inputs and sanitize prompt content. |
| Yjs array order vs. z-index | Elements render in array order; z-index equals array index. |

## Migration Plan

- Not applicable; this is a new project with no existing deployment or data.

## Open Questions

- Which public or self-hosted WebSocket endpoint should be used by default? (Default: `wss://demos.yjs.dev/ws` for testing.)
- Should AI-generated results be images, vector groups, or both? (Decision: support both; mock returns grouped vector shapes and optionally a placeholder image.)
