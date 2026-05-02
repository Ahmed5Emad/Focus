## Sentry Configuration
- Installed @sentry/react and @sentry/browser.
- Initialized Sentry in src/main.tsx with browserTracingIntegration and replayIntegration.
- Verified with bun run build.
## Vercel Web Analytics Integration
- Integrated @vercel/analytics into the application.
- Added <Analytics /> component to src/App.tsx alongside SpeedInsights.
- Verified with lsp_diagnostics and a successful build.
## React Error Boundary Implementation
- Installed react-error-boundary using bun.
- Created a fallback UI component src/components/ErrorBoundaryFallback.tsx.
- Wrapped the main HashRouter in src/App.tsx with ErrorBoundary to catch errors globally.
- Verified with a test component that throws an error.
## CI Workflow
- Created .github/workflows/ci.yml for automated linting and type checking on PRs.
- Workflow runs `bun install`, `bun run lint`, and `bun run tsc --noEmit`.
