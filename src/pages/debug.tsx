import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import OrganizationDebugger from '../components/OrganizationDebugger';
import useClerkToken from '../hooks/useClerkToken';

export default function DebugPage() {
  // This ensures the Clerk token is stored and refreshed
  useClerkToken();
  
  const router = useRouter();
  
  // Create or select organization if needed
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check local storage for token
    const hasToken = !!localStorage.getItem('token');
    console.log('Token in local storage:', hasToken);
  }, []);
  
  return (
    <>
      <SignedIn>
        <div className="p-8 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Authentication Debug Page</h1>
          
          <div className="mb-6">
            <button 
              onClick={() => router.push('/organization-selector')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-4"
            >
              Change Organization
            </button>
            
            <button 
              onClick={() => router.push('/')}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            >
              Back to Home
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <OrganizationDebugger />
            
            {/* API Test Panel */}
            <div className="p-4 border rounded-lg bg-white shadow">
              <h2 className="text-xl font-bold mb-4">API Test Panel</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Test Authorization</h3>
                  <button 
                    onClick={async () => {
                      try {
                        const res = await fetch('http://localhost:4000/api/auth/me', {
                          headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            'Content-Type': 'application/json'
                          }
                        });
                        const data = await res.json();
                        console.log('Auth test result:', data);
                        alert(JSON.stringify(data, null, 2));
                      } catch (err) {
                        console.error('Auth test error:', err);
                        alert('Error: ' + (err instanceof Error ? err.message : String(err)));
                      }
                    }}
                    className="bg-green-500 text-white px-3 py-1 text-sm rounded hover:bg-green-600"
                  >
                    Test Auth
                  </button>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Test Subscription</h3>
                  <button 
                    onClick={async () => {
                      try {
                        // Get current org ID from local storage
                        const orgId = localStorage.getItem('currentOrganizationId');
                        if (!orgId) {
                          alert('No organization selected');
                          return;
                        }
                        
                        const res = await fetch(`http://localhost:4000/api/subscriptions/${orgId}`, {
                          headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            'Content-Type': 'application/json',
                            'X-Organization-Id': orgId
                          }
                        });
                        const data = await res.json();
                        console.log('Subscription test result:', data);
                        alert(JSON.stringify(data, null, 2));
                      } catch (err) {
                        console.error('Subscription test error:', err);
                        alert('Error: ' + (err instanceof Error ? err.message : String(err)));
                      }
                    }}
                    className="bg-green-500 text-white px-3 py-1 text-sm rounded hover:bg-green-600"
                  >
                    Test Subscription
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
} 