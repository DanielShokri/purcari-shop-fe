import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';
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
import { Box, Flex, Text, Spinner, VStack } from '@chakra-ui/react';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Layout>{children}</Layout>;
};

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
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/products" element={
        <ProtectedRoute>
          <Products />
        </ProtectedRoute>
      } />
      
      <Route path="/products/new" element={
        <ProtectedRoute>
          <ProductEditor />
        </ProtectedRoute>
      } />
      
      <Route path="/products/:id/edit" element={
        <ProtectedRoute>
          <ProductEditor />
        </ProtectedRoute>
      } />
      
      <Route path="/orders" element={
        <ProtectedRoute>
          <Orders />
        </ProtectedRoute>
      } />
      
      <Route path="/orders/:id" element={
        <ProtectedRoute>
          <OrderDetails />
        </ProtectedRoute>
      } />
      
      {/* Placeholders for other routes */}
      <Route path="/media" element={
        <ProtectedRoute>
          <PlaceholderPage title="עמוד מדיה" />
        </ProtectedRoute>
      } />
      <Route path="/users" element={
        <ProtectedRoute>
          <Users />
        </ProtectedRoute>
      } />
      <Route path="/categories" element={
        <ProtectedRoute>
          <Categories />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <PlaceholderPage title="עמוד הגדרות" />
        </ProtectedRoute>
      } />
      <Route path="/search" element={
        <ProtectedRoute>
          <Search />
        </ProtectedRoute>
      } />
      <Route path="/analytics" element={
        <ProtectedRoute>
          <Analytics />
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute>
          <Notifications />
        </ProtectedRoute>
      } />
      
      <Route path="/coupons" element={
        <ProtectedRoute>
          <Coupons />
        </ProtectedRoute>
      } />
      
      <Route path="/coupons/new" element={
        <ProtectedRoute>
          <CouponEditor />
        </ProtectedRoute>
      } />
      
      <Route path="/coupons/:id/edit" element={
        <ProtectedRoute>
          <CouponEditor />
        </ProtectedRoute>
      } />
      
      {/* 404 Not Found - catch all unmatched routes */}
      <Route path="*" element={
        <ProtectedRoute>
          <NotFound />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
