import React from 'react';
import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8 }
};

const PurcariIsraelSection: React.FC = () => {
  return (
    <section className="py-20 bg-gray-900 text-white">
      <div className="container mx-auto px-4 text-center">
        <motion.div {...fadeInUp}>
          <h2 className="text-3xl md:text-4xl font-bold mb-8 italic">פורקרי ישראל</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-12">
            המטרה שלנו היא להנגיש את התרבות העשירה ואת היינות המעולים של יקב פורקרי לצרכן הישראלי המחפש איכות, היסטוריה וטעם בלתי נשכח. אנו מזמינים אתכם להצטרף למסע שלנו ולגלות את עולם היין המלכותי.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PurcariIsraelSection;
