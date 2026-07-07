# Project Structure

```
Focus/
├── src/
│   ├── App.tsx                      # Root component (AuthProvider, Router, routes)
│   ├── main.tsx                     # Entry point
│   ├── index.css                    # Tailwind v4 imports + @theme config
│   ├── vite-env.d.ts                # ImportMetaEnv type declarations
│   │
│   ├── App/                         # Authenticated app shell
│   │   ├── AppLayout.tsx            # Sidebar + TopBar + content area
│   │   ├── components/
│   │   │   ├── Sidebar.tsx          # Navigation sidebar (links to all pages)
│   │   │   └── TopBar.tsx           # Header with search, notifications, user menu
│   │   ├── Onboarding/              # 4-step onboarding wizard
│   │   │   ├── OnboardingWelcome.tsx
│   │   │   ├── OnboardingDeepWork.tsx
│   │   │   ├── OnboardingPowerTools.tsx
│   │   │   ├── OnboardingFinalSetup.tsx
│   │   │   └── components/          # Reusable onboarding sub-components
│   │   └── Pages/                   # Feature pages (protected)
│   │       ├── Dashboard/
│   │       ├── Tasks/
│   │       ├── Projects/
│   │       ├── Goals/
│   │       ├── Documents/           # TipTap editor, Hocuspocus provider
│   │       ├── Chat/
│   │       ├── FocusTimer/
│   │       ├── Management/
│   │       ├── Settings/
│   │       ├── Archive/
│   │       └── Support/
│   │
│   ├── Pages/                       # Public/marketing pages (no auth required)
│   │   ├── Home/
│   │   ├── LogIn/login-form.tsx
│   │   ├── SignUp/signup-form.tsx
│   │   ├── Auth/
│   │   │   ├── Callback.tsx         # OAuth PKCE callback handler
│   │   │   └── VerificationPending.tsx
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
│   │   ├── ui/                      # shadcn/ui primitives (16 components)
│   │   │   ├── avatar.tsx, button.tsx, dialog.tsx, dropdown-menu.tsx
│   │   │   ├── input.tsx, label.tsx, popover.tsx, sheet.tsx
│   │   │   ├── tabs.tsx, toggle.tsx, slider.tsx, separator.tsx
│   │   │   ├── command.tsx, collapsible.tsx, field.tsx
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
│   │   ├── useTasks.ts
│   │   ├── useDocuments.ts
│   │   ├── useChat.ts
│   │   └── useDirectMessages.ts
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
│   └── migrations/                  # SQL migration files (7 files)
│
├── resources/
│   ├── DESIGN_SYSTEM.md             # Comprehensive design system docs
│   └── style-guide.json             # Theme tokens
│
├── docs/                            # Project documentation
├── .env.local                       # Environment variables
├── vercel.json                      # Vercel SPA rewrites
├── vite.config.ts
├── tsconfig.json
├── package.json
├── README.md
└── TODO.md
```

## Conventions

- **Page components** are default exports in `index.tsx` or `PageName.tsx`
- **UI components** in `src/components/ui/` follow the shadcn/ui pattern (named exports, `cn()` for className merging)
- **Hooks** are named `use{Feature}.ts` and return an object with state + actions
- **Contexts** use `createContext` + `useContext` with a custom provider component
- **Supabase queries** use the singleton client from `@/lib/supabase/client`
