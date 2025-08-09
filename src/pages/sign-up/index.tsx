'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAppAuth } from '@/contexts/AppAuthContext';

export default function SignUpPage() {
  const { register, loading } = useAppAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [firstNameTouched, setFirstNameTouched] = useState(false);
  const [lastNameTouched, setLastNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const firstNameValid = useMemo(() => firstName.trim().length >= 2, [firstName]);
  const lastNameValid = useMemo(() => lastName.trim().length >= 2, [lastName]);
  const emailValid = useMemo(() => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email.trim()), [email]);
  const pwLen = useMemo(() => password.length >= 8, [password]);
  const pwUpper = useMemo(() => /[A-Z]/.test(password), [password]);
  const pwLower = useMemo(() => /[a-z]/.test(password), [password]);
  const pwDigit = useMemo(() => /\d/.test(password), [password]);
  const pwSpecial = useMemo(() => /[^A-Za-z0-9]/.test(password), [password]);
  const passwordValid = useMemo(() => pwLen && pwUpper && pwLower && pwDigit && pwSpecial, [pwLen, pwUpper, pwLower, pwDigit, pwSpecial]);
  const formValid = useMemo(() => firstNameValid && lastNameValid && emailValid && passwordValid, [firstNameValid, lastNameValid, emailValid, passwordValid]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    setError(null);
    if (!formValid) {
      setError('Verifique os campos destacados e corrija as pendências.');
      return;
    }
    try {
      await register({ firstName, lastName, email, password });
    } catch (e: unknown) {
      const maybeMsg = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      const msg = Array.isArray(maybeMsg)
        ? maybeMsg.join('\n')
        : (typeof maybeMsg === 'string' ? maybeMsg : 'Falha no cadastro');
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-gray-900 p-6 rounded-lg shadow">
        <h1 className="text-xl font-semibold text-white mb-4">Criar conta</h1>
        {error && (
          <div className="text-red-400 text-sm mb-3 whitespace-pre-line">{error}</div>
        )}
        <label className="block text-sm text-gray-300 mb-1">Nome</label>
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          onBlur={() => setFirstNameTouched(true)}
          className="w-full mb-3 px-3 py-2 rounded bg-gray-800 text-white border border-gray-700"
          required
        />
        {(firstNameTouched || submitted) && !firstNameValid && (
          <div className="text-xs text-red-400 mb-2">O nome deve ter pelo menos 2 caracteres.</div>
        )}
        <label className="block text-sm text-gray-300 mb-1">Sobrenome</label>
        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          onBlur={() => setLastNameTouched(true)}
          className="w-full mb-3 px-3 py-2 rounded bg-gray-800 text-white border border-gray-700"
          required
        />
        {(lastNameTouched || submitted) && !lastNameValid && (
          <div className="text-xs text-red-400 mb-2">O sobrenome deve ter pelo menos 2 caracteres.</div>
        )}
        <label className="block text-sm text-gray-300 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setEmailTouched(true)}
          className="w-full mb-3 px-3 py-2 rounded bg-gray-800 text-white border border-gray-700"
          required
        />
        {(emailTouched || submitted) && !emailValid && (
          <div className="text-xs text-red-400 mb-2">Informe um email válido.</div>
        )}
        <label className="block text-sm text-gray-300 mb-1">Senha</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setPasswordTouched(true)}
          className="w-full mb-4 px-3 py-2 rounded bg-gray-800 text-white border border-gray-700"
          required
        />
        {(passwordTouched || submitted) && (
        <div className="text-xs -mt-3 mb-4 space-y-1">
          <div className={pwLen ? 'text-green-400' : 'text-gray-400'}>• Pelo menos 8 caracteres</div>
          <div className={pwUpper ? 'text-green-400' : 'text-gray-400'}>• Pelo menos 1 letra maiúscula</div>
          <div className={pwLower ? 'text-green-400' : 'text-gray-400'}>• Pelo menos 1 letra minúscula</div>
          <div className={pwDigit ? 'text-green-400' : 'text-gray-400'}>• Pelo menos 1 número</div>
          <div className={pwSpecial ? 'text-green-400' : 'text-gray-400'}>• Pelo menos 1 caractere especial</div>
        </div>
        )}
        <button
          type="submit"
          disabled={loading || !formValid}
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

