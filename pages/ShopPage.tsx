import React, { useState, useEffect } from 'react';
import { useGetProductsQuery } from '../services/api/productsApi';
import { useGetCategoriesQuery } from '../services/api/categoriesApi';
import { useTrackEventMutation } from '../services/api/analyticsApi';
import SEO from '../components/SEO';
import ProductCard from '../components/ProductCard';
import { Filter } from 'lucide-react';

const ShopPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const { data: products, isLoading } = useGetProductsQuery(
    activeCategory !== 'all' ? { category: activeCategory } : undefined
  );
  const { data: categoriesData } = useGetCategoriesQuery();
  const [trackEvent] = useTrackEventMutation();

  useEffect(() => {
    trackEvent({ type: 'page_view' });
  }, [trackEvent]);

  const categories = [
    { id: 'all', label: 'הכל' },
    ...(categoriesData?.map(cat => ({ id: cat.slug, label: (cat as any).nameHe || cat.name })) || [])
  ];

  // If we have no categories from DB, use fallback wine categories
  const displayCategories = categories.length > 1 ? categories : [
    { id: 'all', label: 'הכל' },
    { id: 'Red', label: 'יינות אדומים' },
    { id: 'White', label: 'יינות לבנים' },
    { id: 'Rosé', label: 'רוזה' },
    { id: 'Sparkling', label: 'מבעבעים' },
  ];

  const currentCategoryLabel = displayCategories.find(c => c.id === activeCategory)?.label || 'הכל';

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
      }
    ]
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <SEO 
        title={`חנות - ${currentCategoryLabel}`}
        description={`צפו בקטלוג היינות המלא של פורקארי ישראל. ${currentCategoryLabel} - יינות איכותיים ממולדובה במחירים מעולים.`}
        canonical="/products"
        schemaData={breadcrumbSchema}
      />
      {/* Header */}
      <div className="bg-gray-900 text-white py-12 mb-10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-2">החנות שלנו</h1>
          <p className="text-gray-400">גלו את המבחר המלא של יינות פורקרי</p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <aside className="w-full md:w-64 flex-shrink-0">
             <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
               <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                 <Filter size={20} className="text-secondary" />
                 <h3 className="font-bold text-lg">סינון</h3>
               </div>
               
               <div className="space-y-2">
                 {displayCategories.map(cat => (
                   <button
                     key={cat.id}
                     onClick={() => setActiveCategory(cat.id)}
                     className={`w-full text-right px-3 py-2 rounded-md transition-colors cursor-pointer ${
                       activeCategory === cat.id 
                       ? 'bg-secondary text-white font-bold' 
                       : 'text-gray-600 hover:bg-gray-100'
                     }`}
                   >
                     {cat.label}
                   </button>
                 ))}
               </div>
             </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
             {isLoading ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="h-96 bg-gray-200 rounded-lg animate-pulse" />
                  ))}
               </div>
             ) : (
               <>
                 <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-500 text-sm">מציג {products?.length} מוצרים</p>
                    {/* Sort Dropdown placeholder */}
                 </div>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products?.map(product => (
                      <ProductCard key={product.$id} product={product} />
                    ))}
                 </div>

                 {products?.length === 0 && (
                   <div className="text-center py-20">
                     <p className="text-gray-500 text-lg">לא נמצאו מוצרים בקטגוריה זו.</p>
                   </div>
                 )}
               </>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;