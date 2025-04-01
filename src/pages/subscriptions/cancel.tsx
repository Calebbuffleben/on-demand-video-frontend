'use client';
import { useRouter } from 'next/router';

const SubscriptionCancelPage = () => {
  const router = useRouter();

  // Handle the cancellation logic if needed

  return (
    <div>
      <h1>Subscription Canceled</h1>
      <p>Your subscription was not processed.</p>
      <button onClick={() => router.push('/pricing')}>Back to Pricing</button>
    </div>
  );
};

export default SubscriptionCancelPage; 