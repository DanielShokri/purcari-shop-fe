import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from '@convex/api';

import { Address, AuthUser, Order } from '@shared/types';
import { 
  profileSchema, 
  addressFormSchema, 
  ProfileInput, 
  AddressFormInput 
} from '../schemas/validationSchemas';

import {
  DashboardHeader,
  DashboardTabs,
  OrdersTab,
  ProfileTab,
  AddressesTab,
  AddressModal,
  TabId,
} from '../components/dashboard';

import { useAppDispatch } from '../store/hooks';
import { handleLogout as handleCartLogout } from '../store/slices/cartSlice';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<TabId>('orders');
  
  // Queries & Mutations
  const convexUser = useQuery(api.users.get);
  const user = convexUser as AuthUser | null;
  const isUserLoading = convexUser === undefined;

  const convexOrders = useQuery(api.orders.listByCustomer, convexUser ? { email: convexUser.email } : "skip");
  const orders = convexOrders as Order[] || [];
  const isOrdersLoading = convexOrders === undefined;
  
  const convexAddresses = useQuery(api.userAddresses.list, convexUser ? { userId: convexUser._id } : "skip");
  const addresses = convexAddresses as Address[] || [];
  const isPrefsLoading = convexAddresses === undefined;
  
  const { signOut } = useAuthActions();
  const updateProfileMutation = useMutation(api.users.updateProfile);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const createAddress = useMutation(api.userAddresses.create);
  const updateAddress = useMutation(api.userAddresses.update);
  const removeAddress = useMutation(api.userAddresses.remove);
  const [isUpdatingPrefs, setIsUpdatingPrefs] = useState(false);

  const [profileStatus, setProfileStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Profile Form
  const { 
    register: registerProfile, 
    handleSubmit: handleProfileSubmitHook, 
    formState: { errors: profileErrors },
    reset: resetProfile
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
  });

  // Address Form
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  
  const addressFormMethods = useForm<AddressFormInput>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      name: '',
      street: '',
      city: '',
      postalCode: '',
      country: 'Israel',
      isDefault: false
    }
  });

  const { reset: resetAddress } = addressFormMethods;

  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name || '',
        phone: user.phone || ''
      });
    }
  }, [user, resetProfile]);

  // Handlers
  const handleLogout = async () => {
    await signOut();
    dispatch(handleCartLogout());
    navigate('/login');
  };

  const onProfileSubmit = async (data: ProfileInput) => {
    setProfileStatus(null);
    setIsUpdatingProfile(true);
    try {
      await updateProfileMutation({ 
        name: data.name,
        phone: data.phone
      });
      setProfileStatus({ type: 'success', message: 'הפרופיל עודכן בהצלחה' });
    } catch (err: any) {
      setProfileStatus({ type: 'error', message: err.message || 'שגיאה בעדכון הפרופיל' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

   const onAddressSubmit = async (data: AddressFormInput) => {
     if (!user) return;
     setIsUpdatingPrefs(true);
     try {
       if (editingAddressId) {
         await updateAddress({
           addressId: editingAddressId as any,
           ...data,
           postalCode: data.postalCode || '',
         } as any);
       } else {
          await createAddress({
            userId: convexUser?._id as any,
            ...data,
            postalCode: data.postalCode || '',
          } as any);
       }
      closeAddressModal();
    } catch (err) {
      console.error('Failed to update addresses:', err);
    } finally {
      setIsUpdatingPrefs(false);
    }
  };

  const deleteAddress = async (id: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק כתובת זו?')) return;
    try {
      await removeAddress({ addressId: id as any });
    } catch (err) {
      console.error('Failed to delete address:', err);
    }
  };

  const openEditAddress = (address: Address) => {
    setEditingAddressId(address.id);
    resetAddress({
      name: address.name,
      street: address.street,
      city: address.city,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault || false
    });
    setIsAddressModalOpen(true);
  };

  const openNewAddress = () => {
    setEditingAddressId(null);
    resetAddress({
      name: '',
      street: '',
      city: '',
      postalCode: '',
      country: 'Israel',
      isDefault: false
    });
    setIsAddressModalOpen(true);
  };

  const closeAddressModal = () => {
    setIsAddressModalOpen(false);
    setEditingAddressId(null);
    resetAddress({
      name: '',
      street: '',
      city: '',
      postalCode: '',
      country: 'Israel',
      isDefault: false
    });
  };

  // Loading & Auth guards
  if (isUserLoading) {
    return <div className="min-h-screen flex items-center justify-center">טוען...</div>;
  }
  
  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <DashboardHeader user={user} onLogout={handleLogout} />
        
        <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {activeTab === 'orders' && (
              <OrdersTab orders={orders} isLoading={isOrdersLoading} />
            )}

            {activeTab === 'profile' && (
              <ProfileTab
                userEmail={user.email}
                register={registerProfile}
                errors={profileErrors}
                onSubmit={handleProfileSubmitHook(onProfileSubmit)}
                isUpdating={isUpdatingProfile || isUpdatingPrefs}
                status={profileStatus}
              />
            )}

            {activeTab === 'addresses' && (
              <AddressesTab
                addresses={addresses}
                isLoading={isPrefsLoading}
                onAddNew={openNewAddress}
                onEdit={openEditAddress}
                onDelete={deleteAddress}
              />
            )}
          </AnimatePresence>
        </div>

        <AddressModal
          isOpen={isAddressModalOpen}
          isEditing={!!editingAddressId}
          formMethods={addressFormMethods}
          isSubmitting={isUpdatingPrefs}
          onSubmit={addressFormMethods.handleSubmit(onAddressSubmit)}
          onClose={closeAddressModal}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
