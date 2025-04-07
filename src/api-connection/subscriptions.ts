import api from './service';

export const subscriptionService = {
  // Get current user's subscription
  getCurrentSubscription: async () => {
    console.log('Fetching current subscription...');
    
    // First check if we have the required data
    if (typeof window === 'undefined') {
      throw new Error('Cannot call subscription service on server-side rendering');
    }
    
    const token = localStorage.getItem('token');
    const orgId = localStorage.getItem('currentOrganizationId'); // Clerk organization ID
    const dbOrgId = localStorage.getItem('dbOrganizationId'); // Database organization ID
    
    if (!token) {
      console.error('No token available for subscription request');
      throw new Error('Authentication token is missing');
    }
    
    if (!orgId) {
      console.error('No organization ID available for subscription request');
      throw new Error('Organization ID is missing');
    }
    
    console.log('Making API call with organization:', orgId);
    
    // Call different endpoint that doesn't rely on header
    try {
      // Try the direct endpoint with organization ID parameter - prioritize database ID
      if (dbOrgId) {
        console.log('Using database organization ID for API call:', dbOrgId);
        const response = await api.get(`/api/subscriptions/${dbOrgId}`);
        console.log('Subscription API response:', response.status);
        return response.data;
      } else {
        // Fall back to Clerk ID if database ID is not available
        console.log('Using Clerk organization ID for API call:', orgId);
        const response = await api.get(`/api/subscriptions/${orgId}`);
        console.log('Subscription API response:', response.status);
        return response.data;
      }
    } catch (error: any) {
      console.error('Failed to get subscription by ID, falling back to current endpoint:', error);
      
      // Fall back to the current endpoint
      try {
        const response = await api.get('/api/subscriptions/current');
        console.log('Fallback subscription API response:', response.status);
        return response.data;
      } catch (error: any) {
        handleSubscriptionError(error);
        throw error;
      }
    }
  },

  // Create a checkout session
  createCheckoutSession: async (priceId: string) => {
    try {
      const response = await api.post('/api/subscriptions/create-checkout', { priceId });
      return response.data;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      throw error;
    }
  },

  // Cancel subscription
  cancelSubscription: async (subscriptionId: string) => {
    try {
      const response = await api.put(`/api/subscriptions/${subscriptionId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw error;
    }
  },

  // Get available subscription plans
  getSubscriptionPlans: async () => {
    try {
      const response = await api.get('/api/subscriptions/plans');
      return response.data;
    } catch (error) {
      console.error('Failed to get subscription plans:', error);
      throw error;
    }
  }
};

// Helper function to handle subscription errors
function handleSubscriptionError(error: any) {
  console.error('Subscription error:', error?.response?.data || error.message);
  
  // Provide more specific error messages
  if (error.response?.status === 401) {
    throw new Error('Your session has expired. Please sign in again.');
  } else if (error.response?.status === 403) {
    throw new Error('You do not have permission to access this subscription.');
  } else if (error.response?.status === 404) {
    throw new Error('Subscription not found. You may need to subscribe first.');
  } else if (error.response?.data?.message) {
    throw new Error(error.response.data.message);
  }
}

export default subscriptionService;