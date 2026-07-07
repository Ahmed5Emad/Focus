# Focus Documentation

## Getting Started
- [Getting Started](getting-started.md) — Setup, env vars, running the app

## Architecture & Design
- [Architecture Overview](architecture.md) — App structure and data flow
- [Project Structure](frontend/project-structure.md) — Codebase layout explained

## Backend
- [Database Schema](backend/database.md) — Tables, RLS policies, migrations
- [Authentication](backend/authentication.md) — Auth flow, PKCE, session handling
- [Real-time Collaboration](backend/realtime-collaboration.md) — Hocuspocus + Yjs + TipTap

## Operations
- [Deployment](deployment.md) — Vercel + Railway deployment
- [Troubleshooting](troubleshooting.md) — Common issues and solutions

## Features
- **Command Palette** — Universal search (Cmd+K) across tasks, goals, projects, documents
- **Collaborative Documents** — Real-time editing with TipTap + Hocuspocus + Yjs
- **Workspace Chat** — Real-time messaging with typing indicators, file uploads, read status
- **Notifications** — In-app bell with real-time updates, mark-as-read, assignment alerts
- **Tasks** — Kanban/list view, priorities, due dates, assignments, subtasks
- **Goals** — Progress tracking with grid layout, linked tasks
- **Projects** — Task grouping by project
- **Focus Timer** — Pomodoro/flow timer sessions
- **Dashboard** — Real stats (flow score, deep work time, task counts) from RPC
- **Onboarding** — 4-step wizard for new users
- **Settings** — Preferences, integrations, workspace management, branding
