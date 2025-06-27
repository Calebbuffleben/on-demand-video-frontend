/**
 * Utility functions for handling Clerk tokens
 */

// Type for Clerk window object
interface ClerkWindow extends Window {
  __clerk?: {
    session?: {
      getToken(): Promise<string | null>;
    };
  };
}

export const getFreshToken = async (): Promise<string | null> => {
  try {
    // Try to get token from Clerk session if available
    if (typeof window !== 'undefined') {
      const clerkWindow = window as ClerkWindow;
      if (clerkWindow.__clerk?.session) {
        const session = clerkWindow.__clerk.session;
        const token = await session.getToken();
        if (token) {
          localStorage.setItem('token', token);
          return token;
        }
      }
    }
    
    // Fallback to stored token
    return localStorage.getItem('token');
  } catch (error) {
    console.warn('Failed to get fresh token:', error);
    return localStorage.getItem('token');
  }
};

export const isTokenExpired = (token: string): boolean => {
  try {
    // Decode JWT to check expiration
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    console.warn('Could not decode token to check expiration:', error);
    return false; // Assume not expired if we can't decode
  }
}; 