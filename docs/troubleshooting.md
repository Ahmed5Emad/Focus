# Troubleshooting

## Common Issues

### All data disappears when switching tabs, apps, or workspaces

**Cause**: Supabase GoTrue client fires `SIGNED_IN` via `_recoverAndRefresh()` every time the browser tab becomes visible. The old `AuthContext` handler re-ran `setUser`/`setSession`/`fetchWorkspaces` on every event — even when nothing changed — causing cascading re-renders that nullified `currentWorkspaceId`.

**Fix**: The `AuthContext` now uses a `hasInitialFetch` ref to skip redundant work on repeated `SIGNED_IN`/`TOKEN_REFRESHED` events. After initial auth, these events are fully ignored — no state changes, no re-renders. Additionally, `useTasks` and `useActivityFeed` Realtime callbacks use silent fetch mode (no loading state) so WebSocket reconnection on tab return doesn't show skeletons.

**If still happening**: Clear browser cookies and re-login. Ensure you're on the latest `main` commit containing the `hasInitialFetch` fix in `src/contexts/AuthContext.tsx`.

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

**Cause**: New dependencies may have been added, or the `tsconfig.app.json` `verbatimModuleSyntax` setting requires type-only imports for type-only exports.

**Fix**:
```bash
bun install
bun run build
```

If errors persist for test files, ensure `@testing-library/jest-dom` and `vitest` are installed. The `src/vitest.d.ts` file provides the jest-dom matcher type augmentation (requires `import "@testing-library/jest-dom/vitest"` in test setup).

### Document content not saving

**Cause**: The Yjs snapshot (`yjs_snapshot`) column or `content` column in the `documents` table is not writable.

**Fix**: Check the RLS policy on the `documents` table — the user must have update permission on documents they own or collaborate on.
