import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useGetFeaturedProductsQuery } from '../../services/api/productsApi';
import ProductCard from '../ProductCard';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

const FeaturedProducts: React.FC = () => {
  const { data: featuredProducts, isLoading } = useGetFeaturedProductsQuery();

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          {...fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">המומלצים שלנו</h2>
          <div className="w-20 h-1 bg-secondary mx-auto"></div>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">בחירה קפדנית של היינות האהובים ביותר שלנו, שנבחרו על ידי הלקוחות והסומלייה שלנו.</p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts?.map((product) => (
              <ProductCard key={product.$id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link to="/products" className="inline-block border-2 border-gray-900 text-gray-900 px-10 py-3 rounded-full font-bold hover:bg-gray-900 hover:text-white transition-colors">
            לכל הקטלוג
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
