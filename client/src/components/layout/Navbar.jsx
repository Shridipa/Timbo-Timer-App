import React from 'react';
import { Menu, Bell, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Navbar = ({ isOpen, setIsOpen }) => {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className="h-16 glass border-b border-white/5 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center">
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2 mr-4 rounded-lg hover:bg-white/10 text-gray-400 lg:hidden cursor-pointer"
        >
          <Menu className="w-6 h-6" />
        </button>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2 mr-4 rounded-lg hover:bg-white/10 text-gray-400 hidden lg:block cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold text-gray-200 hidden sm:block">Welcome back, {user?.name.split(' ')[0]}</h2>
      </div>

      <div className="flex items-center space-x-4">
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-full hover:bg-white/10 text-gray-400 transition-colors cursor-pointer"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        
        <button className="p-2 rounded-full hover:bg-white/10 text-gray-400 transition-colors relative cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border border-background"></span>
        </button>

        <div className="h-8 w-8 rounded-full overflow-hidden border border-white/10">
          <img src={user?.avatar} alt={user?.name} className="h-full w-full object-cover" />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
