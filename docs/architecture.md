# Architecture Overview

Focus is a **React + Vite** SPA with a **Supabase** backend. All real-time collaboration uses Supabase Realtime — no separate WebSocket server. Instrumented with **Sentry** for error tracking.

## High-Level Architecture

```
Browser (React SPA)
  │
  ├── Sentry (error tracking)
  ├── Vercel Speed Insights + Analytics
  │
  └── Supabase Client ── HTTPS/WebSocket ──► Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions)
                                              │
                                              ├── Auth (email/password, Google, Apple)
                                              ├── Database (PostgreSQL with RLS)
                                              ├── Realtime (broadcast, presence, postgres changes)
                                              ├── Storage (chat-attachments bucket)
                                              └── Edge Functions (send-notification)
```

No Hocuspocus server. No separate deployment. Everything runs on Supabase.

## Frontend Architecture

- **React 19** with TypeScript
- **react-router-dom v7** with HashRouter
- **Tailwind CSS v4**
- **Radix UI** primitives + **shadcn/ui** components
- **Supabase SSR** (`@supabase/ssr` v0.10.2) for session management
- **Sentry** for error tracking (CDN loader + React integration)
- **Vite** (v7) with bundler

### Key Features

| Feature | Implementation |
|---------|---------------|
| **Auth** | Supabase Auth (email/password, Google, Apple) with PKCE OAuth, cookie-based sessions via `@supabase/ssr` |
| **Search** | Universal CommandPalette (Cmd+K) across tasks/goals/projects/documents; separate GlobalSearch hook for full-text |
| **Notifications** | `useNotifications` hook with real-time subscription via postgres_changes, Popover UI, mark-as-read |
| **Chat** | Realtime Presence for typing indicators, Storage for file uploads, message status tracking (sent/delivered/read), @mention notifications |
| **Direct Messages** | 1:1 messaging with same feature set as chat, presence tracking |
| **Documents** | TipTap editor + Yjs + Supabase Realtime Broadcast for collaborative editing, document comments with text selection |
| **Tasks** | Kanban board, list view, calendar view, priorities (none/low/medium/high/urgent), due dates, assignments, subtasks, task dependencies, recurrence, templates, workflow statuses, custom fields |
| **Dashboard** | Real stats from `get_dashboard_stats` RPC, activity feed, weekly trends with 999% cap |
| **Focus Timer** | Pomodoro/flow timer with distraction logging, flow score, session history editing |
| **Activity Feed** | `useActivityFeed` hook with real-time INSERT subscription, user profile enrichment |
| **Presence** | `usePresence` hook showing online users per page via Realtime Presence |
| **Keyboard Shortcuts** | `KeyboardShortcutsModal` with full shortcut listing |
| **Settings** | Preferences persisted to localStorage + DB, notifications config, integrations |
| **Sentry** | Error boundary, `Sentry.setUser()` on auth, performance monitoring |

### State Management

- `AuthContext` — Session, user, workspaces, workspace validation
- `FocusContext` — Timer/focus session state
- Custom hooks: `useDocuments`, `useTasks`, `useChat`, `useDirectMessages`, `useNotifications`, `usePreferences`, `useActivityFeed`, `usePresence`, `useGlobalSearch`

### AuthContext — Tab Visibility Fix

When the browser tab comes back after being in the background, Supabase's GoTrue client fires `_recoverAndRefresh()` which emits `SIGNED_IN` or `TOKEN_REFRESHED`. The `AuthContext` now uses a `hasInitialFetch` ref to skip redundant `setUser`/`setSession`/`fetchWorkspaces` calls on these repeated events — preventing cascading re-renders that would nullify `currentWorkspaceId` and cause all data hooks to show skeleton loading states. See [Authentication](backend/authentication.md#tab-visibility--data-persistence) for details.

### Routing

- Public: `/`, `/login`, `/signup`, `/pricing`, `/about`, `/features`, `/auth/callback`, `/auth/verification-pending`
- Protected (inside `AppLayout`): `/dashboard`, `/tasks`, `/projects`, `/goals`, `/documents`, `/documents/:id`, `/chat`, `/focus-timer`, `/settings`, `/archive`, `/management`, `/support`, `/tasks/new`
- Onboarding: `/onboarding` (4 steps)
- 404: `*` → `NotFound`

## Backend (Supabase)

- **PostgreSQL** with Row-Level Security (RLS)
- **Supabase Auth** — email/password, Google OAuth, Apple OAuth (PKCE)
- **Supabase Realtime** — broadcast for Yjs document sync, presence for chat typing indicators/online users, postgres_changes for live UI updates across tasks/chat/notifications/activity
- **Supabase Storage** — `chat-attachments` bucket
- **Edge Functions** — `send-notification` for out-of-band push
- **Custom RPCs** — `get_dashboard_stats`, `get_workspace_members_with_email`, `search_tasks_fulltext`
- **13 migrations** applied — covering core tables, task dependencies, recurrence, workflow config, custom fields, full-text search, activity logs, notification preferences, archival policy, rate limiting, composite indexes, task reordering

## Data Flow

```
User Action → React Component → Custom Hook → Supabase Client
                                                  │
                                    ┌─────────────┼─────────────┐
                                    ▼             ▼             ▼
                              PostgreSQL     Realtime      Storage
                              (RLS auth)   (broadcast,    (files)
                                            presence,
                                            postgres_changes)
                                    │             │
                                    ▼             ▼
                              UI updates     Other clients
                              (state)       receive update
```

On tab visibility change, Supabase Realtime WebSocket reconnects silently — postgres_changes callbacks use silent re-fetches that don't trigger loading states.
