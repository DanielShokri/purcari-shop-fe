import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useGetMyOrdersQuery } from '../services/api/ordersApi';
import { 
  useGetCurrentUserQuery, 
  useLogoutMutation, 
  useUpdateProfileMutation,
  useGetUserPrefsQuery,
  useUpdateUserPrefsMutation 
} from '../services/api/authApi';

import { Address } from '../types';
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

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('orders');
  
  // Queries & Mutations
  const { data: user, isLoading: isUserLoading } = useGetCurrentUserQuery();
  const { data: orders, isLoading: isOrdersLoading } = useGetMyOrdersQuery(undefined, {
    skip: !user
  });
  const { data: prefs, isLoading: isPrefsLoading } = useGetUserPrefsQuery(undefined, {
    skip: !user
  });
  
  const [logout] = useLogoutMutation();
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [updatePrefs, { isLoading: isUpdatingPrefs }] = useUpdateUserPrefsMutation();

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
    await logout().unwrap();
    navigate('/login');
  };

  const onProfileSubmit = async (data: ProfileInput) => {
    setProfileStatus(null);
    try {
      await updateProfile({ 
        name: data.name,
        phone: data.phone
      }).unwrap();
      setProfileStatus({ type: 'success', message: 'הפרופיל עודכן בהצלחה' });
    } catch (err: any) {
      setProfileStatus({ type: 'error', message: err.message || 'שגיאה בעדכון הפרופיל' });
    }
  };

  const onAddressSubmit = async (data: AddressFormInput) => {
    try {
      const currentAddresses = prefs?.addresses || [];
      let updatedAddresses: Address[];

      if (editingAddressId) {
        updatedAddresses = currentAddresses.map(addr => 
          addr.id === editingAddressId ? { ...data, id: editingAddressId } as Address : addr
        );
      } else {
        const newAddress: Address = {
          ...data,
          id: Math.random().toString(36).substring(7)
        } as Address;
        updatedAddresses = [...currentAddresses, newAddress];
      }

      // If set as default, unset others
      if (data.isDefault) {
        const targetId = editingAddressId || updatedAddresses[updatedAddresses.length-1].id;
        updatedAddresses = updatedAddresses.map(addr => ({
          ...addr,
          isDefault: addr.id === targetId
        }));
      }

      await updatePrefs({ ...prefs, addresses: updatedAddresses }).unwrap();
      closeAddressModal();
    } catch (err) {
      console.error('Failed to update addresses:', err);
    }
  };

  const deleteAddress = async (id: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק כתובת זו?')) return;
    try {
      const updatedAddresses = (prefs?.addresses || []).filter(addr => addr.id !== id);
      await updatePrefs({ ...prefs, addresses: updatedAddresses }).unwrap();
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
                addresses={prefs?.addresses}
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
