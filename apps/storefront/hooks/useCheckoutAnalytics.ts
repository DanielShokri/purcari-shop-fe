import { useEffect, useRef } from 'react';
import { useTrackCheckoutStart, useTrackCheckoutStep } from './useAnalytics';

export interface UseCheckoutAnalyticsParams {
  cartItemsLength: number;
  subtotal: number;
  step: number;
}

/**
 * Automatically tracks checkout start and step transitions
 */
export function useCheckoutAnalytics({
  cartItemsLength,
  subtotal,
  step,
}: UseCheckoutAnalyticsParams) {
  const { trackCheckoutStart } = useTrackCheckoutStart();
  const { trackCheckoutStep } = useTrackCheckoutStep();
  const hasTrackedCheckout = useRef(false);
  const hasTrackedStep = useRef<number>(0);

  // Track checkout start when page loads with items
  useEffect(() => {
    if (cartItemsLength > 0 && !hasTrackedCheckout.current) {
      hasTrackedCheckout.current = true;
      trackCheckoutStart(`checkout_${Date.now()}`, cartItemsLength, subtotal);
    }
  }, [cartItemsLength, subtotal, trackCheckoutStart]);

  // Track checkout step changes
  useEffect(() => {
    if (cartItemsLength > 0 && step !== hasTrackedStep.current) {
      hasTrackedStep.current = step;
      const stepNames: Record<number, "shipping" | "review" | "payment" | "confirmation"> = {
        1: "shipping",
        2: "review",
        3: "payment",
      };
      const stepName = stepNames[step];
      if (stepName) {
        trackCheckoutStep(
          stepName,
          step,
          3,
          subtotal,
          cartItemsLength
        );
      }
    }
  }, [step, cartItemsLength, subtotal, trackCheckoutStep]);
}
