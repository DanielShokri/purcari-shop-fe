import React from 'react';
import { CreditCard, Shield, Loader2 } from 'lucide-react';

interface PaymentStepProps {
  /** Total amount in ILS */
  total: number;
  /** Called when user clicks "Proceed to Secure Payment" */
  onProceedToPayment: () => void;
  /** Called when user clicks "Back" */
  prevStep: () => void;
  /** Whether the payment URL is being generated */
  isProcessingPayment: boolean;
  /** Error message from Rivhit API, if any */
  paymentError: string | null;
  /** Retry function when there's an error */
  onRetry: () => void;
}

/**
 * RivhitPaymentRedirect - Payment step that redirects to Rivhit hosted payment page.
 * 
 * NO credit card inputs are shown here. We are PCI-compliant because
 * Rivhit handles all card data on their secure hosted page.
 */
const PaymentStep: React.FC<PaymentStepProps> = ({
  total,
  onProceedToPayment,
  prevStep,
  isProcessingPayment,
  paymentError,
  onRetry,
}) => {
  return (
    <>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <CreditCard className="text-secondary" />
        תשלום
      </h2>
      
      <div className="space-y-6">
        {/* Order total summary */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">סכום לתשלום:</span>
            <span className="text-2xl font-bold text-secondary">₪{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center gap-3 text-sm text-gray-500 bg-green-50 p-4 rounded-lg border border-green-100">
          <Shield className="text-green-600 flex-shrink-0" size={24} />
          <div>
            <p className="font-medium text-green-800">תשלום מאובטח</p>
            <p className="text-green-600">פרטי כרטיס האשראי שלך מעובדים באופן מאובטח על ידי רבחית</p>
          </div>
        </div>

        {/* Payment redirect notice in Hebrew */}
        <div className="text-center text-gray-600 text-sm">
          <p>תועבר/י לדף תשלום מאובטח של רבחית</p>
          <p className="text-xs text-gray-400 mt-1">לאחר התשלום, תחזור/י אוטומטית לאתר</p>
        </div>

        {/* Credit card logos for trust */}
        <div className="flex justify-center items-center gap-4 py-2">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/100px-Visa_Inc._logo.svg.png" 
            alt="Visa" 
            className="h-6 object-contain opacity-60"
          />
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/MasterCard_Logo.svg/100px-MasterCard_Logo.svg.png" 
            alt="Mastercard" 
            className="h-6 object-contain opacity-60"
          />
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/100px-American_Express_logo_%282018%29.svg.png" 
            alt="American Express" 
            className="h-6 object-contain opacity-60"
          />
        </div>

        {/* Error state */}
        {paymentError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-medium mb-2">שגיאה ביצירת עמוד התשלום:</p>
            <p className="text-sm">{paymentError}</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
            >
              נסה שוב
            </button>
          </div>
        )}

        {/* Loading state */}
        {isProcessingPayment && (
          <div className="text-center py-4">
            <Loader2 className="animate-spin mx-auto text-secondary mb-2" size={32} />
            <p className="text-gray-600 font-medium">מכין דף תשלום מאובטח...</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-4 mt-8">
          <button 
            type="button" 
            onClick={prevStep} 
            disabled={isProcessingPayment}
            className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            חזרה
          </button>
          <button 
            type="button" 
            onClick={onProceedToPayment}
            disabled={isProcessingPayment}
            className="flex-1 bg-secondary text-white py-4 rounded-xl font-bold cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessingPayment ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                מעבד...
              </>
            ) : (
              <>
                <Shield size={20} />
                המשך לתשלום מאובטח
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default PaymentStep;
