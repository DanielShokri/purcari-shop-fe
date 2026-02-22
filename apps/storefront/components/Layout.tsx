import React from 'react';
import Header from './Header';
import Footer from './Footer';
import CartModal from './CartModal';
import SearchModal from './SearchModal';
import AgeVerificationModal from './AgeVerificationModal';
import SystemAnnouncementBanner from './SystemAnnouncementBanner';
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
      {/* pt-20 offsets all content below the fixed header (h-20) */}
      <div className="flex flex-col flex-grow pt-20">
        <SystemAnnouncementBanner />
        <main className="flex-grow">
          {children}
        </main>
      </div>
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