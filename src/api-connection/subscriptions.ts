/**
 * Mock subscription service implementation
 * 
 * This is a temporary mock implementation of the subscription service
 * that returns static data instead of making API calls. This is used
 * until the backend API is fully implemented.
 */

import api from "./service";

type Invite = {
  email: string;
  organizationId: string;
  role: string;
  token: string;
  expiresAt: Date;
};

type Token = {
  token: string;
};

type Body = {
  body: Body;
};

// Static implementation with predetermined return values
const subscriptionService = {
  /**
  Criar metodos seguindo os requisitos do frontend para consumir
  as rotas do backend para subscriptions
  e payments
  **/

  //POST /subscriptions/invites
  createInvite: async (invite: Invite) => {
    const res = await api.post('/subscriptions/invites', invite);
    return res.data;
  },
  //GET /auth/invite/:token
  getInvite: async (token: Token) => {
    const res = await api.get(`/auth/invite/${token}`);
    return res.data;
  },
  //POST /auth/invite/:token/consume
  consumeInvite: async (token: string) => {
    const res = await api.post(`/auth/invite/${token}/consume`);
    return res.data;
  },
  //GET /subscriptions/status (por account)
  getSubscriptionStatus: async (account: string) => {
    const res = await api.get(`/subscriptions/status/${account}`);
    return res.data;
  },
  //POST /subscriptions/pause, POST /subscriptions/resume, POST /subscriptions/cancel
  pauseSubscription: async (account: string) => {
    const res = await api.post(`/subscriptions/pause/${account}`);
    return res.data;
  },
  resumeSubscription: async (account: string) => {
    const res = await api.post(`/subscriptions/resume/${account}`);
    return res.data;
  },
  cancelSubscription: async (account: string) => {
    const res = await api.post(`/subscriptions/cancel/${account}`);
    return res.data;
  },
  //POST /payments/webhook
  webhook: async (body: Body) => {
    const res = await api.post(`/payments/webhook`, body);
    return res.data;
  },
};

export default subscriptionService;