import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallback() {
  const navigate = useNavigate();
  const supabase = createClient();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/onboarding', { replace: true });
        return;
      }

      const url = new URL(window.location.href);
      let code = url.searchParams.get('code');
      if (!code) {
        const hash = url.hash;
        const qs = hash.includes('?') ? hash.split('?')[1] : '';
        const hashParams = new URLSearchParams(qs);
        code = hashParams.get('code');
      }
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          navigate('/onboarding', { replace: true });
          return;
        }
      }
      navigate('/login', { replace: true });
    };

    handleCallback();
  }, [navigate, supabase]);

  return <div className="min-h-screen flex items-center justify-center">Verifying...</div>;
}