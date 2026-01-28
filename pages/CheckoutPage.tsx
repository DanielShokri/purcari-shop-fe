import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch, useToast } from '../store/hooks';
import { selectCartItems, selectCartSubtotal, selectShippingCost, clearCart } from '../store/slices/cartSlice';
import { useCreateOrderMutation } from '../services/api/ordersApi';
import { useValidateCouponQuery } from '../services/api/couponsApi';
import { useTrackEventMutation } from '../services/api/analyticsApi';
import { useGetCurrentUserQuery, useGetUserPrefsQuery } from '../services/api/authApi';
import { ShoppingBag } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkoutSchema, CheckoutInput } from '../schemas/validationSchemas';

import CheckoutProgressBar from '../components/checkout/CheckoutProgressBar';
import ShippingStep from '../components/checkout/ShippingStep';
import PaymentStep from '../components/checkout/PaymentStep';
import ReviewStep from '../components/checkout/ReviewStep';
import OrderSummarySidebar from '../components/checkout/OrderSummarySidebar';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const cartItems = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const shipping = useAppSelector(selectShippingCost);
  const { data: user } = useGetCurrentUserQuery();
  const { data: prefs } = useGetUserPrefsQuery(undefined, { skip: !user });
  
  const [step, setStep] = useState(1);
  const prevCouponDataRef = useRef<typeof couponData>(undefined);
  const prevCouponErrorRef = useRef<typeof couponError>(undefined);

  const methods = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      street: '',
      city: '',
      postalCode: '',
      country: 'Israel',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      couponCode: '',
    }
  });

  const { watch, setValue, trigger, handleSubmit } = methods;
  const couponCode = watch('couponCode');

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (user) {
      setValue('name', user.name || '');
      setValue('email', user.email || '');
      if (user.phone) setValue('phone', user.phone);
    }
    
    if (prefs?.addresses && prefs.addresses.length > 0) {
      const defaultAddr = prefs.addresses.find(a => a.isDefault) || prefs.addresses[0];
      setValue('street', defaultAddr.street);
      setValue('city', defaultAddr.city);
      setValue('postalCode', defaultAddr.postalCode);
      setValue('country', defaultAddr.country);
    }
  }, [user, prefs, setValue]);

  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [trackEvent] = useTrackEventMutation();
  const { data: couponData, error: couponError } = useValidateCouponQuery(
    { code: couponCode || '', cartTotal: subtotal },
    { skip: !couponCode }
  );

  // Show toast when coupon status changes
  useEffect(() => {
    if (couponData && couponData !== prevCouponDataRef.current) {
      toast.success('הקופון הופעל בהצלחה');
    }
    prevCouponDataRef.current = couponData;
  }, [couponData, toast]);

  useEffect(() => {
    if (couponError && couponError !== prevCouponErrorRef.current && couponCode) {
      toast.error('קוד קופון לא תקף');
    }
    prevCouponErrorRef.current = couponError;
  }, [couponError, couponCode, toast]);

  const discount = couponData ? (couponData.discountType === 'percentage' ? (subtotal * couponData.discountValue / 100) : couponData.discountValue) : 0;
  const total = subtotal + shipping - discount;

  const nextStep = async () => {
    let fieldsToValidate: (keyof CheckoutInput)[] = [];
    if (step === 1) {
      fieldsToValidate = ['name', 'email', 'phone', 'street', 'city', 'postalCode'];
    } else if (step === 2) {
      fieldsToValidate = ['cardNumber', 'expiryDate', 'cvv'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(s => s + 1);
    }
  };

  const prevStep = () => setStep(s => s - 1);

  const onSubmit = async (data: CheckoutInput) => {
    try {
      const orderResult = await createOrder({
        customerName: data.name,
        customerEmail: data.email,
        customerPhone: data.phone,
        shippingAddress: {
          street: data.street,
          city: data.city,
          postalCode: data.postalCode || '',
          country: data.country,
        },
        payment: {
          method: 'Credit Card',
          transactionId: `mock_${Date.now()}`,
          chargeDate: new Date().toISOString(),
        },
        items: cartItems.map(item => ({
          productId: item.productId,
          productName: item.title,
          productImage: item.imgSrc,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
      }).unwrap();

      trackEvent({ type: 'checkout' });
      dispatch(clearCart());
      toast.success('ההזמנה בוצעה בהצלחה!');
      navigate(`/order-confirmation/${orderResult.$id}`);
    } catch (err) {
      console.error('Failed to create order:', err);
      toast.error('שגיאה ביצירת ההזמנה, נסה שוב');
    }
  };

  if (cartItems.length === 0 && step !== 4) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-6" />
        <h2 className="text-2xl font-bold mb-4">סל הקניות שלך ריק</h2>
        <button onClick={() => navigate('/products')} className="bg-secondary text-white px-8 py-3 rounded-full font-bold cursor-pointer">
          חזרה לחנות
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <CheckoutProgressBar currentStep={step} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Area */}
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm">
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <ShippingStep 
                      key="step1" 
                      nextStep={nextStep} 
                      user={user} 
                    />
                  )}

                  {step === 2 && (
                    <PaymentStep 
                      key="step2" 
                      nextStep={nextStep} 
                      prevStep={prevStep} 
                    />
                  )}

                  {step === 3 && (
                    <ReviewStep 
                      key="step3" 
                      formData={watch()} 
                      cartItems={cartItems} 
                      handleSubmit={() => handleSubmit(onSubmit)()} 
                      prevStep={prevStep} 
                      isCreatingOrder={isCreatingOrder} 
                    />
                  )}
                </AnimatePresence>
              </form>
            </FormProvider>
          </div>

          <OrderSummarySidebar 
            cartItems={cartItems}
            subtotal={subtotal}
            shipping={shipping}
            discount={discount}
            total={total}
            couponCode={couponCode || ''}
            handleInputChange={(e) => setValue('couponCode', e.target.value)}
            couponError={couponError}
            couponData={couponData}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
