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

> **No separate server needed.** Document collaboration syncs directly through Supabase Realtime Broadcast — no Hocuspocus, no WebSocket server, no extra deployment.
