# Product Readiness Plan: Focus (depifinal)

## 1. Goal & Scope
- **Goal**: Make the Focus application 100% production-ready.
- **Scope**: Replace all mocked data with real Supabase integrations. Build out all missing modules (Focus Timer, Goals, Distractions). Set up full production infrastructure.
- **Deployment**: Vercel (via GitHub Actions).
- **Monitoring**: Vercel Web Analytics + Sentry.
- **Testing**: Manual QA.

## 2. Infrastructure Setup (Phase 1)
### 1. Error Tracking & Analytics
- [x] **Task**: Install and configure Sentry for React.
- **QA**: Run `bun run build` and trigger a deliberate error in a test component. Verify Sentry captures it.
- [x] **Task**: Configure Vercel Web Analytics.
- **QA**: Verify `@vercel/analytics` is integrated in `src/main.tsx` or `src/App.tsx`.

### 2. Global Error Boundaries
- [x] **Task**: Implement a global React Error Boundary (`react-error-boundary`) wrapping the main router/app.
- **QA**: Throw an error in a child component and verify the Error Boundary displays a fallback UI instead of crashing the white screen.

### 3. CI/CD Pipeline
- **Task**: Create `.github/workflows/ci.yml` for automated linting and type checking on PRs.
- **Task**: Create `.github/workflows/deploy.yml` for deploying to Vercel on push to `main` (if not relying on Vercel's native GitHub integration. If using Vercel's native integration, just document the requirement).
- **QA**: Verify workflows pass locally using `act` or by pushing a test branch.

## 3. Data Integration & Supabase (Phase 2)
*(Note: Supabase tables for `tasks`, `goals`, `projects`, `workspaces`, `workspace_members`, `focus_sessions`, and `distraction_logs` already exist with RLS enabled.)*

### 1. Onboarding & Profiles
- **Task**: Currently, onboarding relies on mock data. If onboarding collects user preferences, create a `public.profiles` table (linked to `auth.users`) with RLS policies, OR utilize `auth.users` `raw_user_meta_data`. Update the onboarding flow to save data to Supabase.
- **QA**: Manual: Complete onboarding flow. Query Supabase to ensure data is persisted for the user.

### 2. Dashboard Statistics
- **Task**: Replace mocked "Flow Score" and "Deep Work" stats in `Dashboard.tsx` with actual SQL aggregations from `focus_sessions` and `tasks` tables via `@supabase/ssr` or custom RPCs.
- **QA**: Manual: Log in, view dashboard, verify stats match seed data in Supabase.

### 3. Task Management Refinement
- **Task**: Remove any remaining mock references or `any` types in `TaskCreation.tsx` and `Dashboard.tsx`. Connect Quick Actions (Schedule, Project, Assign) to Supabase tables.
- **QA**: Manual: Verify task creation, scheduling, and assignment work correctly in the UI and save to Supabase.

## 4. Missing Features Implementation (Phase 3)
### 1. Goals Module
- **Task**: Implement the Goals UI (`src/App/Pages/Goals/Goals.tsx`) connected to the `public.goals` table. Support CRUD operations.
- **QA**: Manual: Navigate to Goals, create a goal, edit it, mark it as complete, and delete it.

### 2. Focus Session Timer (Pomodoro)
- **Task**: Implement the Focus Timer UI and logic. Connect to the `public.focus_sessions` table.
- **Task**: Timer must handle state (active, paused, completed, abandoned) and log actual duration and calculate a "flow score".
- **QA**: Manual: Start a focus session, pause it, complete it. Verify the `focus_sessions` table is updated with duration and status.

### 3. Distraction Log
- **Task**: Add UI inside the Focus Session to log internal/external distractions. Connect to `public.distraction_logs` table.
- **QA**: Manual: During an active focus session, log an internal distraction. Verify the `distraction_logs` table records it with the correct `session_id`.

## Final Verification Wave
- **Task**: End-to-End manual sanity check.
- **QA**: Manually click through all core user flows (Onboarding, Goals, Timer, Tasks) and verify successful execution and data persistence in Supabase.
