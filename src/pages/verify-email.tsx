'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '@/api-connection/service';
import AuthGuard from '@/components/Auth/AuthGuard';
import { useAppAuth } from '@/contexts/AppAuthContext';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { token } = router.query;
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const { user, requestEmailVerification } = useAppAuth();

  useEffect(() => {
    const verify = async () => {
      if (!token || typeof token !== 'string') return;
      setStatus('verifying');
      try {
        const res = await api.get(`/auth/email/verify?token=${encodeURIComponent(token)}`);
        if (res.data?.success) {
          setStatus('success');
          setTimeout(() => router.push('/organization-selector'), 1200);
        } else {
          setStatus('error');
        }
      } catch {
        setStatus('error');
      }
    };
    verify();
  }, [token, router]);

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-scale-950 via-scale-900 to-scale-800 p-6">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 w-full max-w-md text-white text-center">
          <h1 className="text-2xl font-bold mb-2">Verificação de E-mail</h1>
          {status === 'idle' && <p>Carregando...</p>}
          {status === 'verifying' && <p>Verificando seu e-mail...</p>}
          {status === 'success' && <p className="text-green-300">E-mail verificado! Redirecionando...</p>}
          {status === 'error' && (
            <div>
              <p className="text-red-300 mb-4">Token inválido ou expirado.</p>
              <button
                onClick={() => router.push('/sign-in')}
                className="px-4 py-2 rounded bg-scale-700 hover:bg-scale-800"
              >
                Voltar ao login
              </button>
              <div className="mt-4">
                <button
                  onClick={() => user?.email && requestEmailVerification(user.email)}
                  className="text-sm underline text-silver-300 hover:text-white"
                >
                  Reenviar e-mail de verificação
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}

