import React from 'react';
import { motion } from 'framer-motion';
import theme from '../../theme/styles';

const ContactHeader: React.FC = () => {
  return (
    <motion.div 
      className="text-center mb-16"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h1 className={`${theme.H1} mb-4`}>צור קשר</h1>
      <div className="w-24 h-1 bg-secondary mx-auto mb-6"></div>
      <p className={`${theme.BODY_LG} max-w-2xl mx-auto`}>
        נשמח לשמוע מכם! בין אם יש לכם שאלה על היינות שלנו, על משלוחים או על שיתופי פעולה, הצוות שלנו כאן בשבילכם.
      </p>
    </motion.div>
  );
};

export default ContactHeader;
