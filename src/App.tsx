import Home from "./Pages/Home/Home"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SignupForm } from "./Pages/SignUp/signup-form";
import { LoginForm } from "./Pages/LogIn/login-form";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/login" element={<LoginForm />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
