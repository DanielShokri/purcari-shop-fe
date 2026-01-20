import React, { useState, useEffect } from 'react';
import { useGetMyOrdersQuery } from '../services/api/ordersApi';
import { 
  useGetCurrentUserQuery, 
  useLogoutMutation, 
  useUpdateProfileMutation,
  useGetUserPrefsQuery,
  useUpdateUserPrefsMutation 
} from '../services/api/authApi';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LogOut, 
  Package, 
  Clock, 
  ChevronLeft, 
  User as UserIcon, 
  MapPin, 
  Settings, 
  Plus, 
  Trash2, 
  Edit2,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Address } from '../types';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AddressAutocomplete from '../components/common/AddressAutocomplete';
import { 
  profileSchema, 
  addressFormSchema, 
  ProfileInput, 
  AddressFormInput 
} from '../schemas/validationSchemas';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses'>('orders');
  
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

  const { 
    register: registerAddress, 
    handleSubmit: handleAddressSubmitHook, 
    formState: { errors: addressErrors },
    reset: resetAddress,
    setValue: setAddressValue
  } = addressFormMethods;

  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name || '',
        phone: user.phone || ''
      });
    }
  }, [user, resetProfile]);

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

  if (isUserLoading) return <div className="min-h-screen flex items-center justify-center">טוען...</div>;
  if (!user) {
    navigate('/login');
    return null;
  }

  const tabs = [
    { id: 'orders', label: 'ההזמנות שלי', icon: Package },
    { id: 'profile', label: 'פרטים אישיים', icon: Settings },
    { id: 'addresses', label: 'ניהול כתובות', icon: MapPin },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Profile Header */}
        <div className="bg-white p-8 rounded-3xl shadow-sm mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4 text-right">
            <div className="bg-gray-100 p-4 rounded-full text-secondary">
              <UserIcon size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 mt-1">
                <p className="text-gray-500 flex items-center gap-1">
                  <Mail size={14} />
                  {user.email}
                </p>
                {user.phone && (
                  <p className="text-gray-500 flex items-center gap-1">
                    <Phone size={14} />
                    <span dir="ltr">{user.phone}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-500 hover:text-red-600 font-medium transition-colors border border-gray-200 px-4 py-2 rounded-xl"
          >
            <LogOut size={18} />
            התנתקות
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 font-bold transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab.id 
                ? 'border-secondary text-secondary' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {activeTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {isOrdersLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse" />
                    ))}
                  </div>
                ) : orders && orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div 
                        key={order.$id}
                        className="bg-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-gray-50 p-3 rounded-xl text-gray-400">
                            <Clock size={24} />
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">הזמנה #{order.$id.slice(-6).toUpperCase()}</p>
                            <p className="text-sm text-gray-500">{new Date(order.$createdAt).toLocaleDateString('he-IL')}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-8">
                          <div className="text-right">
                            <p className="text-xs text-gray-500 mb-1 text-center md:text-right">סה"כ</p>
                            <p className="font-bold text-secondary">₪{order.total}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 mb-1 text-center md:text-right">סטטוס</p>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              order.status === 'completed' ? 'bg-green-100 text-green-700' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {order.status === 'pending' ? 'בהמתנה' : 
                               order.status === 'processing' ? 'בטיפול' :
                               order.status === 'shipped' ? 'נשלח' :
                               order.status === 'completed' ? 'הושלם' : 'בוטל'}
                            </span>
                          </div>
                          <Link 
                            to={`/order-confirmation/${order.$id}`} 
                            className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-secondary hover:bg-red-50 transition-all"
                          >
                            <ChevronLeft size={20} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-12 rounded-3xl text-center shadow-sm">
                    <Package size={48} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-500 mb-6">עדיין לא ביצעת הזמנות</p>
                    <Link to="/products" className="bg-secondary text-white px-8 py-3 rounded-full font-bold">
                      עבור לחנות
                    </Link>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white p-8 rounded-3xl shadow-sm"
              >
                <h3 className="text-xl font-bold mb-6">עריכת פרטים אישיים</h3>
                
                {profileStatus && (
                  <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                    profileStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {profileStatus.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    {profileStatus.message}
                  </div>
                )}

                <form onSubmit={handleProfileSubmitHook(onProfileSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">שם מלא <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <UserIcon className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          {...registerProfile('name')}
                          className={`w-full ps-10 pe-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all ${profileErrors.name ? 'border-red-500' : ''}`}
                          placeholder="ישראל ישראלי"
                        />
                      </div>
                      {profileErrors.name && <p className="text-red-500 text-xs mt-1">{profileErrors.name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">טלפון נייד <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Phone className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="tel"
                          {...registerProfile('phone')}
                          className={`w-full ps-10 pe-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all text-left ${profileErrors.phone ? 'border-red-500' : ''}`}
                          placeholder="050-0000000"
                          dir="ltr"
                        />
                      </div>
                      {profileErrors.phone && <p className="text-red-500 text-xs mt-1">{profileErrors.phone.message}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">כתובת אימייל</label>
                      <div className="relative">
                        <Mail className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="email"
                          value={user.email}
                          disabled
                          className="w-full ps-10 pe-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-500 cursor-not-allowed outline-none text-left"
                          dir="ltr"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-400">לא ניתן לשנות כתובת אימייל</p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingProfile || isUpdatingPrefs}
                    className="bg-secondary text-white px-8 py-3 rounded-xl font-bold hover:bg-red-900 transition-colors disabled:opacity-50"
                  >
                    {isUpdatingProfile ? 'מעדכן...' : 'שמירת שינויים'}
                  </button>
                </form>
              </motion.div>
            )}

            {activeTab === 'addresses' && (
              <motion.div
                key="addresses"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">הכתובות שלי</h3>
                  <button
                    onClick={() => {
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
                    }}
                    className="flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-xl font-bold hover:bg-red-900 transition-colors"
                  >
                    <Plus size={18} />
                    הוספת כתובת
                  </button>
                </div>

                {isPrefsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map(i => (
                      <div key={i} className="h-40 bg-gray-200 rounded-2xl animate-pulse" />
                    ))}
                  </div>
                ) : prefs?.addresses && prefs.addresses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {prefs.addresses.map((address) => (
                      <div 
                        key={address.id}
                        className={`bg-white p-6 rounded-2xl shadow-sm border-2 transition-all ${
                          address.isDefault ? 'border-secondary/20 bg-red-50/10' : 'border-transparent'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="bg-gray-50 p-2 rounded-lg text-secondary">
                            <MapPin size={20} />
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => openEditAddress(address)}
                              className="p-2 text-gray-400 hover:text-secondary hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => deleteAddress(address.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <h4 className="font-bold text-gray-900 mb-1">
                          {address.name}
                          {address.isDefault && (
                            <span className="ms-2 text-[10px] bg-secondary text-white px-2 py-0.5 rounded-full uppercase tracking-wider">ברירת מחדל</span>
                          )}
                        </h4>
                        <p className="text-gray-500 text-sm">{address.street}</p>
                        <p className="text-gray-500 text-sm">{address.city}, {address.postalCode}</p>
                        <p className="text-gray-500 text-sm">{address.country}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-12 rounded-3xl text-center shadow-sm">
                    <MapPin size={48} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-500">טרם הוספת כתובות למשלוח</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Address Modal */}
        {isAddressModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-xl"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-bold">{editingAddressId ? 'עריכת כתובת' : 'הוספת כתובת חדשה'}</h3>
                <button onClick={() => setIsAddressModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>
              <FormProvider {...addressFormMethods}>
                <form onSubmit={handleAddressSubmitHook(onAddressSubmit) as any} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">כינוי לכתובת (בית, עבודה וכו') <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      {...registerAddress('name')}
                      className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all ${addressErrors.name ? 'border-red-500' : ''}`}
                      placeholder="לדוגמה: הבית שלי"
                    />
                    {addressErrors.name && <p className="text-red-500 text-xs mt-1">{addressErrors.name.message}</p>}
                  </div>
                  <div>
                    <AddressAutocomplete 
                      name="street" 
                      label="רחוב ומספר בית" 
                      placeholder="רחוב הירקון 1"
                      error={addressErrors.street?.message}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">עיר <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      {...registerAddress('city')}
                      className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all ${addressErrors.city ? 'border-red-500' : ''}`}
                      placeholder="תל אביב"
                    />
                    {addressErrors.city && <p className="text-red-500 text-xs mt-1">{addressErrors.city.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">מיקוד</label>
                    <input
                      type="text"
                      {...registerAddress('postalCode')}
                      className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all ${addressErrors.postalCode ? 'border-red-500' : ''}`}
                      placeholder="1234567"
                    />
                    {addressErrors.postalCode && <p className="text-red-500 text-xs mt-1">{addressErrors.postalCode.message}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 py-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    {...registerAddress('isDefault')}
                    className="w-5 h-5 rounded border-gray-300 text-secondary focus:ring-secondary"
                  />
                  <label htmlFor="isDefault" className="text-sm font-medium text-gray-700 cursor-pointer">
                    הגדרה ככתובת ברירת מחדל
                  </label>
                </div>
                <div className="pt-4 flex gap-3">
                  <button
                    type="submit"
                    disabled={isUpdatingPrefs}
                    className="flex-1 bg-secondary text-white py-3 rounded-xl font-bold hover:bg-red-900 transition-colors disabled:opacity-50"
                  >
                    {isUpdatingPrefs ? 'שומר...' : (editingAddressId ? 'עדכון כתובת' : 'שמירת כתובת')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(false)}
                    className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                  >
                    ביטול
                  </button>
                </div>
              </form>
            </FormProvider>
          </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
