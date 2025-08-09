'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppAuth } from '@/contexts/AppAuthContext';

export default function SignUpPage() {
  const { register, loading } = useAppAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    try {
      await register({ firstName, lastName, email, password });
    } catch {
      setError('Falha no cadastro');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-gray-900 p-6 rounded-lg shadow">
        <h1 className="text-xl font-semibold text-white mb-4">Criar conta</h1>
        {error && <div className="text-red-400 text-sm mb-3">{error}</div>}
        <label className="block text-sm text-gray-300 mb-1">Nome</label>
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded bg-gray-800 text-white border border-gray-700"
          required
        />
        <label className="block text-sm text-gray-300 mb-1">Sobrenome</label>
        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded bg-gray-800 text-white border border-gray-700"
          required
        />
        <label className="block text-sm text-gray-300 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded bg-gray-800 text-white border border-gray-700"
          required
        />
        <label className="block text-sm text-gray-300 mb-1">Senha</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded bg-gray-800 text-white border border-gray-700"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded"
        >
          {loading ? 'Criando...' : 'Criar conta'}
        </button>
        <p className="text-gray-400 text-sm mt-4">
          Já tem conta? <Link className="text-blue-400 hover:underline" href="/sign-in">Entrar</Link>
        </p>
      </form>
    </div>
  );
}

