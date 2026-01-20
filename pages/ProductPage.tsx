import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGetProductByIdQuery } from '../services/api/productsApi';
import { useTrackEventMutation } from '../services/api/analyticsApi';
import SEO from '../components/SEO';
import { useAppDispatch } from '../store/hooks';
import { addToCart } from '../store/slices/cartSlice';
import { Minus, Plus, ShoppingBag, Truck, Shield, RotateCcw } from 'lucide-react';

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading } = useGetProductByIdQuery(id || '');
  const [trackEvent] = useTrackEventMutation();
  const dispatch = useAppDispatch();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      trackEvent({ type: 'product_view', productId: product.$id });
    }
  }, [product, trackEvent]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">טוען...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">המוצר לא נמצא</div>;

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.productNameHe || product.productName,
    "image": [product.featuredImage || product.images?.[0] || ''],
    "description": product.descriptionHe || product.description,
    "sku": product.sku,
    "brand": {
      "@type": "Brand",
      "name": "Purcari"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://purcari.co.il/product/${product.$id}`,
      "priceCurrency": "ILS",
      "price": product.price,
      "availability": product.quantityInStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition"
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "דף הבית",
        "item": "https://purcari.co.il"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "חנות",
        "item": "https://purcari.co.il/products"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": product.productNameHe || product.productName,
        "item": `https://purcari.co.il/product/${product.$id}`
      }
    ]
  };

  const handleAddToCart = () => {
    dispatch(addToCart({
      id: product.$id,
      productId: product.$id,
      title: product.productNameHe || product.productName,
      price: product.price,
      quantity,
      imgSrc: product.featuredImage || product.images?.[0] || ''
    }));
    trackEvent({ type: 'add_to_cart', productId: product.$id });
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      <SEO 
        title={product.productNameHe || product.productName}
        description={product.descriptionHe || product.description}
        ogImage={product.featuredImage || product.images?.[0] || ''}
        ogType="product"
        canonical={`/product/${product.$id}`}
        schemaData={[productSchema, breadcrumbSchema]}
      />
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Gallery */}
          <div className="space-y-4">
            <div className="aspect-[3/4] bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
              <img src={product.featuredImage || product.images?.[0] || ''} alt={product.productNameHe || product.productName} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Details */}
          <div>
            <div className="mb-2 text-secondary font-medium tracking-wide text-sm uppercase">{product.wineType === 'Red' ? 'יין אדום' : product.wineType === 'White' ? 'יין לבן' : 'רוזה'}</div>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">{product.productNameHe || product.productName}</h1>
            <p className="text-2xl font-bold text-gray-900 mb-6">₪{product.price}</p>
            
            <p className="text-gray-600 leading-relaxed mb-8 text-lg">
              {product.descriptionHe || product.description}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8 text-sm text-gray-600">
              <div className="p-3 bg-gray-50 rounded border border-gray-100">
                <span className="block font-bold text-gray-900 mb-1">בציר</span>
                {product.vintage}
              </div>
              <div className="p-3 bg-gray-50 rounded border border-gray-100">
                <span className="block font-bold text-gray-900 mb-1">אלכוהול</span>
                {product.alcoholContent}%
              </div>
              <div className="p-3 bg-gray-50 rounded border border-gray-100">
                <span className="block font-bold text-gray-900 mb-1">נפח</span>
                {product.volume}
              </div>
              <div className="p-3 bg-gray-50 rounded border border-gray-100">
                <span className="block font-bold text-gray-900 mb-1">מק"ט</span>
                {product.sku}
              </div>
            </div>

            <div className="flex items-center gap-6 mb-8 border-t border-b border-gray-100 py-6">
              <div className="flex items-center border border-gray-300 rounded-md">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-4 py-3 hover:bg-gray-100 text-gray-600 cursor-pointer"
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 font-bold text-lg w-12 text-center">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-4 py-3 hover:bg-gray-100 text-gray-600 cursor-pointer"
                >
                  <Plus size={16} />
                </button>
              </div>
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-secondary hover:bg-red-900 text-white py-3 px-6 rounded-md font-bold text-lg flex items-center justify-center gap-2 transition-colors shadow-md hover:shadow-xl cursor-pointer"
              >
                <ShoppingBag size={20} />
                הוסף לסל
              </button>
            </div>

            <div className="space-y-4 text-sm text-gray-500">
               <div className="flex items-center gap-3">
                 <Truck size={18} />
                 <span>משלוח חינם בהזמנה מעל ₪400</span>
               </div>
               <div className="flex items-center gap-3">
                 <Shield size={18} />
                 <span>אחריות על איכות היין</span>
               </div>
               <div className="flex items-center gap-3">
                 <RotateCcw size={18} />
                 <span>החזרות עד 14 יום</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;