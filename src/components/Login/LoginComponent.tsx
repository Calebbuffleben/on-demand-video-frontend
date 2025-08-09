import Link from 'next/link';
import { useAppAuth } from '@/contexts/AppAuthContext';

const LoginComponent = () => {
  const { isAuthenticated } = useAppAuth();
  if (isAuthenticated) {
    return <Link href="/profile">Perfil</Link>;
  }
  return <Link href="/sign-in">Entrar</Link>;
};

export default LoginComponent;
