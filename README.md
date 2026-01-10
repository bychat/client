# ByChat Electron Client

An Electron-based desktop chat application with login functionality for the ByChat platform.

## Features

- 🔐 User authentication (login/signup) via Supabase
- 💬 Chat interface
- 🎨 Material-UI (MUI) components
- 🖥️ Native desktop experience with Electron
- 🔒 Secure context isolation with preload scripts

## Prerequisites

- Node.js 18+ (20+ recommended)
- npm

## Project Structure

```
client/
├── src/
│   ├── main/           # Electron main process
│   │   ├── main.ts     # Entry point, window creation
│   │   ├── preload.ts  # Context bridge for IPC
│   │   └── ipc.ts      # IPC handlers
│   └── renderer/       # React frontend
│       ├── App.tsx     # Root component
│       ├── main.tsx    # React entry
│       ├── components/ # UI components
│       │   ├── Login.tsx
│       │   └── Chat.tsx
│       ├── context/    # React contexts
│       └── types/      # TypeScript types
├── package.json
└── vite.config.ts
```

## Setup

1. **Install dependencies:**
   ```bash
   cd client
   npm install
   ```

2. **Configure environment variables:**
   
   Copy `.env.example` to `.env` and update:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   API_URL=http://localhost:3000
   ```

3. **Start development:**
   ```bash
   npm run dev
   ```

   Or run separately:
   ```bash
   # Terminal 1: Start renderer
   npm run dev:renderer
   
   # Terminal 2: Start Electron
   NODE_ENV=development npm run dev:main
   ```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both renderer and main process |
| `npm run dev:renderer` | Start Vite dev server |
| `npm run dev:main` | Build and start Electron |
| `npm run build` | Build for production |
| `npm run start` | Start built app |
| `npm run pack` | Package app |
| `npm run dist` | Create distributable |

## Architecture (Electron Standards)

This app follows Electron best practices:

1. **Main Process** (`src/main/main.ts`)
   - Uses `app.whenReady()` pattern
   - Handles window lifecycle for all platforms
   - `contextIsolation: true` and `nodeIntegration: false`

2. **Preload Script** (`src/main/preload.ts`)
   - Uses `contextBridge` to safely expose APIs
   - No direct exposure of `ipcRenderer`

3. **Renderer Process** (`src/renderer/`)
   - React app with MUI
   - Communicates via `window.electronAPI`

## Technologies

- **Electron** - Desktop framework
- **React** - UI library
- **Material-UI** - Component library
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Supabase** - Authentication
