import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toggleCartModal, toggleMobileMenu, selectIsMobileMenuOpen } from '../store/slices/uiSlice';
import { selectCartItemCount } from '../store/slices/cartSlice';
import { useGetCurrentUserQuery } from '../services/api/authApi';
import { ShoppingCart, Menu, Search, User, X, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const cartCount = useAppSelector(selectCartItemCount);
  const isMobileMenuOpen = useAppSelector(selectIsMobileMenuOpen);
  const location = useLocation();
  const { data: user } = useGetCurrentUserQuery();

  const navLinks = [
    { name: 'דף הבית', path: '/' },
    { name: 'חנות', path: '/products' },
    { name: 'אודות', path: '/about' },
    { name: 'צור קשר', path: '/contact' },
  ];

  return (
    <header className="fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-40 border-b border-gray-100">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        
        {/* Mobile Menu Button */}
        <button 
          className="lg:hidden p-2 text-gray-600 hover:text-secondary transition-colors"
          onClick={() => dispatch(toggleMobileMenu())}
        >
          <Menu size={24} />
        </button>

        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <div className="text-2xl font-bold text-secondary tracking-widest uppercase">
            Purcari
          </div>
          <div className="text-[10px] text-gray-500 tracking-[0.2em] text-center -mt-1 uppercase">
            Israel
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path}
              className={`text-sm font-medium tracking-wide transition-colors hover:text-secondary ${
                location.pathname === link.path ? 'text-secondary font-bold' : 'text-gray-600'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-600 hover:text-secondary transition-colors hidden sm:block">
            <Search size={22} />
          </button>
          <Link to={user ? "/dashboard" : "/login"} className="p-2 text-gray-600 hover:text-secondary transition-colors hidden sm:block">
            <User size={22} />
          </Link>
          <button 
            className="p-2 text-gray-600 hover:text-secondary transition-colors relative"
            onClick={() => dispatch(toggleCartModal())}
          >
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute top-0 -end-1 bg-secondary text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => dispatch(toggleMobileMenu())}
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
                  onClick={() => dispatch(toggleMobileMenu())} 
                  className="p-2 -me-2 text-gray-400 hover:text-secondary hover:bg-white rounded-full transition-all"
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
                      onClick={() => dispatch(toggleMobileMenu())}
                    >
                      <span className="text-lg">{link.name}</span>
                      <ChevronLeft size={18} className={location.pathname === link.path ? 'opacity-100' : 'opacity-30'} />
                    </Link>
                  ))}
                </nav>

                <div className="px-8 my-6">
                  <div className="h-px bg-gray-100 w-full" />
                </div>

                {/* Account Link */}
                <div className="px-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ps-4 mb-2">החשבון שלי</p>
                  <Link 
                    to={user ? "/dashboard" : "/login"}
                    className="flex items-center gap-4 px-4 py-4 text-gray-700 hover:bg-gray-50 rounded-2xl transition-all"
                    onClick={() => dispatch(toggleMobileMenu())}
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
                <p className="text-[10px] text-gray-400">© 2026 כל הזכויות שמורות</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;