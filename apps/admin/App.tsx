import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Authenticated, Unauthenticated, AuthLoading, useQuery } from "convex/react";
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
import { Box, Flex, Text, Spinner, VStack, Center } from '@chakra-ui/react';
import { toaster } from './components/ui/toaster';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const user = useQuery(api.users.get);
  const location = useLocation();

  if (user === undefined) return null; // Loading handled by AuthLoading

  if (user === null || user.role !== 'admin') {
    // If user is authenticated but not admin, show access denied message
    const isAuthenticated = user !== null;
    return (
      <Navigate 
        to="/login" 
        state={{ 
          from: location,
          accessDenied: isAuthenticated 
        }} 
        replace 
      />
    );
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
    <>
      <AuthLoading>
        <Center minH="100vh" bg="bg.subtle">
          <VStack gap="4">
            <Spinner size="xl" color="blue.500" borderWidth="4px" />
            <Text color="fg.muted">טוען...</Text>
          </VStack>
        </Center>
      </AuthLoading>
      <Unauthenticated>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Unauthenticated>
      <Authenticated>
        <Routes>
          <Route path="/login" element={<Navigate to="/" replace />} />
          
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
          
          <Route path="/cart-rules" element={
            <ProtectedRoute>
              <CartRules />
            </ProtectedRoute>
          } />
          
          <Route path="/cart-rules/new" element={
            <ProtectedRoute>
              <CartRuleEditor />
            </ProtectedRoute>
          } />
          
          <Route path="/cart-rules/:id/edit" element={
            <ProtectedRoute>
              <CartRuleEditor />
            </ProtectedRoute>
          } />
          
          {/* 404 Not Found - catch all unmatched routes */}
          <Route path="*" element={
            <ProtectedRoute>
              <NotFound />
            </ProtectedRoute>
          } />
        </Routes>
      </Authenticated>
    </>
  );
}
