import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2 } from 'lucide-react';
import theme from '../../theme/styles';

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setEmail('');
    }
  };

  return (
    <section className={`${theme.SECTION_PY} bg-gray-50 border-t border-gray-100`}>
      <div className={theme.CONTAINER}>
        <div className="max-w-4xl mx-auto bg-white rounded-[3rem] p-8 md:p-16 shadow-xl relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-0 end-0 w-64 h-64 bg-secondary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 start-0 w-64 h-64 bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

          <div className="relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block p-3 bg-secondary/10 rounded-2xl text-secondary mb-6"
            >
              <Send size={28} />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className={`${theme.H2} mb-4`}
            >
              הצטרפו למועדון הלקוחות שלנו
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className={`${theme.BODY} mb-8 max-w-lg mx-auto`}
            >
              הירשמו לניוזלטר שלנו וקבלו עדכונים על יינות חדשים, מבצעים בלעדיים ואירועי טעימות.
            </motion.p>

            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  onSubmit={handleSubmit}
                  className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="כתובת האימייל שלך"
                    className="flex-1 px-6 py-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-secondary text-white px-8 py-4 rounded-full font-bold hover:bg-red-900 transition-all shadow-lg shadow-secondary/20 cursor-pointer"
                  >
                    הרשמה
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 text-green-700 p-6 rounded-3xl inline-flex items-center gap-3"
                >
                  <CheckCircle2 size={24} />
                  <span className="font-bold">תודה על ההרשמה! נהיה בקשר בקרוב.</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            <p className="mt-6 text-[10px] text-gray-400">
              בלחיצה על הרשמה, הנך מסכים לקבלת דברי פרסומת בכפוף לתנאי השימוש ומדיניות הפרטיות.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
