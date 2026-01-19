import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle2 } from 'lucide-react';

const ContactForm: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <motion.div 
      className="lg:col-span-2 bg-white p-8 md:p-12 rounded-3xl shadow-xl"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
    >
      {isSubmitted ? (
        <div className="text-center py-12">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">ההודעה נשלחה בהצלחה!</h2>
          <p className="text-gray-600 mb-8">תודה שפנית אלינו. נציג מטעמנו יחזור אליך בהקדם האפשרי.</p>
          <button 
            onClick={() => setIsSubmitted(false)}
            className="text-secondary font-bold hover:underline"
          >
            שלח הודעה נוספת
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">שם מלא</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border-gray-200 rounded-xl p-3 border focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
                placeholder="הכנס שם מלא"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">אימייל</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border-gray-200 rounded-xl p-3 border focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
                placeholder="email@example.com"
              />
            </div>
          </div>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">נושא הפנייה</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full border-gray-200 rounded-xl p-3 border focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
              placeholder="איך נוכל לעזור?"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">הודעה</label>
            <textarea
              id="message"
              name="message"
              rows={5}
              value={formData.message}
              onChange={handleChange}
              required
              className="w-full border-gray-200 rounded-xl p-3 border focus:ring-2 focus:ring-secondary focus:border-secondary transition-all resize-none"
              placeholder="כתוב כאן את הודעתך..."
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-secondary text-white py-4 rounded-xl font-bold text-lg hover:bg-red-900 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <Send size={20} />
            שלח הודעה
          </button>
        </form>
      )}
    </motion.div>
  );
};

export default ContactForm;
