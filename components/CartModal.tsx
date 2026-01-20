import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectCartItems, selectCartTotal, removeFromCart, updateQuantity } from '../store/slices/cartSlice';
import { closeCartModal } from '../store/slices/uiSlice';
import { X, Trash2, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CartModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={() => dispatch(closeCartModal())}
      />
      
      {/* Panel */}
      <motion.div 
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute top-0 end-0 w-full max-w-md h-full bg-white shadow-2xl flex flex-col"
      >
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">סל הקניות</h2>
          <button 
            onClick={() => dispatch(closeCartModal())}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {items.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <p className="text-lg">הסל שלך ריק</p>
              <button 
                onClick={() => dispatch(closeCartModal())} 
                className="mt-4 text-secondary underline font-medium"
              >
                המשך בקניות
              </button>
            </div>
          ) : (
            items.map((item, index) => (
              <div key={item.id || item.productId || `cart-item-${index}`} className="flex gap-4">
                <div className="w-20 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 border border-gray-200">
                  <img src={item.imgSrc} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-800 line-clamp-1">{item.title}</h3>
                    <p className="text-secondary font-semibold">₪{item.price}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                      <button 
                        className="px-2 py-1 hover:bg-gray-100"
                        onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity - 1 }))}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-2 text-sm font-medium w-8 text-center">{item.quantity}</span>
                      <button 
                        className="px-2 py-1 hover:bg-gray-100"
                        onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity + 1 }))}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button 
                      onClick={() => dispatch(removeFromCart(item.productId))}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <div className="flex justify-between items-center mb-4 text-lg font-bold text-gray-900">
              <span>סה"כ לתשלום:</span>
              <span>₪{total.toFixed(2)}</span>
            </div>
            <Link 
              to="/checkout"
              className="block w-full bg-secondary hover:bg-red-900 text-white text-center py-3 rounded-md font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              onClick={() => dispatch(closeCartModal())}
            >
              לקופה
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CartModal;