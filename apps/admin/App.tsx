import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useQuery } from "convex/react";
import { api } from "@convex/api";
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductEditor from './pages/ProductEditor';
import Login from './pages/Login';
import Users from './pages/Users';
import Categories from './pages/Categories';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import NotFound from './pages/NotFound';
import Search from './pages/Search';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';
import Coupons from './pages/Coupons';
import CouponEditor from './pages/CouponEditor';
import CartRules from './pages/CartRules';
import CartRuleEditor from './pages/CartRuleEditor';
import SystemAnnouncements from './pages/SystemAnnouncements';
import { Box, Flex, Text, Spinner, VStack, Center } from '@chakra-ui/react';

// Loading screen
const LoadingScreen = () => (
  <Center minH="100vh" bg="bg.subtle">
    <VStack gap="4">
      <Spinner size="xl" color="blue.500" borderWidth="4px" />
      <Text color="fg.muted">טוען...</Text>
    </VStack>
  </Center>
);

// Placeholder page component
const PlaceholderPage = ({ title }: { title: string }) => (
  <Flex justify="center" align="center" h="full" p="10">
    <VStack gap="4">
      <Text
        as="span"
        className="material-symbols-outlined"
        fontSize="48px"
        color="fg.subtle"
      >
        construction
      </Text>
      <Text fontSize="lg" color="fg.muted" textAlign="center">
        {title} בבנייה...
      </Text>
    </VStack>
  </Flex>
);

export default function App() {
  // Query current user data
  const currentUser = useQuery(api.users.get);

  // Loading state while query is undefined
  if (currentUser === undefined) {
    return <LoadingScreen />;
  }

  const isAuthenticated = currentUser !== null;
  const isAdmin = currentUser?.role === 'admin';

  // If authenticated as admin, show the full app with redirect from /login to /
  if (isAuthenticated && isAdmin) {
    return (
      <Routes>
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/products" element={<Layout><Products /></Layout>} />
        <Route path="/products/new" element={<Layout><ProductEditor /></Layout>} />
        <Route path="/products/:id/edit" element={<Layout><ProductEditor /></Layout>} />
        <Route path="/orders" element={<Layout><Orders /></Layout>} />
        <Route path="/orders/:id" element={<Layout><OrderDetails /></Layout>} />
        <Route path="/media" element={<Layout><PlaceholderPage title="עמוד מדיה" /></Layout>} />
        <Route path="/users" element={<Layout><Users /></Layout>} />
        <Route path="/categories" element={<Layout><Categories /></Layout>} />
        <Route path="/settings" element={<Layout><PlaceholderPage title="עמוד הגדרות" /></Layout>} />
        <Route path="/search" element={<Layout><Search /></Layout>} />
        <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
        <Route path="/notifications" element={<Layout><Notifications /></Layout>} />
        <Route path="/system-announcements" element={<Layout><SystemAnnouncements /></Layout>} />
        <Route path="/coupons" element={<Layout><Coupons /></Layout>} />
        <Route path="/coupons/new" element={<Layout><CouponEditor /></Layout>} />
        <Route path="/coupons/:id/edit" element={<Layout><CouponEditor /></Layout>} />
        <Route path="/cart-rules" element={<Layout><CartRules /></Layout>} />
        <Route path="/cart-rules/new" element={<Layout><CartRuleEditor /></Layout>} />
        <Route path="/cart-rules/:id/edit" element={<Layout><CartRuleEditor /></Layout>} />
        {/* Redirect /login to / when admin */}
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Layout><NotFound /></Layout>} />
      </Routes>
    );
  }

  // Otherwise (not authenticated OR not admin) - show only login page
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
