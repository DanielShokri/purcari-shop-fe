import { CartItem, CartRule, CartRuleConfig } from '@shared/types';

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

  console.debug('[CartCalculation] Processing cart totals with rules:', {
    itemCount: items.length,
    subtotal,
    rulesCount: rules.length,
    rules: rules.map(r => ({ name: r.name, ruleType: r.ruleType, priority: r.priority }))
  });

  let shippingCost = 29.90;
  let discount = 0;
  let validationErrors: string[] = [];
  let appliedBenefits: string[] = [];

  for (const rule of rules) {
    const config = rule.config;

    if (config.type === 'shipping') {
      if (subtotal >= config.minOrderAmount) {
        shippingCost = 0;
        console.debug('[CartCalculation] Applied free shipping rule:', rule.name);
      }
    }
  }

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
