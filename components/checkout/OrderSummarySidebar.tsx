import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { CartItem } from '../../types';

interface OrderSummarySidebarProps {
  cartItems: CartItem[];
  cartTotal: number;
  discount: number;
  total: number;
  couponCode: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  couponError: any;
  couponData: any;
}

const OrderSummarySidebar: React.FC<OrderSummarySidebarProps> = ({ 
  cartItems, 
  cartTotal, 
  discount, 
  total, 
  couponCode, 
  handleInputChange, 
  couponError, 
  couponData 
}) => {
  return (
    <div className="lg:col-span-1">
      <div className="bg-white p-6 rounded-2xl shadow-sm sticky top-24">
        <h3 className="font-bold text-lg mb-6 border-b pb-4">סיכום הזמנה</h3>
        
        {/* Added Cart Items List */}
        <div className="space-y-4 mb-6 border-b pb-6 max-h-[300px] overflow-y-auto custom-scrollbar">
          {cartItems.map((item) => (
            <div key={item.productId} className="flex gap-3">
              <div className="w-12 h-16 bg-gray-50 rounded overflow-hidden flex-shrink-0 border border-gray-100">
                <img src={item.imgSrc} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-center min-w-0">
                <h4 className="text-xs font-bold text-gray-800 truncate">{item.title}</h4>
                <p className="text-[10px] text-gray-500">כמות: {item.quantity}</p>
                <p className="text-xs font-bold text-secondary mt-1">₪{item.price * item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between text-gray-600">
            <span>סכום ביניים</span>
            <span>₪{cartTotal}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-red-600 font-medium">
              <span>הנחה</span>
              <span>-₪{discount}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>משלוח</span>
            <span className="text-green-600">חינם</span>
          </div>
          <div className="flex justify-between text-xl font-bold pt-4 border-t">
            <span>סה"כ</span>
            <span>₪{total}</span>
          </div>
        </div>

        <div className="mt-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">קוד קופון</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              name="couponCode" 
              value={couponCode} 
              onChange={handleInputChange}
              placeholder="הכנס קוד..."
              className="flex-1 border-gray-300 rounded-lg p-2 text-sm border focus:ring-secondary focus:border-secondary" 
            />
          </div>
          {couponError && (
            <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
              <AlertCircle size={12} />
              {typeof couponError === 'string' ? couponError : 'קוד לא תקין'}
            </p>
          )}
          {couponData && (
            <p className="text-green-600 text-xs mt-2 flex items-center gap-1">
              <CheckCircle2 size={12} />
              קופון הוחל בהצלחה!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderSummarySidebar;
