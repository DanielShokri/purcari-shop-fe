import React from 'react';
import { Truck } from 'lucide-react';
import GuestLoginPrompt from './GuestLoginPrompt';

interface ShippingStepProps {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  nextStep: () => void;
  user: any;
}

const ShippingStep: React.FC<ShippingStepProps> = ({ formData, handleInputChange, nextStep, user }) => {
  return (
    <>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Truck className="text-secondary" />
        פרטי משלוח
      </h2>

      <GuestLoginPrompt user={user} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">שם מלא</label>
          <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-secondary focus:border-secondary" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
          <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-secondary focus:border-secondary" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-secondary focus:border-secondary" required />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">כתובת</label>
          <input type="text" name="street" value={formData.street} onChange={handleInputChange} className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-secondary focus:border-secondary" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">עיר</label>
          <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-secondary focus:border-secondary" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">מיקוד</label>
          <input type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-secondary focus:border-secondary" required />
        </div>
      </div>
      <button onClick={nextStep} className="w-full mt-8 bg-secondary text-white py-4 rounded-xl font-bold text-lg hover:bg-red-900 transition-colors">
        המשך לתשלום
      </button>
    </>
  );
};

export default ShippingStep;
