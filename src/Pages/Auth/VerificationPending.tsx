export default function VerificationPending() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Check your email</h1>
      <p className="text-gray-600">We've sent a verification link to your email address.</p>
      <p className="text-sm text-gray-500 mt-2">Please click the link to verify your account.</p>
    </div>
  );
}