import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Compass, Calendar, BarChart3, Bot, Target, Settings, X, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  { path: '/', name: 'Execution Center', icon: LayoutDashboard },
  { path: '/roadmap', name: 'Strategic Roadmap', icon: Compass },
  { path: '/calendar', name: 'Smart Calendar', icon: Calendar },
  { path: '/analytics', name: 'Performance Intelligence', icon: BarChart3 },
  { path: '/coach', name: 'AI Strategist', icon: Bot },
  { path: '/focus', name: 'Deep Focus Arena', icon: Target },
  { path: '/settings', name: 'Preferences', icon: Settings },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { logout } = useAuth();
  
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <motion.aside 
        initial={false}
        animate={{ width: isOpen ? 280 : 80, x: 0 }}
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 glass border-r border-white/5 flex flex-col transition-all duration-300 ${!isOpen && 'max-lg:-translate-x-full'}`}
      >
        <div className="flex items-center justify-between h-16 px-4 mb-4 border-b border-white/5">
          {isOpen ? (
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent whitespace-nowrap overflow-hidden">
              LifeOS AI
            </span>
          ) : (
            <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-purple-600 mx-auto" />
          )}
          <button onClick={() => setIsOpen(!isOpen)} className="p-1 rounded-md hover:bg-white/10 lg:hidden cursor-pointer">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => 
                  `flex items-center px-3 py-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-primary/20 text-blue-400 border border-primary/20' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                  }`
                }
                title={!isOpen ? item.name : ''}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span className="ml-3 font-medium whitespace-nowrap overflow-hidden">{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={logout}
            className="flex items-center w-full px-3 py-3 text-gray-400 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span className="ml-3 font-medium whitespace-nowrap overflow-hidden">Logout</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
