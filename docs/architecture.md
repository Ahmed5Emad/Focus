# Architecture Overview

Focus is a **React + Vite** SPA with a **Supabase** backend and a standalone **Hocuspocus** server for real-time collaborative editing.

## High-Level Architecture

```
Browser (React SPA)
  │
  ├── Supabase Client ── HTTPS ───► Supabase (PostgreSQL, Auth, Realtime, Storage)
  │
  ├── Hocuspocus Client ── WebSocket ──► Hocuspocus Server (Node.js, port 1234)
  │                                         │
  │                                         └──► Supabase (persist Yjs documents)
  │
  └── Vite Dev Server (port 5174)
```

## Frontend Architecture

- **React 19** with TypeScript
- **react-router-dom v7** with HashRouter (all routes in URL hash)
- **Tailwind CSS v4** with custom OKLCH color palette
- **Radix UI** primitives + **shadcn/ui** components
- **Supabase SSR** for cookie-based session management

### Key Features

| Feature | Implementation |
|---------|---------------|
| **Auth** | Supabase Auth (email/password, Google, Apple) with PKCE OAuth flow |
| **Search** | Universal CommandPalette (Cmd+K) searches across tasks/goals/projects/documents |
| **Notifications** | `useNotifications` hook with real-time subscription, Popover UI |
| **Chat** | Realtime Presence for typing indicators, Storage for file uploads, message status tracking |
| **Documents** | TipTap editor + Hocuspocus + Yjs for real-time collaborative editing |
| **Tasks** | Priority (none/low/medium/high/urgent), due dates, assignments, subtasks |
| **Dashboard** | Real stats from `get_dashboard_stats` RPC (flow score, deep work time, task counts) |
| **Settings** | Preferences persisted to localStorage, integration placeholders |

### State Management

React Context providers:
- `AuthContext` — Session, user, workspaces, workspace selection
- `FocusContext` — Timer/focus session state

Custom hooks for feature-level state:
- `useDocuments`, `useTasks`, `useChat`, `useDirectMessages`, `useNotifications`, `usePreferences`

### Routing

- Public routes: `/`, `/login`, `/signup`, `/pricing`, `/about`, `/features`, `/auth/callback`
- Protected routes: `/dashboard`, `/tasks`, `/projects`, `/goals`, `/documents`, `/chat`, `/focus-timer`, `/settings`, `/archive`, `/management`, `/support`
- Onboarding: `/onboarding`, `/onboarding/deep-work`, `/onboarding/power-tools`, `/onboarding/final-setup`
- 404 catch-all: `*` renders `NotFound` component

## Backend (Supabase)

- **PostgreSQL** database with Row-Level Security (RLS)
- **Supabase Auth** — email/password, Google OAuth, Apple OAuth (PKCE flow)
- **Supabase Realtime** — broadcast updates (chat messages, notifications)
- **Supabase Storage** — `chat-attachments` bucket for file uploads
- **Custom RPC** — `get_dashboard_stats` returns aggregated metrics
- **Migrations** in `supabase/migrations/` — versioned SQL files

## Collaborative Editing (Hocuspocus)

Standalone Node.js server (`server/hocuspocus.ts`):
- WebSocket using **Hocuspocus** (port 1234)
- JWT authentication via Supabase `getUser`
- Yjs document persistence via `@hocuspocus/extension-database` with custom Supabase callbacks
- Deployed separately on Railway (see [Deployment](deployment.md))

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
