import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Wine, ArrowLeft, Search } from 'lucide-react';
import SEO from '../components/SEO';
import theme from '../theme/styles';

const NotFoundPage: React.FC = () => {
  return (
    <div className={`min-h-[70vh] flex items-center justify-center ${theme.SECTION_PY}`}>
      <SEO 
        title="הדף לא נמצא" 
        description="מצטערים, הדף שחיפשת לא נמצא. חזרו לדף הבית או גלו את היינות שלנו."
      />
      
      <div className={`${theme.CONTAINER} text-center`}>
        {/* Animated Wine Glass Illustration */}
        <div className="relative mb-8">
          <div className="inline-block relative">
            {/* Large 404 Number */}
            <h1 className="text-[8rem] md:text-[12rem] font-bold text-primary/10 leading-none select-none">
              404
            </h1>
            
            {/* Wine Icon Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <Wine 
                  className="w-24 h-24 md:w-32 md:h-32 text-primary animate-pulse" 
                  strokeWidth={1.5}
                />
                {/* Subtle wine drop animation */}
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-2 h-2 bg-primary/30 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hebrew Title */}
        <h2 className={`${theme.H2} mb-4`}>
          הדף לא נמצא
        </h2>
        
        {/* Description */}
        <p className={`${theme.BODY_LG} max-w-xl mx-auto mb-8`}>
          מצטערים, הדף שחיפשת אינו קיים או הועבר למיקום אחר. 
          <br />
          אולי תרצו לחזור לדף הבית או לגלות את היינות המיוחדים שלנו?
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Home className="w-5 h-5" />
            <span>חזרה לדף הבית</span>
          </Link>
          
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-semibold rounded-xl border-2 border-primary hover:bg-primary/5 transition-all duration-300"
          >
            <Search className="w-5 h-5" />
            <span>גלו את היינות שלנו</span>
          </Link>
        </div>

        {/* Helpful Links Section */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <p className="text-gray-500 mb-6">אולי חיפשתם:</p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            <Link 
              to="/products" 
              className="text-primary hover:text-primary/80 font-medium transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              חנות היינות
            </Link>
            <Link 
              to="/about" 
              className="text-primary hover:text-primary/80 font-medium transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              אודות פורקארי
            </Link>
            <Link 
              to="/contact" 
              className="text-primary hover:text-primary/80 font-medium transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              צור קשר
            </Link>
            <Link 
              to="/shipping" 
              className="text-primary hover:text-primary/80 font-medium transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              משלוחים
            </Link>
          </div>
        </div>

        {/* Wine Quote */}
        <div className="mt-12 text-gray-400 italic">
          <p>"יין הוא השמשת הטובה ביותר של הזיכרון"</p>
          <p className="text-sm mt-1">— ג'ון קיטס</p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
