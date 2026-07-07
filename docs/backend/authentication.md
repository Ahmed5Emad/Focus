# Authentication

## Tech Stack
- **Supabase Auth** — email/password + OAuth (Google, Apple)
- **`@supabase/ssr`** — Cookie-based session management (v0.10.2)
- **`@supabase/auth-js`** — GoTrueClient (v2.104.1)

## Auth Flow

### Email/Password Login

1. User submits credentials on `/login`
2. `supabase.auth.signInWithPassword({ email, password })` sends POST to Supabase Auth
3. Response includes `access_token`, `refresh_token`, session data
4. `@supabase/ssr` stores session in **cookies** via `document.cookie` (base64url encoded, chunked if > 3180 bytes)
5. GoTrueClient emits `onAuthStateChange('SIGNED_IN', session)`
6. `AuthContext` listener picks up the event and sets React state
7. User is navigated to `/dashboard`

### Session Persistence

On page refresh:
1. GoTrueClient constructor calls `initialize()` — runs `_recoverAndRefresh()`
2. Reads session from cookies via `@supabase/ssr` storage adapter
3. If valid, emits `SIGNED_IN` (missed if no listener registered yet)
4. `AuthContext` mounts, calls `getSession()` (awaits `initializePromise`)
5. `onAuthStateChange` is registered, which emits `INITIAL_SESSION` with the current session
6. `ProtectedRoute` sees the session and renders children

### PKCE OAuth Flow (Google, Apple, Magic Link)

1. User clicks OAuth button → `signInWithOAuth({ provider })` — generates code_verifier stored in cookie
2. Browser redirects to provider
3. On return, URL contains `?code=xxx` in the hash (due to HashRouter)
4. `AuthCallback` component extracts `code` from hash and calls `exchangeCodeForSession(code)`
5. Session is stored in cookies, user navigated to `/onboarding`

> **Important**: With HashRouter, the auth code is in the URL hash fragment
> (`#/auth/callback?code=xxx`). The `AuthCallback` parses it from there.

### Session Cookie Configuration

- **Storage**: `document.cookie` (via `@supabase/ssr` default)
- **Key**: `sb-{project_ref}-auth-token`
- **Encoding**: base64url (chunked into `key.0`, `key.1`, etc. if needed)
- **Path**: `/`
- **SameSite**: `Lax`
- **MaxAge**: 400 days
- **httpOnly**: false (accessible via JavaScript)

## Client Setup

`src/lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY!

export const supabase = createBrowserClient(supabaseUrl, supabaseKey)
export function createClient() { return supabase } // singleton
```

## Auth Context

`src/contexts/AuthContext.tsx` provides:
- `session` — Current Supabase session
- `user` — Current user
- `isLoading` — Initialization state
- `workspaces` — User's workspaces
- `currentWorkspaceId` — Selected workspace
- `setCurrentWorkspaceId` — Switch workspace
- `refreshWorkspaces` — Reload workspace list

## Logout

```typescript
await supabase.auth.signOut()
// Clears session cookies, emits SIGNED_OUT, navigates to /login
```
