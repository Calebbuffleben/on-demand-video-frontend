'use client';

import { useState } from 'react';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/router';

type UserSettingsCardProps = {
  className?: string;
};

export default function UserSettingsCard({ className = '' }: UserSettingsCardProps) {
  const { signOut } = useClerk();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  
  const handleSignOut = async () => {
    if (!confirmingSignOut) {
      setConfirmingSignOut(true);
      return;
    }
    
    // Reset state
    setConfirmingSignOut(false);
    
    // Sign out and redirect to sign-in page
    await signOut(() => {
      router.push('/sign-in');
    });
  };

  // Cancel sign out confirmation
  const cancelSignOut = () => {
    setConfirmingSignOut(false);
  };
  
  // Toggle dark mode (placeholder for actual implementation)
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // In a real implementation, you would apply the dark mode to the application
    // For example: document.documentElement.classList.toggle('dark');
  };
  
  // Toggle email notifications preference
  const toggleEmailNotifications = () => {
    setEmailNotifications(!emailNotifications);
    // In a real implementation, you would save this preference to a user settings API
  };
  
  // Open Clerk user profile management
  const openUserProfile = () => {
    // You might implement this differently depending on how you want to handle profile management
    // This is a common approach with Clerk
    if (typeof window !== 'undefined') {
      // Access Clerk through the global namespace safely
      const clerkWindow = window as unknown as { Clerk?: { openUserProfile: () => void } };
      clerkWindow.Clerk?.openUserProfile();
    }
  };
  
  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">Account Settings</h2>
        
        <div className="space-y-6">
          {/* Security Section */}
          <div>
            <h3 className="font-medium text-gray-600 mb-3 text-sm">Security</h3>
            <div className="space-y-4">
              <div>
                <button 
                  onClick={openUserProfile}
                  className="w-full flex justify-between items-center px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-md transition"
                >
                  <span className="text-sm">Change Password</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              <div>
                <button 
                  onClick={openUserProfile}
                  className="w-full flex justify-between items-center px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-md transition"
                >
                  <span className="text-sm">Two-Factor Authentication</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {/* Preferences Section */}
          <div>
            <h3 className="font-medium text-gray-600 mb-3 text-sm">Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-md">
                <span className="text-sm">Dark Mode</span>
                <button 
                  onClick={toggleDarkMode}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${isDarkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <span 
                    className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} 
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-md">
                <span className="text-sm">Email Notifications</span>
                <button 
                  onClick={toggleEmailNotifications}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${emailNotifications ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <span 
                    className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full ${emailNotifications ? 'translate-x-6' : 'translate-x-1'}`} 
                  />
                </button>
              </div>
            </div>
          </div>
          
          {/* Account Actions Section */}
          <div>
            <h3 className="font-medium text-gray-600 mb-3 text-sm">Account Actions</h3>
            <div className="space-y-4">
              <div>
                <button 
                  onClick={handleSignOut}
                  className={`w-full flex justify-between items-center px-4 py-2 rounded-md transition ${
                    confirmingSignOut 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-sm">
                    {confirmingSignOut ? 'Click again to confirm sign out' : 'Sign Out'}
                  </span>
                  {confirmingSignOut ? (
                    <button 
                      onClick={(e) => { e.stopPropagation(); cancelSignOut(); }}
                      className="text-xs text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 