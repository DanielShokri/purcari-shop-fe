import { CartItem, CartRule, CartRuleType } from '@shared/types';

export interface CartTotals {
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  validationErrors: string[];
  appliedBenefits: string[];
}

export const calculateCartTotals = (items: CartItem[], rules: CartRule[]): CartTotals => {
  const subtotal = items.reduce((acc, item) => {
    const price = item.salePrice ?? item.price;
    return acc + (price * item.quantity);
  }, 0);
  
  // Debug: Log rules being used
  console.debug('[CartCalculation] Processing cart totals with rules:', {
    itemCount: items.length,
    subtotal,
    rulesCount: rules.length,
    rules: rules.map(r => ({ name: r.name, type: r.type, priority: r.priority, value: r.value }))
  });
  
  let shippingCost = 29.90; // Standard baseline
  let discount = 0;
  let validationErrors: string[] = [];
  let appliedBenefits: string[] = [];

  // Rules are already sorted by priority from API
  rules.forEach(rule => {
    switch (rule.type) {
      case CartRuleType.SHIPPING:
        if (subtotal >= (rule.value || 0)) {
          shippingCost = 0;
          console.debug('[CartCalculation] Applied shipping rule:', rule.name);
        }
        break;

      case CartRuleType.RESTRICTION:
        if (subtotal < (rule.value || 0)) {
          validationErrors.push(`מינימום להזמנה באתר: ₪${rule.value}`);
          console.debug('[CartCalculation] Applied restriction rule:', rule.name);
        }
        break;

      case CartRuleType.DISCOUNT:
        // Logic for automatic % or fixed discounts
        // Placeholder for future implementation
        break;
        
      case CartRuleType.BENEFIT:
        if (subtotal >= (rule.value || 0)) {
          appliedBenefits.push(rule.name);
          console.debug('[CartCalculation] Applied benefit rule:', rule.name);
        }
        break;
    }
  });

  // Calculate total
  // Note: Israeli retail prices already include VAT
  const total = subtotal + shippingCost - discount;

  return {
    subtotal,
    shippingCost,
    discount,
    total: Math.max(0, Math.round(total * 100) / 100),
    validationErrors,
    appliedBenefits
  };
};
