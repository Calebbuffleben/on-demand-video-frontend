import React, { useState, useRef } from 'react';
import axios from 'axios';
import testUploadService from '../api-connection/testUpload';

export default function TestUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState('659b9a2c-4f58-4590-bc18-d2d1385b0fb0');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleOrganizationIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrganizationId(e.target.value);
  };

  const handleDirectUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    if (!organizationId) {
      setError('Organization ID is required');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);
      setResult(null);

      // Use the test upload service with direct file and query params
      const response = await testUploadService.uploadFileToTestEndpoint(
        file,
        organizationId,
        (progress) => setUploadProgress(progress)
      );

      console.log('Upload response:', response);
      setResult(response);
    } catch (err) {
      console.error('Error uploading file:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleFormDataUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    if (!organizationId) {
      setError('Organization ID is required');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);
      setResult(null);

      // Use the alternative FormData upload method
      const response = await testUploadService.uploadFileWithFormData(
        file,
        organizationId,
        (progress) => setUploadProgress(progress)
      );

      console.log('Upload response:', response);
      setResult(response);
    } catch (err) {
      console.error('Error uploading file:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleManualUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    if (!organizationId) {
      setError('Organization ID is required');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);
      setResult(null);

      // Create form data manually
      const formData = new FormData();
      formData.append('file', file);
      formData.append('organizationId', organizationId);
      formData.append('name', file.name);
      formData.append('description', 'Test upload');

      // Log what we're sending
      console.log('Form data keys:', [...formData.keys()]);

      // Direct axios call with form data
      const response = await axios.post(
        'http://localhost:4000/api/videos/test-upload',
        formData,
        {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(progress);
            }
          }
        }
      );

      console.log('Manual upload response:', response.data);
      setResult(response.data);
    } catch (err) {
      console.error('Error in manual upload:', err);
      if (axios.isAxiosError(err) && err.response) {
        setError(`Upload failed: ${err.response.status} - ${err.response.data?.message || err.message}`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Test File Upload</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Select a file to upload:</label>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-md file:border-0
                     file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-blue-700
                     hover:file:bg-blue-100"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Organization ID:</label>
          <input
            type="text"
            value={organizationId}
            onChange={handleOrganizationIdChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Enter organization ID"
          />
          <p className="mt-1 text-xs text-gray-500">Required by the backend for test uploads</p>
        </div>
        
        {file && (
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <p className="text-sm"><strong>Selected File:</strong> {file.name}</p>
            <p className="text-sm"><strong>Type:</strong> {file.type}</p>
            <p className="text-sm"><strong>Size:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <button
            onClick={handleDirectUpload}
            disabled={uploading || !file || !organizationId}
            className={`py-2 px-3 rounded-md text-white font-medium text-sm ${
              uploading || !file || !organizationId ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Method 1: Query Params
          </button>
          
          <button
            onClick={handleFormDataUpload}
            disabled={uploading || !file || !organizationId}
            className={`py-2 px-3 rounded-md text-white font-medium text-sm ${
              uploading || !file || !organizationId ? 'bg-green-300' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            Method 2: FormData
          </button>
          
          <button
            onClick={handleManualUpload}
            disabled={uploading || !file || !organizationId}
            className={`py-2 px-3 rounded-md text-white font-medium text-sm ${
              uploading || !file || !organizationId ? 'bg-purple-300' : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            Method 3: Manual FormData
          </button>
        </div>
        
        {uploading && (
          <div className="mt-4">
            <div className="h-2 bg-gray-200 rounded overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-center mt-1 text-sm text-gray-600">{uploadProgress}%</p>
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {result && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Upload Result:</h3>
            <pre className="bg-gray-50 p-3 rounded overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      <div className="mt-8 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h2 className="text-lg font-semibold mb-2">Debug Information</h2>
        <p className="text-sm mb-2">
          This test page provides three different methods to upload to the <code>http://localhost:4000/api/videos/test-upload</code> endpoint:
        </p>
        
        <ol className="list-decimal list-inside text-sm mb-4 space-y-1">
          <li><strong>Method 1:</strong> Sends the raw file with organizationId as query parameter and in X-Organization-ID header</li>
          <li><strong>Method 2:</strong> Uses FormData with the organizationId field included in the form</li>
          <li><strong>Method 3:</strong> Manually creates FormData and uses direct axios call</li>
        </ol>
        
        <div className="mt-4">
          <h3 className="font-medium mb-2">Testing with cURL</h3>
          <div className="bg-gray-100 p-3 rounded overflow-auto text-sm font-mono">
            <p># Method 1: Query params</p>
            <p>curl -v -X POST "http://localhost:4000/api/videos/test-upload?organizationId=659b9a2c-4f58-4590-bc18-d2d1385b0fb0&name=test.mp4" \</p>
            <p>&nbsp;&nbsp;-H "Content-Type: video/mp4" \</p>
            <p>&nbsp;&nbsp;-H "X-Organization-ID: 659b9a2c-4f58-4590-bc18-d2d1385b0fb0" \</p>
            <p>&nbsp;&nbsp;--data-binary @/path/to/your/test-video.mp4</p>
            <p></p>
            <p># Method 2: FormData</p>
            <p>curl -v -X POST http://localhost:4000/api/videos/test-upload \</p>
            <p>&nbsp;&nbsp;-F "file=@/path/to/your/test-video.mp4" \</p>
            <p>&nbsp;&nbsp;-F "organizationId=659b9a2c-4f58-4590-bc18-d2d1385b0fb0" \</p>
            <p>&nbsp;&nbsp;-F "name=Test Video" \</p>
            <p>&nbsp;&nbsp;-F "description=Test upload"</p>
          </div>
        </div>
      </div>
    </div>
  );
} 