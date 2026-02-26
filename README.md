# Swizzle Particle Editor

A visual editor for designing particle effects with the [Swizzle](https://github.com/your-org/swizzle) particle system. Desktop-only, browser-based — no server required.

## Features

- **Three-panel layout** — Layers / Assets / Examples | Live Preview | Properties Inspector
- **Live preview** — Real-time PixiJS rendering with play/pause/restart controls
- **9 emitter types** — Point, Area, Circle, Line, Polygon, Path, Burst, Timed, Triggered
- **13 behavior types** — Velocity, Gravity, Drag, Fade, Scale, Rotation, Color, Bounds, Velocity Acceleration, Velocity Align, Velocity Stretch, Keyframe, Proximity Link
- **Asset management** — Upload textures, auto-detect numbered image sequences for animation
- **YAML export/import** — PSAC (Particle System as Code) configs, compatible with Swizzle runtime
- **Undo/redo** — Full history with Ctrl+Z / Ctrl+Shift+Z
- **Built-in examples** — Filterable gallery of preset effects to learn from and modify
- **Dark & light themes** — Token-based design system

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Development

```bash
# From the repo root
npm install

# Start the editor dev server (port 3001)
npm run dev --workspace=apps/editor

# Or from this directory
cd apps/editor
npm run dev
```

### Production Build

```bash
npm run build --workspace=apps/editor
```

Output goes to `apps/editor/dist/`. Serve with any static file server.

### Testing

```bash
npm test --workspace=apps/editor      # Run tests once
npm run typecheck --workspace=apps/editor  # Type-check
```

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+S` | Export YAML |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` / `Ctrl+Y` | Redo |
| `Ctrl+D` | Duplicate selected layer |
| `Delete` | Delete selected layer |
| `Space` | Play / Pause |
| `Escape` | Deselect layer |

## Project Structure

```
src/
├── components/
│   ├── layout/        # Header, LeftPanel, CenterPanel, RightPanel, StatusBar
│   ├── layers/        # Layer list with drag-drop reordering
│   ├── assets/        # Asset library with sequence detection
│   ├── examples/      # Built-in effect gallery
│   ├── preview/       # PixiJS canvas and playback controls
│   ├── properties/    # Property inspector, emitter forms, behavior forms, fields
│   └── ui/            # Primitives (Button, Input, Label, Toggle, etc.)
├── data/              # Example effect definitions
├── hooks/             # useKeyboardShortcuts, useResizable
├── store/             # Zustand store (config, assets, UI, history)
├── types/             # Behavior and emitter type registries
├── utils/             # Config transform (YAML ↔ EditorConfig), sequence detection
├── lib/               # Utility helpers (cn, generateId, debounce, etc.)
└── styles/            # tokens.css (design tokens), globals.css
```

## Tech Stack

| Concern | Library |
|---|---|
| UI Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| State Management | Zustand 4 |
| Rendering | PixiJS 8 (via Swizzle) |
| UI Primitives | Radix UI |
| Styling | Tailwind CSS 3 + CSS custom properties |
| Icons | Lucide React |
| Notifications | Sonner |
| Drag & Drop | react-beautiful-dnd |
| Testing | Vitest + Testing Library |

## Architecture

- **State**: Zustand store mirrors PSAC YAML structure 1:1. Undo/redo via snapshot history.
- **Assets**: IndexedDB persistence for uploaded textures; auto-detected frame sequences.
- **Preview**: Debounced ParticleSystem rebuilds (150ms) on config changes. PixiJS canvas with ticker-driven updates.
- **Styling**: Token-based design system (`tokens.css`) — all components use CSS custom properties, never hardcoded values.
- **Type Safety**: Strict TypeScript throughout. Typed registries for emitter and behavior configurations.

## License

MIT
