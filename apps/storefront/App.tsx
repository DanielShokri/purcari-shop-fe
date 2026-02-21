import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import ToastContainer from './components/toast/ToastContainer';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import ShippingPage from './pages/ShippingPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import { useConvex, useQuery } from "convex/react";
import { api } from "@convex/api";
import { useAppDispatch, useAppSelector } from './store/hooks';
import { initializeCart, selectCartItems, selectAppliedCoupon } from './store/slices/cartSlice';
import { syncCartToConvex } from './store/slices/convexCartBridge';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const convex = useConvex();
  // undefined = auth loading, null = logged out, object = logged in
  const user = useQuery(api.users.get);
  const cartItems = useAppSelector(selectCartItems);
  const appliedCoupon = useAppSelector(selectAppliedCoupon);
  // Track previous auth state to detect login/logout transitions
  const prevUserRef = useRef<typeof user>(undefined);
  const lastSyncedItemsRef = useRef<string>('');

  // React to auth state changes
  useEffect(() => {
    const prev = prevUserRef.current;
    prevUserRef.current = user;

    // Still loading — do nothing yet
    if (user === undefined) return;

    // Logged out: load cart from localStorage for guest session
    if (user === null) {
      // Only reinitialize if we were previously logged in (i.e. this is a logout)
      if (prev !== undefined && prev !== null) {
        dispatch(initializeCart(convex));
        lastSyncedItemsRef.current = '';
      } else if (prev === undefined) {
        // Initial load as guest — initialize from localStorage
        dispatch(initializeCart(convex));
      }
      return;
    }

    // Logged in: fetch cloud cart and merge with any local items
    // Fires on: initial load while authenticated, AND on login transition
    dispatch(initializeCart(convex)).then(() => {
      lastSyncedItemsRef.current = '';
    });
  }, [user, dispatch, convex]);

  // Write cart to Convex whenever items change while logged in
  useEffect(() => {
    if (user == null) return; // not logged in or still loading

    const currentItemsJson = JSON.stringify(cartItems);
    if (currentItemsJson === lastSyncedItemsRef.current) return;

    lastSyncedItemsRef.current = currentItemsJson;
    syncCartToConvex(convex, cartItems, appliedCoupon).catch(console.error);
  }, [convex, user, cartItems, appliedCoupon]);

  return (
    <Router>
      <ScrollToTop />
      <ToastContainer />
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/shipping" element={<ShippingPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="*" element={<div className="container mx-auto px-4 py-20 text-center">הדף לא נמצא (404)</div>} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;