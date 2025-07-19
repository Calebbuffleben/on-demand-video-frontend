import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ScaleLogo from '../ui/ScaleLogo';

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
    { name: 'Painel de Controle', href: '/dashboard', icon: 'home' },
    { name: 'Meus Vídeos', href: tenantId ? '/videos' : '/my-videos', icon: 'video' },
    { name: 'Enviar Vídeo', href: '/upload-video', icon: 'upload' },
    { name: 'Análises', href: '/analytics', icon: 'analytics', isNew: true },
    { name: 'Códigos de Incorporação', href: '/embed-codes', icon: 'code', isNew: true },
    { name: 'Armazenamento', href: '/storage', icon: 'storage', isNew: true },
  ];

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-scale-900 via-scale-700 to-scale-800 text-white relative overflow-hidden">
      {/* Gradient overlay for enhanced effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-scale-900/50 via-transparent to-scale-800/30 pointer-events-none"></div>
      
      {/* Logo and brand */}
      <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-scale-800 relative z-10">
        <Link href={getUrl('/dashboard')}>
          <ScaleLogo size="md" showText={true} variant="light" />
        </Link>
      </div>
      
      {/* User profile section */}
      <div className="px-4 py-3 border-b border-scale-800 relative z-10">
        <div className="flex items-center">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-silver-600 to-silver-800 flex items-center justify-center text-white font-semibold mr-3 shadow-lg">
            U
          </div>
          <div>
            <p className="text-sm font-medium text-white">Perfil do Usuário</p>
            <p className="text-xs text-white opacity-70">Conta de Criador</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="mt-3 flex-grow flex flex-col overflow-y-auto relative z-10">
        <nav className="flex-1 px-2 space-y-1">
          <div className="space-y-2 pb-2">
            {navigationItems.slice(0, 4).map((item) => (
              <Link
                key={item.name}
                href={getUrl(item.href)}
                className={`
                  group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200
                  ${isActive(item.href)
                    ? 'bg-gradient-to-r from-scale-800 to-scale-700 text-white shadow-lg'
                    : 'text-white hover:bg-gradient-to-r hover:from-silver-600 hover:to-silver-700 hover:text-white hover:shadow-md'}
                `}
              >
                {renderIcon(item.icon, isActive(item.href))}
                <span className="flex-1">{item.name}</span>
                {item.isNew && (
                  <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-scale-700 to-scale-600 text-white shadow-sm">
                    Novo
                  </span>
                )}
              </Link>
            ))}
          </div>
          
          <div className="pt-2 border-t border-scale-800">
            <p className="px-3 text-xs font-semibold text-white uppercase tracking-wider">
              Ferramentas da Plataforma
            </p>
            <div className="mt-2 space-y-2">
              {navigationItems.slice(4).map((item) => (
                <Link
                  key={item.name}
                  href={getUrl(item.href)}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200
                    ${isActive(item.href)
                      ? 'bg-gradient-to-r from-scale-800 to-scale-700 text-white shadow-lg'
                      : 'text-white hover:bg-gradient-to-r hover:from-silver-600 hover:to-silver-700 hover:text-white hover:shadow-md'}
                  `}
                >
                  {renderIcon(item.icon, isActive(item.href))}
                  <span className="flex-1">{item.name}</span>
                  {item.isNew && (
                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-scale-700 to-scale-600 text-white shadow-sm">
                      Novo
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </div>
      
      {/* Help & Info Links */}
      <div className="px-3 py-3 border-t border-scale-800 relative z-10">
        <div className="flex flex-col space-y-2">
          <Link href={getUrl('/documentation')} className="text-xs text-white hover:text-white transition-colors duration-200">
            Documentação da API
          </Link>
          <Link href={getUrl('/help')} className="text-xs text-white hover:text-white transition-colors duration-200">
            Central de Ajuda
          </Link>
          <Link href={getUrl('/contact')} className="text-xs text-white hover:text-white transition-colors duration-200">
            Contatar Suporte
          </Link>
        </div>
      </div>
    </div>
  );
};

// Helper function to render icons based on their type
function renderIcon(iconName: string, isActive: boolean) {
  const className = `mr-3 flex-shrink-0 h-5 w-5 ${isActive ? 'text-white' : 'text-white group-hover:text-white'}`;
  
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
    case 'analytics':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
      );
    case 'code':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      );
    case 'money':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
        </svg>
      );
    case 'storage':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
          <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
        </svg>
      );
    case 'key':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
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