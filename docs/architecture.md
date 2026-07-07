# Architecture Overview

Focus is a **React + Vite** SPA with a **Supabase** backend. All real-time collaboration uses Supabase Realtime — no separate WebSocket server.

## High-Level Architecture

```
Browser (React SPA)
  │
  └── Supabase Client ── HTTPS/WebSocket ──► Supabase (PostgreSQL, Auth, Realtime, Storage)
                                              │
                                              ├── Auth (email/password, Google, Apple)
                                              ├── Database (PostgreSQL with RLS)
                                              ├── Realtime (broadcast, presence, postgres changes)
                                              └── Storage (file uploads)
```

No Hocuspocus server. No separate deployment. Everything runs on Supabase.

## Frontend Architecture

- **React 19** with TypeScript
- **react-router-dom v7** with HashRouter
- **Tailwind CSS v4**
- **Radix UI** primitives + **shadcn/ui** components
- **Supabase SSR** for session management

### Key Features

| Feature | Implementation |
|---------|---------------|
| **Auth** | Supabase Auth (email/password, Google, Apple) with PKCE OAuth |
| **Search** | Universal CommandPalette (Cmd+K) across tasks/goals/projects/documents |
| **Notifications** | `useNotifications` hook with real-time subscription, Popover UI |
| **Chat** | Realtime Presence for typing indicators, Storage for file uploads, message status tracking |
| **Documents** | TipTap editor + Yjs + Supabase Realtime Broadcast for collaborative editing |
| **Tasks** | Priority (none/low/medium/high/urgent), due dates, assignments, subtasks |
| **Dashboard** | Real stats from `get_dashboard_stats` RPC |
| **Settings** | Preferences persisted to localStorage |

### State Management

- `AuthContext` — Session, user, workspaces
- `FocusContext` — Timer/focus session state
- Custom hooks: `useDocuments`, `useTasks`, `useChat`, `useDirectMessages`, `useNotifications`, `usePreferences`

### Routing

- Public: `/`, `/login`, `/signup`, `/pricing`, `/about`, `/features`, `/auth/callback`
- Protected: `/dashboard`, `/tasks`, `/projects`, `/goals`, `/documents`, `/chat`, `/focus-timer`, `/settings`, `/archive`, `/management`, `/support`
- Onboarding: `/onboarding` (4 steps)
- 404: `*` → `NotFound`

## Backend (Supabase)

- **PostgreSQL** with Row-Level Security (RLS)
- **Supabase Auth** — email/password, Google OAuth, Apple OAuth (PKCE)
- **Supabase Realtime** — broadcast for Yjs document sync, presence for chat typing indicators, postgres_changes for live UI updates
- **Supabase Storage** — `chat-attachments` bucket
- **Custom RPC** — `get_dashboard_stats`

## Data Flow

```
User Action → React Component → Custom Hook → Supabase Client
                                                  │
                                    ┌─────────────┼─────────────┐
                                    ▼             ▼             ▼
                              PostgreSQL     Realtime      Storage
                              (RLS auth)   (broadcast)   (files)
                                    │             │
                                    ▼             ▼
                              UI updates     Other clients
                              (state)       receive update
```
