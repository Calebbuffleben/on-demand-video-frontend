import React, { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, sidebar }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      {sidebar && (
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
            {sidebar}
          </div>
        </div>
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