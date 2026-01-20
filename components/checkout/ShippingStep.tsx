import React from 'react';
import { Truck } from 'lucide-react';
import GuestLoginPrompt from './GuestLoginPrompt';
import { useFormContext } from 'react-hook-form';
import { CheckoutInput } from '../../schemas/validationSchemas';
import AddressAutocomplete from '../common/AddressAutocomplete';

interface ShippingStepProps {
  nextStep: () => void;
  user: any;
}

const ShippingStep: React.FC<ShippingStepProps> = ({ nextStep, user }) => {
  const { register, formState: { errors } } = useFormContext<CheckoutInput>();

  return (
    <>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Truck className="text-secondary" />
        פרטי משלוח
      </h2>

      <GuestLoginPrompt user={user} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">שם מלא <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            {...register('name')} 
            className={`w-full border-gray-300 rounded-lg p-2.5 border focus:ring-secondary focus:border-secondary ${errors.name ? 'border-red-500' : ''}`} 
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">אימייל <span className="text-red-500">*</span></label>
          <input 
            type="email" 
            {...register('email')} 
            className={`w-full border-gray-300 rounded-lg p-2.5 border focus:ring-secondary focus:border-secondary ${errors.email ? 'border-red-500' : ''}`} 
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">טלפון <span className="text-red-500">*</span></label>
          <input 
            type="tel" 
            {...register('phone')} 
            className={`w-full border-gray-300 rounded-lg p-2.5 border focus:ring-secondary focus:border-secondary ${errors.phone ? 'border-red-500' : ''}`} 
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>
        <div className="md:col-span-2">
          <AddressAutocomplete 
            name="street" 
            label="כתובת" 
            placeholder="התחל להקליד כתובת..."
            error={errors.street?.message}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">עיר <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            {...register('city')} 
            className={`w-full border-gray-300 rounded-lg p-2.5 border focus:ring-secondary focus:border-secondary ${errors.city ? 'border-red-500' : ''}`} 
          />
          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">מיקוד</label>
          <input 
            type="text" 
            {...register('postalCode')} 
            className={`w-full border-gray-300 rounded-lg p-2.5 border focus:ring-secondary focus:border-secondary ${errors.postalCode ? 'border-red-500' : ''}`} 
          />
          {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>}
        </div>
        <button 
          type="button" 
          onClick={nextStep}
          className="md:col-span-2 w-full mt-8 bg-secondary text-white py-4 rounded-xl font-bold text-lg hover:bg-red-900 transition-colors"
        >
          המשך לתשלום
        </button>
      </div>
    </>
  );
};

export default ShippingStep;
