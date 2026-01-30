import React from 'react';
import { LogOut, User as UserIcon, Phone, Mail } from 'lucide-react';
import { AuthUser } from '@shared/types';

interface DashboardHeaderProps {
  user: AuthUser;
  onLogout: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user, onLogout }) => {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex items-center gap-4 text-right">
        <div className="bg-gray-100 p-4 rounded-full text-secondary">
          <UserIcon size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 mt-1">
            <p className="text-gray-500 flex items-center gap-1">
              <Mail size={14} />
              {user.email}
            </p>
            {user.phone && (
              <p className="text-gray-500 flex items-center gap-1">
                <Phone size={14} />
                <span dir="ltr">{user.phone}</span>
              </p>
            )}
          </div>
        </div>
      </div>
      <button 
        onClick={onLogout}
        className="flex items-center gap-2 text-gray-500 hover:text-red-600 font-medium transition-colors border border-gray-200 px-4 py-2 rounded-xl cursor-pointer"
      >
        <LogOut size={18} />
        התנתקות
      </button>
    </div>
  );
};

export default DashboardHeader;
