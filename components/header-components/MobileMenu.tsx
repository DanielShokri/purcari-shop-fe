import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, ChevronLeft, Search, User } from 'lucide-react';
import { useAppDispatch } from '../../store/hooks';
import { toggleMobileMenu, openSearchModal } from '../../store/slices/uiSlice';
import { navLinks } from './navLinks';

interface MobileMenuProps {
  user: any;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ user }) => {
  const dispatch = useAppDispatch();
  const location = useLocation();

  const handleClose = () => dispatch(toggleMobileMenu());

  const handleSearchClick = () => {
    dispatch(toggleMobileMenu());
    dispatch(openSearchModal());
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
      />
      
      {/* Menu Content */}
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="absolute top-0 start-0 w-[300px] h-screen bg-white shadow-2xl flex flex-col z-50"
      >
        {/* Header */}
        <div className="p-6 flex justify-between items-center border-b border-gray-100 bg-gray-50/50">
          <span className="text-xl font-bold text-secondary uppercase tracking-wider">תפריט</span>
          <button 
            onClick={handleClose} 
            className="p-2 -me-2 text-gray-400 hover:text-secondary hover:bg-white rounded-full transition-all cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Links */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-4 space-y-2">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path}
                className={`flex items-center justify-between px-4 py-4 rounded-2xl transition-all ${
                  location.pathname === link.path 
                  ? 'bg-secondary/5 text-secondary font-bold' 
                  : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={handleClose}
              >
                <span className="text-lg">{link.name}</span>
                <ChevronLeft size={18} className={location.pathname === link.path ? 'opacity-100' : 'opacity-30'} />
              </Link>
            ))}
          </nav>

          <div className="px-8 my-6">
            <div className="h-px bg-gray-100 w-full" />
          </div>

          {/* Search Button */}
          <div className="px-4 mb-4">
            <button
              onClick={handleSearchClick}
              className="flex items-center gap-4 w-full px-4 py-4 text-gray-700 hover:bg-gray-50 rounded-2xl transition-all cursor-pointer"
            >
              <div className="bg-gray-100 p-2 rounded-xl text-gray-600">
                <Search size={20} />
              </div>
              <span className="text-lg">חיפוש</span>
            </button>
          </div>

          {/* Account Link */}
          <div className="px-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ps-4 mb-2">החשבון שלי</p>
            <Link 
              to={user ? "/dashboard" : "/login"}
              className="flex items-center gap-4 px-4 py-4 text-gray-700 hover:bg-gray-50 rounded-2xl transition-all"
              onClick={handleClose}
            >
              <div className="bg-secondary/10 p-2 rounded-xl text-secondary">
                <User size={20} />
              </div>
              <span className="text-lg">{user ? 'אזור אישי' : 'התחברות'}</span>
            </Link>
          </div>
        </div>

        {/* Brand Footer */}
        <div className="p-8 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-secondary font-bold tracking-[0.3em] uppercase text-xs mb-1">Purcari Israel</p>
          <p className="text-[10px] text-gray-400">© {new Date().getFullYear()} כל הזכויות שמורות</p>
        </div>
      </motion.div>
    </div>
  );
};

export default MobileMenu;
