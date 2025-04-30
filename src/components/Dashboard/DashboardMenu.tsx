'use client';

import { useState, useRef, useEffect } from 'react';
import { useClerk, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';

type DashboardMenuProps = {
  className?: string;
};

export default function DashboardMenu({ className = '' }: DashboardMenuProps) {
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false); // For dark mode toggle demo
  const menuRef = useRef<HTMLDivElement>(null);
  const { tenantId } = router.query;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check for dark mode from localStorage on initial load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = localStorage.getItem('darkMode') === 'true';
      setDarkMode(isDark);
    }
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut(() => {
      router.push('/sign-in');
    });
  };

  // Toggle dark mode and save preference to localStorage
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', String(newMode));
      
      // This would typically update body classes or theme context
      // For demo purposes, we're just storing the preference
    }
  };

  // Build the proper profile URL with tenant context if available
  const getProfileUrl = () => {
    if (tenantId && typeof tenantId === 'string') {
      return `/${tenantId}/profile`;
    }
    return '/profile';
  };

  // Build the proper upload video URL with tenant context if available
  const getUploadVideoUrl = () => {
    if (tenantId && typeof tenantId === 'string') {
      return `/${tenantId}/upload-video`;
    }
    return '/upload-video';
  };

  // Build the proper my videos URL with tenant context if available
  const getMyVideosUrl = () => {
    if (tenantId && typeof tenantId === 'string') {
      return `/${tenantId}/videos`;
    }
    return '/my-videos';
  };

  if (!isLoaded) {
    return (
      <div className={`relative ${className}`}>
        <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      {/* User avatar/button that toggles the menu */}
      <button
        onClick={toggleMenu}
        className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors"
        aria-expanded={isMenuOpen}
        aria-haspopup="true"
      >
        <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white shadow-sm relative">
          {user?.imageUrl ? (
            <Image
              src={user.imageUrl}
              alt={user.fullName || 'User'}
              width={40}
              height={40}
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-indigo-100 text-indigo-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 border-2 border-white"></div>
        </div>
        <span className="hidden md:block text-sm font-medium">
          {user?.fullName || user?.username || 'User'}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg py-1 z-50 border border-gray-200">
          {/* User header section */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full overflow-hidden mr-3">
                {user?.imageUrl ? (
                  <Image
                    src={user.imageUrl}
                    alt={user.fullName || 'User'}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-indigo-100 text-indigo-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {user?.fullName || user?.username || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate mt-1">
                  {user?.primaryEmailAddress?.emailAddress || ''}
                </p>
              </div>
            </div>
          </div>
          
          {/* Menu items */}
          <div className="py-1">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Account
            </div>
            
            <Link 
              href={getProfileUrl()}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
              onClick={() => setIsMenuOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Your Profile
            </Link>
            
            <Link 
              href="/settings"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
              onClick={() => setIsMenuOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Link>
            
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
          
          <div className="py-1 border-t border-gray-100">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Content
            </div>
            
            <Link 
              href={getUploadVideoUrl()}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
              onClick={() => setIsMenuOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Video
            </Link>
            
            <Link 
              href={getMyVideosUrl()}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
              onClick={() => setIsMenuOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              My Videos
            </Link>
            
            <Link 
              href="/analytics"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
              onClick={() => setIsMenuOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analytics
            </Link>
          </div>
          
          {/* Sign out button */}
          <div className="py-1 border-t border-gray-100">
            <button
              onClick={handleSignOut}
              className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 