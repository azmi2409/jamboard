# Contributing to Jamboard

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

```bash
# Clone the repo
git clone https://github.com/your-username/jamboard.git
cd jamboard

# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

The dev server runs at `http://localhost:5173/`.

## Project Guidelines

### Code Style

- TypeScript strict mode
- Functional components with hooks
- Tailwind CSS for styling (utility classes only)
- Lucide React for icons

### Commits

Use conventional commits:

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation only
- `refactor:` code change that neither fixes a bug nor adds a feature
- `test:` adding tests
- `chore:` maintenance tasks

Examples:
```
feat: add shape grouping
fix: prevent text editor opening during drag
docs: update README with contributing guide
```

### Pull Requests

1. Fork the repo and create your branch from `main`
2. Make your changes
3. Run `pnpm build` and `pnpm lint` to verify
4. Write a clear PR description
5. Open a PR

### Reporting Issues

- Use GitHub Issues
- Include steps to reproduce
- Include browser/OS info
- Screenshots welcome

## Architecture

```
src/
├── ai/              # Swappable AI generation interface
├── canvas/          # Core canvas engine
│   ├── types.ts     # Element and tool types
│   ├── math.ts      # Coordinate transforms, utilities
│   ├── tools.ts     # Element creation and manipulation
│   ├── render.ts    # Canvas rendering with roughjs
│   └── geometry.ts  # Hit testing and bounds calculation
├── components/      # React UI components
├── hooks/           # Custom React hooks
└── state/           # Yjs and IndexedDB state management
```

### Key Concepts

- **Elements**: All shapes are `CanvasElement` objects with position, size, style
- **Viewport**: Pan/zoom state (x, y, zoom)
- **Tools**: Active drawing mode (select, rectangle, ellipse, etc.)
- **History**: Undo/redo stack via `useHistory` hook
- **Collaboration**: Yjs document syncs elements across users

## Areas to Contribute

- New drawing tools (sticky notes, shapes, connectors)
- Export to PNG/SVG
- Element grouping/ungrouping
- Layer management
- Snap to grid/guides
- Touch/mobile support improvements
- Accessibility
- Tests

## Questions?

Open a GitHub Issue or start a Discussion.
