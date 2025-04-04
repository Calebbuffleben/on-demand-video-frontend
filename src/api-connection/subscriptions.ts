import api from './service';

export const subscriptionService = {
  // Get current user's subscription
  getCurrentSubscription: async () => {
    try {
      const response = await api.get('/api/subscriptions/current');
      return response.data;
    } catch (error) {
      console.error('Failed to get current subscription:', error);
      throw error;
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

export default subscriptionService;