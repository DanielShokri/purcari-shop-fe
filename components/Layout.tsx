import React from 'react';
import Header from './Header';
import Footer from './Footer';
import CartModal from './CartModal';
import SearchModal from './SearchModal';
import { useAppSelector } from '../store/hooks';
import { selectIsCartModalOpen } from '../store/slices/uiSlice';
import { AnimatePresence } from 'framer-motion';
import theme from '../theme/styles';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isCartOpen = useAppSelector(selectIsCartModalOpen);

  return (
    <div className="flex flex-col min-h-screen font-sans">
      <Header />
      <main className={`flex-grow pt-20 ${theme.CONTAINER_PX}`}>
        {children}
      </main>
      <Footer />
      <AnimatePresence>
        {isCartOpen && <CartModal />}
      </AnimatePresence>
      <SearchModal />
    </div>
  );
};

export default Layout;