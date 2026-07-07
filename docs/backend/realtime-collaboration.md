# Real-time Collaboration

## Overview

Documents support real-time collaborative editing via **Yjs** (CRDT) + **Hocuspocus** (server) + **TipTap** (editor).

## Architecture

```
TipTap Editor (Browser)
  │
  ├── @tiptap/core + extensions
  ├── @tiptap/extension-collaboration (Yjs binding)
  └── CollaborationCursor (custom awareness plugin)
        │
        └── Hocuspocus Provider (WebSocket)
              │
              └── Hocuspocus Server (Node.js, port 1234)
                    │
                    ├── Supabase Extension (persist Yjs document)
                    └── Logger Extension
```

## Hocuspocus Server

Located at `server/hocuspocus.ts`. Runs as a standalone Node.js process:

```bash
bun run server        # or: npx tsx server/hocuspocus.ts
```

Key configuration:
- **Port**: 1234
- **Authentication**: JWT verification (validates Supabase `access_token` from the client)
- **Persistence**: Supabase extension saves/loads Yjs document state to/from the `documents` table (`yjs_snapshot` column)
- **Timeout**: 30 seconds for inactivity

### Server Script

```typescript
import { Server } from '@hocuspocus/server'
import { SupabaseExtension } from './extensions/supabase'

const server = Server.configure({
  port: 1234,
  extensions: [new SupabaseExtension(), new Logger()],
  timeout: 30000,
  onAuthenticate({ token }) {
    // Verify Supabase JWT
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !user) throw new Error('Unauthorized')
    return { user }
  },
})

server.listen()
```

## Frontend Integration

### Provider (`src/App/Pages/Documents/components/Editor.tsx`)

```typescript
import { HocuspocusProvider } from '@hocuspocus/provider'

const provider = new HocuspocusProvider({
  url: import.meta.env.VITE_HOCUSPOCUS_URL, // ws://localhost:1234
  name: docId, // Document UUID
  token: session.access_token, // Supabase access token for auth
})
```

The provider is created inside a `useMemo` to avoid re-creating on re-renders.

### TipTap Editor

Uses `@tiptap/extension-collaboration` to bind the Yjs document to ProseMirror. The editor content is synced in real-time across all connected clients.

### Collaboration Cursor (`src/App/Pages/Documents/components/CollaborationCursor.ts`)

Custom cursor awareness extension (replaces `@tiptap/extension-collaboration-cursor` v2 which is incompatible with TipTap v3). Uses a raw ProseMirror Plugin with the Yjs cursor plugin, guarded against null ySyncPlugin state.

## Exports

Documents can be exported to:
- **Markdown** — via custom TipTap extension + Turndown
- **PDF** — via `window.print()` (browser print-to-PDF)
- **HTML** — via `editor.getHTML()`
