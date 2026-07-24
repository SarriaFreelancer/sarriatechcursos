import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { RequireAuth } from '../auth/RequireRole';
import { PlatformFooter } from './PlatformFooter';

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <RequireAuth>
      <div className="flex min-h-screen bg-background relative">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0 relative">
          <Header onMenuToggle={() => setSidebarOpen(prev => !prev)} />
          <main className="flex-1 p-3 sm:p-4 md:p-6">
            <Outlet />
          </main>
          <PlatformFooter />
        </div>
      </div>
    </RequireAuth>
  );
}
