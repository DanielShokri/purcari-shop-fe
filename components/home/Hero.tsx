import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpLeft } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="mx-4 sm:mx-8 lg:mx-12 mt-6 sm:mt-8">
      <div className="relative h-[65vh] sm:h-[70vh] w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-gray-900">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-[1.2]"
          poster="https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1920&q=80"
        >
          <source src="https://fra.cloud.appwrite.io/v1/storage/buckets/696e54f10012bb259d9b/files/696e56dc003d4a11c66c/view?project=696e539a0008cbaae14d" type="video/mp4" />
        </video>
        
        <div className="absolute inset-0 bg-gradient-to-l from-black/50 via-black/20 to-transparent"></div>

        <div className="absolute inset-0 flex items-center">
          <div className="max-w-xl text-right text-white ps-8 sm:ps-12 lg:ps-20">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-5xl sm:text-6xl md:text-7xl font-bold mb-4 tracking-tight drop-shadow-lg"
            >
              חום החורף
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-lg sm:text-xl text-white/90 mb-8 leading-relaxed drop-shadow-md"
            >
              הישארו חמים ואופנתיים עם קולקציית החורף שלנו.
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
