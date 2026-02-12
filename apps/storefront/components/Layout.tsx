import React from 'react';
import Header from './Header';
import Footer from './Footer';
import CartModal from './CartModal';
import SearchModal from './SearchModal';
import AgeVerificationModal from './AgeVerificationModal';
import { ToastContainer } from './toast';
import { useAppSelector } from '../store/hooks';
import { selectIsCartModalOpen } from '../store/slices/uiSlice';
import { AnimatePresence } from 'framer-motion';
import { useTrackPageView } from '../hooks/useAnalytics';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isCartOpen = useAppSelector(selectIsCartModalOpen);

  // Enable automatic page view tracking (must be inside Router context)
  useTrackPageView();

  return (
    <div className="flex flex-col min-h-screen font-sans">
      <Header />
      <main className="flex-grow pt-20">
        {children}
      </main>
      <Footer />
      <AnimatePresence>
        {isCartOpen && <CartModal />}
      </AnimatePresence>
      <SearchModal />
      <AgeVerificationModal />
      <ToastContainer />
    </div>
  );
};

export default Layout;