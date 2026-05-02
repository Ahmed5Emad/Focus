# Work Plan: App Enhancements

## 1. Goal & Scope
- **Goal**: Implement task relationships, multi-tab settings, Goals empty state, and a progressive disclosure Focus Timer.
- **Scope**:
  - `tasks` table schema update (`is_completed` -> `status`).
  - `TaskCreation.tsx` UI updates for relationship selectors.
  - `Settings.tsx` complete overhaul using Shadcn Tabs.
  - `Goals.tsx` dedicated empty state.
  - `FocusTimer.tsx` progressive disclosure layout.

## 2. Default Decisions Applied
- **DB Migration**: We will write a Supabase SQL migration to rename the column and set a default 'todo' status, rather than just changing frontend types.
- **Task Dropdowns**: We will use standard Shadcn `Select` or `Command` (Combobox) components for selecting projects/goals/tasks.
- **Settings Tabs**: New tabs (Account, Preferences, Integrations) will be scaffolded with placeholder content/forms if explicit data isn't available yet, while Workspace gets the existing settings.
- **Focus Timer**: The "Advanced" toggle will hide the Distraction Log table and the Recent Sessions history, keeping only the main circular timer and active controls visible by default.

## 3. Tasks

### Phase 1: Database & Type Standardization
- [x] **Task 1.1**: Create a Supabase migration script in `supabase/migrations/` (if using local dev) OR provide the raw SQL in the agent instructions to alter `public.tasks` table: rename `is_completed` to `status` (type `text`, default `'todo'`). Migrate existing `true` values to `'done'` and `false` to `'todo'`.
- [x] **QA 1.1**: Verify the SQL migration runs successfully.
- [x] **Task 1.2**: Update the `Task` interface in `Dashboard.tsx`, `TaskCreation.tsx`, and anywhere else it is defined to use `status: string` instead of `is_completed: boolean`.
- [x] **Task 1.3**: Update all Supabase queries in the codebase that filter or insert using `is_completed` to use `status` instead (e.g. in `Dashboard.tsx`).
- [x] **QA 1.3**: Run `bun run tsc -b` to ensure no type errors remain regarding `is_completed`.

### Phase 2: Task Relationships UI
- [ ] **Task 2.1**: In `TaskCreation.tsx`, implement Shadcn UI `Select` or Combobox components for "Schedule for Today" (Date picker/toggle), "Add to Project" (fetch from `projects`), "Link to Goal" (fetch from `goals`), and "Parent Task" (fetch from `tasks`).
- [ ] **Task 2.2**: Update the `createTask` function in `TaskCreation.tsx` to insert the selected `project_id`, `goal_id`, `parent_task_id`, and `assigned_to` values into Supabase.
- [ ] **QA 2.2**: Manually test creating a task linked to a project and goal, and verify it appears correctly in the database.

### Phase 3: Settings Overhaul
- [ ] **Task 3.1**: Refactor `src/App/Pages/Settings/Settings.tsx` to use Shadcn UI `<Tabs>`.
- [ ] **Task 3.2**: Create the tabs: "Account", "Preferences", "Workspace", and "Integrations".
- [ ] **Task 3.3**: Move all existing UI (Workspace Name, Custom Branding, Invite Members) into the "Workspace" tab.
- [ ] **Task 3.4**: Create basic placeholder UI for "Account" (Email/Password forms), "Preferences" (Theme toggle, Timer duration inputs), and "Integrations" (List of mock connected apps).
- [ ] **QA 3.4**: Manually verify tab switching works without breaking the layout.

### Phase 4: Goals & Focus Timer UI
- [ ] **Task 4.1**: In `Goals.tsx`, implement a dedicated Empty State component that renders when `goals.length === 0`. It should have an illustration/icon and a primary "Create Goal" button that opens the modal.
- [ ] **QA 4.1**: Temporarily set goals to `[]` and verify the empty state looks good.
- [ ] **Task 4.2**: In `FocusTimer.tsx`, implement "Progressive Disclosure". Wrap the "Recent Sessions" and "Distraction Log" sections in an expandable section (like a Shadcn `Collapsible` or `Accordion`) or hide them behind an "Advanced Settings" toggle button. The default view should be minimal (just the timer and start/stop controls).
- [ ] **QA 4.2**: Verify the timer view is clean by default, and expanding shows the tables correctly.

## Final Verification Wave
- [ ] **Task 5.1**: Run a full manual sweep of the application to ensure no regressions were introduced.
- [ ] **QA 5.1**: Ensure `bun run build` succeeds without type errors.
