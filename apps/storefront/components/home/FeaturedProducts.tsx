import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useGetFeaturedProductsQuery } from '../../services/api/productsApi';
import ProductCard from '../ProductCard';
import theme from '../../theme/styles';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

const FeaturedProducts: React.FC = () => {
  const { data: featuredProducts, isLoading } = useGetFeaturedProductsQuery(undefined);

  return (
    <section className={`${theme.SECTION_PY} bg-gray-50`}>
      <div className={theme.CONTAINER}>
        <motion.div
          {...fadeInUp}
          className="text-center mb-16"
        >
          <h2 className={`${theme.H2} mb-4`}>המומלצים שלנו</h2>
          <div className="w-20 h-1 bg-secondary mx-auto"></div>
          <p className={`${theme.BODY_LG} mt-4 max-w-2xl mx-auto`}>בחירה קפדנית של היינות האהובים ביותר שלנו, שנבחרו על ידי הלקוחות והסומלייה שלנו.</p>
        </motion.div>

        {isLoading ? (
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ${theme.GAP_COMPONENT}`}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ${theme.GAP_COMPONENT}`}>
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
