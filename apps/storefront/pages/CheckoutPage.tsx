import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import useToast from '../store/hooks/useToast';
import { selectCartItems, clearCart, useCartSummaryWithRules, useCouponFlow } from '../store/slices/cartSlice';
import { useMutation, useQuery, useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useTrackCheckoutStart, useTrackCheckoutStep } from '../hooks/useAnalytics';
import { ShoppingBag } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkoutSchema, CheckoutInput } from '../schemas/validationSchemas';
import { Id } from '../../../convex/_generated/dataModel';

import CheckoutProgressBar from '../components/checkout/CheckoutProgressBar';
import ShippingStep from '../components/checkout/ShippingStep';
import ReviewStep from '../components/checkout/ReviewStep';
import PaymentStep from '../components/checkout/PaymentStep';
import OrderSummarySidebar from '../components/checkout/OrderSummarySidebar';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const toast = useToast();
  // Use the new hook that triggers cart rules fetch
  const cartSummary = useCartSummaryWithRules();
  const { items: cartItems, subtotal, shipping, validationErrors, appliedBenefits, discount: automaticDiscount } = cartSummary;
  
  const user = useQuery(api.users.get);
  const addresses = useQuery(api.userAddresses.list, user ? { userId: user._id } : "skip");
  
  // 3 steps: 1 = Shipping, 2 = Review, 3 = Payment (iframe)
  const [step, setStep] = useState(1);

  // Payment state
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<Id<"orders"> | null>(null);

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
    }
  });

  const { watch, setValue, trigger } = methods;

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
  const createPaymentPage = useAction(api.rivhit.createPaymentPage);
  
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  
  const { trackCheckoutStart } = useTrackCheckoutStart();
  const { trackCheckoutStep } = useTrackCheckoutStep();
  const hasTrackedCheckout = useRef(false);
  const hasTrackedStep = useRef<number>(0);

  // Track checkout start when page loads with items
  useEffect(() => {
    if (cartItems.length > 0 && !hasTrackedCheckout.current) {
      hasTrackedCheckout.current = true;
      trackCheckoutStart(
        `checkout_${Date.now()}`,
        cartItems.length,
        subtotal
      );
    }
  }, [cartItems.length, subtotal, trackCheckoutStart]);

  // Track checkout step changes (now 3 steps)
  useEffect(() => {
    if (cartItems.length > 0 && step !== hasTrackedStep.current) {
      hasTrackedStep.current = step;
      const stepNames: Record<number, "shipping" | "payment" | "review" | "confirmation"> = {
        1: "shipping",
        2: "review",
        3: "payment",
      };
      trackCheckoutStep(
        stepNames[step],
        step,
        3, // Total steps now 3
        subtotal,
        cartItems.length
      );
    }
  }, [step, cartItems.length, subtotal, trackCheckoutStep]);

  // Calculate total discount (automatic + applied coupon)
  const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const totalDiscount = automaticDiscount + couponDiscount;
  const total = Math.max(0, subtotal + shipping - totalDiscount);

  // Step 1 -> Step 2: Validate shipping fields
  const nextStep = async () => {
    if (validationErrors.length > 0) {
      toast.error(validationErrors[0]);
      return;
    }

    const fieldsToValidate: (keyof CheckoutInput)[] = ['name', 'email', 'phone', 'street', 'city', 'postalCode'];

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(2);
    }
  };

  const prevStep = () => {
    if (step === 3) {
      // Going back from payment to review
      setStep(2);
      // Reset payment state
      setPaymentUrl(null);
      setPaymentError(null);
    } else if (step === 2) {
      setStep(1);
    }
  };

  /**
   * Step 2 -> Step 3: Create order and get payment URL
   * Called when user clicks "Proceed to Payment" on the Review step
   */
  const handleProceedToPayment = async () => {
    const formData = watch();
    
    try {
      setIsCreatingOrder(true);
      setPaymentError(null);

      // 1. Create the order first (with pending payment status)
      const orderId = await createOrder({
        customerId: user?._id,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: {
          street: formData.street,
          city: formData.city,
          postalCode: formData.postalCode || '',
          country: formData.country,
        },
        payment: {
          method: 'Rivhit',
          transactionId: 'pending',
          chargeDate: new Date().toISOString(),
        },
        items: cartItems.map(item => ({
          productId: item.productId as any,
          productName: item.title,
          productImage: item.imgSrc,
          quantity: BigInt(item.quantity),
          price: item.price,
        })),
        // Pre-calculated totals from the cart rules engine
        subtotal,
        shippingCost: shipping,
        discount: totalDiscount,
        total,
        // Add coupon snapshot if applied
        ...(appliedCoupon && {
          appliedCouponCode: appliedCoupon.code,
          appliedCouponDiscount: appliedCoupon.discountAmount,
        }),
      });

      setCurrentOrderId(orderId);
      setIsCreatingOrder(false);
      setIsLoadingPayment(true);

      // 2. Call iCredit to create payment page
      const result = await createPaymentPage({ orderId });

      if (result.success && result.paymentUrl) {
        // Success - show payment iframe
        setPaymentUrl(result.paymentUrl);
        setStep(3);
      } else {
        // Payment page creation failed
        setPaymentError(result.error || 'שגיאה ביצירת עמוד התשלום');
      }
    } catch (err) {
      console.error('Failed to process payment:', err);
      setPaymentError(err instanceof Error ? err.message : 'שגיאה בעיבוד התשלום');
    } finally {
      setIsCreatingOrder(false);
      setIsLoadingPayment(false);
    }
  };

  const handleRetryPayment = async () => {
    if (!currentOrderId) {
      // No order exists yet, retry from order creation
      handleProceedToPayment();
      return;
    }

    // Order exists, just retry getting payment URL
    try {
      setPaymentError(null);
      setIsLoadingPayment(true);

      const result = await createPaymentPage({ orderId: currentOrderId });

      if (result.success && result.paymentUrl) {
        setPaymentUrl(result.paymentUrl);
        setStep(3);
      } else {
        setPaymentError(result.error || 'שגיאה ביצירת עמוד התשלום');
      }
    } catch (err) {
      console.error('Failed to retry payment:', err);
      setPaymentError(err instanceof Error ? err.message : 'שגיאה בעיבוד התשלום');
    } finally {
      setIsLoadingPayment(false);
    }
  };

  // Listen for payment completion via postMessage from iCredit iframe
  // Note: iCredit typically uses URL redirect, not postMessage, so this is a backup
  useEffect(() => {
    const handlePaymentMessage = (event: MessageEvent) => {
      // Only handle messages from iCredit domains (test and production)
      const isIcreditOrigin = event.origin.includes('icredit.rivhit.co.il') || 
                              event.origin.includes('testicredit.rivhit.co.il');
      
      if (!isIcreditOrigin) return;
      
      console.log('[iCredit] Payment message received:', event.data);
      
      // Only redirect if we receive a specific payment completion message
      // Check for explicit success indicators in the message data
      const data = event.data;
      const isPaymentComplete = data && (
        data.status === 'success' || 
        data.Status === 0 || 
        data.type === 'payment_complete'
      );
      
      if (isPaymentComplete && currentOrderId) {
        dispatch(clearCart());
        navigate(`/order-confirmation/${currentOrderId}`);
      }
    };

    window.addEventListener('message', handlePaymentMessage);
    return () => window.removeEventListener('message', handlePaymentMessage);
  }, [currentOrderId, dispatch, navigate]);

  if (cartItems.length === 0) {
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
              <form onSubmit={(e) => e.preventDefault()}>
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <ShippingStep 
                      key="step1" 
                      nextStep={nextStep} 
                      user={user} 
                    />
                  )}

                  {step === 2 && (
                    <ReviewStep 
                      key="step2"
                      formData={watch()}
                      cartItems={cartItems}
                      handleSubmit={handleProceedToPayment}
                      prevStep={prevStep}
                      isCreatingOrder={isCreatingOrder || isLoadingPayment}
                      paymentError={paymentError}
                      onRetry={handleRetryPayment}
                    />
                  )}

                  {step === 3 && (
                    <PaymentStep 
                      key="step3"
                      paymentUrl={paymentUrl}
                      isLoadingUrl={isLoadingPayment}
                      paymentError={paymentError}
                      onRetry={handleRetryPayment}
                      prevStep={prevStep}
                      total={total}
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
