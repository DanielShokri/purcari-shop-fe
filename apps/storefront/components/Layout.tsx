import React, { Suspense, lazy, useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import AgeVerificationModal from './AgeVerificationModal';
import SystemAnnouncementBanner from './SystemAnnouncementBanner';
import { ToastContainer } from './toast';
import { useCartUI } from '../hooks/useCartUI';
import { AnimatePresence } from 'framer-motion';
import { useTrackPageView } from '../hooks/useAnalytics';
import { useAppSelector } from '../store/hooks';
import { selectIsSearchModalOpen } from '../store/slices/uiSlice';

// Only needed after the user opens them, so keep them out of the first-paint bundle.
const CartModal = lazy(() => import('./CartModal'));
const SearchModal = lazy(() => import('./SearchModal'));

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isCartOpen } = useCartUI();

  // Mount SearchModal on first open and keep it mounted so its exit animation still plays.
  const isSearchOpen = useAppSelector(selectIsSearchModalOpen);
  const [searchLoaded, setSearchLoaded] = useState(false);
  useEffect(() => {
    if (isSearchOpen) setSearchLoaded(true);
  }, [isSearchOpen]);

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
        {isCartOpen && (
          <Suspense fallback={null}>
            <CartModal />
          </Suspense>
        )}
      </AnimatePresence>
      {searchLoaded && (
        <Suspense fallback={null}>
          <SearchModal />
        </Suspense>
      )}
      <AgeVerificationModal />
      <ToastContainer />
    </div>
  );
};

export default Layout;