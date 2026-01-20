import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpLeft } from 'lucide-react';
import theme from '../../theme/styles';

const Hero: React.FC = () => {
  const [loadVideo, setLoadVideo] = useState(false);

  useEffect(() => {
    // Delay video loading to prioritize site assets
    const timer = setTimeout(() => setLoadVideo(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="mt-6 sm:mt-8">
      <div className={`relative h-[65vh] sm:h-[70vh] w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-gray-900 shadow-2xl`}>
        {/* Static Background / Poster Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1920&q=80")' }}
        />

        {/* Video Overlay (Desktop Only) */}
        <div className="absolute inset-0 w-full h-full overflow-hidden hidden md:block">
          <AnimatePresence>
            {loadVideo && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
                className="w-full h-full"
              >
                <iframe
                  className="absolute top-1/2 left-1/2 w-[150%] h-[150%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  src="https://www.youtube-nocookie.com/embed/TxEr9TB4nPU?autoplay=1&mute=1&loop=1&playlist=TxEr9TB4nPU&controls=0&rel=0&showinfo=0&iv_load_policy=3&modestbranding=1&playsinline=1"
                  title="Purcari background video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  loading="lazy"
                ></iframe>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Dark Screen Overlay for Text Readability */}
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        
        {/* Directional Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/20 to-transparent z-10"></div>

        <div className="absolute inset-0 flex items-center z-20">
          <div className={`max-w-xl text-right text-white ${theme.CONTAINER_PX}`}>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`${theme.H1} mb-4 drop-shadow-lg text-white`}
            >
              ערכים אמיתיים אינם משתנים
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className={`${theme.BODY_LG} mb-8 drop-shadow-md text-white/90`}
            >
              מורשת של מצוינות מאז 1827. היינות של Purcari שכבשו את בתי המלוכה של אירופה, עכשיו אצלכם בשולחן.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link
                to="/products"
                className="group inline-flex items-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-base sm:text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
              >
                גלו את היינות שלנו
                <ArrowUpLeft className="transition-transform group-hover:-translate-y-0.5 group-hover:-translate-x-0.5" size={22} />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
