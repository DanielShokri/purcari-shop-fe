import React from 'react';
import { CreditCard } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { CheckoutInput } from '../../schemas/validationSchemas';

interface PaymentStepProps {
  nextStep: () => void;
  prevStep: () => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({ nextStep, prevStep }) => {
  const { register, formState: { errors } } = useFormContext<CheckoutInput>();

  return (
    <>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <CreditCard className="text-secondary" />
        תשלום
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">מספר כרטיס <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            {...register('cardNumber')} 
            className={`w-full border-gray-300 rounded-lg p-2.5 border focus:ring-secondary focus:border-secondary ${errors.cardNumber ? 'border-red-500' : ''}`} 
            placeholder="0000 0000 0000 0000" 
          />
          {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">תוקף <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              {...register('expiryDate')} 
              className={`w-full border-gray-300 rounded-lg p-2.5 border focus:ring-secondary focus:border-secondary ${errors.expiryDate ? 'border-red-500' : ''}`} 
              placeholder="MM/YY" 
            />
            {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CVV <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              {...register('cvv')} 
              className={`w-full border-gray-300 rounded-lg p-2.5 border focus:ring-secondary focus:border-secondary ${errors.cvv ? 'border-red-500' : ''}`} 
              placeholder="123" 
            />
            {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv.message}</p>}
          </div>
        </div>
        <div className="flex gap-4 mt-8">
          <button 
            type="button" 
            onClick={prevStep} 
            className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-bold"
          >
            חזרה
          </button>
          <button 
            type="button" 
            onClick={nextStep}
            className="flex-1 bg-secondary text-white py-4 rounded-xl font-bold"
          >
            סיכום הזמנה
          </button>
        </div>
      </div>
    </>
  );
};

export default PaymentStep;
