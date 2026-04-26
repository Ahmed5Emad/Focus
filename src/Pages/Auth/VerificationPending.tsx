import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@/lib/supabase/client';

export default function VerificationPending() {
  const navigate = useNavigate();
  const supabase = createClient();

  useEffect(() => {
    const interval = setInterval(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email_confirmed_at) {
        clearInterval(interval);
        navigate('/onboarding', { replace: true });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [navigate, supabase]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Check your email</h1>
      <p className="text-gray-600">We've sent a verification link to your email address.</p>
      <p className="text-sm text-gray-500 mt-2">Waiting for verification...</p>
    </div>
  );
}