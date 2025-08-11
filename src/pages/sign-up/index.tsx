'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAppAuth } from '@/contexts/AppAuthContext';
import AuthShell, { AuthInput } from '@/components/Auth/AuthShell';
import Button from '@/components/Button';

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
    <AuthShell
      title="Criar conta"
      description="Preencha seus dados para começar"
      footer={(
        <p>
          <span className="text-silver-400">Já tem conta?</span>{' '}
          <Link className="text-white underline" href="/sign-in">Entrar</Link>
        </p>
      )}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div className="text-red-300 text-sm whitespace-pre-line">{error}</div>
        )}
        <AuthInput
          label="Nome"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          onBlur={() => setFirstNameTouched(true)}
          required
          placeholder="Seu nome"
        />
        {(firstNameTouched || submitted) && !firstNameValid && (
          <div className="text-xs text-red-300">O nome deve ter pelo menos 2 caracteres.</div>
        )}
        <AuthInput
          label="Sobrenome"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          onBlur={() => setLastNameTouched(true)}
          required
          placeholder="Seu sobrenome"
        />
        {(lastNameTouched || submitted) && !lastNameValid && (
          <div className="text-xs text-red-300">O sobrenome deve ter pelo menos 2 caracteres.</div>
        )}
        <AuthInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setEmailTouched(true)}
          required
          placeholder="voce@empresa.com"
        />
        {(emailTouched || submitted) && !emailValid && (
          <div className="text-xs text-red-300">Informe um email válido.</div>
        )}
        <AuthInput
          label="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setPasswordTouched(true)}
          required
          placeholder="Mínimo 8 caracteres, com maiúscula, minúscula, número e símbolo"
        />
        {(passwordTouched || submitted) && (
          <div className="text-xs text-silver-300 space-y-1">
            <div className={pwLen ? 'text-green-300' : 'text-silver-400'}>• Pelo menos 8 caracteres</div>
            <div className={pwUpper ? 'text-green-300' : 'text-silver-400'}>• Pelo menos 1 letra maiúscula</div>
            <div className={pwLower ? 'text-green-300' : 'text-silver-400'}>• Pelo menos 1 letra minúscula</div>
            <div className={pwDigit ? 'text-green-300' : 'text-silver-400'}>• Pelo menos 1 número</div>
            <div className={pwSpecial ? 'text-green-300' : 'text-silver-400'}>• Pelo menos 1 caractere especial</div>
          </div>
        )}
        <Button type="submit" className="w-full" disabled={loading || !formValid} isLoading={loading}>
          {loading ? 'Criando...' : 'Criar conta'}
        </Button>
      </form>
    </AuthShell>
  );
}

