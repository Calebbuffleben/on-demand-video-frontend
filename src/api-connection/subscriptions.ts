import api from './service';

export const subscriptionService = {
  // Get current user's subscription
  getCurrentSubscription: async () => {
    const response = await api.get('/subscriptions/current');
    return response.data;
  },

  // Create a checkout session
  createCheckoutSession: async (priceId: string) => {
    const response = await api.post('/subscriptions/create-checkout', { priceId });
    return response.data;
  },

  // Cancel subscription
  cancelSubscription: async (subscriptionId: string) => {
    const response = await api.put(`/subscriptions/${subscriptionId}/cancel`);
    return response.data;
  },

  // Get available subscription plans
  getSubscriptionPlans: async () => {
    const response = await api.get('/subscriptions/plans');
    return response.data;
  }
};

export default subscriptionService;