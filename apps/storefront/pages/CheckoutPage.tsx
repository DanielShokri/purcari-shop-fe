import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { useToast } from '../hooks/useToast';
import { selectCartItems, clearCart, useCartSummaryWithRules } from '../store/slices/cartSlice';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
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
  // Use the new hook that triggers cart rules fetch
  const cartSummary = useCartSummaryWithRules();
  const { items: cartItems, subtotal, shipping, validationErrors, appliedBenefits, discount: automaticDiscount } = cartSummary;
  
  const user = useQuery(api.users.get);
  const addresses = useQuery(api.addresses.listByUserId, user ? { userId: user._id } : "skip");
  
   const [step, setStep] = useState(1);

   // Initialize coupon flow
   const {
     validationState,
     validationError,
     appliedCoupon,
     handleValidateCoupon,
     handleApplyCoupon,
     handleRemoveCoupon,
   } = useCouponFlow();

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
     }
   });

   const { watch, setValue, trigger, handleSubmit } = methods;

   // Pre-fill form if user is logged in
  useEffect(() => {
    if (user) {
      setValue('name', user.name || '');
      setValue('email', user.email || '');
      if (user.phone) setValue('phone', user.phone);
    }
    
    if (addresses && addresses.length > 0) {
      const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
      setValue('street', defaultAddr.street);
      setValue('city', defaultAddr.city);
      setValue('postalCode', defaultAddr.postalCode);
      setValue('country', defaultAddr.country);
    }
  }, [user, addresses, setValue]);

   const createOrder = useMutation(api.orders.create);
   const [isCreatingOrder, setIsCreatingOrder] = useState(false);
   // TrackEvent replaced by manual call or analytics utility if needed
   const trackEvent = (payload: any) => console.log('Track event:', payload);

   // Calculate total discount (automatic + applied coupon)
   const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
   const totalDiscount = automaticDiscount + couponDiscount;
   const total = Math.max(0, subtotal + shipping - totalDiscount);

   const nextStep = async () => {
     if (validationErrors.length > 0) {
       toast.error({
         title: "שגיאה",
         description: validationErrors[0],
       });
       return;
     }

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
        setIsCreatingOrder(true);
        const orderId = await createOrder({
          customerId: user?._id,
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
            productId: item.productId as any, // Convex IDs need proper casting if they come from strings
            productName: item.title,
            productImage: item.imgSrc,
            quantity: BigInt(item.quantity),
            price: item.price,
          })),
          // Add coupon snapshot if applied
          ...(appliedCoupon && {
            appliedCouponCode: appliedCoupon.code,
            appliedCouponDiscount: appliedCoupon.discountAmount,
          }),
        });

        trackEvent({ type: 'checkout' });
        dispatch(clearCart());
         toast.success({
           title: "בחזקת!",
           description: 'ההזמנה בוצעה בהצלחה!',
         });
         navigate(`/order-confirmation/${orderId}`);
       } catch (err) {
         console.error('Failed to create order:', err);
         toast.error({
           title: "שגיאה",
           description: 'שגיאה ביצירת ההזמנה, נסה שוב',
         });
      } finally {
        setIsCreatingOrder(false);
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

        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-bold">שים לב:</p>
            <ul className="list-disc list-inside">
              {validationErrors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {appliedBenefits.length > 0 && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-bold">הטבות פעילות:</p>
            <ul className="list-disc list-inside">
              {appliedBenefits.map((benefit, idx) => (
                <li key={idx}>{benefit}</li>
              ))}
            </ul>
          </div>
        )}

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
             discount={totalDiscount}
             total={total}
             appliedCoupon={appliedCoupon}
             validationState={validationState}
             validationError={validationError}
             onValidateCoupon={handleValidateCoupon}
             onApplyCoupon={handleApplyCoupon}
             onRemoveCoupon={handleRemoveCoupon}
           />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
