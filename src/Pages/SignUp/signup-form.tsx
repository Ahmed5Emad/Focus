import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import logo from "@/assets/logo.svg"
import appleIcon from "@/assets/apple-icon.svg"
import googleIcon from "@/assets/google-icon.svg"
import { createClient } from "@/lib/supabase/client"

const PASSWORD_REQUIREMENTS = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "At least one uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "At least one lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "At least one number", test: (p: string) => /\d/.test(p) },
] as const;

function getFriendlyErrorMessage(error: { message: string }): string {
  const msg = error.message.toLowerCase();

  if (msg.includes("rate limit") || msg.includes("too many requests")) {
    return "Too many sign-up attempts. Please wait a few minutes before trying again.";
  }
  if (msg.includes("password") && (msg.includes("word") || msg.includes("character") || msg.includes("letter") || msg.includes("digit") || msg.includes("symbol") || msg.includes("uppercase") || msg.includes("lowercase"))) {
    return "Password doesn't meet security requirements. See the checklist below.";
  }
  if (msg.includes("email") && (msg.includes("already") || msg.includes("registered") || msg.includes("exist"))) {
    return "An account with this email already exists. Try signing in instead.";
  }
  if (msg.includes("email") && msg.includes("invalid")) {
    return "Please enter a valid email address.";
  }

  return error.message;
}

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [supabase] = useState(() => createClient());

  const allRequirementsMet = PASSWORD_REQUIREMENTS.every(r => r.test(password));
  const touchedPassword = password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!allRequirementsMet) {
      setError("Please meet all password requirements before continuing.");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        setError(getFriendlyErrorMessage(error));
        return;
      }

      navigate('/auth/verification-pending');
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during sign up");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("min-h-screen flex items-center justify-center bg-gradient-to-br from-cu-purple/5 via-background to-cu-orange/5 p-4", className)} {...props}>
      <div className="w-full max-w-md flex flex-col gap-6 bg-card rounded-3xl shadow-2xl border border-border p-8 sm:p-10 relative overflow-hidden">
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <div className="flex flex-col items-center gap-2 text-center mb-4">
              <Link
                to="/"
                className="flex flex-col items-center gap-2 font-medium group"
              >
                <div className="flex flex-col items-center justify-center group-hover:scale-105 transition-transform">
                  <img src={logo} alt="logo" className="w-12" /> 
                </div>
                <h2 className="text-3xl font-black text-foreground">Focus</h2>
                <span className="sr-only">Focus</span>
              </Link>
              <h1 className="text-2xl font-bold mt-2 text-foreground">Create your Focus account</h1>
              <FieldDescription className="text-base mt-1">
                Already have an account? <Link to="/login" className="text-cu-purple font-semibold hover:underline">Sign in</Link>
              </FieldDescription>
            </div>
            <Field>
             <FieldLabel htmlFor="name" className="font-semibold text-card-foreground">Name</FieldLabel>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              className="h-12 rounded-xl bg-muted border-border focus:bg-card focus:border-cu-purple focus:ring-cu-purple/20"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
            <FieldLabel htmlFor="email" className="font-semibold text-card-foreground mt-2">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              className="h-12 rounded-xl bg-muted border-border focus:bg-card focus:border-cu-purple focus:ring-cu-purple/20"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            <Field className="mt-2">
            <FieldLabel htmlFor="password" className="font-semibold text-card-foreground">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="h-12 rounded-xl bg-muted border-border focus:bg-card focus:border-cu-purple focus:ring-cu-purple/20"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              disabled={isLoading}
            />
          </Field>
          </Field>
          {(isPasswordFocused || (touchedPassword && !allRequirementsMet)) && (
            <ul className="mt-2 space-y-1">
              {PASSWORD_REQUIREMENTS.map((req) => {
                const met = req.test(password);
                return (
                  <li
                    key={req.label}
                    className={`flex items-center gap-2 text-xs transition-colors ${
                      met ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                    }`}
                  >
                    <span className="text-base leading-none">{met ? "✓" : "○"}</span>
                    {req.label}
                  </li>
                );
              })}
            </ul>
          )}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 dark:bg-red-950 dark:border-red-800 dark:text-red-400 rounded-xl text-sm">
              {error}
            </div>
          )}
          <Field className="mt-6">
            <Button type="submit" disabled={isLoading} className="w-full bg-cu-purple hover:bg-cu-purple/90 text-white shadow-lg shadow-cu-purple/20 font-bold h-12 text-md rounded-xl transition-all hover:-translate-y-0.5">
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </Field>
          <FieldSeparator className="my-4 text-muted-foreground">Or continue with</FieldSeparator>
          <Field className="grid gap-4 sm:grid-cols-2">
              <Button variant="outline" type="button" onClick={async () => { await supabase.auth.signInWithOAuth({ provider: 'apple', options: { redirectTo: window.location.origin + '/#/auth/callback' } }); }} className="h-12 rounded-xl border-border hover:bg-muted font-semibold text-card-foreground">
                <img src={appleIcon} alt="" className="w-5 h-5 mr-2" />
                Apple
              </Button>
              <Button variant="outline" type="button" onClick={async () => { await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/#/auth/callback' } }); }} className="h-12 rounded-xl border-border hover:bg-muted font-semibold text-card-foreground">
                <img src={googleIcon} alt="" className="w-5 h-5 mr-2" />
                Google
              </Button>
          </Field>
        </FieldGroup>
        </form>
        <FieldDescription className="px-6 text-center mt-2 text-sm text-muted-foreground">
          By clicking continue, you agree to our <a href="#" className="font-medium text-card-foreground hover:underline">Terms of Service</a>{" "}
          and <a href="#" className="font-medium text-card-foreground hover:underline">Privacy Policy</a>.
        </FieldDescription>
      </div>
    </div>
  )
}
