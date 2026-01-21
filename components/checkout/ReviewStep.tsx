import React from 'react';
import { CartItem } from '../../types';

interface ReviewStepProps {
  formData: any;
  cartItems: CartItem[];
  handleSubmit: () => void;
  prevStep: () => void;
  isCreatingOrder: boolean;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ formData, cartItems, handleSubmit, prevStep, isCreatingOrder }) => {
  return (
    <>
      <h2 className="text-2xl font-bold mb-6">סיכום ואישור</h2>
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h3 className="font-bold mb-2 text-gray-900">משלוח אל:</h3>
          <p className="text-gray-600">{formData.name}</p>
          <p className="text-gray-600">{formData.street}, {formData.city}</p>
          <p className="text-gray-600">{formData.phone}</p>
        </div>
        <div>
          <h3 className="font-bold mb-4 text-gray-900">הפריטים שלך:</h3>
          <div className="space-y-3">
            {cartItems.map((item, index) => (
              <div key={item.id || item.productId || `review-item-${index}`} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <img src={item.imgSrc} alt={item.title} className="w-12 h-16 object-cover rounded" />
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.quantity} יחידות</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${item.originalPrice ? 'text-red-600' : 'text-gray-900'}`}>
                    ₪{item.price * item.quantity}
                  </p>
                  {item.originalPrice && (
                    <p className="text-[10px] text-gray-400 line-through">
                      ₪{item.originalPrice * item.quantity}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-4 mt-8">
        <button onClick={prevStep} className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-bold cursor-pointer">
          חזרה
        </button>
        <button 
          onClick={handleSubmit} 
          disabled={isCreatingOrder}
          className="flex-1 bg-secondary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer"
        >
          {isCreatingOrder ? 'מעבד...' : 'בצע הזמנה'}
        </button>
      </div>
    </>
  );
};

export default ReviewStep;
