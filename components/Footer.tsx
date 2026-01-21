import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          
          {/* Brand */}
          <div className="space-y-4">
             <div className="text-2xl font-bold text-white tracking-widest uppercase">
              Purcari
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              יינות פרימיום מבית פורקרי, המשלבים מסורת של מאות שנים עם טכנולוגיה מודרנית. טעם של איכות בלתי מתפשרת.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-accent">ניווט מהיר</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/about" className="hover:text-white transition-colors">הסיפור שלנו</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">החנות</Link></li>
              <li><Link to="/shipping" className="hover:text-white transition-colors">מדיניות משלוחים</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">צור קשר</Link></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-accent">מידע משפטי</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/terms" className="hover:text-white transition-colors">תנאי שימוש</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">מדיניות פרטיות</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-accent">צור קשר</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>טלפון: 050-9480040</li>
              <li>אימייל: ivninov45@gmail.com</li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-accent">הירשם לניוזלטר</h4>
            <p className="text-gray-400 text-xs mb-4">קבל עדכונים על יינות חדשים ומבצעים מיוחדים.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="הכנס אימייל" 
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-secondary"
              />
              <button className="bg-secondary hover:bg-red-900 text-white px-4 py-2 rounded text-sm font-medium transition-colors cursor-pointer">
                שלח
              </button>
            </div>
            <div className="flex gap-4 mt-6">
              <a href="https://www.facebook.com/purcariwines/" target="_blank" className="text-gray-400 hover:text-white transition-colors"><Facebook size={20} /></a>
              <a href="https://www.instagram.com/purcari_israel/?hl=en" target="_blank" className="text-gray-400 hover:text-white transition-colors"><Instagram size={20} /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Purcari Israel. כל הזכויות שמורות.</p>
          <p className="mt-2">אזהרה: צריכה מופרזת של אלכוהול מסכנת חיים ומזיקה לבריאות.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;