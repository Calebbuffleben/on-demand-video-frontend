import '@testing-library/jest-dom';

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  auth: () => new Promise((resolve) => resolve({ userId: 'user_123' })),
  ClerkProvider: ({ children }) => <>{children}</>,
  useAuth: () => ({
    isLoaded: true,
    userId: 'user_123',
    sessionId: 'session_123',
    getToken: jest.fn(),
  }),
  useUser: () => ({
    isLoaded: true,
    isSignedIn: true,
    user: {
      id: 'user_123',
      fullName: 'Test User',
      primaryEmailAddress: 'test@example.com',
    },
  }),
  useOrganization: () => ({
    isLoaded: true,
    organization: {
      id: 'org_123',
      name: 'Test Organization',
      slug: 'test-org',
    },
    membership: {
      role: 'admin',
    },
  }),
  SignIn: () => <div data-testid="mock-sign-in">Mock Sign In Component</div>,
  SignUp: () => <div data-testid="mock-sign-up">Mock Sign Up Component</div>,
  CreateOrganization: () => <div data-testid="mock-create-org">Mock Create Organization Component</div>,
  OrganizationList: () => <div data-testid="mock-org-list">Mock Organization List Component</div>,
  OrganizationProfile: () => <div data-testid="mock-org-profile">Mock Organization Profile Component</div>,
})); 