'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import api from '@/api-connection/service';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = router.query;
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = password.length >= 8 && password === confirm;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || typeof token !== 'string') return;
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      await api.post('/auth/password/reset', { token, password });
      setMessage('Senha redefinida com sucesso. Redirecionando...');
      setTimeout(() => router.push('/sign-in'), 1500);
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err?.response?.data?.message || 'Falha ao redefinir senha');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-scale-950 via-scale-900 to-scale-800 p-6">
      <form onSubmit={onSubmit} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 w-full max-w-md text-white">
        <h1 className="text-2xl font-bold mb-4">Redefinir Senha</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Nova senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded px-3 py-2 bg-white/5 border border-white/20" required />
          </div>
          <div>
            <label className="block text-sm mb-1">Confirmar senha</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className="w-full rounded px-3 py-2 bg-white/5 border border-white/20" required />
          </div>
          {error && <p className="text-red-300 text-sm">{error}</p>}
          {message && <p className="text-green-300 text-sm">{message}</p>}
          <button type="submit" disabled={!canSubmit || submitting} className="w-full py-3 rounded bg-scale-700 hover:bg-scale-800 disabled:opacity-50">
            {submitting ? 'Enviando...' : 'Atualizar Senha'}
          </button>
        </div>
      </form>
    </div>
  );
}

