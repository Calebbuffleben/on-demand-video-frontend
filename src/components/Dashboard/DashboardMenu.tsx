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
        <div className="h-10 w-10 bg-silver-200 rounded-full animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      {/* User avatar/button that toggles the menu */}
      <button
        onClick={toggleMenu}
        className="flex items-center space-x-2 p-1 rounded-full hover:bg-silver-100 focus:outline-none focus:ring-2 focus:ring-scale-500 focus:ring-opacity-50 transition-colors"
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
            <div className="h-full w-full flex items-center justify-center bg-silver-100 text-silver-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 border-2 border-white"></div>
        </div>
      </button>

      {/* Dropdown menu */}
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          {/* User info section */}
          <div className="px-4 py-3 border-b border-silver-100">
            <div>
              <p className="text-sm font-semibold text-scale-900">
                {user?.fullName || user?.username || 'User'}
              </p>
              <p className="text-xs text-silver-500 truncate mt-1">
                {user?.primaryEmailAddress?.emailAddress || ''}
              </p>
            </div>
          </div>
          
          {/* Menu items */}
          <div className="py-1">
            <div className="px-3 py-2 text-xs font-semibold text-silver-500 uppercase tracking-wider">
              Conta
            </div>
            
            <Link 
              href={getProfileUrl()}
              className="flex items-center px-4 py-2 text-sm text-silver-700 hover:bg-silver-50 w-full text-left"
              onClick={() => setIsMenuOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-silver-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Seu Perfil
            </Link>
            
            <Link 
              href="/organization-selector"
              className="flex items-center px-4 py-2 text-sm text-silver-700 hover:bg-silver-50 w-full text-left"
              onClick={() => setIsMenuOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-silver-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Trocar Organização
            </Link>
            
            <Link 
              href="/subscriptions"
              className="flex items-center px-4 py-2 text-sm text-silver-700 hover:bg-silver-50 w-full text-left"
              onClick={() => setIsMenuOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-silver-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Assinatura
            </Link>
          </div>
          
          <div className="py-1 border-t border-silver-100">
            <div className="px-3 py-2 text-xs font-semibold text-silver-500 uppercase tracking-wider">
              Conteúdo
            </div>
            
            <Link 
              href={getUploadVideoUrl()}
              className="flex items-center px-4 py-2 text-sm text-silver-700 hover:bg-silver-50 w-full text-left"
              onClick={() => setIsMenuOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-silver-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Enviar Vídeo
            </Link>
            
            <Link 
              href={getMyVideosUrl()}
              className="flex items-center px-4 py-2 text-sm text-silver-700 hover:bg-silver-50 w-full text-left"
              onClick={() => setIsMenuOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-silver-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Meus Vídeos
            </Link>
            
            <Link 
              href="/analytics"
              className="flex items-center px-4 py-2 text-sm text-silver-700 hover:bg-silver-50 w-full text-left"
              onClick={() => setIsMenuOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-silver-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analytics
            </Link>
          </div>
          
          {/* Sign out button */}
          <div className="py-1 border-t border-silver-100">
            <button
              onClick={handleSignOut}
              className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 