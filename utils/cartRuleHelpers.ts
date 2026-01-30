import { createListCollection } from '@chakra-ui/react';
import { CartRuleType, CartRuleStatus } from '../types';

// Cart Rule Type options
export const typeOptions = createListCollection({
  items: [
    { label: 'משלוח', value: CartRuleType.SHIPPING, icon: 'local_shipping', color: 'purple' },
    { label: 'הנחה', value: CartRuleType.DISCOUNT, icon: 'percent', color: 'orange' },
    { label: 'הגבלות', value: CartRuleType.RESTRICTION, icon: 'block', color: 'red' },
    { label: 'הטבה', value: CartRuleType.BENEFIT, icon: 'card_giftcard', color: 'blue' },
  ],
});

// Status options
export const statusOptions = createListCollection({
  items: [
    { label: 'פעיל', value: CartRuleStatus.ACTIVE },
    { label: 'מושהה', value: CartRuleStatus.PAUSED },
  ],
});

// Get value label based on rule type
export const getCartRuleValueLabel = (type: CartRuleType | undefined): string => {
  switch (type) {
    case CartRuleType.SHIPPING:
      return 'סכום מינימום למשלוח חינם (₪)';
    case CartRuleType.DISCOUNT:
      return 'אחוז הנחה (%)';
    case CartRuleType.RESTRICTION:
      return 'סכום מינימום להזמנה (₪)';
    case CartRuleType.BENEFIT:
      return 'סכום מינימום להטבה (₪)';
    default:
      return 'ערך';
  }
};
