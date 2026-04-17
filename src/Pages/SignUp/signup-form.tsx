import { Link } from "react-router-dom"
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

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("min-h-screen flex items-center justify-center bg-gradient-to-br from-cu-purple/5 via-white to-cu-orange/5 p-4", className)} {...props}>
      <div className="w-full max-w-md flex flex-col gap-6 bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 sm:p-10 relative overflow-hidden">
        <form>
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
              <h1 className="text-2xl font-bold mt-2 text-slate-900">Create your Focus account</h1>
              <FieldDescription className="text-base mt-1">
                Already have an account? <Link to="/login" className="text-cu-purple font-semibold hover:underline">Sign in</Link>
              </FieldDescription>
            </div>
            <Field>
             <FieldLabel htmlFor="name" className="font-semibold text-slate-700">Name</FieldLabel>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              className="h-12 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white focus:border-cu-purple focus:ring-cu-purple/20"
              required
            />
            <FieldLabel htmlFor="email" className="font-semibold text-slate-700 mt-2">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              className="h-12 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white focus:border-cu-purple focus:ring-cu-purple/20"
              required
            />
            <Field className="mt-2">
            <FieldLabel htmlFor="password" className="font-semibold text-slate-700">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="h-12 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white focus:border-cu-purple focus:ring-cu-purple/20"
              required
            />
          </Field>
          </Field>
          <Field className="mt-6">
            <Button type="submit" className="w-full bg-cu-purple hover:bg-cu-purple/90 text-white shadow-lg shadow-cu-purple/20 font-bold h-12 text-md rounded-xl transition-all hover:-translate-y-0.5">Create Account</Button>
          </Field>
          <FieldSeparator className="my-4 text-gray-400">Or continue with</FieldSeparator>
          <Field className="grid gap-4 sm:grid-cols-2">
            <Button variant="outline" type="button" className="h-12 rounded-xl border-gray-200 hover:bg-gray-50 font-semibold text-slate-700">
              <svg fill="#000000" className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
              </svg>
              Apple
            </Button>
            <Button variant="outline" type="button" className="h-12 rounded-xl border-gray-200 hover:bg-gray-50 font-semibold text-slate-700">
              <svg className="w-5 h-5 mr-2" viewBox="-3 0 262 262" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid"><path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4"/><path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853"/><path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05"/><path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335"/></svg>
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
  )
}
