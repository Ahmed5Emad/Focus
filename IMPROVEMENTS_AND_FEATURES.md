# Improvements & New Features

## Feature Completeness (MVP Promises from TODO.md)

### Protected Routes
- **Status:** Still unchecked in TODO.md
- **Description:** Ensure ALL authenticated routes are properly guarded with `Navigate` redirect to `/login` when no session exists. AuthContext currently handles session state, but some edge cases may leak.
- **Effort:** Small

### Global Graph Visualization
- **Status:** Promised in Phase 5 of TODO.md
- **Description:** Interactive graph showing task/project/goal interdependencies. Visualize how tasks connect to projects, goals, and each other.
- **Implementation:** Use a library like `react-force-graph-2d` or `d3-force` to render nodes and edges.
- **Effort:** Large

### Custom Workflow Configuration
- **Status:** Promised in Phase 5 of TODO.md
- **Description:** Allow workspaces to define custom task statuses and custom fields. Store in a `workflow_configs` table.
- **Effort:** Large

### Task Dependencies & Subtasks
- **Description:** Add `task_dependencies` table (blocking relationships) and `parent_task_id` column for subtask breakdown.
- **Effort:** Medium

### Recurring Tasks
- **Description:** Add `recurrence_rule` column (cron/rrule expression), auto-create next instance when task is completed.
- **Effort:** Medium

### Calendar View for Tasks
- **Description:** Display tasks with due dates on a monthly/weekly calendar. `react-day-picker` is already a dependency.
- **Effort:** Medium

### Time Tracking Per Task
- **Description:** Aggregate focus session duration per task. Display total tracked time in task detail view and list view.
- **Effort:** Small

### Global Full-Text Search
- **Description:** Search across tasks, projects, documents, and goals using Postgres `to_tsvector` / `to_tsquery`.
- **Effort:** Medium

### Notifications: Email & Preferences
- **Description:** Send email notifications via Supabase Edge Functions. Allow users to configure which notification types they receive and how.
- **Effort:** Medium

## Productivity & Collaboration

### Kanban Board View
- **Description:** Drag-and-drop board for tasks grouped by status (Todo / In Progress / Done). Complement to the existing list view.
- **Implementation:** Use `@dnd-kit/core` for drag-and-drop. Reuse existing task components.
- **Effort:** Medium

### Document Comments & Annotations
- **Description:** Per-paragraph comments on documents. Table `document_comments` already exists.
- **Effort:** Medium

### Real-Time Page Presence Awareness
- **Description:** Show which other workspace members are viewing the same page (beyond just document cursor sharing).
- **Effort:** Small

### Task Templates
- **Description:** Save task structures (title, description, subtasks, priority) as reusable templates.
- **Effort:** Medium

### Focus Session Analytics Dashboard
- **Description:** Deeper stats including focus streaks, daily/weekly trends, distraction patterns, charts.
- **Effort:** Medium

### Workspace Activity Feed
- **Description:** Chronological log of changes (task created, task completed, member joined, etc.) across the workspace.
- **Effort:** Medium

### @Mentions in Chat & Documents
- **Description:** Type `@` to mention workspace members. Create notification on mention. The `@tiptap/extension-mention` is already a dependency.
- **Effort:** Medium

## Integrations 
- **Just Remove it**
## Performance & Infrastructure

### Add Testing Infrastructure
- **Description:** Currently zero tests. Add Vitest + React Testing Library for unit/component tests, Playwright for E2E.
- **Effort:** Large (foundational)

### Code Splitting Audit
- **Description:** Already partially done via `React.lazy`. Audit all routes and ensure Suspense boundaries exist for every chunk. Lazy-load TipTap extensions.
- **Effort:** Small

### Virtual Scrolling for Large Task Lists
- **Description:** Use `@tanstack/react-virtual` for lists with 100+ items to avoid DOM bloat.
- **Effort:** Medium

### Pagination for Chat Messages
- **Description:** Load older messages on scroll-up instead of loading all at once. Improves initial load time for busy channels.
- **Effort:** Medium

### Sentry Error Grouping Improvements
- **Description:** Add breadcrumbs and user context to Sentry reports for better debugging.
- **Effort:** Small

## UX Polish

### Undo/Redo for Task Operations
- **Description:** Soft-delete with "Undo" toast that persists for 5 seconds before committing.
- **Effort:** Small

### Drag-and-Drop Task Reordering
- **Description:** Custom ordering via `position` column in tasks table. Drag handle in list view.
- **Effort:** Medium

### Keyboard Shortcuts Help Modal
- **Description:** "Cmd+/" or "?" to show all available keyboard shortcuts in a styled modal.
- **Effort:** Small

### Improved Onboarding Flow
- **Description:** Tour highlighting key features after signup. Option to populate with sample data.
- **Effort:** Medium

### Dark Mode Polish
- **Description:** Fix remaining hardcoded hex colors that don't respond to theme changes.
- **Effort:** Small

### Responsive Layout Audit
- **Description:** Ensure all pages are fully functional on mobile. Test sidebar, tables, dialogs, charts.
- **Effort:** Medium

### Accessibility Audit
- **Description:** Full pass for keyboard navigation, screen reader support (aria roles/labels), color contrast ratios.
- **Effort:** Medium

### Empty State Improvements
- **Description:** Consistent empty state design across all pages (Tasks, Goals, Chat, Documents, etc.) with helpful CTAs.
- **Effort:** Small

### Loading State Improvements
- **Description:** Skeleton components for all pages (some already done on Dashboard, missing on others).
- **Effort:** Medium

## Database & Backend

### Add Composite Indexes
- **Description:** Index common query patterns: `(workspace_id, user_id)`, `(workspace_id, is_archived)`, `(workspace_id, status)` for better query performance.
- **Effort:** Small

### Data Archival / Retention Policy
- **Description:** Auto-archive tasks/projects older than X months. Clean up old focus sessions.
- **Effort:** Small

### Rate Limiting on Supabase RPCs
- **Description:** Prevent abuse of workspace creation, member invites, and other RPC functions.
- **Effort:** Small

## Cost Optimization

- Limit Realtime subscriptions to only necessary tables
- Add pagination to reduce data transfer
- Compress Yjs snapshot storage usage (store diffs instead of full snapshots)
- Monitor Supabase usage (DB size, bandwidth, Realtime connections)
