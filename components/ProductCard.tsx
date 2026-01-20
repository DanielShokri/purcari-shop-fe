import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useAppDispatch } from '../store/hooks';
import { addToCart } from '../store/slices/cartSlice';
import { ShoppingBag, Eye, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import theme from '../theme/styles';

interface ProductCardProps {
  product: Product;
}

// Calculate discount percentage
const getDiscountPercent = (price: number, compareAtPrice?: number) => {
  if (!compareAtPrice) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
};

// Infinite Marquee component using Framer Motion
const SaleMarquee: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gray-900 text-white overflow-hidden py-2" dir="ltr">
      <motion.div
        className="flex whitespace-nowrap w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          duration: 15,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        <div className="flex">
          {[...Array(6)].map((_, i) => (
            <span key={`a-${i}`} className="inline-flex items-center gap-2 px-6 text-sm font-bold flex-shrink-0">
              <Zap size={14} className="text-red-500 fill-red-500" />
              <span dir="rtl">{text}</span>
            </span>
          ))}
        </div>
        <div className="flex">
          {[...Array(6)].map((_, i) => (
            <span key={`b-${i}`} className="inline-flex items-center gap-2 px-6 text-sm font-bold flex-shrink-0">
              <Zap size={14} className="text-red-500 fill-red-500" />
              <span dir="rtl">{text}</span>
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useAppDispatch();
  const discountPercent = getDiscountPercent(product.price, product.compareAtPrice);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({
      id: product.$id, // Keeping id for internal React key if needed, but the slice uses productId
      productId: product.$id,
      title: product.productNameHe || product.productName,
      price: product.price,
      quantity: 1,
      imgSrc: product.featuredImage || product.images?.[0] || ''
    }));
  };

  // Sale banner text
  const saleBannerText = `מבצע חם ${discountPercent}% הנחה`;

  return (
    <div className={`group relative ${theme.CARD} ${theme.CARD_HOVER} flex flex-col h-full border-transparent hover:border-gray-100`}>
      <div className="relative aspect-[2/3] overflow-hidden bg-amber-50">
        <Link to={`/product/${product.$id}`} className="block w-full h-full">
          <img
            src={product.featuredImage || product.images?.[0] || ''}
            alt={product.productNameHe || product.productName}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </Link>
        
        {/* Sale Badge - Top Right */}
        {product.onSale && discountPercent > 0 && (
          <span className="absolute top-3 end-3 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full pointer-events-none">
            -{discountPercent}%
          </span>
        )}

        {/* Running Sale Banner - Bottom of Image using Framer Motion */}
        {product.onSale && <SaleMarquee text={saleBannerText} />}

        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
          <Link
            to={`/product/${product.$id}`}
            className="bg-white text-gray-900 p-3 rounded-full hover:bg-secondary hover:text-white transition-colors shadow-lg transform translate-y-4 group-hover:translate-y-0 duration-300 pointer-events-auto flex items-center justify-center"
          >
            <Eye size={20} />
          </Link>
          <button
            onClick={handleAddToCart}
            className="bg-white text-gray-900 p-3 rounded-full hover:bg-secondary hover:text-white transition-colors shadow-lg transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75 pointer-events-auto flex items-center justify-center cursor-pointer"
          >
            <ShoppingBag size={20} />
          </button>
        </div>
      </div>

      <div className="p-4 text-center flex-grow flex flex-col justify-end">
        <div className="text-xs text-gray-500 mb-1">{product.wineType === 'Red' ? 'יין אדום' : product.wineType === 'White' ? 'יין לבן' : 'רוזה'}</div>
        <Link to={`/product/${product.$id}`}>
          <h3 className="font-bold text-gray-800 hover:text-secondary transition-colors mb-2 line-clamp-1">{product.productNameHe || product.productName}</h3>
        </Link>
        <div className="flex items-center justify-center gap-2 text-sm">
          {product.onSale && product.compareAtPrice && (
            <span className="text-gray-400 line-through">₪{product.compareAtPrice}</span>
          )}
          <span className={`font-bold ${product.onSale ? 'text-red-600' : 'text-gray-900'}`}>₪{product.price}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;