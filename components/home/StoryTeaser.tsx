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
      className="py-20 flex flex-col md:flex-row ps-4 pe-4 md:ps-12 md:pe-0"
    >
      <div className="w-full md:w-1/2 h-96 md:h-auto overflow-hidden rounded-2xl">
        <img
          src="https://winetravelawards.com/wp-content/uploads/2021/12/243379394_1560132090994759_7077199609990952134_n.jpg"
          alt="Wine Tasting"
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
        />
      </div>
      <div className="w-full md:w-1/2 bg-white p-10 md:p-20 flex flex-col justify-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">הסיפור של Purcari</h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Purcari נוסד בשנת 1827 והפך במהרה לסמל של איכות ומסורת. היינות שלנו זכו להכרה בינלאומית כבר במאה ה-19, והיו לאהובים במיוחד על בתי המלוכה של בריטניה ואירופה.
        </p>
        <p className="text-gray-600 leading-relaxed mb-8 font-medium border-s-4 border-secondary ps-4 italic">
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
