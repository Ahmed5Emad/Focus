import Home from "./Pages/Home/Home"
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorBoundaryFallback } from "./components/ErrorBoundaryFallback";
import { SignupForm } from "./Pages/SignUp/signup-form";

import { LoginForm } from "./Pages/LogIn/login-form";
import VerificationPending from "./Pages/Auth/VerificationPending";
import AuthCallback from "./Pages/Auth/Callback";
import Pricing from "./Pages/Pricing/Pricing";
import About from "./Pages/About/About";
import Featured from "./Pages/Featured/Featured";
import OnboardingWelcome from "./App/Onboarding/OnboardingWelcome";
import OnboardingDeepWork from "./App/Onboarding/OnboardingDeepWork";
import OnboardingPowerTools from "./App/Onboarding/OnboardingPowerTools";
import OnboardingFinalSetup from "./App/Onboarding/OnboardingFinalSetup";
import { SpeedInsights } from "@vercel/speed-insights/react"
import { Analytics } from "@vercel/analytics/react"
import { AppLayout } from "./App/AppLayout";
import Dashboard from "./App/Pages/Dashboard/Dashboard";
import Goals from "./App/Pages/Goals/Goals";
import Projects from "./App/Pages/Projects/Projects";
import Tasks from "./App/Pages/Tasks/Tasks";
import TaskCreation from "./App/Pages/Tasks/TaskCreation";
import Management from "./App/Pages/Management/Management";
import Settings from "./App/Pages/Settings/Settings";
import FocusTimer from "./App/Pages/FocusTimer/FocusTimer";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { FocusProvider } from "./contexts/FocusContext";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <FocusProvider>
        <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
          <HashRouter>
            <SpeedInsights />
            <Analytics />
            <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Featured />} />
          <Route path="/onboarding" element={<OnboardingWelcome />} />
          <Route path="/onboarding/deep-work" element={<OnboardingDeepWork />} />
          <Route path="/onboarding/power-tools" element={<OnboardingPowerTools />} />
          <Route path="/onboarding/final-setup" element={<OnboardingFinalSetup />} />

           <Route path="/signup" element={<SignupForm />} />
           <Route path="/login" element={<LoginForm />} />
           <Route path="/auth/verification-pending" element={<VerificationPending />} />
           <Route path="/auth/callback" element={<AuthCallback />} />

           <Route element={<AppLayout />}>
             <Route path="/dashboard" element={
               <ProtectedRoute>
                 <Dashboard />
               </ProtectedRoute>
             } />
             <Route path="/tasks" element={
               <ProtectedRoute>
                 <Tasks />
               </ProtectedRoute>
             } />
              <Route path="/goals" element={
                <ProtectedRoute>
                  <Goals />
                </ProtectedRoute>
              } />
              <Route path="/projects" element={
                <ProtectedRoute>
                  <Projects />
                </ProtectedRoute>
              } />
             <Route path="/tasks/new" element={
               <ProtectedRoute>
                 <TaskCreation />
               </ProtectedRoute>
             } />
             <Route path="/management" element={
               <ProtectedRoute>
                 <Management />
               </ProtectedRoute>
             } />
             <Route path="/settings" element={
               <ProtectedRoute>
                 <Settings />
               </ProtectedRoute>
             } />
             <Route path="/focus-timer" element={
               <ProtectedRoute>
                 <FocusTimer />
               </ProtectedRoute>
             } />
           </Route>
            </Routes>
          </HashRouter>
        </ErrorBoundary>
      </FocusProvider>
    </AuthProvider>
  )

}

export default App
