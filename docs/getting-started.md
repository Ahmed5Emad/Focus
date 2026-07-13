# Getting Started

## Prerequisites

- **Node.js 20+** and **Bun** (or npm/pnpm)
- A **Supabase project** with all migrations applied
- Supabase project URL and publishable/anon key

## Environment Variables

Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

> No other env vars needed. Collaborative document editing syncs through Supabase Realtime — no separate server required.

## Installation

```bash
git clone <repo-url>
cd Focus
bun install
```

## Database Setup

Apply migrations to your Supabase project:

```bash
# Via Supabase CLI (recommended)
supabase link --project-ref your-project-ref
supabase db push

# Or manually — run files from supabase/migrations/ in order
# through the Supabase dashboard SQL editor
```

## Running Locally

```bash
bun run dev
```

Opens at `http://localhost:5174`.

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start Vite dev server at `http://localhost:5174` |
| `bun run build` | TypeScript check (`tsc -b`) + Vite production build |
| `bun run lint` | Run ESLint |
| `bun run test` | Run Vitest tests |

## Build

```bash
bun run build   # tsc -b + vite build, output → dist/
```
