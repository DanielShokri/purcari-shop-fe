import { ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EmptyCartViewProps {
  className?: string;
}

export default function EmptyCartView({ className }: EmptyCartViewProps) {
  const navigate = useNavigate();

  return (
    <div className={`container mx-auto px-4 py-20 text-center ${className || ''}`}>
      <ShoppingBag size={64} className="mx-auto text-gray-300 mb-6" />
      <h2 className="text-2xl font-bold mb-4">סל הקניות שלך ריק</h2>
      <button
        onClick={() => navigate('/products')}
        className="bg-secondary text-white px-8 py-3 rounded-full font-bold cursor-pointer"
      >
        חזרה לחנות
      </button>
    </div>
  );
}
