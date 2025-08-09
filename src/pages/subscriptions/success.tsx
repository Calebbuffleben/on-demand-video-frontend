'use client';

import { useRouter } from 'next/router';
import { useEffect, useCallback } from 'react';
import api from '@/api-connection/service';

const SubscriptionSuccessPage = () => {
  const router = useRouter();
  const { session_id } = router.query;

  const updateSubscription = useCallback(async () => {
    if (session_id) {
      try {
        await api.post('/subscriptions/update-subscription', { sessionId: session_id });
        router.push('/dashboard');
      } catch (error) {
        console.error('Error updating subscription:', error);
      }
    }
  }, [session_id, router]);

  useEffect(() => {
    updateSubscription();
  }, [updateSubscription]);

  return <div>Processing subscription...</div>;
};

export default SubscriptionSuccessPage;