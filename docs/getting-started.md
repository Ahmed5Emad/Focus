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
VITE_HOCUSPOCUS_URL=ws://localhost:1234
```

> `VITE_HOCUSPOCUS_URL` is only needed for collaborative document editing. The app works without it — only the Documents feature will be unavailable.

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

### Start the frontend only:

```bash
bun run dev
```

Opens at `http://localhost:5174` (or 5173 if 5174 is taken).

### Start the Hocuspocus server (for collaborative docs):

```bash
bun run server
```

Starts the WebSocket server on port 1234.

### Start both (recommended):

```bash
bun run dev:all
```

Runs Vite dev server + Hocuspocus server concurrently.

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start Vite dev server |
| `bun run server` | Start Hocuspocus WebSocket server |
| `bun run dev:all` | Start both concurrently |
| `bun run build` | TypeScript check + Vite production build |
| `bun run lint` | Run ESLint |

## Build

```bash
bun run build   # tsc -b + vite build (also type-checks)
```

Output goes to `dist/`.
