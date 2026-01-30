import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import theme from '../../theme/styles';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

// Official Purcari wine category images from purcari.de
const categoryImages = {
  red: 'https://www.purcari.de/cdn/shop/files/purcari-kategorie-teaser-rotwein-8.jpg?v=1701883178&width=800',
  white: 'https://www.purcari.de/cdn/shop/files/purcari-kategorie-teaser-weiss-8.jpg?v=1701883040&width=800',
  sparkling: 'https://www.purcari.de/cdn/shop/files/purcari-kategorie-teaser-schaumwein-8-1.jpg?v=1701883558&width=800',
  rose: 'https://www.purcari.de/cdn/shop/files/purcari-kategorie-teaser-rose-8.jpg?v=1701883144&width=800',
};

const CategoriesGrid: React.FC = () => {
  return (
    <section className={`${theme.SECTION_PY} bg-white`}>
      <div className={theme.CONTAINER}>
        <motion.div
          {...fadeInUp}
          className="text-center mb-12"
        >
          <h2 className={`${theme.H2} mb-4`}>קנו לפי קטגוריות</h2>
          <div className="w-20 h-1 bg-secondary mx-auto"></div>
        </motion.div>

        <div className={`grid grid-cols-1 md:grid-cols-3 ${theme.GAP_COMPONENT} h-auto md:h-[600px]`}>
          {/* Red Wines - Tall Card */}
          <motion.div 
            {...fadeInUp}
            className="group relative overflow-hidden rounded-2xl md:h-full h-[400px]"
          >
            <img 
              src={categoryImages.red}
              alt="יינות אדומים - Purcari Red Wines" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            <div className="absolute inset-0 flex items-end justify-center p-8">
              <Link 
                to="/products?category=red-wine"
                className="bg-white/95 backdrop-blur-sm text-gray-900 px-8 py-3 rounded-full font-bold shadow-lg hover:bg-secondary hover:text-white transition-all transform group-hover:-translate-y-2"
              >
                יינות אדומים
              </Link>
            </div>
          </motion.div>

          {/* Middle Column - Two Small Cards */}
          <div className={`flex flex-col ${theme.GAP_COMPONENT} md:h-full`}>
            {/* Sparkling */}
            <motion.div 
              {...fadeInUp}
              className="group relative overflow-hidden rounded-2xl flex-1 h-[250px] md:h-auto"
            >
              <img 
                src={categoryImages.sparkling}
                alt="מבעבעים - Purcari Sparkling Wines" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>
              <div className="absolute inset-0 flex items-end justify-center p-8">
                <Link 
                  to="/products?category=sparkling-wine"
                  className="bg-white/95 backdrop-blur-sm text-gray-900 px-8 py-3 rounded-full font-bold shadow-lg hover:bg-secondary hover:text-white transition-all transform group-hover:-translate-y-2"
                >
                  מבעבעים
                </Link>
              </div>
            </motion.div>
            
            {/* Rosé */}
            <motion.div 
              {...fadeInUp}
              className="group relative overflow-hidden rounded-2xl flex-1 h-[250px] md:h-auto"
            >
              <img 
                src={categoryImages.rose}
                alt="רוזה - Purcari Rosé Wines" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>
              <div className="absolute inset-0 flex items-end justify-center p-8">
                <Link 
                  to="/products?category=rose-wine"
                  className="bg-white/95 backdrop-blur-sm text-gray-900 px-8 py-3 rounded-full font-bold shadow-lg hover:bg-secondary hover:text-white transition-all transform group-hover:-translate-y-2"
                >
                  רוזה
                </Link>
              </div>
            </motion.div>
          </div>

          {/* White Wines - Tall Card */}
          <motion.div 
            {...fadeInUp}
            className="group relative overflow-hidden rounded-2xl md:h-full h-[400px]"
          >
            <img 
              src={categoryImages.white}
              alt="יינות לבנים - Purcari White Wines" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            <div className="absolute inset-0 flex items-end justify-center p-8">
              <Link 
                to="/products?category=white-wine"
                className="bg-white/95 backdrop-blur-sm text-gray-900 px-8 py-3 rounded-full font-bold shadow-lg hover:bg-secondary hover:text-white transition-all transform group-hover:-translate-y-2"
              >
                יינות לבנים
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CategoriesGrid;
