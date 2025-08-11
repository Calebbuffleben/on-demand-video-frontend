'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppAuth } from '@/contexts/AppAuthContext';
import AuthShell, { AuthInput } from '@/components/Auth/AuthShell';
import Button from '@/components/Button';

export default function SignInPage() {
  const { login, loading } = useAppAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err?.response?.data?.message || 'Falha no login');
    }
  };

  return (
    <AuthShell
      title="Entrar"
      description="Acesse sua conta para continuar"
      footer={(
        <div className="flex w-full justify-between">
          <span>
            <span className="text-silver-400">Não tem conta?</span>{' '}
            <Link className="text-white underline" href="/sign-up">Criar conta</Link>
          </span>
          <Link className="text-white underline" href="/forgot-password">Esqueci minha senha</Link>
        </div>
      )}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <div className="text-red-300 text-sm">{error}</div>}
        <AuthInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="seu@email.com"
        />
        <AuthInput
          label="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
        />
        <Button type="submit" className="w-full" isLoading={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </AuthShell>
  );
}

