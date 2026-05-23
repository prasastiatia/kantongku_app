import React from 'react';
import { Wallet, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuthStore();
  
  return (
    <div className="flex h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 overflow-hidden text-slate-800">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-white/70 backdrop-blur-xl border-r border-blue-100/50 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
        <div className="p-6 flex items-center space-x-3 text-slate-800">
          <Wallet className="w-8 h-8 text-blue-600" />
          <span className="text-xl font-bold tracking-tight">Kantongku</span>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <a href="#" className="flex items-center space-x-3 px-3 py-2.5 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-500/20 font-medium transition-all">
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-3 py-2.5 text-slate-500 hover:bg-white hover:text-blue-700 hover:shadow-sm rounded-xl font-medium transition-all">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </a>
        </nav>

        {/* User Profile & Logout */}
        {user && (
          <div className="p-4 border-t border-blue-100/50 mt-auto">
            <div className="flex items-center space-x-3 mb-4 px-2">
              <img src={user.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full bg-slate-100" />
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full flex items-center justify-center space-x-2 py-2 text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative overflow-y-auto overflow-x-hidden">
        {/* Topbar - Mobile */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-md border-b border-blue-100/50 shrink-0 sticky top-0 z-20">
          <div className="flex items-center space-x-2 text-slate-800">
            <Wallet className="w-6 h-6 text-blue-600" />
            <span className="text-lg font-bold">Kantongku</span>
          </div>
          {user && (
            <button onClick={logout} className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-full">
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </header>
        
        <div className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
