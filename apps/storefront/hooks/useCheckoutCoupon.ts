import { useState, useCallback } from 'react';
import { CouponValidationResult } from '@shared/types';

export interface UseCheckoutCouponReturn {
  validationState: 'idle' | 'validating' | 'valid' | 'invalid';
  couponError: string | null;
  validatedCoupon: CouponValidationResult | null;
  validateCoupon: (code: string) => Promise<CouponValidationResult | null>;
  onApplyCoupon: (validationResult: CouponValidationResult) => void;
  onRemoveCoupon: () => Promise<void>;
  resetCouponState: () => void;
}

/**
 * Manages coupon validation state and actions for checkout flow
 */
export function useCheckoutCoupon(
  applyCoupon: (code: string) => Promise<CouponValidationResult | null>,
  removeCoupon: () => Promise<void>
): UseCheckoutCouponReturn {
  const [validationState, setValidationState] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [validatedCoupon, setValidatedCoupon] = useState<CouponValidationResult | null>(null);

  const validateCoupon = useCallback(async (code: string): Promise<CouponValidationResult | null> => {
    if (!code.trim()) {
      return null;
    }

    setValidationState('validating');
    setCouponError(null);

    try {
      const result = await applyCoupon(code);

      if (result && result.valid) {
        setValidatedCoupon(result);
        setValidationState('valid');
        return result;
      } else {
        setValidationState('invalid');
        setCouponError(result?.error || 'קוד קופון לא תקין');
        return null;
      }
    } catch (error) {
      console.error('[Coupon] Validation error:', error);
      setValidationState('invalid');
      setCouponError('שגיאה באימות הקופון');
      return null;
    }
  }, [applyCoupon]);

  const onApplyCoupon = useCallback((validationResult: CouponValidationResult) => {
    // The coupon has already been applied via validateCoupon call
    // This callback is for the sidebar to handle its internal UI state
    setValidatedCoupon(null);
  }, []);

  const onRemoveCoupon = useCallback(async () => {
    await removeCoupon();
    setValidationState('idle');
    setCouponError(null);
    setValidatedCoupon(null);
  }, [removeCoupon]);

  const resetCouponState = useCallback(() => {
    setValidationState('idle');
    setCouponError(null);
    setValidatedCoupon(null);
  }, []);

  return {
    validationState,
    couponError,
    validatedCoupon,
    validateCoupon,
    onApplyCoupon,
    onRemoveCoupon,
    resetCouponState,
  };
}
