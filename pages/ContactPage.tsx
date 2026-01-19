import React from 'react';
import { motion } from 'framer-motion';
import ContactHeader from '../components/contact/ContactHeader';
import ContactInfo from '../components/contact/ContactInfo';
import ContactForm from '../components/contact/ContactForm';

const ContactPage: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        
        <ContactHeader />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <ContactInfo />
          <ContactForm />
        </div>

        {/* FAQ Section Teaser */}
        <motion.div 
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-gray-500 italic">
            "יין טוב הוא כמו סיפור טוב - הוא משתפר ככל שחולק אותו."
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;
