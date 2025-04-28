/**
 * Mock subscription service implementation
 * 
 * This is a temporary mock implementation of the subscription service
 * that returns static data instead of making API calls. This is used
 * until the backend API is fully implemented.
 */

// Static implementation with predetermined return values
const subscriptionService = {
  // Get current user's subscription - always returns a default response
  getCurrentSubscription() {
    return Promise.resolve({
      status: 'no_subscription',
      subscription: null,
      message: 'Subscription API not available yet'
    });
  },

  // Create a checkout session - simulates a successful checkout creation
  createCheckoutSession() {
    return Promise.resolve({
      sessionId: 'mock-session-id',
      sessionUrl: 'https://example.com/checkout/mock-session'
    });
  },

  // Get organizations for the current user - returns an empty array
  getOrganizations() {
    return Promise.resolve({
      organizations: []
    });
  },

  // Cancel subscription - simulates a successful cancellation
  cancelSubscription() {
    return Promise.resolve({
      success: true,
      message: 'Subscription cancelled successfully (mock)'
    });
  }
};

export default subscriptionService;