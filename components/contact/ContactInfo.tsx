import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const ContactInfo: React.FC = () => {
  return (
    <div className="lg:col-span-1 space-y-6">
      <motion.div 
        {...fadeInUp}
        className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4"
      >
        <div className="bg-secondary/10 p-3 rounded-xl text-secondary">
          <Mail size={24} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 mb-1">אימייל</h3>
          <p className="text-gray-600 text-sm">info@purcari.co.il</p>
          <p className="text-gray-400 text-xs mt-1">אנחנו עונים תוך 24 שעות</p>
        </div>
      </motion.div>

      <motion.div 
        {...fadeInUp}
        transition={{ delay: 0.1 }}
        className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4"
      >
        <div className="bg-secondary/10 p-3 rounded-xl text-secondary">
          <Phone size={24} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 mb-1">טלפון</h3>
          <p className="text-gray-600 text-sm">050-1234567</p>
          <p className="text-gray-400 text-xs mt-1">א'-ה' | 09:00 - 18:00</p>
        </div>
      </motion.div>

      <motion.div 
        {...fadeInUp}
        transition={{ delay: 0.2 }}
        className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4"
      >
        <div className="bg-secondary/10 p-3 rounded-xl text-secondary">
          <MapPin size={24} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 mb-1">הכתובת שלנו</h3>
          <p className="text-gray-600 text-sm">רחוב היין 1, תל אביב</p>
          <p className="text-gray-400 text-xs mt-1">בתיאום מראש בלבד</p>
        </div>
      </motion.div>
    </div>
  );
};

export default ContactInfo;
