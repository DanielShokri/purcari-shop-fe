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
              src="https://images.unsplash.com/photo-1510850438980-69711f96a300?q=80&w=2070&auto=format&fit=crop" 
              alt="יינות אדומים" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
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
                src="https://images.unsplash.com/photo-1594494006614-209199c7efea?q=80&w=2071&auto=format&fit=crop" 
                alt="מבעבעים" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
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
                src="https://images.unsplash.com/photo-1558001373-7b93ee48ffa0?q=80&w=2070&auto=format&fit=crop" 
                alt="רוזה" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
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
              src="https://images.unsplash.com/photo-1559158068-930a7fb608ec?q=80&w=2070&auto=format&fit=crop" 
              alt="יינות לבנים" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
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
