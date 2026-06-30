import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import logo from "@/assets/logo.svg";
import appleIcon from "@/assets/apple-icon.svg";
import googleIcon from "@/assets/google-icon.svg";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supabase] = useState(() => createClient());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center bg-gradient-to-br from-cu-purple/5 via-white to-cu-orange/5 p-4",
        className,
      )}
      {...props}
    >
      <div className="w-full max-w-md flex flex-col gap-6 bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 sm:p-10 relative overflow-hidden">
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
                <h2 className="text-3xl font-black text-slate-900">Focus</h2>
                <span className="sr-only">Focus</span>
              </Link>
              <h1 className="text-2xl font-bold mt-2 text-slate-900">Sign in to your workspace</h1>
              <FieldDescription className="text-base mt-1">
                Don&apos;t have an account? <Link to="/signup" className="text-cu-purple font-semibold hover:underline">Sign up</Link>
              </FieldDescription>
            </div>
            <Field>
              <FieldLabel htmlFor="email" className="font-semibold text-slate-700">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                className="h-12 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white focus:border-cu-purple focus:ring-cu-purple/20"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
               <FieldLabel htmlFor="password" className="font-semibold text-slate-700 mt-2">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="h-12 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white focus:border-cu-purple focus:ring-cu-purple/20"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </Field>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                {error}
              </div>
            )}
            <Field className="mt-6">
              <Button type="submit" disabled={isLoading} className="w-full bg-cu-purple hover:bg-cu-purple/90 text-white shadow-lg shadow-cu-purple/20 font-bold h-12 text-md rounded-xl transition-all hover:-translate-y-0.5">
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </Field>
            <FieldSeparator className="my-4 text-gray-400">Or continue with</FieldSeparator>
            <Field className="grid gap-4 sm:grid-cols-2">
              <Button variant="outline" type="button" onClick={async () => { await supabase.auth.signInWithOAuth({ provider: 'apple' }); }} className="h-12 rounded-xl border-gray-200 hover:bg-gray-50 font-semibold text-slate-700">
                <img src={appleIcon} alt="" className="w-5 h-5 mr-2" />
                Apple
              </Button>
              <Button variant="outline" type="button" onClick={async () => { await supabase.auth.signInWithOAuth({ provider: 'google' }); }} className="h-12 rounded-xl border-gray-200 hover:bg-gray-50 font-semibold text-slate-700">
                <img src={googleIcon} alt="" className="w-5 h-5 mr-2" />
                Google
              </Button>
            </Field>
          </FieldGroup>
        </form>
        <FieldDescription className="px-6 text-center mt-2 text-sm text-gray-500">
          By clicking continue, you agree to our <a href="#" className="font-medium text-slate-700 hover:underline">Terms of Service</a>{" "}
          and <a href="#" className="font-medium text-slate-700 hover:underline">Privacy Policy</a>.
        </FieldDescription>
      </div>
    </div>
  );
}
