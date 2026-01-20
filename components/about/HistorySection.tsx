import React from 'react';
import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8 }
};

const HistorySection: React.FC = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">יקב עם היסטוריה מלכותית</h2>
            <div className="w-20 h-1 bg-secondary mb-8"></div>
            <p className="text-gray-600 leading-relaxed mb-6 text-lg">
              Purcari נוסד בשנת 1827 בדרום מולדובה, באזור עם תנאי אקלים וקרקע ייחודיים הדומים לאלו של חבל בורדו בצרפת. תוך זמן קצר, היינות של Purcari זכו להכרה בינלאומית וקטפו מדליות זהב בתערוכות החשובות ביותר בעולם.
            </p>
            <p className="text-gray-600 leading-relaxed text-lg">
              במהלך השנים, הפך היקב לספק רשמי של בתי מלוכה באירופה, כולל בית המלוכה הבריטי. היין האייקוני שלנו, Negru de Purcari, ידוע כיין המועדף על המלכה אליזבת השנייה.
            </p>
          </motion.div>
          <motion.div 
            {...fadeInUp}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative rounded-3xl overflow-hidden shadow-2xl h-[500px]"
          >
            <img 
              src="https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?q=80&w=2070&auto=format&fit=crop" 
              alt="Winery History" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-3xl"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HistorySection;
