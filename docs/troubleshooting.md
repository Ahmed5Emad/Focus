# Troubleshooting

## Common Issues

### OAuth callback redirects to a blank page

**Cause**: HashRouter stores the auth code in the URL hash (`#/auth/callback?code=xxx`). The `AuthCallback` component needs to extract the code from the hash fragment.

**Fix**: Make sure OAuth calls use `redirectTo` with the correct format:
```typescript
signInWithOAuth({
  provider: 'google',
  options: { redirectTo: window.location.origin + '/#/auth/callback' },
})
```

### "Invalid JWT token" from Hocuspocus server

**Cause**: The Hocuspocus server calls `supabase.auth.getUser(token)` with the Supabase access token. If the token is expired or malformed, authentication fails.

**Fix**: Ensure the client passes a valid Supabase session token. The Hocuspocus provider should use:
```typescript
token: session.access_token
```

### Hocuspocus connection refused (`ws://` error)

**Cause**: The Hocuspocus server isn't running or the `VITE_HOCUSPOCUS_URL` is wrong.

**Fix**:
- Local dev: Run `bun run server` and check it's on port 1234
- Production: Ensure the Railway URL is correct with `wss://` prefix (not `ws://`)

### Yjs document state not persisting

**Cause**: The `yjs_snapshot` column in the `documents` table uses `bytea` format. The server stores as `\\x<hex>` and reads it back.

**Fix**: Check the Supabase RLS policy on the `documents` table — the Hocuspocus server needs update permission. If using an anon key, it needs RLS to allow updates by document ownership.

### "Corrupted snapshot, starting fresh" warning

**Cause**: The `yjs_snapshot` bytea data is in an unexpected format or corrupted.

**Fix**: The server handles this gracefully (starts a fresh document), but if it happens persistently, delete the `yjs_snapshot` value for that document in the database.

### TypeScript build errors after pull

**Cause**: New dependencies may have been added.

**Fix**:
```bash
bun install
bun run build
```

### "Failed to create task" toast

**Cause**: Missing or invalid workspace ID, or RLS policy blocking the insert.

**Fix**: Check that `currentWorkspaceId` is set in the AuthContext. Verify the user has the correct role in `workspace_members`.

## Belmo-specific

### Hocuspocus server won't start

**Cause**: The `server/` directory might not have a `package.json` with dependencies, or the run command is wrong.

**Fix**: Make sure `server/package.json` exists with `tsx`, `@hocuspocus/server`, `@supabase/supabase-js`, and `yjs`. Set the run command to `npx tsx hocuspocus.ts` and root directory to `server`.

### Can't connect to Belmo-hosted Hocuspocus

**Cause**: URL format is wrong or the port isn't configured.

**Fix**:
1. Go to Belmo dashboard → your app → copy the URL
2. Use `wss://your-app.belmo.app` as `VITE_HOCUSPOCUS_URL` (note `wss://` not `ws://`)
3. Make sure the app status shows as running before testing
