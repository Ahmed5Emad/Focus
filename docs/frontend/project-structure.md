# Project Structure

```
Focus/
├── src/
│   ├── App.tsx                      # Root component (AuthProvider, Router, routes, Toaster)
│   ├── main.tsx                     # Entry point (Sentry init, StrictMode)
│   ├── index.css                    # Tailwind v4 imports + @theme config, dark mode overrides
│   ├── vite-env.d.ts                # ImportMetaEnv type declarations
│   ├── vitest.d.ts                  # Vitest globals + jest-dom matcher types
│   │
│   ├── App/                         # Authenticated app shell
│   │   ├── AppLayout.tsx            # Sidebar + TopBar + content area
│   │   ├── components/
│   │   │   ├── Sidebar.tsx          # Navigation sidebar (desktop: fixed, mobile: Sheet drawer)
│   │   │   ├── TopBar.tsx           # Header with search trigger, notifications, user menu, sign-out
│   │   │   ├── CommandPalette.tsx   # Universal Cmd+K search (tasks, goals, projects, documents)
│   │   │   ├── KeyboardShortcutsModal.tsx  # Full shortcut listing modal
│   │   │   ├── PagePresence.tsx     # Real-time avatars showing who's on each page
│   │   │   └── ThemeToggle.tsx      # Dark/light mode toggle
│   │   ├── Onboarding/              # 4-step onboarding wizard
│   │   └── Pages/                   # Feature pages (protected)
│   │       ├── Dashboard/           # Real stats from RPC, activity feed, weekly trends, skeleton loading
│   │       │   └── components/
│   │       │       └── ActivityFeed.tsx  # Live workspace activity
│   │       ├── Tasks/               # List view, Kanban board, calendar view
│   │       │   ├── TaskCreation.tsx # New task form (standalone page)
│   │       │   └── components/
│   │       │       ├── KanbanBoard.tsx           # Drag-and-drop column view
│   │       │       ├── TaskCalendarView.tsx      # Month calendar view
│   │       │       ├── TaskEditDialog.tsx        # Edit task modal
│   │       │       ├── TaskDependenciesDialog.tsx # Dependency graph UI
│   │       │       ├── TaskRecurrenceDialog.tsx   # RRULE recurrence config
│   │       │       └── TaskTemplatesDialog.tsx    # Template picker
│   │       ├── Projects/            # Project cards with task grouping
│   │       │   └── components/
│   │       │       └── EmptyProjectsState.tsx
│   │       ├── Goals/               # 3-column grid, progress tracking, edit modal
│   │       ├── Documents/           # TipTap editor + Yjs + Supabase Realtime collaboration
│   │       │   ├── DocumentEditor.tsx
│   │       │   └── components/
│   │       │       ├── CommentSidebar.tsx        # Document comments with text range selection
│   │       │       ├── Editor.tsx                # TipTap + Yjs + Realtime Broadcast
│   │       │       └── TaskLinkSelector.tsx
│   │       ├── Chat/                # Real-time chat, typing indicators, file uploads, message status
│   │       │   └── components/
│   │       │       ├── MentionDropdown.tsx       # @mention autocomplete
│   │       │       └── MentionInput.tsx          # Input with mention support
│   │       ├── FocusTimer/          # Pomodoro/flow timer, distraction logging
│   │       │   └── components/
│   │       │       └── SessionEditDialog.tsx     # Edit past session
│   │       ├── Management/          # Workspace management, member roles, invite system
│   │       ├── Settings/            # Account, workspace, notifications, integrations
│   │       ├── Archive/             # Archived tasks view/restore
│   │       └── Support/             # Support page
│   │
│   ├── Pages/                       # Public/marketing pages (no auth required)
│   │   ├── Home/
│   │   ├── LogIn/login-form.tsx     # Login with email, Google, Apple; forgot password
│   │   ├── SignUp/signup-form.tsx   # Sign up with email, Google, Apple
│   │   ├── Auth/
│   │   │   ├── Callback.tsx         # OAuth PKCE callback (handles hash-based code params)
│   │   │   └── VerificationPending.tsx
│   │   ├── NotFound/NotFound.tsx    # 404 catch-all route
│   │   ├── Pricing/
│   │   ├── About/
│   │   └── Featured/
│   │
│   ├── sections/                    # Landing page sections
│   │   ├── hero/
│   │   ├── features/
│   │   ├── split-content/
│   │   └── footer/
│   │
│   ├── components/                  # Shared/reusable components
│   │   ├── ui/                      # shadcn/ui primitives
│   │   │   ├── avatar, button, dialog, dropdown-menu, input, label
│   │   │   ├── popover, sheet, tabs, toggle, slider, separator
│   │   │   ├── command, collapsible, field
│   │   │   ├── skeleton, alert-dialog, confirm-dialog
│   │   │   ├── date-picker, toaster
│   │   │   └── FeaturesCard
│   │   ├── layout/
│   │   ├── shared/
│   │   │   ├── Dropdown
│   │   │   ├── EmptyState
│   │   │   └── AppLoadingFallback   # Loading spinner for lazy routes
│   │   └── ErrorBoundaryFallback
│   │
│   ├── contexts/                    # React Context providers
│   │   ├── AuthContext.tsx          # Session, user, workspaces (with hasInitialFetch ref)
│   │   └── FocusContext.tsx         # Timer/focus session state
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useTasks.ts              # Tasks CRUD + priority, due date, deps, recurrence, templates, workflow, custom fields
│   │   ├── useDocuments.ts          # Documents CRUD + Yjs integration
│   │   ├── useChat.ts               # Chat messages, file upload, typing indicators, status
│   │   ├── useDirectMessages.ts     # DM messages, same features as chat
│   │   ├── useNotifications.ts      # Fetch + real-time subscription + mark-as-read
│   │   ├── useActivityFeed.ts       # Live activity feed with real-time INSERT subscription
│   │   ├── usePresence.ts           # Online user presence per page via Realtime Presence
│   │   ├── useGlobalSearch.ts       # Full-text search across tasks/docs/chat
│   │   └── usePreferences.ts        # localStorage-persisted user preferences
│   │
│   ├── lib/                         # Utilities
│   │   ├── utils.ts                 # cn() (clsx + tailwind-merge)
│   │   ├── sentry.ts                # Sentry CDN loader + initialization
│   │   ├── analytics.ts
│   │   └── supabase/
│   │       ├── client.ts            # Browser client (singleton via @supabase/ssr)
│   │       └── server.ts            # Server/client for SSR
│   │
│   ├── test/                        # Test setup
│   │   ├── setup.ts                 # Vitest setup (imports @testing-library/jest-dom/vitest)
│   │   ├── mocks/
│   │   │   ├── AuthContext.tsx       # Mock AuthProvider for tests
│   │   │   └── supabase.ts           # Mock Supabase client
│   │   └── utils/
│   │
│   ├── data/
│   │   └── mockData.ts
│   │
│   └── assets/                      # SVG icons, images
│
├── supabase/
│   ├── migrations/                  # SQL migration files (16 files)
│   └── functions/
│       └── send-notification/       # Edge Function for push notifications
│           └── index.ts
│
├── docs/                            # Project documentation
│   ├── README.md                    # Documentation index
│   ├── architecture.md              # System architecture overview
│   ├── deployment.md                # Vercel + Supabase deployment guide
│   ├── getting-started.md           # Setup and running locally
│   ├── troubleshooting.md           # Common issues
│   ├── backend/                     # Backend docs
│   └── frontend/                    # Frontend docs
│
├── .env.local                       # Environment variables
├── vercel.json                      # Vercel SPA rewrites
├── vitest.config.ts                 # Vitest configuration
├── vite.config.ts
├── tsconfig.json
├── package.json
├── README.md
└── UX.md                            # UX improvement checklist
```

## Conventions

- **Page components** are default exports in `PageName.tsx`
- **UI components** in `src/components/ui/` follow the shadcn/ui pattern (named exports, `cn()` for className merging)
- **Hooks** are named `use{Feature}.ts` and return an object with state + actions
- **Contexts** use `createContext` + `useContext` with a custom provider component
- **Supabase queries** use the singleton client from `@/lib/supabase/client`
- **File naming**: PascalCase for components, camelCase for hooks/utilities
- **Test files**: `.test.tsx` alongside the source component, mocked via `src/test/mocks/`

## Path Aliases

Configured in `vite.config.ts` and `tsconfig.json`:

```typescript
"@/*": ["./src/*"]
```

Usage: `import { Button } from "@/components/ui/button"`
