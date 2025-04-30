import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const DashboardSidebar: React.FC = () => {
  const router = useRouter();
  const { tenantId } = router.query;
  
  const isActive = (path: string) => {
    return router.pathname === path || router.pathname.startsWith(`${path}/`);
  };

  // Helper function to get URL with tenant context if available
  const getUrl = (path: string) => {
    return tenantId ? `/${tenantId}${path}` : path;
  };

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: 'home' },
    { name: 'My Videos', href: tenantId ? '/videos' : '/my-videos', icon: 'video' },
    { name: 'Upload Video', href: '/upload-video', icon: 'upload' },
    { name: 'Settings', href: '/settings', icon: 'settings' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Logo and brand */}
      <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-gray-200">
        <Link href={getUrl('/dashboard')}>
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            <span className="ml-2 text-lg font-bold text-gray-900">Stream</span>
          </span>
        </Link>
      </div>
      
      {/* Navigation */}
      <div className="mt-5 flex-grow flex flex-col">
        <nav className="flex-1 px-2 space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={getUrl(item.href)}
              className={`
                group flex items-center px-2 py-2 text-sm font-medium rounded-md
                ${isActive(item.href)
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
              `}
            >
              {renderIcon(item.icon, isActive(item.href))}
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

// Helper function to render icons based on their type
function renderIcon(iconName: string, isActive: boolean) {
  const className = `mr-3 flex-shrink-0 h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`;
  
  switch (iconName) {
    case 'home':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      );
    case 'video':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
        </svg>
      );
    case 'upload':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      );
    case 'settings':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
  }
}

export default DashboardSidebar; 