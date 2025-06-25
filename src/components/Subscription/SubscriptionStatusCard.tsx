'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@clerk/nextjs';
import Link from 'next/link';

type SubscriptionStatusCardProps = {
  className?: string;
};

interface SubscriptionInfo {
  id: string;
  status: string;
  planName: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  price?: string;
  interval?: string;
}

interface SubscriptionService {
  getCurrentSubscription: () => Promise<{
    status: string;
    subscription: {
      id: string;
      status: string;
      plan?: {
        name: string;
        amount: number;
        interval: string;
      };
      currentPeriodEnd: number;
      cancelAtPeriodEnd: boolean;
    } | null;
    message: string;
  }>;
}

export default function SubscriptionStatusCard({ className = '' }: SubscriptionStatusCardProps) {
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionService, setSubscriptionService] = useState<SubscriptionService | null>(null);
  
  // Load subscription service
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('@/api-connection/subscriptions').then((module) => {
        setSubscriptionService(module.default);
      });
    }
  }, []);
  
  // Fetch subscription data
  useEffect(() => {
    if (!orgLoaded || !organization || !subscriptionService) {
      return;
    }
    
    async function fetchSubscription() {
      setLoading(true);
      setError(null);
      
      try {
        // Make sure organization ID is set
        if (organization?.id) {
          localStorage.setItem('currentOrganizationId', organization.id);
        }
        
        if (!subscriptionService) {
          throw new Error('Subscription service not loaded');
        }
        
        const result = await subscriptionService.getCurrentSubscription();
        
        if (result && result.subscription) {
          const sub = result.subscription;
          setSubscription({
            id: sub.id,
            status: sub.status,
            planName: sub.plan?.name || 'Unknown Plan',
            currentPeriodEnd: new Date(sub.currentPeriodEnd * 1000).toLocaleDateString(),
            cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
            price: sub.plan?.amount 
              ? `$${(sub.plan.amount / 100).toFixed(2)}` 
              : undefined,
            interval: sub.plan?.interval
          });
        } else {
          // No active subscription
          setSubscription(null);
        }
      } catch (err) {
        console.error('Error fetching subscription:', err);
        setError('Unable to load subscription information');
      } finally {
        setLoading(false);
      }
    }
    
    fetchSubscription();
  }, [orgLoaded, organization, subscriptionService]);
  
  if (!orgLoaded || loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 animate-pulse ${className}`}>
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h2 className="text-lg font-semibold mb-2">Subscription Status</h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }
  
  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">Subscription Status</h2>
        
        {!subscription ? (
          <div className="text-center py-4">
            <p className="text-gray-500 mb-4">No active subscription found</p>
            <Link 
              href="/pricing" 
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              View Pricing Options
            </Link>
          </div>
        ) : (
          <div>
            <div className="flex items-center mb-4">
              <span className={`w-3 h-3 rounded-full mr-2 ${
                subscription.status === 'active' ? 'bg-green-500' : 
                subscription.status === 'past_due' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></span>
              <span className="font-medium capitalize">{subscription.status}</span>
              
              {subscription.cancelAtPeriodEnd && (
                <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                  Cancels at period end
                </span>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Plan</span>
                <span className="font-medium">{subscription.planName}</span>
              </div>
              
              {subscription.price && subscription.interval && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Price</span>
                  <span className="font-medium">
                    {subscription.price}/{subscription.interval}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Current Period Ends</span>
                <span className="font-medium">{subscription.currentPeriodEnd}</span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100 text-right">
              <Link 
                href={`/subscriptions/manage`} 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Manage Subscription
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 