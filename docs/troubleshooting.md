# Troubleshooting

## Common Issues

### OAuth callback redirects to a blank page

**Cause**: HashRouter stores the auth code in the URL hash (`#/auth/callback?code=xxx`).

**Fix**: OAuth calls must use `redirectTo` with the correct format:
```typescript
signInWithOAuth({
  provider: 'google',
  options: { redirectTo: window.location.origin + '/#/auth/callback' },
})
```

### Document collaboration not syncing between clients

**Cause**: Supabase Realtime Broadcast is not enabled on the project, or the broadcast channel isn't connecting.

**Fix**:
1. Go to Supabase Dashboard → Realtime → make sure "Broadcast" is enabled
2. Check browser console for Realtime connection errors
3. Verify both clients are authenticated and on the same workspace

### "Failed to create task" toast

**Cause**: Missing or invalid workspace ID, or RLS policy blocking the insert.

**Fix**: Check that `currentWorkspaceId` is set in the AuthContext. Verify the user has the correct role in `workspace_members`.

### TypeScript build errors after pull

**Cause**: New dependencies may have been added.

**Fix**:
```bash
bun install
bun run build
```

### Document content not saving

**Cause**: The Yjs snapshot (`yjs_snapshot`) column or `content` column in the `documents` table is not writable.

**Fix**: Check the RLS policy on the `documents` table — the user must have update permission on documents they own or collaborate on.
