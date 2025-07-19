import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useAppStore } from '../../stores/appStore';
import { LayoutDashboard, Users, Send, History, Settings, Copy, Mail, Menu, X, ChevronsLeft } from 'lucide-react';
import { useDataFetcher } from '../../hooks/useDataFetcher';
import Logo from '../../assets/logo.png';

const navLinks = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/contacts', label: 'Contacts', icon: Users },
  { to: '/send-mail', label: 'Send Mail', icon: Send },
  { to: '/history', label: 'History', icon: History },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const AppLink = ({ to, label, icon: Icon, isCollapsed }) => (
  <NavLink
    to={to}
    end={to === '/'}
    className={({ isActive }) =>
      `flex items-center justify-start gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
        isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'
      } ${isCollapsed ? 'justify-center px-0 pl-[0.675rem]' : ''}`
    }
  >
    <Icon size={20} />
    <span className={`whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>{label}</span>
  </NavLink>
);

export default function MainLayout() {
  useDataFetcher(); 
  const { userId } = useAuthStore();
  const { notifySuccess } = useAppStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleCopyUserId = () => {
    if (userId) {
      navigator.clipboard.writeText(userId);
      notifySuccess('User ID copied to clipboard!');
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-300 font-sans">
      <aside className={`bg-gray-800/50 border-r border-gray-700 flex-col hidden md:flex relative transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className={`p-6 text-2xl font-bold text-white flex items-center gap-2 transition-all duration-300 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
          <img  src={Logo} alt="cold mail outreach"/>
          <span className={isSidebarCollapsed ? 'hidden' : 'hidden'}>Cold Mail Outreach</span>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navLinks.map((link) => (
            <AppLink key={link.to} {...link} isCollapsed={isSidebarCollapsed} />
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <div className={`flex items-center gap-2 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
            <p className={`text-xs text-gray-400 truncate ${isSidebarCollapsed ? 'hidden' : 'block'}`}>{userId}</p>
            <button onClick={handleCopyUserId} className="text-gray-400 hover:text-white">
              <Copy size={14} />
            </button>
          </div>
        </div>
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
          className="absolute -right-3 top-8 bg-gray-700 hover:bg-blue-600 p-1.5 rounded-full text-white transition-transform duration-300"
        >
          <ChevronsLeft size={16} className={`transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </aside>


      <header className="md:hidden max-h-[4rem] w-full p-4 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 flex justify-between items-center z-20">
        <div className="text-xl font-bold text-white flex items-center gap-2">
          <img className="w-[3rem]" src={Logo} alt="cold mail outreach"/>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="text-white">
          <Menu size={24} />
        </button>
      </header>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30" onClick={() => setIsMobileMenuOpen(false)}>
          <aside className="fixed inset-y-0 left-0 w-64 bg-gray-800 border-r border-gray-700 flex flex-col z-40" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 flex justify-between items-center">
              <span className="text-2xl font-bold text-white flex items-center gap-2"><Mail size={28} /> Pro</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-white">
                <X size={24} />
              </button>
            </div>
            <nav className="flex-1 px-4 space-y-2">
              {navLinks.map((link) => (
                <AppLink key={link.to} {...link} isCollapsed={false} onClick={()=>{setIsMobileMenuOpen(false)}}/>
              ))}
            </nav>
            <div className="p-4 border-t border-gray-700">
              <p className="text-xs text-gray-500 mb-1">User ID:</p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-400 truncate">{userId}</p>
                <button onClick={handleCopyUserId} className="text-gray-400 hover:text-white">
                  <Copy size={14} />
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      <main className="flex-1 p-6 md:p-10 overflow-y-auto absolute md:relative inset-0 top-16 md:top-0">
        <Outlet />
      </main>
    </div>
  );
}
