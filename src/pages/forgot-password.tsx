'use client';

import { useState } from 'react';
import api from '@/api-connection/service';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-scale-950 via-scale-900 to-scale-800 p-6">
      <form onSubmit={onSubmit} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 w-full max-w-md text-white">
        <h1 className="text-2xl font-bold mb-4">Esqueci minha senha</h1>
        <label className="block text-sm mb-1">E-mail</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full rounded px-3 py-2 bg-white/5 border border-white/20 mb-4"
        />
        {error && <p className="text-red-300 text-sm mb-2">{error}</p>}
        {message && <p className="text-green-300 text-sm mb-2">{message}</p>}
        <button type="submit" disabled={submitting} className="w-full py-3 rounded bg-scale-700 hover:bg-scale-800 disabled:opacity-50">
          {submitting ? 'Enviando...' : 'Enviar instruções'}
        </button>
      </form>
    </div>
  );
}

