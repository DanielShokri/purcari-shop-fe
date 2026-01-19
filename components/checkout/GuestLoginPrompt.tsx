import React from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';

interface GuestLoginPromptProps {
  user: any;
}

const GuestLoginPrompt: React.FC<GuestLoginPromptProps> = ({ user }) => {
  if (user) return null;

  return (
    <div className="mb-8 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="bg-amber-100 p-2 rounded-full text-amber-600">
          <User size={20} />
        </div>
        <div>
          <p className="font-bold text-amber-900 text-sm">כבר יש לכם חשבון?</p>
          <p className="text-amber-700 text-xs">התחברו כדי למלא את הפרטים שלכם אוטומטית.</p>
        </div>
      </div>
      <Link 
        to="/login?redirect=checkout" 
        className="bg-white text-amber-700 px-4 py-2 rounded-lg text-sm font-bold border border-amber-200 hover:bg-amber-100 transition-colors"
      >
        התחברות / הרשמה
      </Link>
    </div>
  );
};

export default GuestLoginPrompt;
