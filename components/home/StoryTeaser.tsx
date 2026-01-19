import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const StoryTeaser: React.FC = () => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1 }}
      className="py-20 flex flex-col md:flex-row"
    >
      <div className="w-full md:w-1/2 h-96 md:h-auto">
        <img
          src="https://images.unsplash.com/photo-1528823872057-9c0182e4f8f9?q=80&w=2070&auto=format&fit=crop"
          alt="Wine Tasting"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="w-full md:w-1/2 bg-white p-10 md:p-20 flex flex-col justify-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">הסיפור שלנו</h2>
        <p className="text-gray-600 leading-relaxed mb-8">
          יקב פורקרי נוסד בשנת 1827. במשך השנים, יקבי פורקרי הפכו לספק מורשה של בית המלוכה הבריטי.
          היינות שלנו נושאים עמם היסטוריה עשירה של תשוקה ומצוינות בייצור יין.
        </p>
        <Link to="/about" className="text-secondary font-bold hover:underline self-start">
          קרא עוד אודותינו
        </Link>
      </div>
    </motion.section>
  );
};

export default StoryTeaser;
