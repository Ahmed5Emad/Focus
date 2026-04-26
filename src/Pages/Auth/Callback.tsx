import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallback() {
  const navigate = useNavigate();
  const supabase = createClient();

  useEffect(() => {
    const handleCallback = async () => {
      const { searchParams } = new URL(window.location.href);
      const code = searchParams.get('code');

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          navigate('/dashboard', { replace: true });
          return;
        }
      }
      navigate('/login', { replace: true });
    };

    handleCallback();
  }, [navigate, supabase]);

  return <div className="min-h-screen flex items-center justify-center">Verifying...</div>;
}