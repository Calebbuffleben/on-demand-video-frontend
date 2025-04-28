import Link from 'next/link';

interface EmptyVideoStateProps {
  message?: string;
  ctaLink?: string;
  ctaText?: string;
}

export default function EmptyVideoState({
  message = "You haven't uploaded any videos yet",
  ctaLink = "/upload-video",
  ctaText = "Upload Your First Video"
}: EmptyVideoStateProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-10 text-center">
      <div className="bg-blue-50 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{message}</h3>
      <p className="text-gray-500 mb-6">
        Upload videos to share with your team or embed in your content.
      </p>
      <Link 
        href={ctaLink}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        {ctaText}
      </Link>
    </div>
  );
} 