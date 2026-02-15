import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface CheckoutProgressBarProps {
  currentStep: number;
}

const stepLabels = ['משלוח', 'סיכום ותשלום'];

const CheckoutProgressBar: React.FC<CheckoutProgressBarProps> = ({ currentStep }) => {
  return (
    <div className="flex justify-between mb-12 relative max-w-md mx-auto">
      <div className="absolute top-1/2 start-0 end-0 h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>
      {[1, 2].map((s) => (
        <div key={s} className="relative z-10 flex flex-col items-center">
          <div 
            className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-colors ${
              currentStep >= s ? 'bg-secondary text-white' : 'bg-gray-200 text-gray-500'
            }`}
          >
            {currentStep > s ? <CheckCircle2 size={20} /> : s}
          </div>
          <span className={`text-xs mt-2 font-medium ${
            currentStep >= s ? 'text-secondary' : 'text-gray-400'
          }`}>
            {stepLabels[s - 1]}
          </span>
        </div>
      ))}
    </div>
  );
};

export default CheckoutProgressBar;
