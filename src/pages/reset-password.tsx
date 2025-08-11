'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import api from '@/api-connection/service';
import AuthShell, { AuthInput } from '@/components/Auth/AuthShell';
import Button from '@/components/Button';

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
    <AuthShell
      title="Redefinir Senha"
      description="Crie uma nova senha para acessar sua conta"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <AuthInput
          label="Nova senha"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          placeholder="mínimo de 8 caracteres"
        />
        <AuthInput
          label="Confirmar senha"
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
          placeholder="repita a senha"
        />
        {error && <p className="text-red-300 text-sm">{error}</p>}
        {message && <p className="text-green-300 text-sm">{message}</p>}
        <Button type="submit" className="w-full" disabled={!canSubmit} isLoading={submitting}>
          {submitting ? 'Enviando...' : 'Atualizar Senha'}
        </Button>
      </form>
    </AuthShell>
  );
}

