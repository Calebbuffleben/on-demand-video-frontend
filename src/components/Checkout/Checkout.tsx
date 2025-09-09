'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import subscriptionService from '../../api-connection/subscriptions';

interface CheckoutProps {
  priceId: string;
}

const Checkout: React.FC<CheckoutProps> = ({ priceId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      console.log('Creating checkout session for priceId:', priceId);
      
      // Use the subscription service
      const response = await subscriptionService.createCheckoutSession({
        planType: priceId === 'price_basic' ? 'BASIC' : priceId === 'price_pro' ? 'PRO' : 'ENTERPRISE',
        successUrl: `${window.location.origin}/subscription/success`,
        cancelUrl: `${window.location.origin}/subscription/cancel`
      });
      
      // Log the response in case of issues
      console.log('Checkout session response:', response);
      
      // Check if we have a sessionUrl
      if (response && response.sessionUrl) {
        // For local development/testing - redirect to a different page instead of Stripe
        if (response.sessionUrl.startsWith('https://example.com')) {
          console.log('Using mock checkout URL - redirecting to success page');
          router.push('/subscriptions/success?mock=true');
        } else {
          // Redirect to the actual Stripe Checkout page
          router.push(response.sessionUrl);
        }
      } else {
        console.error('No session URL returned');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={isLoading}
      className="bg-[#55624c] hover:bg-[#45524c] text-white font-bold py-2 px-4 rounded"
    >
      {isLoading ? 'Loading...' : 'Subscribe'}
    </button>
  );
};

export default Checkout; 