# Real-time Collaboration

## Overview

Documents support real-time collaborative editing via **Yjs** (CRDT) + **Supabase Realtime Broadcast** + **TipTap** (editor).

## Architecture

```
TipTap Editor (Browser)
  │
  ├── @tiptap/core + extensions
  ├── @tiptap/extension-collaboration (Yjs binding)
  └── CollaborationCursor (custom awareness plugin)
        │
        └── Supabase Realtime Broadcast Channel
              │
              ├── Yjs document updates (synced to all clients)
              ├── Cursor/awareness positions (real-time cursor sharing)
              └── No separate server — everything goes through Supabase
```

No Hocuspocus server. No WebSocket server to deploy. Yjs updates and cursor positions are broadcast via Supabase Realtime, and the document state is persisted directly to the `documents` table.

## How It Works

### Connection

When a user opens a document:

1. Fetch the Yjs snapshot from `documents.yjs_snapshot` (bytea column)
2. Create a Yjs `Doc` and apply the snapshot via `Y.applyUpdate()`
3. Subscribe to a Supabase Realtime Broadcast channel named `document-{id}`
4. Listen for `"yjs-update"` and `"awareness"` messages

### Syncing

- **Local changes**: Yjs fires an `"update"` event → serialize the update (`Y.encodeStateAsUpdate` subset) → broadcast via Realtime as `"yjs-update"`
- **Remote changes**: Receive `"yjs-update"` on the Realtime channel → `Y.applyUpdate(doc, update)` → TipTap re-renders
- **Persistence**: Every 3 seconds, save the editor JSON content + Yjs snapshot to Supabase

### Cursor Sharing (Awareness)

- **Local cursor move**: Editor fires a `selectionUpdate` event → broadcast cursor position + user info as `"awareness"` message
- **Remote cursor**: Receive `"awareness"` → update local cursor decorations
- **Cleanup**: Remove cursors that haven't sent an update in 10 seconds

### Message Format

```typescript
// Yjs document update (binary encoded as base64)
{ type: "yjs-update", data: "<base64-encoded Uint8Array>" }

// Cursor position
{ type: "awareness", user: { name: string, color: string }, cursor: { anchor: number, head: number | null } }
```

## Frontend Implementation

### Editor (`src/App/Pages/Documents/components/Editor.tsx`)

Key parts:

```typescript
// 1. Create Yjs document
const ydoc = useMemo(() => new Y.Doc(), [documentId]);

// 2. Subscribe to Supabase Realtime Broadcast
const channel = supabase.channel(`document-${documentId}`);
channel.on("broadcast", { event: "yjs-update" }, ({ payload }) => {
  const update = base64ToUint8Array(payload.data);
  Y.applyUpdate(ydoc, update);
});
channel.subscribe();

// 3. Broadcast local Yjs changes
ydoc.on("update", (update: Uint8Array) => {
  channel.send({
    type: "broadcast",
    event: "yjs-update",
    payload: { data: uint8ArrayToBase64(update) },
  });
});

// 4. Auto-save to Supabase every 3 seconds
setInterval(async () => {
  await supabase.from("documents").update({
    content: editor.getJSON(),
    yjs_snapshot: `\\x${uint8ArrayToHex(Y.encodeStateAsUpdate(ydoc))}`,
    updated_at: new Date().toISOString(),
  }).eq("id", documentId);
}, 3000);
```

### Collaboration Cursor (`src/App/Pages/Documents/components/CollaborationCursor.ts`)

Custom ProseMirror plugin that:
- Listens for cursor position broadcasts from other users
- Renders colored cursor indicators with user name labels
- Highlights text selections
- Cleans up stale cursors after 10s of inactivity

### Utility Functions

```typescript
function uint8ArrayToBase64(uint8: Uint8Array): string {
  return btoa(String.fromCharCode(...uint8));
}

function base64ToUint8Array(base64: string): Uint8Array {
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}
```

## Exports

Documents can be exported to:
- **Markdown** — via custom TipTap extension + Turndown
- **PDF** — via `window.print()` (browser print-to-PDF)
- **HTML** — via `editor.getHTML()`
