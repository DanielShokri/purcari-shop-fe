import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toggleCartModal, toggleMobileMenu, selectIsMobileMenuOpen } from '../store/slices/uiSlice';
import { selectCartItemCount } from '../store/slices/cartSlice';
import { useGetCurrentUserQuery } from '../services/api/authApi';
import { ShoppingCart, Menu, Search, User, X } from 'lucide-react';

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
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => dispatch(toggleMobileMenu())} />
          <div className="absolute top-0 start-0 w-[80%] max-w-sm h-full bg-white shadow-xl flex flex-col p-6 animate-in slide-in-from-start duration-300">
            <div className="flex justify-between items-center mb-8">
               <span className="text-xl font-bold text-secondary">תפריט</span>
               <button onClick={() => dispatch(toggleMobileMenu())} className="text-gray-500">
                 <X size={24} />
               </button>
            </div>
            <nav className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.path}
                  to={link.path}
                  className="text-lg font-medium text-gray-800 border-b border-gray-100 pb-2"
                  onClick={() => dispatch(toggleMobileMenu())}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;