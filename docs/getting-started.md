# Getting Started

## Prerequisites

- Node.js 20+ and Bun (or npm)
- A Supabase project with migrations applied
- Supabase project URL and publishable/anon key

## Environment Variables

Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
VITE_HOCUSPOCUS_URL=ws://localhost:1234
```

## Installation

```bash
git clone <repo-url>
cd Focus
bun install
```

## Database Setup

Apply all migrations to your Supabase project:

```bash
# Via Supabase CLI
supabase migration up

# Or apply manually through the Supabase dashboard SQL editor
# Run files from supabase/migrations/ in order
```

## Running Locally

### Start the frontend only:

```bash
bun run dev
```

### Start the Hocuspocus server:

```bash
bun run server
```

### Start both (recommended):

```bash
bun run dev:all
```

Runs both the Vite dev server and the Hocuspocus server concurrently.

## Lint & Type Check

```bash
bun run lint    # ESLint
bun run build   # tsc -b + vite build (also type-checks)
```
