import React from 'react';
import { CreditCard } from 'lucide-react';

interface PaymentStepProps {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({ formData, handleInputChange, nextStep, prevStep }) => {
  return (
    <>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <CreditCard className="text-secondary" />
        תשלום
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">מספר כרטיס</label>
          <input type="text" name="cardNumber" value={formData.cardNumber} onChange={handleInputChange} className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-secondary focus:border-secondary" placeholder="0000 0000 0000 0000" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">תוקף</label>
            <input type="text" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-secondary focus:border-secondary" placeholder="MM/YY" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
            <input type="text" name="cvv" value={formData.cvv} onChange={handleInputChange} className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-secondary focus:border-secondary" placeholder="123" />
          </div>
        </div>
      </div>
      <div className="flex gap-4 mt-8">
        <button onClick={prevStep} className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-bold">
          חזרה
        </button>
        <button onClick={nextStep} className="flex-1 bg-secondary text-white py-4 rounded-xl font-bold">
          סיכום הזמנה
        </button>
      </div>
    </>
  );
};

export default PaymentStep;
