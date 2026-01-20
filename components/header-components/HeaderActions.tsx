import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, User } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleCartModal, openSearchModal } from '../../store/slices/uiSlice';
import { selectCartItemCount } from '../../store/slices/cartSlice';

interface HeaderActionsProps {
  user: any;
}

const HeaderActions: React.FC<HeaderActionsProps> = ({ user }) => {
  const dispatch = useAppDispatch();
  const cartCount = useAppSelector(selectCartItemCount);

  return (
    <div className="flex items-center gap-4">
      <button 
        className="p-2 text-gray-600 hover:text-secondary transition-colors hidden sm:block cursor-pointer"
        onClick={() => dispatch(openSearchModal())}
        aria-label="חיפוש"
      >
        <Search size={22} />
      </button>
      <Link 
        to={user ? "/dashboard" : "/login"} 
        className="p-2 text-gray-600 hover:text-secondary transition-colors hidden sm:block"
      >
        <User size={22} />
      </Link>
      <button 
        className="p-2 text-gray-600 hover:text-secondary transition-colors relative cursor-pointer"
        onClick={() => dispatch(toggleCartModal())}
        aria-label="סל קניות"
      >
        <ShoppingCart size={22} />
        {cartCount > 0 && (
          <span className="absolute top-0 -end-1 bg-secondary text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
            {cartCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default HeaderActions;
