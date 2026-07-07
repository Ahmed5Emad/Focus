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
                    ├── @hocuspocus/extension-database (inline fetch/store to Supabase)
                    └── @hocuspocus/extension-logger
```

## Hocuspocus Server

Located at `server/hocuspocus.ts`. Runs as a standalone Node.js process:

```bash
bun run server        # or: npx tsx server/hocuspocus.ts
```

### Server Script

```typescript
import { Server } from "@hocuspocus/server";
import { Database } from "@hocuspocus/extension-database";
import { Logger } from "@hocuspocus/extension-logger";
import { createClient } from "@supabase/supabase-js";
import * as Y from "yjs";

const server = new Server({
  port: parseInt(process.env.HOCUSPOCUS_PORT || "1234", 10),
  extensions: [
    new Logger(),
    new Database({
      async fetch({ documentName, context }) {
        // Load Yjs snapshot from Supabase documents table
        const token = context?.user_token;
        const client = token
          ? createAuthClient(token)
          : createClient(supabaseUrl, supabaseAnonKey);
        const { data } = await client
          .from("documents")
          .select("yjs_snapshot")
          .eq("id", documentName)
          .single();
        if (!data?.yjs_snapshot) return null;
        // Handle bytea format from Postgres (\x<hex>)
        const raw = data.yjs_snapshot;
        const hex = typeof raw === "string"
          ? raw.startsWith("\\x") ? raw.slice(2) : raw
          : Buffer.from(raw).toString("hex");
        return Buffer.from(hex, "hex");
      },
      async store({ documentName, state, lastContext }) {
        // Save Yjs snapshot to Supabase as hex bytea
        const token = lastContext?.user_token;
        const client = token
          ? createAuthClient(token)
          : createClient(supabaseUrl, supabaseAnonKey);
        await client
          .from("documents")
          .update({
            yjs_snapshot: `\\x${(state as Buffer).toString("hex")}`,
            updated_at: new Date().toISOString(),
          })
          .eq("id", documentName);
      },
    }),
  ],
  async onAuthenticate({ token, context }) {
    // Verify JWT — only authenticated users can collaborate
    const anonClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await anonClient.auth.getUser(token);
    if (error || !data.user) throw new Error("Invalid JWT token");
    context.user_token = token;
  },
});

server.listen();
```

Key details:
- **Port**: 1234 (configurable via `HOCUSPOCUS_PORT`)
- **Authentication**: Validates Supabase `access_token` from the client via `supabase.auth.getUser()`
- **Persistence**: `@hocuspocus/extension-database` with custom `fetch`/`store` callbacks reads/writes `yjs_snapshot` (bytea) on the `documents` table
- **Bytea format**: Postgres bytea hex format (`\\x<hex>`) is used — the server encodes with `\\x${hex}` and decodes by stripping `\\x`

## Frontend Integration

### Provider

```typescript
import { HocuspocusProvider } from "@hocuspocus/provider";

const provider = new HocuspocusProvider({
  url: import.meta.env.VITE_HOCUSPOCUS_URL, // e.g. ws://localhost:1234
  name: docId, // Document UUID
  token: session.access_token, // Supabase access token for auth
});
```

Created inside `useMemo` to avoid re-creating on re-renders.

### TipTap Editor

Uses `@tiptap/extension-collaboration` to bind the Yjs document to ProseMirror. Content syncs in real-time across all connected clients.

### Collaboration Cursor

Located at `src/App/Pages/Documents/components/CollaborationCursor.ts`. Custom cursor awareness extension that replaces `@tiptap/extension-collaboration-cursor` v2 (incompatible with TipTap v3). Uses a raw ProseMirror Plugin with the Yjs cursor plugin.

## Exports

Documents can be exported to:
- **Markdown** — via custom TipTap extension + Turndown
- **PDF** — via `window.print()` (browser print-to-PDF)
- **HTML** — via `editor.getHTML()`
