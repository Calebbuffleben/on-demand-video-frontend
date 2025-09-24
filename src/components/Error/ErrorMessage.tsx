import React from 'react';
import Link from 'next/link';
import { translateError, LimitErrorDetails } from '@/lib/error-messages';

interface ErrorMessageProps {
  error: any;
  className?: string;
  showUpgradeButton?: boolean;
}

export default function ErrorMessage({ 
  error, 
  className = '', 
  showUpgradeButton = true 
}: ErrorMessageProps) {
  const errorDetails: LimitErrorDetails = translateError(error);
  
  return (
    <div className={`p-4 rounded-md ${errorDetails.isLimitError ? 'bg-orange-50 border border-orange-200' : 'bg-red-50 border border-red-200'} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {errorDetails.isLimitError ? (
            <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${errorDetails.isLimitError ? 'text-orange-800' : 'text-red-800'}`}>
            {errorDetails.isLimitError ? 'Limite do Plano Atingido' : 'Erro'}
          </h3>
          <div className={`mt-2 text-sm ${errorDetails.isLimitError ? 'text-orange-700' : 'text-red-700'}`}>
            <p>{errorDetails.message}</p>
          </div>
          {errorDetails.isLimitError && showUpgradeButton && errorDetails.upgradeUrl && (
            <div className="mt-4">
              <div className="-mx-2 -my-1.5 flex">
                <Link
                  href={errorDetails.upgradeUrl}
                  className={`px-2 py-1.5 rounded-md text-sm font-medium ${errorDetails.isLimitError ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' : 'bg-red-100 text-red-800 hover:bg-red-200'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-orange-50 focus:ring-orange-600`}
                >
                  Fazer Upgrade do Plano
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Simple error message component for inline errors
 */
export function InlineErrorMessage({ error, className = '' }: { error: any; className?: string }) {
  const errorDetails: LimitErrorDetails = translateError(error);
  
  return (
    <div className={`text-sm ${errorDetails.isLimitError ? 'text-orange-600' : 'text-red-600'} ${className}`}>
      {errorDetails.message}
      {errorDetails.isLimitError && errorDetails.upgradeUrl && (
        <span className="ml-1">
          <Link href={errorDetails.upgradeUrl} className="underline hover:no-underline">
            Fazer upgrade
          </Link>
        </span>
      )}
    </div>
  );
}
