'use client';

import { useState } from 'react';
import api from '@/api-connection/service';
import AuthShell, { AuthInput } from '@/components/Auth/AuthShell';
import Button from '@/components/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);
    try {
      await api.post('/auth/password/forgot', { email });
      setMessage('Se existir uma conta com este e-mail, enviaremos instruções para redefinição.');
    } catch {
      setMessage('Se existir uma conta com este e-mail, enviaremos instruções para redefinição.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Esqueci minha senha"
      description="Informe seu e-mail para enviarmos o link de redefinição"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <AuthInput
          label="E-mail"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          placeholder="voce@empresa.com"
        />
        {error && <p className="text-red-300 text-sm">{error}</p>}
        {message && <p className="text-green-300 text-sm">{message}</p>}
        <Button type="submit" className="w-full" isLoading={submitting}>
          {submitting ? 'Enviando...' : 'Enviar instruções'}
        </Button>
      </form>
    </AuthShell>
  );
}

