# Deployment

Focus has two deployable units:

| Unit | Platform | Type | Cost |
|------|----------|------|------|
| **Frontend** (React SPA) | Vercel | Static site + API | Free |
| **Hocuspocus Server** (WebSocket) | Belmo | Node.js service | Free (always-on, no CC) |

---

## Frontend — Vercel

### Automatic (recommended)

1. Push your repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Add New Project → Import your repo
3. Vercel auto-detects Vite. No build config changes needed.
4. Add these environment variables:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your publishable/anon key |
| `VITE_HOCUSPOCUS_URL` | `wss://your-railway-app.up.railway.app` |

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

---

## Hocuspocus Server — Belmo (Free, Always-On, No CC)

The collaborative editing server (`server/hocuspocus.ts`) needs a persistent Node.js process. [Belmo](https://belmo.io) provides this on a free tier with **no credit card**, **never sleeps**, WebSocket support, and HTTPS.

### Step 1: Push to GitHub

Make sure your repo is pushed with the `server/` directory including `server/package.json`.

### Step 2: Deploy to Belmo

1. Go to [belmo.io](https://belmo.io) and sign in with GitHub
2. Click **New App** → select your repo (`Ahmed5Emad/Focus`)
3. Set **Root Directory** to `server`
4. Set **Build Command** to `npm install` (it auto-detects)

### Step 3: Configure the service

| Setting | Value |
|---------|-------|
| **Run Command** | `npx tsx hocuspocus.ts` |
| **Port** | `1234` |

### Step 4: Set environment variables

Add these in the Belmo dashboard:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your publishable/anon key |
| `HOCUSPOCUS_PORT` | `1234` |

### Step 5: Deploy

Click **Deploy**. Belmo builds and deploys. After deployment:

1. Copy your app URL from the Belmo dashboard (e.g. `https://my-app.belmo.app`)
2. Use this URL with `wss://` prefix as `VITE_HOCUSPOCUS_URL` in your **Vercel** environment variables
3. Redeploy the Vercel frontend

### Belmo free tier limits

| Resource | Limit |
|----------|-------|
| Services | 1 always-on Node.js service |
| Sleep | **Never** |
| HTTPS | ✅ Included |
| WebSocket | ✅ Supported |
| Custom domain | ✅ Available |
| Credit card | **Not required** |

> Belmo is the only free Node.js host that stays awake 24/7 with no credit card and no time limit.

---

## Database — Supabase

The Supabase project is already deployed. Apply new migrations via:

```bash
# Install Supabase CLI, then:
supabase link --project-ref your-project-ref
supabase db push
```

Or manually run migration SQL files in the Supabase dashboard SQL editor.

---

## Environment Summary

Make sure these env vars are set on the correct platforms:

| Variable | Vercel | Belmo |
|----------|--------|-------|
| `VITE_SUPABASE_URL` | ✅ | ✅ |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | ✅ | ✅ |
| `VITE_HOCUSPOCUS_URL` | ✅ | ❌ |
| `HOCUSPOCUS_PORT` | ❌ | ✅ |

> `VITE_HOCUSPOCUS_URL` on Vercel should point to `wss://your-app.belmo.app`
