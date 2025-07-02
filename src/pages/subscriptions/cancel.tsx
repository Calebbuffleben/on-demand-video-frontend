'use client';
import { useRouter } from 'next/router';

const SubscriptionCancelPage = () => {
  const router = useRouter();

  // Handle the cancellation logic if needed

  return (
    <div>
      <h1>Assinatura Cancelada</h1>
      <p>Sua assinatura não foi processada.</p>
      <button onClick={() => router.push('/pricing')}>Voltar aos Preços</button>
    </div>
  );
};

export default SubscriptionCancelPage; 