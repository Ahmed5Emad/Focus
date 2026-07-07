# UX Improvement Plan

## 1. Feedback & Notifications

- [x] **Toast system** — sonner installed, Toaster in App.tsx, wired into Documents, Tasks, Projects, Goals
- [x] **Replace `alert()` calls** — TaskCreation now uses toast.error instead of alert()
- [x] **Functional notifications bell** — Notifications table + useNotifications hook + Popover dropdown in TopBar

## 2. Navigation & Layout

- [x] **Mobile responsive sidebar** — Sidebar uses Sheet drawer on mobile (< lg), hidden on small screens
- [x] **Functional command palette** — Cmd+K opens CommandPalette searching tasks/goals/projects/documents
- [x] **404 route** — Catch-all route renders NotFound component
- [x] **Sidebar sub-route highlighting** — Uses `startsWith(path + "/")` for all nav items including bottom nav

## 3. Data Display

- [x] **Search on list pages** — Universal CommandPalette searches across all entities
- [x] **Skeleton loading** — Skeleton component created; applied to Dashboard, Projects, Management, Documents, Goals
- [x] **Dashboard data** — Real `get_dashboard_stats` RPC, dynamic greeting, real flow score/change/deep work/task counts

## 4. Settings & Configuration

- [x] **Dark mode toggle** — useTheme hook + ThemeToggle in TopBar + segmented control in Settings Preferences tab
- [x] **Preferences tab** — All 6 toggles/dropdowns wired to usePreferences hook with localStorage persistence
- [x] **Integration buttons** — All 7 buttons have toast.info onClick handlers

## 5. Feature Gaps

- [x] **Task due dates + priority** — Migration added columns; UI shows priority badge + due date in task list, TaskCreation, TaskEditDialog
- [x] **Chat typing indicators + file upload** — Realtime Presence typing, file upload to Storage, message status (Sent/Delivered/Read), multi-line textarea
- [x] **Forgot password flow** — "Forgot password?" link on login form sends reset email
- [x] **Onboarding "Back" on step 1** — Navigates to home page (`/`)
