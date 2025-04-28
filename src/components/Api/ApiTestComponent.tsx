'use client';

import { useState } from 'react';
import useApi from '@/hooks/useApi';

interface TestResponse {
  message: string;
}

export default function ApiTestComponent() {
  const { get, loading, error } = useApi();
  const [response, setResponse] = useState<string | null>(null);

  const testApiConnection = async () => {
    try {
      const data = await get<TestResponse>('/');
      if (data) {
        setResponse(data.message);
      } else {
        setResponse('No data received');
      }
    } catch (err) {
      setResponse(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">API Connection Test</h2>
      
      <button 
        onClick={testApiConnection}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Test Backend Connection'}
      </button>
      
      {response && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p><strong>Response:</strong> {response}</p>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          <p><strong>Error:</strong> {error.message}</p>
        </div>
      )}
    </div>
  );
} 