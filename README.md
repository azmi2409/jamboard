# Jamboard

A collaborative AI-powered whiteboard built with React, TypeScript, and HTML5 Canvas. Draw, brainstorm, and collaborate in real-time with others.

**Demo:** [https://jamboard-rust.vercel.app](https://jamboard-rust.vercel.app)

## Features

- **Drawing Tools**: Rectangle, ellipse, line, arrow, freehand draw, and text
- **Roughness Toggle**: Switch between fine (smooth) and rough (hand-drawn) styles
- **Real-time Collaboration**: Yjs + y-websocket for live multi-user editing with cursor tracking
- **AI Generation**: Generate shapes and layouts from text prompts (Cmd/Ctrl + K)
- **Undo/Redo**: Full history support with Ctrl+Z / Ctrl+Shift+Z
- **Copy/Paste**: Ctrl+C / Ctrl+V / Ctrl+X for element duplication
- **Zoom Controls**: Scroll to zoom, +/- buttons, pinch-to-zoom support
- **Pan**: Drag on empty space, Shift+click, or middle mouse button
- **Auto-save**: IndexedDB persistence - your work is saved automatically
- **Double-click Text Editing**: Double-click any shape to add text, or double-click empty space to create text

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast dev/build
- **HTML5 Canvas** with [roughjs](https://roughjs.com/) for hand-drawn rendering
- **Yjs** + [y-websocket](https://github.com/yjs/y-websocket) for real-time collaboration
- **IndexedDB** via [idb](https://www.npmjs.com/package/idb) for local persistence
- **Tailwind CSS v4** for styling
- **Lucide React** for icons

## Getting Started

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Lint
pnpm lint
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `V` | Select tool |
| `R` | Rectangle |
| `E` | Ellipse |
| `A` | Arrow |
| `L` | Line |
| `D` | Draw (freehand) |
| `T` | Text |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` | Redo |
| `Ctrl/Cmd + C` | Copy |
| `Ctrl/Cmd + V` | Paste |
| `Ctrl/Cmd + X` | Cut |
| `Delete / Backspace` | Delete selected |
| `Ctrl/Cmd + K` | AI Generate |
| `Shift + Drag` | Pan canvas |
| `Scroll` | Zoom in/out |

## Project Structure

```
src/
├── ai/              # AI generation service
├── canvas/          # Canvas engine (types, math, rendering, geometry)
├── components/      # React components (Canvas, Toolbar, PromptBar, etc.)
├── hooks/           # Custom hooks (useHistory, useClipboard, useAutoSave, etc.)
└── state/           # Yjs document and IndexedDB persistence
```

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## TODO

- [ ] Sticky notes tool
- [ ] Shape connectors with auto-routing
- [ ] Element grouping/ungrouping
- [ ] Layer management (bring to front, send to back)
- [ ] Snap to grid and alignment guides
- [ ] Export to PNG/SVG
- [ ] Image upload and embedding
- [ ] Color picker for stroke/fill
- [ ] Stroke width adjustment
- [ ] Multi-select with rubber band
- [ ] Touch/mobile gesture support
- [ ] Keyboard accessibility
- [ ] Collaboration cursors avatars
- [ ] Version history timeline
- [ ] Templates and presets
- [ ] Dark mode

## License

MIT
