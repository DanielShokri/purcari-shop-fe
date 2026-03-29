import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook to listen for payment completion messages from iCredit iframe via postMessage
 * @param currentOrderId - The order ID to navigate to upon completion
 * @param onPaymentComplete - Callback when payment is confirmed (optional, default navigates to confirmation)
 */
export function usePaymentListener(
  currentOrderId: string | null,
  onPaymentComplete?: (orderId: string) => void
) {
  const navigate = useNavigate();

  useEffect(() => {
    const handlePaymentMessage = (event: MessageEvent) => {
      // Only handle messages from iCredit domains (test and production)
      const isIcreditOrigin =
        event.origin.includes('icredit.rivhit.co.il') ||
        event.origin.includes('testicredit.rivhit.co.il');

      if (!isIcreditOrigin) return;

      console.log('[iCredit] Payment message received:', event.data);

      // Check for explicit success indicators in the message data
      const data = event.data;
      const isPaymentComplete = data && (
        data.status === 'success' ||
        data.Status === 0 ||
        data.type === 'payment_complete'
      );

      if (isPaymentComplete && currentOrderId) {
        if (onPaymentComplete) {
          onPaymentComplete(currentOrderId);
        } else {
          navigate(`/order-confirmation/${currentOrderId}`);
        }
      }
    };

    window.addEventListener('message', handlePaymentMessage);
    return () => window.removeEventListener('message', handlePaymentMessage);
  }, [currentOrderId, navigate, onPaymentComplete]);
}
