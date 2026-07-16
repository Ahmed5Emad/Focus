import { lazy, Suspense, useEffect } from "react";
import { HashRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorBoundaryFallback } from "./components/ErrorBoundaryFallback";
import { AppLoadingFallback } from "./components/shared/AppLoadingFallback";
import { HomeSkeleton } from "./Pages/Home/HomeSkeleton";
import { PricingSkeleton } from "./Pages/Pricing/PricingSkeleton";
import { AboutSkeleton } from "./Pages/About/AboutSkeleton";
import { FeaturedSkeleton } from "./Pages/Featured/FeaturedSkeleton";
import { LoginSkeleton } from "./Pages/LogIn/LoginSkeleton";
import { SignUpSkeleton } from "./Pages/SignUp/SignUpSkeleton";
import { NotFoundSkeleton } from "./Pages/NotFound/NotFoundSkeleton";
import { SpeedInsights } from "@vercel/speed-insights/react"
import { Analytics } from "@vercel/analytics/react"
import { AppLayout } from "./App/AppLayout";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { FocusProvider } from "./contexts/FocusContext";

const Home = lazy(() => import("./Pages/Home/Home"));
const SignupForm = lazy(() => import("./Pages/SignUp/signup-form").then(m => ({ default: m.SignupForm })));
const LoginForm = lazy(() => import("./Pages/LogIn/login-form").then(m => ({ default: m.LoginForm })));
const VerificationPending = lazy(() => import("./Pages/Auth/VerificationPending"));
const AuthCallback = lazy(() => import("./Pages/Auth/Callback"));
const Pricing = lazy(() => import("./Pages/Pricing/Pricing"));
const About = lazy(() => import("./Pages/About/About"));
const Featured = lazy(() => import("./Pages/Featured/Featured"));
const OnboardingWelcome = lazy(() => import("./App/Onboarding/OnboardingWelcome"));
const OnboardingDeepWork = lazy(() => import("./App/Onboarding/OnboardingDeepWork"));
const OnboardingPowerTools = lazy(() => import("./App/Onboarding/OnboardingPowerTools"));
const OnboardingFinalSetup = lazy(() => import("./App/Onboarding/OnboardingFinalSetup"));
const Dashboard = lazy(() => import("./App/Pages/Dashboard/Dashboard"));
const Goals = lazy(() => import("./App/Pages/Goals/Goals"));
const Projects = lazy(() => import("./App/Pages/Projects/Projects"));
const Tasks = lazy(() => import("./App/Pages/Tasks/Tasks"));
const TaskCreation = lazy(() => import("./App/Pages/Tasks/TaskCreation"));
const Settings = lazy(() => import("./App/Pages/Settings/Settings"));
const FocusTimer = lazy(() => import("./App/Pages/FocusTimer/FocusTimer"));
const ArchivePage = lazy(() => import("./App/Pages/Archive/Archive"));
const Support = lazy(() => import("./App/Pages/Support/Support"));
const Chat = lazy(() => import("./App/Pages/Chat/Chat"));
const Documents = lazy(() => import("./App/Pages/Documents/Documents"));
const DocumentEditor = lazy(() => import("./App/Pages/Documents/DocumentEditor"));
const NotFound = lazy(() => import("./Pages/NotFound/NotFound").then(m => ({ default: m.NotFound })));

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

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function App() {
  return (
    <AuthProvider>
      <FocusProvider>
        <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
          <HashRouter>
            <ScrollToTop />
            <Toaster />
            <SpeedInsights />
            <Analytics />
            <Suspense fallback={<AppLoadingFallback />}>
              <Routes>
                <Route path="/" element={<Suspense fallback={<HomeSkeleton />}><Home /></Suspense>} />
                <Route path="/pricing" element={<Suspense fallback={<PricingSkeleton />}><Pricing /></Suspense>} />
                <Route path="/about" element={<Suspense fallback={<AboutSkeleton />}><About /></Suspense>} />
                <Route path="/features" element={<Suspense fallback={<FeaturedSkeleton />}><Featured /></Suspense>} />
                <Route path="/onboarding" element={<Suspense fallback={<AppLoadingFallback />}><OnboardingWelcome /></Suspense>} />
                <Route path="/onboarding/deep-work" element={<Suspense fallback={<AppLoadingFallback />}><OnboardingDeepWork /></Suspense>} />
                <Route path="/onboarding/power-tools" element={<Suspense fallback={<AppLoadingFallback />}><OnboardingPowerTools /></Suspense>} />
                <Route path="/onboarding/final-setup" element={<Suspense fallback={<AppLoadingFallback />}><OnboardingFinalSetup /></Suspense>} />
                <Route path="/signup" element={<Suspense fallback={<SignUpSkeleton />}><SignupForm /></Suspense>} />
                <Route path="/login" element={<Suspense fallback={<LoginSkeleton />}><LoginForm /></Suspense>} />
                <Route path="/auth/verification-pending" element={<Suspense fallback={<LoginSkeleton />}><VerificationPending /></Suspense>} />
                <Route path="/auth/callback" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}><AuthCallback /></Suspense>} />
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
                  <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
                  <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
                  <Route path="/tasks/new" element={<ProtectedRoute><TaskCreation /></ProtectedRoute>} />

                  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
                  <Route path="/documents/:id" element={<ProtectedRoute><DocumentEditor /></ProtectedRoute>} />
                  <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                  <Route path="/focus-timer" element={<ProtectedRoute><FocusTimer /></ProtectedRoute>} />
                  <Route path="/archive" element={<ProtectedRoute><ArchivePage /></ProtectedRoute>} />
                  <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
                  <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
                </Route>
                <Route path="*" element={<Suspense fallback={<NotFoundSkeleton />}><NotFound /></Suspense>} />
              </Routes>
            </Suspense>
          </HashRouter>
        </ErrorBoundary>
      </FocusProvider>
    </AuthProvider>
  )

}

export default App
