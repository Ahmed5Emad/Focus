# Deployment

Focus has two deployable units:

| Unit | Platform | Type | Cost |
|------|----------|------|------|
| **Frontend** (React SPA) | Vercel | Static site + API | Free |
| **Hocuspocus Server** (WebSocket) | Koyeb | Node.js service | Free (always-on) |

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

## Hocuspocus Server — Koyeb (Free, Always-On)

The collaborative editing server (`server/hocuspocus.ts`) needs a persistent Node.js process. [Koyeb](https://koyeb.com) provides this on a free tier with **no credit card**, **always-on** (no sleeping), and WebSocket support.

### Step 1: Push to GitHub

Make sure your repo is pushed with the `server/` directory including `server/package.json`.

### Step 2: Create a Koyeb app

1. Go to [koyeb.com](https://koyeb.com) and sign in with GitHub
2. Click **Create App**
3. Select **GitHub** as the deployment method
4. Select your repo (`Ahmed5Emad/Focus`)

### Step 3: Configure the service

| Setting | Value |
|---------|-------|
| **Root Directory** | `server` |
| **Build Command** | *(leave empty)* |
| **Run Command** | `npx tsx hocuspocus.ts` |
| **Port** | `1234` |

### Step 4: Set environment variables

Add these under **Environment Variables**:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your publishable/anon key |
| `HOCUSPOCUS_PORT` | `1234` |

### Step 5: Deploy

Click **Create App**. Koyeb will build and deploy. After deployment:

1. Go to your app's page → **Domains** tab
2. Copy the Koyeb domain (e.g. `my-app.koyeb.app`)
3. Use this URL with `wss://` prefix as `VITE_HOCUSPOCUS_URL` in your **Vercel** environment variables
4. Redeploy the Vercel frontend to pick up the change

### Koyeb free tier limits

| Resource | Limit |
|----------|-------|
| RAM | 512 MB |
| CPU | Shared |
| Storage | 1 GB |
| Bandwidth | 100 GB/month |
| Sleep | **Never** (always-on) |
| Credit card | **Not required** |

> Unlike Railway/Render, Koyeb does **not** sleep your service on the free tier. The WebSocket server stays connected continuously.

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

| Variable | Vercel | Koyeb |
|----------|--------|-------|
| `VITE_SUPABASE_URL` | ✅ | ✅ |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | ✅ | ✅ |
| `VITE_HOCUSPOCUS_URL` | ✅ | ❌ |
| `HOCUSPOCUS_PORT` | ❌ | ✅ |

> `VITE_HOCUSPOCUS_URL` on Vercel should point to `wss://your-app.koyeb.app`
