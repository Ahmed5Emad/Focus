# Focus

A modern productivity app for managing tasks, projects, and goals with a built-in focus timer. Built with React, Tailwind CSS v4, Supabase, and shadcn/ui.

## Features

- **Task Management** — Create, filter, search, and organize tasks with status tracking (todo, in progress, done)
- **Project Management** — Group tasks into projects with active/completed/on-hold status filters
- **Goal Tracking** — Define long-term objectives, link them to tasks, track progress
- **Focus Timer** — Pomodoro-style timer with work/break sessions, real-time sync across devices
- **Workspaces** — Multi-tenant architecture; each user gets an isolated workspace
- **Authentication** — Email/password + OAuth (Google, Apple) via Supabase Auth
- **Real-time Sync** — Task updates broadcast across sessions via Supabase Realtime
- **Dark/Light Mode** — Full theme support (in progress for some pages)

## Tech Stack

- **Framework:** React 19
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **Backend:** Supabase (PostgreSQL, Auth, Realtime)
- **UI Primitives:** Radix UI & shadcn/ui
- **Icons:** Lucide React
- **Routing:** react-router-dom v7
- **Language:** TypeScript

## Getting Started

### Prerequisites

- Node.js 20+ and Bun (or npm)
- A Supabase project with the required schema

### Installation

```bash
git clone https://github.com/Ahmed5Emad/Focus.git
cd Focus
bun install
```

### Environment Variables

Create a `.env` file in the root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development

```bash
bun dev
```

### Build

```bash
bun run build
```

### Lint

```bash
bun run lint
```
