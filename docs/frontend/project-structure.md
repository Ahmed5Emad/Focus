# Project Structure

```
Focus/
├── src/
│   ├── App.tsx                      # Root component (AuthProvider, Router, routes, Toaster)
│   ├── main.tsx                     # Entry point
│   ├── index.css                    # Tailwind v4 imports + @theme config
│   ├── vite-env.d.ts                # ImportMetaEnv type declarations
│   │
│   ├── App/                         # Authenticated app shell
│   │   ├── AppLayout.tsx            # Sidebar + TopBar + content area
│   │   ├── components/
│   │   │   ├── Sidebar.tsx          # Navigation sidebar (desktop: fixed, mobile: Sheet drawer)
│   │   │   ├── TopBar.tsx           # Header with search trigger, notifications, user menu, sign-out
│   │   │   └── CommandPalette.tsx   # Universal Cmd+K search (tasks, goals, projects, documents)
│   │   ├── Onboarding/              # 4-step onboarding wizard
│   │   └── Pages/                   # Feature pages (protected)
│   │       ├── Dashboard/           # Real stats from RPC, skeleton loading, dynamic greeting
│   │       ├── Tasks/               # List view, priority dots, due dates, creation/edit dialogs
│   │       ├── Projects/            # Project cards with task grouping
│   │       ├── Goals/               # 3-column grid, progress tracking, edit modal
│   │       ├── Documents/           # TipTap editor, Hocuspocus provider, collaboration cursors
│   │       ├── Chat/                # Real-time chat, typing indicators, file uploads, message status
│   │       ├── FocusTimer/          # Pomodoro/flow timer
│   │       ├── Management/          # Workspace management
│   │       ├── Settings/            # Preferences (localStorage), integrations, branding
│   │       ├── Archive/             # Archived items
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
│   │   │   ├── avatar.tsx, button.tsx, dialog.tsx, dropdown-menu.tsx
│   │   │   ├── input.tsx, label.tsx, popover.tsx, sheet.tsx
│   │   │   ├── tabs.tsx, toggle.tsx, slider.tsx, separator.tsx
│   │   │   ├── command.tsx, collapsible.tsx, field.tsx
│   │   │   ├── skeleton.tsx, alert-dialog.tsx, confirm-dialog.tsx
│   │   │   ├── date-picker.tsx, toaster.tsx
│   │   │   └── FeaturesCard.tsx
│   │   ├── layout/                  # AuthLayout, Header
│   │   ├── shared/                  # Dropdown, EmptyState
│   │   └── ErrorBoundaryFallback.tsx
│   │
│   ├── contexts/                    # React Context providers
│   │   ├── AuthContext.tsx          # Session, user, workspaces
│   │   └── FocusContext.tsx         # Timer/focus session state
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useTasks.ts              # Tasks CRUD + priority/due_date
│   │   ├── useDocuments.ts          # Documents CRUD + Yjs integration
│   │   ├── useChat.ts               # Chat messages, file upload, typing indicators, status
│   │   ├── useDirectMessages.ts     # DM messages, same features as chat
│   │   ├── useNotifications.ts      # Fetch + real-time subscription + mark-as-read
│   │   └── usePreferences.ts        # localStorage-persisted user preferences
│   │
│   ├── lib/                         # Utilities
│   │   ├── utils.ts                 # cn() (clsx + tailwind-merge)
│   │   ├── analytics.ts
│   │   └── supabase/
│   │       ├── client.ts            # Browser client (singleton)
│   │       └── server.ts            # Server/client for SSR
│   │
│   ├── data/
│   │   └── mockData.ts
│   │
│   └── assets/                      # SVG icons, images
│
├── server/
│   └── hocuspocus.ts                # Hocuspocus collaborative editing server
│
├── supabase/
│   └── migrations/                  # SQL migration files (7+ files)
│
├── docs/                            # Project documentation
│   ├── README.md                    # Documentation index
│   ├── architecture.md              # System architecture overview
│   ├── deployment.md                # Vercel + Railway deployment guide
│   ├── getting-started.md           # Setup and running locally
│   ├── troubleshooting.md           # Common issues
│   ├── backend/                     # Backend docs
│   └── frontend/                    # Frontend docs
│
├── .env.local                       # Environment variables
├── vercel.json                      # Vercel SPA rewrites
├── vite.config.ts
├── tsconfig.json
├── package.json
├── README.md
└── UX.md                            # UX improvement checklist
```

## Conventions

- **Page components** are default exports in `PageName.tsx` or `index.tsx`
- **UI components** in `src/components/ui/` follow the shadcn/ui pattern (named exports, `cn()` for className merging)
- **Hooks** are named `use{Feature}.ts` and return an object with state + actions
- **Contexts** use `createContext` + `useContext` with a custom provider component
- **Supabase queries** use the singleton client from `@/lib/supabase/client`
- **File naming**: PascalCase for components, camelCase for hooks/utilities

## Path Aliases

Configured in `vite.config.ts` and `tsconfig.json`:

```typescript
"@/*": ["./src/*"]
```

Usage: `import { Button } from "@/components/ui/button"`
