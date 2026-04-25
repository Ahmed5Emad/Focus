import Home from "./Pages/Home/Home"
import { HashRouter, Routes, Route } from "react-router-dom";
import { SignupForm } from "./Pages/SignUp/signup-form";
import { LoginForm } from "./Pages/LogIn/login-form";
import Pricing from "./Pages/Pricing/Pricing";
import About from "./Pages/About/About";
import Featured from "./Pages/Featured/Featured";
import OnboardingWelcome from "./Pages/Onboarding/OnboardingWelcome";
import OnboardingDeepWork from "./Pages/Onboarding/OnboardingDeepWork";
import OnboardingPowerTools from "./Pages/Onboarding/OnboardingPowerTools";
import OnboardingFinalSetup from "./Pages/Onboarding/OnboardingFinalSetup";
import { SpeedInsights } from "@vercel/speed-insights/react"
import { AppLayout } from "./App/AppLayout";
import Dashboard from "./App/Pages/Dashboard/Dashboard";

function App() {
  return (
    <HashRouter>
      <SpeedInsights />
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/signup" element={<SignupForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Featured />} />
        <Route path="/onboarding" element={<OnboardingWelcome />} />
        <Route path="/onboarding/deep-work" element={<OnboardingDeepWork />} />
        <Route path="/onboarding/power-tools" element={<OnboardingPowerTools />} />
        <Route path="/onboarding/final-setup" element={<OnboardingFinalSetup />} />

        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
