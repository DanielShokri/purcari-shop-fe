import React from 'react';
import { Menu } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toggleMobileMenu, selectIsMobileMenuOpen } from '../store/slices/uiSlice';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Logo, DesktopNav, MobileMenu, HeaderActions } from './header-components';

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const isMobileMenuOpen = useAppSelector(selectIsMobileMenuOpen);
  const user = useQuery(api.users.get);

  return (
    <header className="fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-40 border-b border-gray-100">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        
        {/* Mobile Menu Button */}
        <button 
          className="lg:hidden p-2 text-gray-600 hover:text-secondary transition-colors cursor-pointer"
          onClick={() => dispatch(toggleMobileMenu())}
          aria-label="תפריט"
        >
          <Menu size={24} />
        </button>

        <Logo />
        <DesktopNav />
        <HeaderActions user={user} />
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && <MobileMenu user={user} />}
      </AnimatePresence>
    </header>
  );
};

export default Header;
