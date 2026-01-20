import React from 'react';
import { motion } from 'framer-motion';
import { User as UserIcon, Phone, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { ProfileInput } from '../../schemas/validationSchemas';

interface ProfileTabProps {
  userEmail: string;
  register: UseFormRegister<ProfileInput>;
  errors: FieldErrors<ProfileInput>;
  onSubmit: (e: React.FormEvent) => void;
  isUpdating: boolean;
  status: { type: 'success' | 'error'; message: string } | null;
}

const ProfileTab: React.FC<ProfileTabProps> = ({
  userEmail,
  register,
  errors,
  onSubmit,
  isUpdating,
  status,
}) => {
  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white p-8 rounded-3xl shadow-sm"
    >
      <h3 className="text-xl font-bold mb-6">עריכת פרטים אישיים</h3>
      
      {status && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
          status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          {status.message}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              שם מלא <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <UserIcon className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                {...register('name')}
                className={`w-full ps-10 pe-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all ${errors.name ? 'border-red-500' : ''}`}
                placeholder="ישראל ישראלי"
              />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              טלפון נייד <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="tel"
                {...register('phone')}
                className={`w-full ps-10 pe-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all text-left ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="050-0000000"
                dir="ltr"
              />
            </div>
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">כתובת אימייל</label>
            <div className="relative">
              <Mail className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                value={userEmail}
                disabled
                className="w-full ps-10 pe-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-500 cursor-not-allowed outline-none text-left"
                dir="ltr"
              />
            </div>
            <p className="mt-1 text-xs text-gray-400">לא ניתן לשנות כתובת אימייל</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isUpdating}
          className="bg-secondary text-white px-8 py-3 rounded-xl font-bold hover:bg-red-900 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isUpdating ? 'מעדכן...' : 'שמירת שינויים'}
        </button>
      </form>
    </motion.div>
  );
};

export default ProfileTab;
