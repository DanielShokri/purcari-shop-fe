import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetOrderByIdQuery } from '../services/api/ordersApi';
import { CheckCircle, Package, Truck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: orderData, isLoading } = useGetOrderByIdQuery(id || '');

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">טוען פרטי הזמנה...</div>;
  if (!orderData) return <div className="min-h-screen flex items-center justify-center">הזמנה לא נמצאה</div>;

  const { order, items } = orderData;

  return (
    <div className="bg-gray-50 min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 rounded-3xl shadow-xl text-center"
        >
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold mb-2">תודה על הזמנתך!</h1>
          <p className="text-gray-500 mb-8">מספר הזמנה: #{order.$id.slice(-6).toUpperCase()}</p>
          
          <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-right">
            <h3 className="font-bold mb-4 border-b pb-2">סיכום הזמנה</h3>
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.$id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <img src={item.productImage || ''} alt={item.productName} className="w-10 h-14 object-cover rounded" />
                    <span>{item.productName} x {item.quantity}</span>
                  </div>
                  <span className="font-bold">₪{item.total}</span>
                </div>
              ))}
              <div className="pt-4 border-t flex justify-between font-bold text-lg">
                <span>סה"כ לתשלום</span>
                <span>₪{order.total}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white border border-gray-100 p-4 rounded-xl flex flex-col items-center">
              <Package className="text-secondary mb-2" size={24} />
              <span className="text-xs text-gray-500">סטטוס</span>
              <span className="font-bold text-sm">מעובד</span>
            </div>
            <div className="bg-white border border-gray-100 p-4 rounded-xl flex flex-col items-center">
              <Truck className="text-secondary mb-2" size={24} />
              <span className="text-xs text-gray-500">משלוח</span>
              <span className="font-bold text-sm">3-5 ימי עסקים</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link to="/products" className="bg-secondary text-white py-4 rounded-xl font-bold hover:bg-red-900 transition-colors">
              המשך בקניות
            </Link>
            <Link to="/" className="text-gray-500 text-sm font-medium flex items-center justify-center gap-1 hover:text-gray-900 transition-colors">
              חזרה לדף הבית
              <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
