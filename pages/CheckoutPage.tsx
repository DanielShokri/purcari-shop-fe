import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectCartItems, selectCartTotal, clearCart } from '../store/slices/cartSlice';
import { useCreateOrderMutation } from '../services/api/ordersApi';
import { useValidateCouponQuery } from '../services/api/couponsApi';
import { useTrackEventMutation } from '../services/api/analyticsApi';
import { useGetCurrentUserQuery } from '../services/api/authApi';
import { ShoppingBag } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

import CheckoutProgressBar from '../components/checkout/CheckoutProgressBar';
import ShippingStep from '../components/checkout/ShippingStep';
import PaymentStep from '../components/checkout/PaymentStep';
import ReviewStep from '../components/checkout/ReviewStep';
import OrderSummarySidebar from '../components/checkout/OrderSummarySidebar';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const cartTotal = useAppSelector(selectCartTotal);
  const { data: user } = useGetCurrentUserQuery();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
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
  });

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.name,
        email: prev.email || user.email,
      }));
    }
  }, [user]);

  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [trackEvent] = useTrackEventMutation();
  const { data: couponData, error: couponError } = useValidateCouponQuery(
    { code: formData.couponCode, cartTotal },
    { skip: !formData.couponCode }
  );

  const discount = couponData ? (couponData.discountType === 'percentage' ? (cartTotal * couponData.discountValue / 100) : couponData.discountValue) : 0;
  const total = cartTotal - discount;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const orderResult = await createOrder({
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: {
          street: formData.street,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
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
      navigate(`/order-confirmation/${orderResult.$id}`);
    } catch (err) {
      console.error('Failed to create order:', err);
    }
  };

  if (cartItems.length === 0 && step !== 4) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-6" />
        <h2 className="text-2xl font-bold mb-4">סל הקניות שלך ריק</h2>
        <button onClick={() => navigate('/products')} className="bg-secondary text-white px-8 py-3 rounded-full font-bold">
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
            <AnimatePresence mode="wait">
              {step === 1 && (
                <ShippingStep 
                  key="step1" 
                  formData={formData} 
                  handleInputChange={handleInputChange} 
                  nextStep={nextStep} 
                  user={user} 
                />
              )}

              {step === 2 && (
                <PaymentStep 
                  key="step2" 
                  formData={formData} 
                  handleInputChange={handleInputChange} 
                  nextStep={nextStep} 
                  prevStep={prevStep} 
                />
              )}

              {step === 3 && (
                <ReviewStep 
                  key="step3" 
                  formData={formData} 
                  cartItems={cartItems} 
                  handleSubmit={handleSubmit} 
                  prevStep={prevStep} 
                  isCreatingOrder={isCreatingOrder} 
                />
              )}
            </AnimatePresence>
          </div>

          <OrderSummarySidebar 
            cartItems={cartItems}
            cartTotal={cartTotal}
            discount={discount}
            total={total}
            couponCode={formData.couponCode}
            handleInputChange={handleInputChange}
            couponError={couponError}
            couponData={couponData}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
