'use client';

import { useState } from 'react';
import useApi from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';

interface TestResponse {
  message: string;
}

export default function ApiTestComponent() {
  const { get, loading, error } = useApi();
  const { refreshToken, isAuthenticated } = useAuth();
  const [response, setResponse] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testApiConnection = async () => {
    try {
      addTestResult('Testing basic API connection...');
      const data = await get<TestResponse>('/');
      if (data) {
        setResponse(data.message);
        addTestResult('✅ Basic API connection successful');
      } else {
        setResponse('No data received');
        addTestResult('❌ No data received from API');
      }
    } catch (err) {
      setResponse(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      addTestResult(`❌ API connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const testAuthEndpoint = async () => {
    try {
      addTestResult('Testing authenticated endpoint...');
      const data = await get<{ user: any; organization: any; message: string }>('/api/auth/me');
      if (data) {
        addTestResult('✅ Authenticated endpoint successful');
        addTestResult(`User: ${data.user?.email || 'Unknown'}`);
        addTestResult(`Organization: ${data.organization?.name || 'None'}`);
      } else {
        addTestResult('❌ No data from authenticated endpoint');
      }
    } catch (err) {
      addTestResult(`❌ Authenticated endpoint failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const testTokenRefresh = async () => {
    try {
      addTestResult('Testing token refresh...');
      await refreshToken();
      addTestResult('✅ Token refresh triggered');
    } catch (err) {
      addTestResult(`❌ Token refresh failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    setResponse(null);
  };

  return (
    <div className="p-4 border rounded-lg shadow-md max-w-2xl">
      <h2 className="text-xl font-bold mb-4">API & Authentication Test</h2>
      
      <div className="mb-4 p-3 bg-gray-50 rounded">
        <p><strong>Authentication Status:</strong> {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}</p>
      </div>
      
      <div className="flex gap-2 mb-4">
        <button 
          onClick={testApiConnection}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Test API Connection'}
        </button>
        
        <button 
          onClick={testAuthEndpoint}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          disabled={loading}
        >
          Test Auth Endpoint
        </button>
        
        <button 
          onClick={testTokenRefresh}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
          disabled={loading}
        >
          Test Token Refresh
        </button>
        
        <button 
          onClick={clearResults}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
        >
          Clear Results
        </button>
      </div>
      
      {response && (
        <div className="mb-4 p-3 bg-gray-100 rounded">
          <p><strong>API Response:</strong> {response}</p>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          <p><strong>Error:</strong> {error.message}</p>
        </div>
      )}
      
      {testResults.length > 0 && (
        <div className="p-3 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">Test Results:</h3>
          <div className="max-h-60 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="text-sm mb-1 font-mono">
                {result}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 