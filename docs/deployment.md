# Deployment

## Frontend — Vercel (Free)

### Automatic (recommended)

1. Push your repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Add New Project → Import your repo
3. Vercel auto-detects Vite. No build config changes needed.
4. Add these environment variables:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your publishable/anon key |

5. Deploy — every push to `main` auto-deploys.

### `vercel.json`

Already configured for SPA routing (required for HashRouter fallback):

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Build

The build pipeline runs `tsc -b` (TypeScript project build) then `vite build`. Type errors fail the build. Test files are excluded from the build via `tsconfig.app.json` but are type-checked if included in compilation.

### Custom Domain

Add it in Vercel project → Settings → Domains. Vercel provisions SSL automatically.

## Database — Supabase

The Supabase project handles everything: auth, database, realtime sync, storage, and file uploads. Apply new migrations via:

```bash
# Install Supabase CLI, then:
supabase link --project-ref your-project-ref
supabase db push
```

Or manually run migration files in the Supabase dashboard SQL editor.

## Edge Functions

The `send-notification` Edge Function is deployed to Supabase. Deploy via:

```bash
supabase functions deploy send-notification
```

The function is triggered via POST and handles sending push notifications for mentions, assignments, and comments.

> **No separate server needed.** Document collaboration syncs directly through Supabase Realtime Broadcast — no Hocuspocus, no WebSocket server, no extra deployment.
