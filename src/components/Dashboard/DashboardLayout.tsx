import React, { ReactNode, useState } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, sidebar }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-silver-100 dark:bg-scale-900">
      {/* Mobile sidebar toggle */}
      <div className="md:hidden fixed top-4 left-4 z-30">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-md bg-scale-800 text-white hover:bg-scale-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-scale-500"
        >
          {isSidebarOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>
      
      {/* Sidebar - desktop always visible, mobile conditionally */}
      {sidebar && (
        <>
          {/* Desktop sidebar */}
          <div className="hidden md:flex md:flex-shrink-0">
            <div className="flex flex-col w-64 border-r border-scale-800 bg-scale-900">
              {sidebar}
            </div>
          </div>
          
          {/* Mobile sidebar with overlay */}
          <div className={`md:hidden fixed inset-0 z-20 transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-0 bg-black opacity-50" onClick={() => setIsSidebarOpen(false)}></div>
            <div className={`absolute inset-y-0 left-0 w-64 bg-scale-900 transform transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
              {sidebar}
            </div>
          </div>
        </>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-auto">
        <main className="flex-1 relative pb-8 z-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 