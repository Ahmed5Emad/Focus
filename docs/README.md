# Focus Documentation

## Getting Started
- [Getting Started](getting-started.md) — Setup, env vars, running the app

## Architecture & Design
- [Architecture Overview](architecture.md) — App structure and data flow
- [Project Structure](frontend/project-structure.md) — Codebase layout explained

## Backend
- [Database Schema](backend/database.md) — Tables, RLS policies, migrations
- [Authentication](backend/authentication.md) — Auth flow, PKCE, session handling, tab-visibility fix
- [Real-time Collaboration](backend/realtime-collaboration.md) — Yjs + Supabase Realtime

## Operations
- [Deployment](deployment.md) — Vercel deployment, Edge Functions
- [Troubleshooting](troubleshooting.md) — Common issues and solutions

## Features
- **Dashboard** — Real stats (flow score, deep work time, task counts) from RPC, activity feed, weekly trends
- **Tasks** — Kanban board, list view, calendar view, priorities, due dates, assignments, subtasks, dependencies, recurrence, templates, workflow statuses, custom fields
- **Goals** — Progress tracking with linked tasks, percentage completion
- **Projects** — Task grouping by project, empty state
- **Collaborative Documents** — Real-time editing with TipTap + Yjs + Supabase Realtime, comments with text selection
- **Workspace Chat** — Real-time messaging with typing indicators, file uploads, read status, @mentions
- **Direct Messages** — 1:1 messaging with presence indicators
- **Focus Timer** — Pomodoro/flow timer sessions with distraction logging, session history editor
- **Notifications** — In-app bell with real-time updates, assignment/mention/comment alerts
- **Command Palette** — Universal search (Cmd+K) across tasks, goals, projects, documents
- **Keyboard Shortcuts** — Full shortcuts modal with discoverability
- **Page Presence** — Real-time avatar indicators showing who's on each page
- **Activity Feed** — Live workspace activity with user profiles
- **Global Search** — Full-text search across tasks, documents, and chat
- **Settings** — Account, workspace, notifications, preferences, integrations
- **Management** — Workspace member roles, invite system, usage stats
- **Onboarding** — 4-step wizard for new users
- **Archive** — View and restore archived tasks
- **Support** — Contact/support page
