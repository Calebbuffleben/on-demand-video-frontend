'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAppAuth } from '@/contexts/AppAuthContext';
import AuthShell, { AuthInput } from '@/components/Auth/AuthShell';
import Button from '@/components/Button';

export default function SignUpPage() {
  const router = useRouter();
  const { registerWithToken, loading } = useAppAuth();
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
  const [token, setToken] = useState<string | null>(null);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [checkingToken, setCheckingToken] = useState(true);

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

  // Verificar token na URL
  useEffect(() => {
    // Aguardar o router estar pronto antes de verificar o query
    if (!router.isReady) return;
    
    const { token: urlToken } = router.query;
    console.log('🔍 [DEBUG] Router query:', router.query);
    console.log('🔍 [DEBUG] URL token:', urlToken);
    
    if (urlToken && typeof urlToken === 'string') {
      console.log('✅ [DEBUG] Token encontrado, configurando...');
      setToken(urlToken);
      setTokenValid(true);
      setCheckingToken(false);
    } else {
      console.log('❌ [DEBUG] Token não encontrado, redirecionando para pricing');
      // Sem token, redirecionar para pricing
      setTokenValid(false);
      setCheckingToken(false);
      router.push('/pricing');
    }
  }, [router.isReady, router.query]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    setError(null);
    if (!formValid) {
      setError('Verifique os campos destacados e corrija as pendências.');
      return;
    }
    if (!token) {
      setError('Token de criação de conta não encontrado.');
      return;
    }
    try {
      await registerWithToken({ firstName, lastName, email, password, token });
    } catch (e: unknown) {
      const maybeMsg = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      const msg = Array.isArray(maybeMsg)
        ? maybeMsg.join('\n')
        : (typeof maybeMsg === 'string' ? maybeMsg : 'Falha no cadastro');
      setError(msg);
    }
  };

  // Mostrar loading enquanto verifica o token
  if (checkingToken) {
    return (
      <AuthShell
        title="Verificando acesso..."
        description="Validando seu link de criação de conta"
      >
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </AuthShell>
    );
  }

  // Se não há token válido, não mostrar nada (já redirecionou)
  if (!tokenValid || !token) {
    return null;
  }

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
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-300">Acesso Restrito</h3>
              <p className="text-sm text-blue-200 mt-1">
                Esta página é acessível apenas através de um link especial enviado por email após a confirmação do pagamento.
              </p>
            </div>
          </div>
        </div>
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

