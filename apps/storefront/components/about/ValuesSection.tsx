import React from 'react';
import { motion } from 'framer-motion';
import { Award, Grape, Crown } from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8 }
};

const ValuesSection: React.FC = () => {
  const values = [
    {
      title: 'איכות ללא פשרות',
      description: 'כל ענב נבחר בקפידה ידנית כדי להבטיח שרק חומרי הגלם הטובים ביותר יגיעו לתהליך הייצור.',
      icon: <Award size={40} className="text-secondary" />
    },
    {
      title: 'קשר לאדמה',
      description: 'אנו מטפחים את הכרמים שלנו בשיטות בנות-קיימא המכבדות את הטבע ואת המערכת האקולוגית המקומית.',
      icon: <Grape size={40} className="text-secondary" />
    },
    {
      title: 'מורשת מלכותית',
      description: 'אנו גאים להמשיך את המסורת שהחלה לפני כמעט מאתיים שנה כספקים של בתי המלוכה.',
      icon: <Crown size={40} className="text-secondary" />
    }
  ];

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          {...fadeInUp}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">הערכים שלנו</h2>
          <div className="w-20 h-1 bg-secondary mx-auto mb-8"></div>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            אנחנו מאמינים בשילוב של מסורת עתיקת יומין עם טכנולוגיה מודרנית כדי ליצור את היינות הטובים ביותר.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {values.map((value, index) => (
            <motion.div 
              key={index}
              {...fadeInUp}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all text-center"
            >
              <div className="mb-6 flex justify-center">{value.icon}</div>
              <h3 className="text-xl font-bold mb-4">{value.title}</h3>
              <p className="text-gray-600 leading-relaxed">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValuesSection;
