# Architecture Overview

Focus is a **React + Vite** SPA with a **Supabase** backend and a standalone **Hocuspocus** server for real-time collaborative editing.

## High-Level Architecture

```
Browser (React SPA)
  │
  ├── Supabase Client ────── HTTPS ────► Supabase (PostgreSQL, Auth, Realtime)
  │
  ├── Hocuspocus Client ──── WebSocket ─► Hocuspocus Server (Node.js, port 1234)
  │                                        │
  │                                        └──► Supabase (persist Yjs documents)
  │
  └── Vite Dev Server (port 5174/5173)
```

## Frontend Architecture

- **React 19** with TypeScript
- **react-router-dom v7** with HashRouter (all routes in URL hash)
- **Tailwind CSS v4** with custom OKLCH color palette
- **Radix UI** primitives + **shadcn/ui** components
- **Supabase SSR** for cookie-based session management

### State Management

React Context providers for global state:
- `AuthContext` — Session, user, workspaces, workspace selection
- `FocusContext` — Timer/focus session state

Custom hooks for feature-level state:
- `useDocuments`, `useTasks`, `useChat`, `useDirectMessages`

### Routing

- Public routes: `/`, `/login`, `/signup`, `/pricing`, `/about`, `/features`, `/auth/callback`
- Protected routes (require auth): `/dashboard`, `/tasks`, `/projects`, `/goals`, `/documents`, `/chat`, `/focus-timer`, `/settings`, etc.
- Onboarding routes: `/onboarding`, `/onboarding/deep-work`, `/onboarding/power-tools`, `/onboarding/final-setup`

## Backend (Supabase)

- **PostgreSQL** database with Row-Level Security (RLS)
- **Supabase Auth** — email/password, Google OAuth, Apple OAuth (PKCE flow)
- **Supabase Realtime** — broadcast task updates across sessions
- **Migrations** in `supabase/migrations/` — versioned SQL files

## Collaborative Editing (Hocuspocus)

A standalone Node.js server (`server/hocuspocus.ts`) provides real-time collaborative editing:
- WebSocket server using **Hocuspocus** (port 1234)
- JWT-based authentication (validates Supabase access tokens)
- Yjs document persistence via Supabase extension
- Used by the **TipTap** rich text editor (Documents feature)
