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
      // Use the subscription service
      const { sessionUrl } = await subscriptionService.createCheckoutSession(priceId);
      
      // Redirect to the Stripe Checkout page using the URL provided by Stripe
      if (sessionUrl) {
        router.push(sessionUrl);
      } else {
        console.error('No session URL returned from the API');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error creating Stripe Checkout session:', error);
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