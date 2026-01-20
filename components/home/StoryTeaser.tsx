import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpLeft } from 'lucide-react';

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
        <h2 className="text-3xl font-bold text-gray-900 mb-6">הסיפור של Purcari</h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Purcari נוסד בשנת 1827 והפך במהרה לסמל של איכות ומסורת. היינות שלנו זכו להכרה בינלאומית כבר במאה ה-19, והיו לאהובים במיוחד על בתי המלוכה של בריטניה ואירופה.
        </p>
        <p className="text-gray-600 leading-relaxed mb-8 font-medium border-r-4 border-secondary pr-4 italic">
          "היקב המעוטר ביותר בעולם לשנת 2021" - עם מאות מדליות זהב בתחרויות היוקרתיות ביותר, אנחנו ממשיכים להוביל את עולם היין במזרח אירופה.
        </p>
        <Link to="/about" className="text-secondary font-bold hover:underline self-start flex items-center gap-2">
          לסיפור המלא של היקב
          <ArrowUpLeft size={16} className="rotate-45" />
        </Link>
      </div>
    </motion.section>
  );
};

export default StoryTeaser;
