import Home from "./Pages/Home/Home"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SignupForm } from "./Pages/SignUp/signup-form";
import { LoginForm } from "./Pages/LogIn/login-form";
import Pricing from "./Pages/Pricing/Pricing";
import About from "./Pages/About/About";
import Featured from "./Pages/Featured/Featured";
import OnboardingWelcome from "./Pages/Onboarding/OnboardingWelcome";
import OnboardingDeepWork from "./Pages/Onboarding/OnboardingDeepWork";

function App() {

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Featured />} />
        <Route path="/onboarding" element={<OnboardingWelcome />} />
        <Route path="/onboarding/deep-work" element={<OnboardingDeepWork />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
