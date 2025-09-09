/**
 * Mock subscription service implementation
 * 
 * This is a temporary mock implementation of the subscription service
 * that returns static data instead of making API calls. This is used
 * until the backend API is fully implemented.
 */

import api from "./service";

export interface Invite {
  email: string;
  organizationId: string;
  role: string;
  token: string;
  expiresAt: Date;
}

export type Token = string;

export interface WebhookBody {
  type: string;
  data: Record<string, unknown>;
}

export interface SubscriptionResponse {
  id: string;
  status: string;
  planType?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export interface CheckoutResponse {
  sessionUrl?: string;
  sessionId?: string;
}

// Static implementation with predetermined return values
const subscriptionService = {
  /**
  Criar metodos seguindo os requisitos do frontend para consumir
  as rotas do backend para subscriptions
  e payments
  **/

  //POST /subscriptions/invites
  createInvite: async (invite: Pick<Invite, 'email'>): Promise<Invite> => {
    const res = await api.post('/api/subscriptions/invites', invite);
    return res.data;
  },
  //GET /auth/invite/:token
  getInvite: async (token: Token): Promise<Invite> => {
    const res = await api.get(`/api/auth/invite/${token}`);
    return res.data;
  },
  //POST /auth/invite/:token/consume
  consumeInvite: async (token: string, body: { password: string; firstName?: string; lastName?: string }): Promise<{ success: boolean; message?: string }> => {
    const res = await api.post(`/api/auth/invite/${token}/consume`, body);
    return res.data;
  },
  //GET /subscriptions/status (por account)
  getSubscriptionStatus: async (): Promise<SubscriptionResponse> => {
    const res = await api.get(`/api/subscriptions/status`);
    return res.data;
  },
  //GET /subscriptions/access (grace-aware)
  hasAccess: async (): Promise<{ hasAccess: boolean; isWithinGrace: boolean; subscription: SubscriptionResponse }> => {
    const res = await api.get(`/api/subscriptions/access`);
    return res.data;
  },
  //POST /subscriptions/pause, POST /subscriptions/resume, POST /subscriptions/cancel
  pauseSubscription: async (): Promise<SubscriptionResponse> => {
    const res = await api.post(`/api/subscriptions/pause`);
    return res.data;
  },
  resumeSubscription: async (): Promise<SubscriptionResponse> => {
    const res = await api.post(`/api/subscriptions/resume`);
    return res.data;
  },
  cancelSubscription: async (): Promise<SubscriptionResponse> => {
    const res = await api.post(`/api/subscriptions/cancel`);
    return res.data;
  },
  //POST /payments/webhook
  webhook: async (body: WebhookBody): Promise<{ success: boolean }> => {
    const res = await api.post(`/api/payments/webhook`, body);
    return res.data;
  },
  //POST /subscriptions/checkout
  createCheckoutSession: async (payload: { planType: 'BASIC' | 'PRO' | 'ENTERPRISE'; successUrl: string; cancelUrl: string }): Promise<CheckoutResponse> => {
    const res = await api.post(`/api/subscriptions/checkout`, payload);
    return res.data;
  },
  //GET /subscriptions/current
  getCurrentSubscription: async () => {
    const res = await api.get(`/api/subscriptions/current`);
    return res.data;
  },
};

export default subscriptionService;